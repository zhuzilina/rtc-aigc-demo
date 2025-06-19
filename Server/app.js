/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const { Signer } = require('@volcengine/openapi');
const fetch = require('node-fetch');
const { wrapper, assert, sensitiveInjector } = require('./util');
const { ACCOUNT_INFO, RTC_INFO } = require('./sensitive');
const TokenManager = require('./token');
const Privileges = require('./token').privileges;

const app = new Koa();

app.use(cors({
  origin: '*'
}));

app.use(bodyParser());

app.use(async ctx => {
  /**
   * @brief 代理 AIGC 的 OpenAPI 请求
   */
  await wrapper({
    ctx,
    apiName: 'proxy',
    containResponseMetadata: false,
    logic: async () => {
      const { Action, Version = '2024-12-01' } = ctx.query || {};
      const body = ctx.request.body;
      assert(Action, 'Action 不能为空');
      assert(Version, 'Version 不能为空');
      assert(ACCOUNT_INFO.accessKeyId, 'AK 不能为空');
      assert(ACCOUNT_INFO.secretKey, 'SK 不能为空');

      sensitiveInjector(Action, body);

      /** 参考 https://github.com/volcengine/volc-sdk-nodejs 可获取更多 火山 TOP 网关 SDK 的使用方式 */
      const openApiRequestData = {
        region: 'cn-north-1',
        method: 'POST',
        params: {
          Action,
          Version,
        },
        headers: {
          Host: 'rtc.volcengineapi.com',
          'Content-type': 'application/json',
        },
        body,
      };
      const signer = new Signer(openApiRequestData, "rtc");
      signer.addAuthorization(ACCOUNT_INFO);
      
      /** 参考 https://www.volcengine.com/docs/6348/69828 可获取更多 OpenAPI 的信息 */
      const result = await fetch(`https://rtc.volcengineapi.com?Action=${Action}&Version=${Version}`, {
        method: 'POST',
        headers: openApiRequestData.headers,
        body: JSON.stringify(body),
      });
      return result.json();
    }
  });

  wrapper({
    ctx,
    apiName: 'rtc-info',
    logic: () => {
      return {
        appId: RTC_INFO.appId,
      }
    }
  });

  /**
   * @brief 生成 RTC Token
   * @refer https://www.volcengine.com/docs/6348/70121
   */
  await wrapper({
    ctx,
    apiName: 'rtc-token',
    logic: async () => {
      const { roomId, userId } = ctx.request.body || {};
      assert(RTC_INFO.appId, 'AppID 不能为空, 请修改 /Server/sensitive.js');
      assert(RTC_INFO.appKey, 'AppKey 不能为空, 请修改 /Server/sensitive.js');
      assert(roomId, 'RoomID 不能为空');
      assert(userId, 'UserID 不能为空');
      const key = new TokenManager.AccessToken(RTC_INFO.appId, RTC_INFO.appKey, roomId, userId);
      key.addPrivilege(Privileges.PrivSubscribeStream, 0);
      key.addPrivilege(Privileges.PrivPublishStream, 0);
      key.expireTime(Math.floor(new Date() / 1000) + (24 * 3600));
      return {
        token: key.serialize(),
      };
    }
  });
});

app.listen(3001, () => {
  console.log('AIGC Server is running at http://localhost:3001');
});

