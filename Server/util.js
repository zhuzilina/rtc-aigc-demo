/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

const merge = require('lodash/merge');
const { LLMConfig, RTC_INFO, TTSConfig, ASRConfig } = require("./sensitive");

const judgeMethodPath = (method) => {
    return (ctx, pathname) => ctx.method.toLowerCase() === method && ctx.url.startsWith(`/${pathname}`);
}

const assert = (expression, msg) => {
    if (!!!expression || expression?.includes?.(' ')) {
        console.log(`\x1b[31m校验失败: ${msg}\x1b[0m`)
      throw new Error(msg);
    }
}

const wrapper = async ({
    ctx,
    method = 'post',
    apiName,
    logic,
    containResponseMetadata = true,
}) => {
    if (judgeMethodPath(method)(ctx, apiName)) {
        const ResponseMetadata = { Action: apiName };
        try {
            const res = await logic();
            ctx.body = containResponseMetadata ? {
                ResponseMetadata,
                Result: res,
            } : res;
        } catch (e) {
            ResponseMetadata.Error = {
                Code: -1,
                Message: e?.toString(),
            };
            ctx.body = {
                ResponseMetadata,
            }
        }
    }
}

const deepAssert = (params = {}, prefix = '') => {
    if (typeof params === 'object') {
        Object.keys(params).forEach(key => {
            assert(params[key], `${prefix}: ${key} 不能为空, 请修改 /Server/sensitive.js`);
            deepAssert(params[key], `${prefix}: ${key}.`);
        })
    }
}

const sensitiveInjector = (action, params = {}) => {
    assert(RTC_INFO.appId, 'RTC_INFO.appId 不能为空');
    params.AppId = RTC_INFO.appId;
    
    if (action === 'StartVoiceChat') {
        const llmParams = LLMConfig[params?.Config?.LLMConfig?.Mode];
        assert(llmParams, '使用的 LLM Mode 不存在');
        deepAssert(llmParams, 'LLMConfig');
        merge(params.Config.LLMConfig, llmParams);

        const asrParams = ASRConfig[params?.Config?.ASRConfig?.ProviderParams?.Mode];
        assert(asrParams, '使用的 ASR Mode 不存在');
        deepAssert(asrParams, 'ASRConfig');
        merge(params.Config.ASRConfig.ProviderParams, asrParams);

        const ttsParams = TTSConfig[params?.Config?.TTSConfig?.Provider];
        assert(ttsParams, '使用的 TTS Mode 不存在');
        deepAssert(ttsParams, 'TTSConfig');
        merge(params.Config.TTSConfig.ProviderParams, ttsParams);
    }
}

module.exports = {
    wrapper,
    assert,
    sensitiveInjector,
}