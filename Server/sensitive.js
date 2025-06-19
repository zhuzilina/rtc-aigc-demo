/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

/**
 * @note 在 https://console.volcengine.com/iam/keymanage/ 获取 AK/SK。
 */
const ACCOUNT_INFO = {
  /**
   * @notes 必填, 在 https://console.volcengine.com/iam/keymanage/ 获取。
   */
  accessKeyId: 'Your Access Key ID',
  /**
   * @notes 必填, 在 https://console.volcengine.com/iam/keymanage/ 获取。
   */
  secretKey: 'Your Secret Key',
};



/**
 * @note RTC 的必填参数
 * @refer appId、appKey 可从 https://console.volcengine.com/rtc/aigc/listRTC 中获取。
 */
const RTC_INFO = {
  appId: 'Your RTC App ID',
  appKey: 'Your RTC App Key',
};



/**
 * @note 可参考官网 LLMConfig 字段。
 * @refer https://www.volcengine.com/docs/6348/1558163
 */
const LLMConfig = {
  /**
   * @note 火山方舟平台
   */
  ArkV3: {},
  /**
   * @note Coze 平台
   */
  CozeBot: {
    CozeBotConfig: {
      Url: 'https://api.coze.cn',
      APIKey: 'Your Coze API Key',
    }
  },
  /**
   * @note 第三方大模型/Agent
   */
  CustomLLM: {
    URL: 'Your LLM vendor\'s request url',
    APIKey: 'Your LLM vendor\'s API Key',
  },
};



/**
 * @brief 必填, ASR(语音识别) AppId, 可于 https://console.volcengine.com/speech/app?s=g 中获取, 若无可先创建应用。
 *        创建应用时, 需要按需根据语言选择 "流式语音识别" 服务, 并选择对应的 App 进行绑定。
 */
const ASRAppID = 'Your ASR App ID';
/**
 * @note 已开通流式语音识别大模型服务 AppId 对应的 Access Token。
 *       使用流式语音识别 **大模型** 服务时必填, 可于 https://console.volcengine.com/speech/service/10011?s=g 中查看。
 *       使用小模型无需配置 ASRToken。
 */
const ASRAccessToken = 'Your ASR Access Token';
/**
 * @note 可参考官网 ASRConfig 字段。
 * @refer https://www.volcengine.com/docs/6348/1558163
 */
const ASRConfig = {
  /**
   * @note 火山引擎流式语音识别。
   */
  smallmodel: {
    AppId: ASRAppID,
  },
  /**
   * @note 火山引擎流式语音识别大模型。
   */
  bigmodel: {
    AppId: ASRAppID,
    AccessToken: ASRAccessToken,
  },
};



/**
 * @note 必填, TTS(语音合成) AppId, 可于 https://console.volcengine.com/speech/service/8?s=g 中获取, 若无可先创建应用。
 *       创建应用时, 需要选择 "语音合成" 服务, 并选择对应的 App 进行绑定。
 */
const TTSAppID = 'Your TTS App ID';
/**
 * @note 已开通需要的语音合成服务的 token。
 *       使用火山引擎双向流式语音合成服务时必填。
 *       注意! 如您使用的是双向流式语音合成服务, 务必修改 voice_type，使用您已开通的大模型音色，否则无法使用。
 * @refer 可于 https://console.volcengine.com/speech/service/8?s=g 中获取。
 */
const TTSToken = 'Your TTS Token';
/**
 * @note 可参考官网 TTSConfig 字段。
 * @refer https://www.volcengine.com/docs/6348/1558163
 */
const TTSConfig = {
  volcano: {
    app: {
      appid: TTSAppID,
    },
  },
  volcano_bidirection: {
    app: {
      appid: TTSAppID,
      token: TTSToken,
    }
  },
  /**
   * @note 若您使用 minimax, 须填充此处参数
   */
  minimax: {
    Authorization: 'Your Authorization',
    Groupid: 'Your minimax groupid',
  },
};

module.exports = {
  ACCOUNT_INFO,
  RTC_INFO,
  LLMConfig,
  ASRConfig,
  TTSConfig,
}