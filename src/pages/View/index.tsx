/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { useEffect, useMemo, useCallback, useRef } from 'react';

import { Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import Utils from '@/utils/utils';
import RtcClient from '@/lib/RtcClient';

import ResizeWrapper from '@/components/ResizeWrapper';
import Header from '@/components/Header';
import Conversation from './Conversation';
import Menu from './Menu';

import { useGetDevicePermission, useJoin, useLeave } from '@/lib/useCommon';
import { setDevicePermissions } from '@/store/slices/device';
import styles from './index.module.less';

function View() {
  const navigate = useNavigate();

  const room = useSelector((state: RootState) => state.room);

  useGetDevicePermission();

  const [joining, disPatchJoin] = useJoin();
  const leave = useLeave();

  const ref = useRef({
    publishAudio: room.localUser.publishAudio,
  });

  const hasLogin = useMemo(() => Utils.checkLoginInfo(), []);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!room.roomId && !hasLogin) {
      const roomId = Utils.getUrlArgs()?.roomId;
      const userId = Utils.getUrlArgs()?.userId;
      if (roomId) {
        if (userId) {
          navigate(`/login?roomId=${roomId}&userId=${userId}`);
        } else {
          navigate(`/login?roomId=${roomId}`);
        }
      } else {
        navigate('/login');
      }
    } else if (!room.roomId) {
      (async () => {
        const permission = await RtcClient.checkPermission();
        dispatch(setDevicePermissions(permission));

        if (!permission) return;

        const formValues = Utils.getLoginInfo();

        if (false || permission) {
          disPatchJoin(
            {
              ...formValues,
              publishAudio: permission.audio && JSON.parse(formValues?.publishAudio || 'false'),
            },
            true
          );
        }
      })();
    }
  }, [room.roomId, navigate, hasLogin]);

  useEffect(() => {
    const { publishAudio: prevA } = ref.current;
    const { publishAudio } = room.localUser;

    if (prevA !== publishAudio) {
      ref.current = { publishAudio };
      Utils.setSessionInfo({
        publishAudio: !!publishAudio,
      });
    }
  }, [room.localUser.publishAudio]);

  const leaveRoom = useCallback(() => {
    if (!RtcClient.engine) return;
    leave();
  }, []);

  useEffect(() => {
    window.addEventListener('pagehide', leaveRoom);
    return () => {
      leaveRoom();
      window.removeEventListener('pagehide', leaveRoom);
    };
  }, [leaveRoom]);

  useEffect(() => {
    window.addEventListener('popstate', leaveRoom);

    return () => {
      window.removeEventListener('popstate', leaveRoom);
    };
  }, [leaveRoom]);

  useEffect(() => {
    const stop = async () => {
      await RtcClient.stopAudioBot(room.roomId!, room.localUser.userId!);
    };
    window.addEventListener('beforeunload', stop);
    return () => {
      window.removeEventListener('beforeunload', stop);
    };
  }, [RtcClient]);

  return (
    <Spin spinning={joining}>
      <ResizeWrapper>
        <Header />
        <div className={styles.main}>
          <div className={styles.mainArea}>
            <Conversation />
          </div>
          <div className={styles.operationArea}>
            <Menu />
          </div>
        </div>
      </ResizeWrapper>
    </Spin>
  );
}

export default View;
