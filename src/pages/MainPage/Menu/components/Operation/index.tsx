/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { MediaType } from '@volcengine/rtc';
import DeviceDrawerButton from '../DeviceDrawerButton';
import { useVisionMode } from '@/lib/useCommon';
import Interrupt from '../Interrupt';
import styles from './index.module.less';

function Operation() {
  const isVisionMode = useVisionMode();
  return (
    <div className={`${styles.box} ${styles.device}`}>
      <Interrupt />
      <DeviceDrawerButton />
      {isVisionMode ? <DeviceDrawerButton type={MediaType.VIDEO} /> : ''}
    </div>
  );
}

export default Operation;
