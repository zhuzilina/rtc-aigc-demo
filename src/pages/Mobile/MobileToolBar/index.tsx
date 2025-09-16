/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { memo, useEffect, useState } from 'react';
import { VideoRenderMode } from '@volcengine/rtc';
import { useDeviceState, useScene } from '@/lib/useCommon';
import RtcClient from '@/lib/RtcClient';
import SettingsDrawer from '../SettingsDrawer';
import styles from './index.module.less';

function MobileToolBar() {
  const [open, setOpen] = useState(false);

  const { isScreenMode } = useScene();
  const { isVideoPublished, isScreenPublished } = useDeviceState();

  const setVideoPlayer = () => {
    if (isVideoPublished || isScreenPublished) {
      RtcClient.setLocalVideoPlayer(
        'mobile-local-player',
        'mobile-local-player',
        isScreenPublished,
        isScreenMode ? VideoRenderMode.RENDER_MODE_FILL : VideoRenderMode.RENDER_MODE_HIDDEN
      );
    }
  };

  useEffect(() => {
    setVideoPlayer();
  }, [isVideoPublished, isScreenPublished, isScreenMode]);

  return (
    <div className={styles.wrapper}>
      <SettingsDrawer visible={open} onCancel={() => setOpen(false)} />
    </div>
  );
}
export default memo(MobileToolBar);
