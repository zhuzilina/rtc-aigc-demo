/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Operation from './components/Operation';
import CameraArea from '../MainArea/Room/CameraArea';
import { isMobile } from '@/utils/utils';
import { useScene } from '@/lib/useCommon';
import styles from './index.module.less';

function Menu() {
  const room = useSelector((state: RootState) => state.room);
  const isJoined = room?.isJoined;
  const { isVision } = useScene();

  return (
    <div className={styles.wrapper}>
      {isJoined && isMobile() && isVision ? (
        <div className={styles['mobile-camera-wrapper']}>
          <CameraArea className={styles['mobile-camera']} />
        </div>
      ) : null}
      {isJoined ? <Operation /> : ''}
    </div>
  );
}

export default Menu;
