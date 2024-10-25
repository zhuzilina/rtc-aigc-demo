/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
export enum ACTIONS {
  StartVoiceChat = 'StartVoiceChat',
  UpdateVoiceChat = 'UpdateVoiceChat',
  StopVoiceChat = 'StopVoiceChat',
}

export interface RequestParams {
  [ACTIONS.StartVoiceChat]: {
    AppId: string;
    BusinessId: string;
    RoomId: string;
    TaskId: string;
    Config: Partial<{
      BotName: string;
      ASRConfig: {
        AppId: string;
        Cluster?: string;
      };
      TTSConfig: Partial<{
        AppId: string;
        VoiceType: string;
        Cluster?: string;
      }>;
      LLMConfig: Partial<{
        AppId: string;
        ModelName?: string;
        ModelVersion: string;
        Mode?: string;
        Host?: string;
        Region?: string;
        MaxTokens?: number;
        MinTokens?: number;
        Temperature?: number;
        TopP?: number;
        TopK?: number;
        MaxPromptTokens?: number;
        SystemMessages?: string[];
        UserMessages?: string[];
        HistoryLength?: number;
        WelcomeSpeech?: string;
        EndPointId?: string;
        BotId?: string;
      }>;
    }>;
  };
  [ACTIONS.UpdateVoiceChat]: {
    AppId: string;
    BusinessId: string;
    RoomId: string;
    TaskId: string;
    Command: string;
    Message?: string;
  };
  [ACTIONS.StopVoiceChat]: {
    AppId: string;
    BusinessId: string;
    RoomId: string;
    TaskId: string;
  };
}

export interface RequestResponse {
  [ACTIONS.StartVoiceChat]: string;
  [ACTIONS.UpdateVoiceChat]: string;
  [ACTIONS.StopVoiceChat]: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
