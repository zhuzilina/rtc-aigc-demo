/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { MediaType } from '@volcengine/rtc';
import { RootState } from '@/store';
import { useVisionMode } from '@/lib/useCommon';
import styles from './index.module.less';
import CameraCloseNoteSVG from '@/assets/img/CameraCloseNote.svg';
import RtcClient from '@/lib/RtcClient';
import { updateLocalUser } from '@/store/slices/room';

const LocalVideoID = 'local-video-player';

function CameraArea(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const isVisionMode = useVisionMode();
  const localUser = room.localUser;
  const isVideoPublished = localUser.publishVideo;

  const handleOperateCamera = () => {
    !localUser.publishVideo ? RtcClient.startVideoCapture() : RtcClient.stopVideoCapture();

    !localUser.publishVideo
      ? RtcClient.publishStream(MediaType.VIDEO)
      : RtcClient.unpublishStream(MediaType.VIDEO);

    dispatch(
      updateLocalUser({
        publishVideo: !localUser.publishVideo,
      })
    );
  };

  useEffect(() => {
    if (isVisionMode && isVideoPublished) {
      RtcClient.setLocalVideoPlayer(room.localUser.username!, LocalVideoID);
    } else {
      RtcClient.setLocalVideoPlayer(room.localUser.username!);
    }
  }, [isVisionMode, isVideoPublished]);

  return isVisionMode ? (
    <div className={`${styles['camera-wrapper']} ${className}`} {...rest}>
      {isVideoPublished ? (
        <div id={LocalVideoID} className={styles['camera-player']} />
      ) : (
        <div className={styles['camera-placeholder']}>
          <img
            src={CameraCloseNoteSVG}
            alt="close"
            className={styles['camera-placeholder-close-note']}
          />
          <div>
            请
            <span onClick={handleOperateCamera} className={styles['camera-open-btn']}>
              打开摄像头
            </span>
          </div>
          <div>体验豆包视觉理解模型</div>
        </div>
      )}
    </div>
  ) : null;
}

export default CameraArea;
