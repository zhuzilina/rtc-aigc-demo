/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useDispatch, useSelector } from 'react-redux';
import { memo, useEffect, useState } from 'react';
import { VideoRenderMode } from '@volcengine/rtc';
import { IconRight } from '@arco-design/web-react/icon';
import { useDeviceState, useVisionMode } from '@/lib/useCommon';
import { RootState } from '@/store';
import RtcClient from '@/lib/RtcClient';

import { updateShowSubtitle } from '@/store/slices/room';
import styles from './index.module.less';
import SettingsDrawer from '../SettingsDrawer';
import AISettings from '@/components/AISettings';

function MobileToolBar(props: React.HTMLAttributes<HTMLDivElement>) {
  const dispatch = useDispatch();

  const { isScreenMode } = useVisionMode();
  const room = useSelector((state: RootState) => state.room);
  const { isShowSubtitle } = room;
  const [open, setOpen] = useState(false);
  const [openAISettings, setOpenAISettings] = useState(false);
  const [subTitleStatus, setSubTitleStatus] = useState(isShowSubtitle);

  const { isVideoPublished, isScreenPublished } = useDeviceState();

  const handleSetting = () => {
    setOpen(true);
  };

  const handleOpenDrawer = () => setOpenAISettings(true);

  const switchSubtitle = () => {
    setSubTitleStatus(!subTitleStatus);
    dispatch(updateShowSubtitle({ isShowSubtitle: !subTitleStatus }));
  };

  const setVideoPlayer = () => {
    if (isVideoPublished || isScreenPublished) {
      RtcClient.setLocalVideoPlayer(
        room.localUser.username!,
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
      <div>
        <div className={styles.setting} onClick={handleSetting}>
          ...
        </div>
        <div className={styles.aiSetting} onClick={handleOpenDrawer}>
          {room.scene} <IconRight />
        </div>
        <AISettings
          open={openAISettings}
          onCancel={() => setOpenAISettings(false)}
          onOk={() => setOpenAISettings(false)}
        />
      </div>
      <div>
        <div
          className={`${styles.subtitle} ${subTitleStatus ? styles.showSubTitle : ''}`}
          onClick={switchSubtitle}
        >
          字幕
        </div>
      </div>

      <SettingsDrawer visible={open} onCancel={() => setOpen(false)} />
    </div>
  );
}
export default memo(MobileToolBar);
