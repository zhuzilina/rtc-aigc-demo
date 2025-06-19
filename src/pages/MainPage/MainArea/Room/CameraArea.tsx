/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useSelector } from 'react-redux';
import { VideoRenderMode } from '@volcengine/rtc';
import { useEffect } from 'react';
import { RootState } from '@/store';
import { useDeviceState, useVisionMode } from '@/lib/useCommon';
import RtcClient from '@/lib/RtcClient';

import styles from './index.module.less';
import UserTag from '@/components/UserTag';
import LocalPlayerSet from '@/components/LocalPlayerSet';
import AiAvatarCard from '@/components/AiAvatarCard';
import UserAvatar from '@/assets/img/userAvatar.png';
import CameraCloseNoteSVG from '@/assets/img/CameraCloseNote.svg';
import ScreenCloseNoteSVG from '@/assets/img/ScreenCloseNote.svg';

const LocalVideoID = 'local-video-player';
const LocalScreenID = 'local-screen-player';

function CameraArea(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  const room = useSelector((state: RootState) => state.room);
  const { isFullScreen, scene } = room;
  const { isVisionMode, isScreenMode } = useVisionMode();
  const { isVideoPublished, isScreenPublished, switchCamera, switchScreenCapture } =
    useDeviceState();

  const setVideoPlayer = () => {
    RtcClient.removeVideoPlayer(room.localUser.username!);
    if (isVideoPublished || isScreenPublished) {
      RtcClient.setLocalVideoPlayer(
        room.localUser.username!,
        isFullScreen ? 'local-full-player' : isScreenMode ? LocalScreenID : LocalVideoID,
        isScreenPublished,
        isScreenMode ? VideoRenderMode.RENDER_MODE_FILL : VideoRenderMode.RENDER_MODE_HIDDEN
      );
    }
  };

  const handleOperateCamera = () => {
    switchCamera();
  };

  const handleOperateScreenShare = () => {
    switchScreenCapture();
  };

  useEffect(() => {
    setVideoPlayer();
  }, [isVideoPublished, isScreenPublished, isScreenMode, isFullScreen, isVisionMode]);

  return (
    <div className={`${styles['camera-wrapper']} ${className}`} {...rest}>
      <UserTag name={isFullScreen ? scene : '我'} className={styles.userTag} />
      {isFullScreen ? (
        <AiAvatarCard showUserTag={false} showStatus className={styles.fullScreenAiAvatar} />
      ) : null}
      {isVideoPublished || isScreenPublished ? <LocalPlayerSet /> : null}
      <div
        id={LocalVideoID}
        className={`${styles['camera-player']} ${
          isVideoPublished && !isScreenMode ? '' : styles['camera-player-hidden']
        }`}
      />
      <div
        id={LocalScreenID}
        className={`${styles['camera-player']} ${
          isScreenPublished && isScreenMode ? '' : styles['camera-player-hidden']
        }`}
      />
      <div
        className={`${styles['camera-placeholder']} ${
          isVideoPublished || isScreenPublished ? styles['camera-player-hidden'] : ''
        }`}
      >
        <img
          src={isScreenMode ? ScreenCloseNoteSVG : isVisionMode ? CameraCloseNoteSVG : UserAvatar}
          alt="close"
          className={styles['camera-placeholder-close-note']}
        />

        {isFullScreen ? null : (
          <div>
            {isScreenMode ? (
              <>
                打开
                <span onClick={handleOperateScreenShare} className={styles['camera-open-btn']}>
                  屏幕共享
                </span>
                <div>体验豆包视觉理解模型</div>
              </>
            ) : isVisionMode ? (
              <>
                打开
                <span onClick={handleOperateCamera} className={styles['camera-open-btn']}>
                  摄像头
                </span>
                <div>体验豆包视觉理解模型</div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraArea;
