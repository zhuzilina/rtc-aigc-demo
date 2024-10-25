/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

import Utils from '@/utils/utils';
import RtcClient from '@/lib/RtcClient';
import {
  clearCurrentMsg,
  clearHistoryMsg,
  localJoinRoom,
  localLeaveRoom,
  updateAIGCState,
} from '@/store/slices/room';

import useRtcListeners from '@/lib/listenerHooks';
import { RootState } from '@/store';

import {
  updateMediaInputs,
  updateSelectedDevice,
  setDevicePermissions,
} from '@/store/slices/device';
import { resetConfig } from '@/store/slices/stream';
import AIGCConfig from '@/config';

export interface FormProps {
  username: string;
  roomId: string;
  publishAudio?: boolean;
}

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
  const navigate = useNavigate();

  const handleAIGCModeStart = async (roomId: string, userId: string) => {
    if (room.isAIGCEnable) {
      await RtcClient.stopAudioBot(roomId, userId);
      dispatch(clearCurrentMsg());
      await RtcClient.startAudioBot(roomId, userId, AIGCConfig);
    } else {
      await RtcClient.startAudioBot(roomId, userId, AIGCConfig);
    }
    dispatch(updateAIGCState({ isAIGCEnable: true }));
  };

  async function disPatchJoin(formValues: FormProps): Promise<boolean | undefined> {
    if (joining) {
      return;
    }
    setJoining(true);

    const { username, roomId } = formValues;

    /**
     * Advised that fetching the token from your api with roomId and userId.
     * Or try it by using a static token just like blow shown.
     */
    const token = AIGCConfig.Token;

    /** Create RTC Engine */
    await RtcClient.createEngine({
      appId: AIGCConfig.AppId,
      roomId,
      uid: username,
    });

    /** Set events callbacks */
    RtcClient.addEventListeners(listeners);

    /** RTC starting to join room */
    await RtcClient.joinRoom(token, username);
    console.log(' ------ userJoinRoom\n', `roomId: ${roomId}\n`, `uid: ${username}`);
    /** Set users' devices info */
    const mediaDevices = await RtcClient.getDevices();

    if (devicePermissions.audio) {
      await RtcClient.startAudioCapture();
      RtcClient.setAudioVolume(30);
    }

    dispatch(
      localJoinRoom({
        roomId,
        user: {
          username,
          userId: username,
          publishAudio: true,
        },
      })
    );
    dispatch(
      updateSelectedDevice({
        selectedMicrophone: mediaDevices.audioInputs[0]?.deviceId,
      })
    );
    dispatch(updateMediaInputs(mediaDevices));

    setJoining(false);

    Utils.setSessionInfo({
      username,
      roomId,
      publishAudio: true,
    });
    navigate(`/?roomId=${formValues.roomId}&userId=${formValues.username}`);
    handleAIGCModeStart(formValues.roomId, formValues.username);
  }

  return [joining, disPatchJoin];
};

export const useLeave = () => {
  const dispatch = useDispatch();

  return async function () {
    dispatch(localLeaveRoom());
    dispatch(resetConfig());
    dispatch(updateAIGCState({ isAIGCEnable: false }));
    await Promise.all([RtcClient.stopAudioCapture]);
    RtcClient.leaveRoom();
    dispatch(clearHistoryMsg());
    dispatch(clearCurrentMsg());
  };
};

export const useGetRestExperienceTime = () => {
  const [time, setTime] = useState<string>('00:30:00');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const room = useSelector((state: RootState) => state.room);

  useEffect(() => {
    const timer = setInterval(async () => {
      const startTime = RtcClient.audioBotStartTime;
      if (startTime === 0) {
        return;
      }
      const now = Date.now();
      const diff = now - startTime;
      if (diff >= 60 * 1000 * 30) {
        clearInterval(timer);
        try {
          navigate(`/login?roomId=${room.roomId}`);
        } catch (error) {
          console.error('error', error);
        }
        message.info(t('demoExpDone'));
      }
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = 59 - (seconds % 60);
      const remainingMinutes = 29 - (minutes % 60);
      const formattedTime = `00:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
      setTime(formattedTime);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return time;
};
