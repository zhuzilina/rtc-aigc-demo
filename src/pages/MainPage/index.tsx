/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Header from '@/components/Header';
import ResizeWrapper from '@/components/ResizeWrapper';
import Apis from '@/app/index';
import MainArea from './MainArea';
import { ABORT_VISIBILITY_CHANGE, useLeave } from '@/lib/useCommon';
import { RTCConfig, SceneConfig, updateRTCConfig, updateScene, updateSceneConfig } from '@/store/slices/room';
import styles from './index.module.less';

export default function () {

  const leaveRoom = useLeave();
  const dispatch = useDispatch();

  const getScenes = async () => {
    const { scenes }: {
      scenes: {
        rtc: RTCConfig;
        scene: SceneConfig;
      }[];
    } = await Apis.Basic.getScenes();
    dispatch(updateScene(scenes[0].scene.id));
    dispatch(updateSceneConfig(
      scenes.reduce<Record<string, SceneConfig>>((prev, cur) => {
        prev[cur.scene.id] = cur.scene;
        return prev;
      }, {})
    ));
    dispatch(updateRTCConfig(
      scenes.reduce<Record<string, RTCConfig>>((prev, cur) => {
        prev[cur.scene.id] = cur.rtc;
        return prev;
      }, {})
    ));
  }

  useEffect(() => {
    getScenes();
    const isOriginalDemo = window.location.host.startsWith('localhost');
    const handler = () => {
      if (
        document.visibilityState === 'hidden' &&
        !sessionStorage.getItem(ABORT_VISIBILITY_CHANGE)
      ) {
        leaveRoom();
      }
    };
    !isOriginalDemo && document.addEventListener('visibilitychange', handler);
    return () => {
      !isOriginalDemo && document.removeEventListener('visibilitychange', handler);
    };
  }, []);

  return (
    <ResizeWrapper className={styles.container}>
      <Header hide />
      <div className={styles.main}>
        <div className={`${styles.mainArea} ${styles.isMobile}`}>
          <MainArea />
        </div>
      </div>
    </ResizeWrapper>
  );
}
