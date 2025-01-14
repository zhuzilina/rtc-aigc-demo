/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import React from 'react';
import styles from './index.module.less';

type IRippleWaveProps = React.HTMLAttributes<HTMLDivElement>;

const LEVEL = 9;

function RippleWave(props: IRippleWaveProps) {
  const { className = '', style = {} } = props;
  return (
    <div style={style} className={`${styles['wave-container']} ${className}`}>
      {Array(LEVEL)
        .fill(0)
        .map((_, index) => {
          return <div key={`ripple-level-${index}`} className={styles.wave} />;
        })}
    </div>
  );
}

export default RippleWave;
