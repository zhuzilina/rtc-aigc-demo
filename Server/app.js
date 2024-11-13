/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const { Signer } = require('@volcengine/openapi');

const app = new Koa();

app.use(cors({
  origin: '*'
}));

/**
 * @notes 在 https://console.volcengine.com/iam/keymanage/ 获取 AK/SK
 */
const ACCOUNT_INFO = {
  /**
   * @notes 必填
   */
  accessKeyId: 'Your AK',
  /**
   * @notes 必填
   */
  secretKey: 'Your SK',
  /**
   * @notes 非必填, 主账号无须传入, 子账号须传, 获取方式可参考
   * https://www.volcengine.com/docs/6348/1315561 中的 步骤4-使用子账号调用智能体接口 一节
   */
  sessionToken: undefined,
  // sessionToken: 'Your SessionToken',
}

app.use(bodyParser());


app.use(async ctx => {
  /**
   * @brief Proxy AIGC Demo OpenAPI
   */
  if (ctx.url.startsWith('/proxyAIGCFetch') && ctx.method.toLowerCase() === 'post') {
    const { Action, Version } = ctx.query || {};
    const body = ctx.request.body;

    /** Refer to: https://github.com/volcengine/volc-sdk-nodejs */
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
    
    /** Refer to: https://www.volcengine.com/docs/6348/69828 */
    const result = await fetch(`https://rtc.volcengineapi.com?Action=${Action}&Version=${Version}`, {
      method: 'POST',
      headers: {
        ...openApiRequestData.headers,
      },
      body: JSON.stringify(body),
    });
    const volcResponse = await result.json();
    ctx.body = volcResponse;
  } else {
    ctx.body = '<h1>404 Not Found</h1>';
  }
});

app.listen(3001, () => {
  console.log('AIGC Server is running at http://localhost:3001');
});

