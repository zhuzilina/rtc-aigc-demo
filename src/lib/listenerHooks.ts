/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import VERTC, {
  LocalAudioPropertiesInfo,
  RemoteAudioPropertiesInfo,
  LocalStreamStats,
  MediaType,
  onUserJoinedEvent,
  onUserLeaveEvent,
  RemoteStreamStats,
  StreamRemoveReason,
  StreamIndex,
  DeviceInfo,
  AutoPlayFailedEvent,
  PlayerEvent,
  NetworkQuality,
} from '@volcengine/rtc';
import { useDispatch } from 'react-redux';
import { useRef } from 'react';

import {
  IUser,
  remoteUserJoin,
  remoteUserLeave,
  updateLocalUser,
  updateRemoteUser,
  addAutoPlayFail,
  removeAutoPlayFail,
  updateAITalkState,
  setHistoryMsg,
  setCurrentMsg,
  updateNetworkQuality,
} from '@/store/slices/room';
import RtcClient, { IEventListener } from './RtcClient';

import { setMicrophoneList, updateSelectedDevice } from '@/store/slices/device';
import Utils from '@/utils/utils';
import { useMessageHandler } from '@/utils/handler';

const useRtcListeners = (): IEventListener => {
  const dispatch = useDispatch();
  const { parser } = useMessageHandler();
  const playStatus = useRef<{ [key: string]: { audio: boolean; video: boolean } }>({});

  const debounceSetHistoryMsg = Utils.debounce((text: string, user: string) => {
    const isAudioEnable = RtcClient.getAudioBotEnabled();
    if (isAudioEnable) {
      dispatch(setHistoryMsg({ text, user }));
    }
  }, 600);

  const handleUserJoin = (e: onUserJoinedEvent) => {
    const extraInfo = JSON.parse(e.userInfo.extraInfo || '{}');
    const userId = extraInfo.user_id || e.userInfo.userId;
    const username = extraInfo.user_name || e.userInfo.userId;
    dispatch(
      remoteUserJoin({
        userId,
        username,
      })
    );
  };

  const handleError = (e: { errorCode: typeof VERTC.ErrorCode.DUPLICATE_LOGIN }) => {
    const { errorCode } = e;
    if (errorCode === VERTC.ErrorCode.DUPLICATE_LOGIN) {
      console.log('踢人');
    }
  };

  const handleUserLeave = (e: onUserLeaveEvent) => {
    dispatch(remoteUserLeave(e.userInfo));
    dispatch(removeAutoPlayFail(e.userInfo));
  };

  const handleUserPublishStream = (e: { userId: string; mediaType: MediaType }) => {
    const { userId, mediaType } = e;
    const payload: IUser = { userId };
    if (mediaType === MediaType.AUDIO) {
      /** 暂不需要 */
    }
    payload.publishAudio = true;
    dispatch(updateRemoteUser(payload));
  };

  const handleUserUnpublishStream = (e: {
    userId: string;
    mediaType: MediaType;
    reason: StreamRemoveReason;
  }) => {
    const { userId, mediaType } = e;

    const payload: IUser = { userId };
    if (mediaType === MediaType.AUDIO) {
      payload.publishAudio = false;
    }

    if (mediaType === MediaType.AUDIO_AND_VIDEO) {
      payload.publishAudio = false;
    }

    dispatch(updateRemoteUser(payload));
  };

  const handleRemoteStreamStats = (e: RemoteStreamStats) => {
    dispatch(
      updateRemoteUser({
        userId: e.userId,
        audioStats: e.audioStats,
      })
    );
  };

  const handleLocalStreamStats = (e: LocalStreamStats) => {
    dispatch(
      updateLocalUser({
        audioStats: e.audioStats,
      })
    );
  };

  const handleLocalAudioPropertiesReport = (e: LocalAudioPropertiesInfo[]) => {
    const localAudioInfo = e.find(
      (audioInfo) => audioInfo.streamIndex === StreamIndex.STREAM_INDEX_MAIN
    );
    if (localAudioInfo) {
      dispatch(
        updateLocalUser({
          audioPropertiesInfo: localAudioInfo.audioPropertiesInfo,
        })
      );
    }
  };

  const handleRemoteAudioPropertiesReport = (e: RemoteAudioPropertiesInfo[]) => {
    const remoteAudioInfo = e
      .filter((audioInfo) => audioInfo.streamKey.streamIndex === StreamIndex.STREAM_INDEX_MAIN)
      .map((audioInfo) => ({
        userId: audioInfo.streamKey.userId,
        audioPropertiesInfo: audioInfo.audioPropertiesInfo,
      }));

    if (remoteAudioInfo.length) {
      dispatch(updateRemoteUser(remoteAudioInfo));
    }
  };

  const handleAudioDeviceStateChanged = async (device: DeviceInfo) => {
    const devices = await RtcClient.getDevices();

    if (device.mediaDeviceInfo.kind === 'audioinput') {
      let deviceId = device.mediaDeviceInfo.deviceId;
      if (device.deviceState === 'inactive') {
        deviceId = devices.audioInputs?.[0].deviceId || '';
      }
      RtcClient.switchDevice(MediaType.AUDIO, deviceId);
      dispatch(setMicrophoneList(devices.audioInputs));

      dispatch(
        updateSelectedDevice({
          selectedMicrophone: deviceId,
        })
      );
    }
  };

  const handleUserMessageReceived = (e: { userId: string; message: any }) => {
    /** debounce 记录用户输入文字 */
    if (e.message) {
      const msgObj = JSON.parse(e.message || '{}');
      if (msgObj.text) {
        const { text: msg, definite, user_id: user } = msgObj;
        if ((window as any)._debug_mode) {
          dispatch(setHistoryMsg({ msg, user }));
        } else {
          debounceSetHistoryMsg(msg, user);
        }
        dispatch(setCurrentMsg({ msg, definite, user }));
      }
    }
  };

  const handleAutoPlayFail = (event: AutoPlayFailedEvent) => {
    const { userId, kind } = event;
    let playUser = playStatus.current?.[userId] || {};
    playUser = { ...playUser, [kind]: false };
    playStatus.current[userId] = playUser;

    dispatch(
      addAutoPlayFail({
        userId,
      })
    );
  };

  const addFailUser = (userId: string) => {
    dispatch(addAutoPlayFail({ userId }));
  };

  const playerFail = (params: { type: 'audio' | 'video'; userId: string }) => {
    const { type, userId } = params;
    let playUser = playStatus.current?.[userId] || {};

    playUser = { ...playUser, [type]: false };

    const { audio, video } = playUser;

    if (audio === false || video === false) {
      addFailUser(userId);
    }

    return playUser;
  };

  const handlePlayerEvent = (event: PlayerEvent) => {
    const { userId, rawEvent, type } = event;
    let playUser = playStatus.current?.[userId] || {};

    if (!playStatus.current) return;

    if (rawEvent.type === 'playing') {
      playUser = { ...playUser, [type]: true };
      const { audio, video } = playUser;
      if (audio !== false && video !== false) {
        dispatch(removeAutoPlayFail({ userId }));
      }
    } else if (rawEvent.type === 'pause') {
      playUser = playerFail({ type, userId });
    }

    playStatus.current[userId] = playUser;
  };

  const handleUserStartAudioCapture = (_: { userId: string }) => {
    dispatch(updateAITalkState({ isAITalking: true }));
  };

  const handleUserStopAudioCapture = (_: { userId: string }) => {
    dispatch(updateAITalkState({ isAITalking: false }));
  };

  const handleNetworkQuality = (
    uplinkNetworkQuality: NetworkQuality,
    downlinkNetworkQuality: NetworkQuality
  ) => {
    dispatch(
      updateNetworkQuality({
        networkQuality: Math.floor(
          (uplinkNetworkQuality + downlinkNetworkQuality) / 2
        ) as NetworkQuality,
      })
    );
  };

  const handleRoomBinaryMessageReceived = (event: { userId: string; message: ArrayBuffer }) => {
    const { message } = event;
    parser(message);
  };

  return {
    handleError,
    handleUserJoin,
    handleUserLeave,
    handleUserPublishStream,
    handleUserUnpublishStream,
    handleRemoteStreamStats,
    handleLocalStreamStats,
    handleLocalAudioPropertiesReport,
    handleRemoteAudioPropertiesReport,
    handleAudioDeviceStateChanged,
    handleUserMessageReceived,
    handleAutoPlayFail,
    handlePlayerEvent,
    handleUserStartAudioCapture,
    handleUserStopAudioCapture,
    handleRoomBinaryMessageReceived,
    handleNetworkQuality,
  };
};

export default useRtcListeners;
