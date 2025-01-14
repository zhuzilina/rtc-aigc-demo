/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { TTS_CLUSTER, ARK_V3_MODEL_ID, ModelSourceType, SCENE, Prompt, Welcome, Model, Voice, LLM_BOT_ID, AI_MODEL, AI_MODE_MAP, AI_MODEL_MODE } from '.';

export const CONVERSATION_SIGNATURE = 'conversation';

/**
 * @brief RTC & AIGC 配置
 * @notes 更多参数请参考: https://api.volcengine.com/api-explorer?action=StartVoiceChat&groupName=%E6%99%BA%E8%83%BD%E4%BD%93&serviceCode=rtc&version=2024-12-01
 */
export class ConfigFactory {
  BaseConfig = {
    AppId: 'Your AppId',
    /**
     * @brief 非必填, 按需填充
     */
    BusinessId: undefined,
    RoomId: 'Your Room Id',
    UserId: 'Your User Id',
    Token: 'Your Token',
    TTSAppId: 'Your TTS AppId',
    ASRAppId: 'Your ASR AppId',
  };

  Model: AI_MODEL = Model[SCENE.INTELLIGENT_ASSISTANT];

  VoiceType = Voice[SCENE.INTELLIGENT_ASSISTANT];

  Prompt = Prompt[SCENE.INTELLIGENT_ASSISTANT];

  WelcomeSpeech = Welcome[SCENE.INTELLIGENT_ASSISTANT];

  ModeSourceType = ModelSourceType.Available;

  Url? = '';

  APIKey? = '';

  /**
   * @brief AI Robot 名
   * @default RobotMan_
   */
  BotName = 'RobotMan_';

  /**
   * @brief 是否为打断模式
   */
  InterruptMode = true;

  get LLMConfig() {
    const params: Record<string, unknown> = {
      Prefill: true,
      ModelName: this.Model,
      Mode: AI_MODE_MAP[this.Model || ''] || AI_MODEL_MODE.CUSTOM,
      ModelVersion: '1.0',
      WelcomeSpeech: this.WelcomeSpeech,
      SystemMessages: [this.Prompt as string],
      EndPointId: ARK_V3_MODEL_ID[this.Model],
      ModeSourceType: this.ModeSourceType,
      BotId: LLM_BOT_ID[this.Model],
      APIKey: this.APIKey,
      Url: this.Url,
      Feature: JSON.stringify({ Http: true }),
    };
    if (this.Model === AI_MODEL.VISION) {
      params.VisionConfig = {
        Enable: true,
      };
    }
    return params;
  }

  get ASRConfig() {
    return {
      AppId: this.BaseConfig.ASRAppId,
      VolumeGain: 0.3,
      VADConfig: {
        SilenceTime: 600,
        SilenceThreshold: 200,
      },
    };
  }

  get TTSConfig() {
    return {
      AppId: this.BaseConfig.TTSAppId,
      VoiceType: this.VoiceType,
      Cluster: TTS_CLUSTER.TTS,
    };
  }

  get aigcConfig() {
    return {
      Config: {
        LLMConfig: this.LLMConfig,
        TTSConfig: this.TTSConfig,
        ASRConfig: this.ASRConfig,
        InterruptMode: this.InterruptMode ? 0 : 1,
        SubtitleConfig: {
          SubtitleMode: 0,
        },
      },
      AgentConfig: {
        UserId: this.BotName,
        WelcomeMessage: this.WelcomeSpeech,
        EnableConversationStateCallback: true,
        ServerMessageSignatureForRTS: CONVERSATION_SIGNATURE,
      },
    };
  }
}
