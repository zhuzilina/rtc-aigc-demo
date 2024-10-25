/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import {
  LocalStreamStats,
  MediaType,
  onUserJoinedEvent,
  onUserLeaveEvent,
  RemoteStreamStats,
  StreamRemoveReason,
  DeviceInfo,
  AutoPlayFailedEvent,
  PlayerEvent,
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
} from '@/store/slices/room';
import RtcClient, { IEventListener } from './RtcClient';

import { setMicrophoneList, updateSelectedDevice } from '@/store/slices/device';

const useRtcListeners = (): IEventListener => {
  const dispatch = useDispatch();
  const playStatus = useRef<{ [key: string]: { audio: boolean; video: boolean } }>({});

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

  const handleUserLeave = (e: onUserLeaveEvent) => {
    dispatch(remoteUserLeave(e.userInfo));
    dispatch(removeAutoPlayFail(e.userInfo));
  };

  const handleUserPublishStream = (e: { userId: string; mediaType: MediaType }) => {
    const { userId } = e;
    const payload: IUser = { userId };
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

  const handleAudioDeviceStateChanged = async (device: DeviceInfo) => {
    const devices = await RtcClient.getDevices();

    if (device.mediaDeviceInfo.kind === 'audioinput') {
      let deviceId = device.mediaDeviceInfo.deviceId;
      if (device.deviceState === 'inactive') {
        deviceId = devices.audioInputs?.[0].deviceId || '';
      }
      RtcClient.switchDevice('microphone', deviceId);
      dispatch(setMicrophoneList(devices.audioInputs));

      dispatch(
        updateSelectedDevice({
          selectedMicrophone: deviceId,
        })
      );
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

  const handleRoomBinaryMessageReceived = (event: { userId: string; message: ArrayBuffer }) => {
    const { message } = event;
    const decoder = new TextDecoder('utf-8');
    const str = decoder.decode(message);
    const start = str.indexOf('{');
    const context = JSON.parse(str.substring(start, str.length)) || {};
    const data = context.data?.[0] || {};
    if (data) {
      const { text: msg, definite, userId: user, paragraph } = data;
      if ((window as any)._debug_mode) {
        dispatch(setHistoryMsg({ msg, user, paragraph, definite }));
      } else {
        const isAudioEnable = RtcClient.getAudioBotEnabled();
        if (isAudioEnable) {
          dispatch(setHistoryMsg({ text: msg, user, paragraph, definite }));
        }
      }
      dispatch(setCurrentMsg({ msg, definite, user, paragraph }));
    }
  };

  return {
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
  };
};

export default useRtcListeners;
