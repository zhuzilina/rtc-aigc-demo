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
import { Questions } from '@/config';
import CameraArea from '../MainArea/Room/CameraArea';
import utils from '@/utils/utils';
import styles from './index.module.less';

function Menu() {
  const room = useSelector((state: RootState) => state.room);
  const scene = room.scene;
  const isJoined = room?.isJoined;
  const isVisionMode = useVisionMode();

  return (
    <div className={styles.wrapper}>
      {isJoined && utils.isMobile() && isVisionMode ? (
        <div className={styles['mobile-camera-wrapper']}>
          <CameraArea className={styles['mobile-camera']} />
        </div>
      ) : null}
      <div className={`${styles.box} ${styles.info}`}>
        <div className={styles.bold}>Demo Version 1.4.0</div>
        <div className={styles.bold}>SDK Version {VERTC.getSdkVersion()}</div>
        {isJoined ? (
          <div className={styles.gray}>
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
      </div>
      {isJoined ? (
        <div className={`${styles.box} ${styles.questions}`}>
          <div className={styles.title}>你可以问各类问题，比如</div>
          {Questions[scene].map((question) => (
            <div className={styles.line} key={question}>
              {question}
            </div>
          ))}
        </div>
      ) : (
        ''
      )}
      {isJoined ? <Operation /> : ''}
    </div>
  );
}

export default Menu;
