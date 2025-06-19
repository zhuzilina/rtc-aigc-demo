/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { MediaType } from '@volcengine/rtc';
import DeviceDrawerButton from '../DeviceDrawerButton';
import Subtitle from '../Subtitle';
import { useVisionMode } from '@/lib/useCommon';
import styles from './index.module.less';

function Operation() {
  const { isVisionMode } = useVisionMode();
  return (
    <div className={`${styles.box} ${styles.device}`}>
      <Subtitle />
      {isVisionMode && <DeviceDrawerButton type={MediaType.VIDEO} />}
      <DeviceDrawerButton />
    </div>
  );
}

export default Operation;
