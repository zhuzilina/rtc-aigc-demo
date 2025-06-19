/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import VERTC from '@volcengine/rtc';
import { Tooltip, Typography } from '@arco-design/web-react';
import { useSelector } from 'react-redux';
import { useVisionMode } from '@/lib/useCommon';
import { RootState } from '@/store';
import Operation from './components/Operation';
import CameraArea from '../MainArea/Room/CameraArea';
import { isMobile } from '@/utils/utils';
import { SceneMap } from '@/config';
import packageJson from '../../../../package.json';
import styles from './index.module.less';
import AISettingButton from './components/AISettingButton';

function Menu() {
  const room = useSelector((state: RootState) => state.room);
  const { scene } = room;
  const voice = SceneMap[scene]?.ttsConfig?.ProviderParams?.audio?.voice_type || '';
  const model = SceneMap[scene]?.llmConfig?.EndPointId || SceneMap[scene]?.llmConfig?.BotId;
  const isJoined = room?.isJoined;
  const { isVisionMode } = useVisionMode();
  const requestId = sessionStorage.getItem('RequestID');

  return (
    <div className={styles.wrapper}>
      {isJoined && isMobile() && isVisionMode ? (
        <div className={styles['mobile-camera-wrapper']}>
          <CameraArea className={styles['mobile-camera']} />
        </div>
      ) : null}
      <div className={`${styles.box} ${styles.info}`}>
        <div className={styles.title}>AI 人设：{scene}</div>
        <div>
          <div className={styles.desc}>音色 {voice}</div>
          <div className={styles.desc}>{model}</div>
        </div>
        {isJoined && <AISettingButton />}
      </div>
      {isJoined ? <Operation /> : ''}
      <div className={`${styles.box} ${styles.info}`}>
        <div className={styles.title}>{isJoined ? '其他信息' : '版本信息'}</div>
        <div className={styles.desc}>Demo Version {packageJson.version}</div>
        <div className={styles.desc}>SDK Version {VERTC.getSdkVersion()}</div>
        {isJoined ? (
          <div className={styles.desc}>
            房间ID{' '}
            <Tooltip content={room.roomId || '-'}>
              <Typography.Paragraph
                ellipsis={{
                  rows: 1,
                  expandable: false,
                }}
                className={styles.value}
              >
                {room.roomId || '-'}
              </Typography.Paragraph>
            </Tooltip>
          </div>
        ) : (
          ''
        )}
        {room.isAIGCEnable ? (
          <div className={styles.desc}>
            RequestID{' '}
            <Tooltip content={requestId || '-'}>
              <Typography.Paragraph
                ellipsis={{
                  rows: 1,
                  expandable: false,
                }}
                className={styles.value}
              >
                {requestId || '-'}
              </Typography.Paragraph>
            </Tooltip>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export default Menu;
