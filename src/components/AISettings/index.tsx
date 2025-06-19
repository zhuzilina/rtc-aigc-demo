/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { Button, Modal } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CheckIcon from '../CheckIcon';
import { SceneMap, Scenes } from '@/config';
import RtcClient from '@/lib/RtcClient';
import { clearHistoryMsg, updateFullScreen, updateScene } from '@/store/slices/room';
import { RootState } from '@/store';
import { isMobile } from '@/utils/utils';
import styles from './index.module.less';
import { useDeviceState } from '@/lib/useCommon';

export interface IAISettingsProps {
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

function AISettings({ open, onCancel, onOk }: IAISettingsProps) {
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const [loading, setLoading] = useState(false);
  const [scene, setScene] = useState(room.scene);
  const { isVideoPublished, isScreenPublished, switchCamera, switchScreenCapture } = useDeviceState();
  const handleChecked = (checked: string) => {
    setScene(checked);
  };

  const handleUpdateConfig = async () => {
    dispatch(updateScene({ scene }));
    const isVisionMode = SceneMap?.[scene]?.llmConfig?.VisionConfig?.Enable;
    const isScreenMode = SceneMap?.[scene]?.llmConfig?.VisionConfig?.SnapshotConfig?.StreamType === 1;
    if (!isVisionMode && isVideoPublished ) {
      dispatch(updateFullScreen({ isFullScreen: true }));
      switchCamera(true);
    }  
    if (!isScreenMode && isScreenPublished) {
      dispatch(updateFullScreen({ isFullScreen: true }));
      switchScreenCapture(true);
    }
    setLoading(true);

    if (RtcClient.getAgentEnabled()) {
      dispatch(clearHistoryMsg());
      await RtcClient.updateAgent(scene);
    }

    setLoading(false);
    onOk?.();
  };

  useEffect(() => {
    if (open) {
      setScene(room.scene);
    }
  }, [open]);

  return (
    <Modal
      closable={false}
      maskClosable={false}
      title={null}
      className={styles.container}
      style={{
        width: isMobile() ? '100%' : '500px',
      }}
      footer={
        <div className={styles.footer}>
          <div className={styles.suffix}>人设修改后，对话将重新启动。</div>
          <Button loading={loading} className={styles.cancel} onClick={onCancel}>
            取消
          </Button>
          <Button loading={loading} className={styles.confirm} onClick={handleUpdateConfig}>
            确定
          </Button>
        </div>
      }
      visible={open}
      onCancel={onCancel}
    >
      <div className={styles.title}>
        选择你所需要的
        <span className={styles['special-text']}> AI 人设</span>
      </div>
      <div className={styles['sub-title']}>
        我们已为您配置好对应人设的基本参数，您也可以修改 JSON 配置来修改参数。
      </div>
      <div className={isMobile() ? styles['scenes-mobile'] : styles.scenes}>
        {Scenes.map(({ name, icon }) =>
          name ? (
            <CheckIcon
              key={name}
              icon={icon}
              title={name}
              checked={name === scene}
              onClick={() => handleChecked(name)}
            />
          ) : isMobile() ? (
            <div style={{ width: '100px', height: '100px' }} />
          ) : null
        )}
      </div>
    </Modal>
  );
}

export default AISettings;
