/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MediaType } from '@volcengine/rtc';
import Utils from '@/utils/utils';
import RtcClient from '@/lib/RtcClient';
import {
  clearCurrentMsg,
  clearHistoryMsg,
  localJoinRoom,
  localLeaveRoom,
  updateAIGCState,
  updateLocalUser,
} from '@/store/slices/room';

import useRtcListeners from '@/lib/listenerHooks';
import { RootState } from '@/store';

import {
  updateMediaInputs,
  updateSelectedDevice,
  setDevicePermissions,
} from '@/store/slices/device';
import logger from '@/utils/logger';
import aigcConfig, { AI_MODEL } from '@/config';

export interface FormProps {
  username: string;
  roomId: string;
  publishAudio: boolean;
}

export const useVisionMode = () => {
  const room = useSelector((state: RootState) => state.room);
  return [AI_MODEL.VISION].includes(room.aiConfig?.Config?.LLMConfig.ModelName);
};

export const useGetDevicePermission = () => {
  const [permission, setPermission] = useState<{
    audio: boolean;
  }>();

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const permission = await RtcClient.checkPermission();
      dispatch(setDevicePermissions(permission));
      setPermission(permission);
    })();
  }, [dispatch]);
  return permission;
};

export const useJoin = (): [
  boolean,
  (formValues: FormProps, fromRefresh: boolean) => Promise<void | boolean>
] => {
  const devicePermissions = useSelector((state: RootState) => state.device.devicePermissions);
  const room = useSelector((state: RootState) => state.room);

  const dispatch = useDispatch();

  const [joining, setJoining] = useState(false);
  const listeners = useRtcListeners();

  const handleAIGCModeStart = async () => {
    if (room.isAIGCEnable) {
      await RtcClient.stopAudioBot();
      dispatch(clearCurrentMsg());
      await RtcClient.startAudioBot();
    } else {
      await RtcClient.startAudioBot();
    }
    dispatch(updateAIGCState({ isAIGCEnable: true }));
  };

  async function disPatchJoin(formValues: FormProps): Promise<boolean | undefined> {
    if (joining) {
      return;
    }

    setJoining(true);
    const { username, roomId } = formValues;
    const isVisionMode = aigcConfig.Model === AI_MODEL.VISION;

    const token = aigcConfig.BaseConfig.Token;

    /** 1. Create RTC Engine */
    await RtcClient.createEngine({
      appId: aigcConfig.BaseConfig.AppId,
      roomId,
      uid: username,
    } as any);

    /** 2.1 Set events callbacks */
    RtcClient.addEventListeners(listeners);

    /** 2.2 RTC starting to join room */
    await RtcClient.joinRoom(token!, username);
    console.log(' ------ userJoinRoom\n', `roomId: ${roomId}\n`, `uid: ${username}`);
    /** 3. Set users' devices info */
    const mediaDevices = await RtcClient.getDevices({
      audio: true,
      video: isVisionMode,
    });

    if (devicePermissions.audio) {
      try {
        await RtcClient.startAudioCapture();
        // RtcClient.setAudioVolume(30);
      } catch (e) {
        logger.debug('No permission for mic');
      }
    }

    if (devicePermissions.video && isVisionMode) {
      try {
        await RtcClient.startVideoCapture();
      } catch (e) {
        logger.debug('No permission for camera');
      }
    }

    dispatch(
      localJoinRoom({
        roomId,
        user: {
          username,
          userId: username,
          publishAudio: true,
          publishVideo: devicePermissions.video && isVisionMode,
        },
      })
    );
    dispatch(
      updateSelectedDevice({
        selectedMicrophone: mediaDevices.audioInputs[0]?.deviceId,
        selectedCamera: mediaDevices.videoInputs[0]?.deviceId,
      })
    );
    dispatch(updateMediaInputs(mediaDevices));

    setJoining(false);

    Utils.setSessionInfo({
      username,
      roomId,
      publishAudio: true,
    });

    handleAIGCModeStart();
  }

  return [joining, disPatchJoin];
};

export const useLeave = () => {
  const dispatch = useDispatch();

  return async function () {
    dispatch(localLeaveRoom());
    dispatch(updateAIGCState({ isAIGCEnable: false }));
    await Promise.all([RtcClient.stopAudioCapture]);
    RtcClient.leaveRoom();
    dispatch(clearHistoryMsg());
    dispatch(clearCurrentMsg());
  };
};

export const useDeviceState = () => {
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const localUser = room.localUser;
  const isAudioPublished = localUser.publishAudio;
  const isVideoPublished = localUser.publishVideo;

  const queryDevices = async (type: MediaType) => {
    const mediaDevices = await RtcClient.getDevices({
      audio: type === MediaType.AUDIO,
      video: type === MediaType.VIDEO,
    });
    if (type === MediaType.AUDIO) {
      dispatch(
        updateMediaInputs({
          audioInputs: mediaDevices.audioInputs,
        })
      );
      dispatch(
        updateSelectedDevice({
          selectedMicrophone: mediaDevices.audioInputs[0]?.deviceId,
        })
      );
    } else {
      dispatch(
        updateMediaInputs({
          videoInputs: mediaDevices.videoInputs,
        })
      );
      dispatch(
        updateSelectedDevice({
          selectedCamera: mediaDevices.videoInputs[0]?.deviceId,
        })
      );
    }
    return mediaDevices;
  };

  const switchMic = (publish = true) => {
    if (publish) {
      !isAudioPublished
        ? RtcClient.publishStream(MediaType.AUDIO)
        : RtcClient.unpublishStream(MediaType.AUDIO);
    }
    queryDevices(MediaType.AUDIO);
    !isAudioPublished ? RtcClient.startAudioCapture() : RtcClient.stopAudioCapture();
    dispatch(
      updateLocalUser({
        publishAudio: !localUser.publishAudio,
      })
    );
  };

  const switchCamera = (publish = true) => {
    if (publish) {
      !isVideoPublished
        ? RtcClient.publishStream(MediaType.VIDEO)
        : RtcClient.unpublishStream(MediaType.VIDEO);
    }
    queryDevices(MediaType.VIDEO);
    !localUser.publishVideo ? RtcClient.startVideoCapture() : RtcClient.stopVideoCapture();
    dispatch(
      updateLocalUser({
        publishVideo: !localUser.publishVideo,
      })
    );
  };

  return {
    isAudioPublished,
    isVideoPublished,
    switchMic,
    switchCamera,
  };
};
