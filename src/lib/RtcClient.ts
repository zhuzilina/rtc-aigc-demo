/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import VERTC, {
  StreamIndex,
  IRTCEngine,
  RoomProfileType,
  onUserJoinedEvent,
  onUserLeaveEvent,
  MediaType,
  LocalStreamStats,
  RemoteStreamStats,
  StreamRemoveReason,
  AudioProfileType,
  DeviceInfo,
  AutoPlayFailedEvent,
  PlayerEvent,
} from '@volcengine/rtc';
import RTCAIAnsExtension from '@volcengine/rtc/extension-ainr';
import openAPIs from '@/app/api';
import aigcConfig, {
  AI_MODEL,
  AI_MODE_MAP,
  ARK_V2_MODEL_ID,
  ModelSourceType,
  AI_MODEL_MODE,
  LLM_BOT_ID,
} from '@/config';
import { DeepPartial } from '@/app/type';
import Utils from '@/utils/utils';

export interface IEventListener {
  handleUserJoin: (e: onUserJoinedEvent) => void;
  handleUserLeave: (e: onUserLeaveEvent) => void;
  handleUserPublishStream: (e: { userId: string; mediaType: MediaType }) => void;
  handleUserUnpublishStream: (e: {
    userId: string;
    mediaType: MediaType;
    reason: StreamRemoveReason;
  }) => void;
  handleRemoteStreamStats: (e: RemoteStreamStats) => void;
  handleLocalStreamStats: (e: LocalStreamStats) => void;
  handleAudioDeviceStateChanged: (e: DeviceInfo) => void;
  handleAutoPlayFail: (e: AutoPlayFailedEvent) => void;
  handlePlayerEvent: (e: PlayerEvent) => void;
  handleUserStartAudioCapture: (e: { userId: string }) => void;
  handleUserStopAudioCapture: (e: { userId: string }) => void;
  handleRoomBinaryMessageReceived: (e: { userId: string; message: ArrayBuffer }) => void;
}

interface EngineOptions {
  appId: string;
  uid: string;
  roomId: string;
}

export interface BasicBody {
  room_id: string;
  user_id: string;
  login_token: string | null;
}

export const AIAnsExtension = new RTCAIAnsExtension();

/**
 * @brief RTC Core Client
 * @notes Refer to official website documentation to get more information about the API.
 */
export class RTCClient {
  engine!: IRTCEngine;

  config!: EngineOptions;

  rtsBody!: BasicBody;

  private _audioCaptureDevice?: string;

  audioBotEnabled: boolean = Utils.getAudioBotEnabled();

  audioBotStartTime = 0;

  createEngine = async (props: EngineOptions) => {
    this.config = props;
    this.rtsBody = {
      room_id: props.roomId,
      user_id: props.uid,
      login_token: aigcConfig.Token,
    };

    this.engine = VERTC.createEngine(this.config.appId);
    try {
      await this.engine.registerExtension(AIAnsExtension);
      AIAnsExtension.enable();
    } catch (error) {
      console.error((error as any).message);
    }
  };

  addEventListeners = ({
    handleUserJoin,
    handleUserLeave,
    handleUserPublishStream,
    handleUserUnpublishStream,
    handleRemoteStreamStats,
    handleLocalStreamStats,
    handleAudioDeviceStateChanged,
    handleAutoPlayFail,
    handlePlayerEvent,
    handleUserStartAudioCapture,
    handleUserStopAudioCapture,
    handleRoomBinaryMessageReceived,
  }: IEventListener) => {
    this.engine.on(VERTC.events.onUserJoined, handleUserJoin);
    this.engine.on(VERTC.events.onUserLeave, handleUserLeave);
    this.engine.on(VERTC.events.onUserPublishStream, handleUserPublishStream);
    this.engine.on(VERTC.events.onUserUnpublishStream, handleUserUnpublishStream);
    this.engine.on(VERTC.events.onRemoteStreamStats, handleRemoteStreamStats);
    this.engine.on(VERTC.events.onLocalStreamStats, handleLocalStreamStats);
    this.engine.on(VERTC.events.onAudioDeviceStateChanged, handleAudioDeviceStateChanged);

    this.engine.on(VERTC.events.onAutoplayFailed, handleAutoPlayFail);
    this.engine.on(VERTC.events.onPlayerEvent, handlePlayerEvent);
    this.engine.on(VERTC.events.onUserStartAudioCapture, handleUserStartAudioCapture);
    this.engine.on(VERTC.events.onUserStopAudioCapture, handleUserStopAudioCapture);
    this.engine.on(VERTC.events.onRoomBinaryMessageReceived, handleRoomBinaryMessageReceived);
  };

  joinRoom = (token: string | null, username: string): Promise<void> => {
    this.engine.enableAudioPropertiesReport({ interval: 2000 });
    return this.engine.joinRoom(
      token,
      `${this.config.roomId!}`,
      {
        userId: this.config.uid!,
        extraInfo: JSON.stringify({
          user_name: username,
          user_id: this.config.uid,
        }),
      },
      {
        isAutoPublish: true,
        isAutoSubscribeAudio: true,
        roomProfileType: RoomProfileType.chat,
      }
    );
  };

  leaveRoom = () => {
    this.stopAudioBot(this.rtsBody.room_id, this.rtsBody.user_id);
    this.engine.leaveRoom();
    VERTC.destroyEngine(this.engine);
    this._audioCaptureDevice = undefined;
    this.audioBotEnabled = false;
  };

  checkPermission(): Promise<{
    video: boolean;
    audio: boolean;
  }> {
    return VERTC.enableDevices({
      video: false,
      audio: true,
    });
  }

  async getDevices(): Promise<{
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }> {
    const inputs = await VERTC.enumerateAudioCaptureDevices();
    const outputs = await VERTC.enumerateAudioPlaybackDevices();

    const audioInputs: MediaDeviceInfo[] = inputs.filter(
      (i) => i.deviceId && i.kind === 'audioinput'
    );
    const audioOutputs: MediaDeviceInfo[] = outputs.filter(
      (i) => i.deviceId && i.kind === 'audiooutput'
    );

    this._audioCaptureDevice = audioInputs.filter((i) => i.deviceId)?.[0]?.deviceId;

    return {
      audioInputs,
      audioOutputs,
    };
  }

  startAudioCapture = async (mic?: string) => {
    await this.engine.startAudioCapture(mic || this._audioCaptureDevice);
  };

  stopAudioCapture = async () => {
    await this.engine.stopAudioCapture();
  };

  publishStream = (mediaType: MediaType) => {
    this.engine.publishStream(mediaType);
  };

  unpublishStream = (mediaType: MediaType) => {
    this.engine.unpublishStream(mediaType);
  };

  setBusinessId = (businessId: string) => {
    this.engine.setBusinessId(businessId);
  };

  setAudioVolume = (volume: number) => {
    this.engine.setCaptureVolume(StreamIndex.STREAM_INDEX_MAIN, volume);
    this.engine.setCaptureVolume(StreamIndex.STREAM_INDEX_SCREEN, volume);
  };

  setAudioProfile = (profile: AudioProfileType) => {
    this.engine.setAudioProfile(profile);
  };

  switchDevice = (deviceType: 'microphone', deviceId: string) => {
    if (deviceType === 'microphone') {
      this._audioCaptureDevice = deviceId;
      this.engine.setAudioCaptureDevice(deviceId);
    }
  };

  getAudioBotEnabled = () => {
    return this.audioBotEnabled;
  };

  /**
   * @brief Enable AIGC
   */
  startAudioBot = async (
    roomId: string,
    userId: string,
    config: DeepPartial<ReturnType<typeof aigcConfig.getAIGCConfig>['Config']>
  ) => {
    if (this.audioBotEnabled || sessionStorage.getItem('audioBotEnabled')) {
      await this.stopAudioBot(roomId, userId);
    }
    const modeSourceType = config.LLMConfig?.ModeSourceType;
    const originConfig = aigcConfig.getAIGCConfig().Config;
    const mergedConfigs = {
      ...originConfig,
      LLMConfig: {
        APIKey: undefined,
        Url: undefined,
        Feature: undefined,
        ...config.LLMConfig,
        ModeSourceType: undefined,
      },
      TTSConfig: {
        ...originConfig.TTSConfig,
        VoiceType: config.TTSConfig?.VoiceType,
        Cluster: config.TTSConfig?.Cluster,
      },
    };
    const model = config?.LLMConfig?.ModelName as AI_MODEL;

    await openAPIs.StartVoiceChat({
      AppId: aigcConfig.AppId,
      BusinessId: aigcConfig.BusinessId,
      RoomId: roomId,
      TaskId: userId,
      Config: {
        ...mergedConfigs,
        TTSConfig: {
          ...mergedConfigs.TTSConfig,
        },
        LLMConfig: {
          ...mergedConfigs.LLMConfig,
          Mode:
            modeSourceType === ModelSourceType.Custom ? AI_MODEL_MODE.CUSTOM : AI_MODE_MAP[model],
          EndPointId: ARK_V2_MODEL_ID[model],
          BotId: (LLM_BOT_ID as Record<string, string>)[model],
        },
      },
    });
    this.audioBotEnabled = true;
    this.audioBotStartTime = Date.now();
    Utils.setSessionInfo({ audioBotEnabled: 'enable' });
  };

  /**
   * @brief Disable AIGC
   */
  stopAudioBot = async (roomId: string, userId: string) => {
    if (this.audioBotEnabled || sessionStorage.getItem('audioBotEnabled')) {
      await openAPIs.StopVoiceChat({
        AppId: aigcConfig.AppId,
        BusinessId: aigcConfig.BusinessId,
        RoomId: roomId,
        TaskId: userId,
      });
      this.audioBotEnabled = false;
      this.audioBotStartTime = 0;
      sessionStorage.removeItem('audioBotEnabled');
    }
  };

  /**
   * @brief Command(Update) AIGC
   */
  commandAudioBot = async (roomId: string, userId: string, command: string) => {
    if (this.audioBotEnabled) {
      const res = await openAPIs.UpdateVoiceChat({
        AppId: aigcConfig.AppId,
        BusinessId: aigcConfig.BusinessId,
        RoomId: roomId,
        TaskId: userId,
        Command: command,
      });
      return res;
    }
    return Promise.reject(new Error('AI Call failed'));
  };

  /**
   * @brief Update AIGC Configuration
   */
  updateAudioBot = async (
    roomId: string,
    userId: string,
    config: DeepPartial<ReturnType<typeof aigcConfig.getAIGCConfig>['Config']>
  ) => {
    if (this.audioBotEnabled) {
      await this.stopAudioBot(roomId, userId);
      await this.startAudioBot(roomId, userId, config);
    } else {
      await this.startAudioBot(roomId, userId, config);
    }
  };
}

export default new RTCClient();
