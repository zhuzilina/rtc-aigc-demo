/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import {
  AI_MODEL,
  AI_MODE_MAP,
  AI_MODE_PROMPT,
  ARK_V2_MODEL_ID,
  ModelSourceType,
  TTS_CLUSTER,
  VOICE_TYPE,
} from './config';

export const AIGC_PROXY_HOST = 'http://localhost:3001/proxyAIGCFetch';

/**
 * @brief Defining RTC & AIGC config
 * @notes If you wanna get full config and description of params, refer to https://api.volcengine.com/api-explorer?action=StartVoiceChat&groupName=%E6%99%BA%E8%83%BD%E4%BD%93&serviceCode=rtc&version=2024-06-01
 */
export class Config {
  AppId = 'Your AppId';

  BusinessId = 'Your BusinessId';

  RoomId = 'Your RoomId';

  UserId = 'Your UserId';

  Token = 'Your Token';

  ASRConfig = {
    AppId: 'Your ASR AppId',
  };

  TTSConfig = {
    AppId: 'Your TTS AppId',
    VoiceType: VOICE_TYPE.通用女声,
    Cluster: TTS_CLUSTER.TTS,
  };

  LLMConfig = {
    ModelName: AI_MODEL.DOUBAO_LITE_4K,
    Mode: AI_MODE_MAP[AI_MODEL.DOUBAO_LITE_4K],
    ModelVersion: '1.0',
    WelcomeSpeech: '欢迎使用火山引擎视频云 RTC 驱动的虚拟人大模型',
    SystemMessages: [AI_MODE_PROMPT[AI_MODEL.DOUBAO_LITE_4K]],
    EndPointId: ARK_V2_MODEL_ID[AI_MODEL.DOUBAO_LITE_4K],

    ModeSourceType: ModelSourceType.Available,
    APIKey: '',
    Url: '',
    Feature: JSON.stringify({ Http: true }),
  };

  BotName = 'RobotMan_';

  getAIGCConfig() {
    return {
      AppId: this.AppId,
      BusinessId: this.BusinessId,
      Config: {
        BotName: this.BotName,
        LLMConfig: this.LLMConfig,
        TTSConfig: this.TTSConfig,
        ASRConfig: this.ASRConfig,
      },
    };
  }
}

const config = new Config();

export * from './config';
export default config;
