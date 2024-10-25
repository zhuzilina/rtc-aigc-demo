/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import React from 'react';
import Bubble from '@/assets/img/bubble.svg';
import styles from './index.module.less';

type IBubbleMsgProps = {
  text?: string;
  direction?: 'left' | 'right';
} & React.HTMLAttributes<HTMLDivElement>;

enum Direction {
  Left = 'left',
  Right = 'right',
}

function BubbleMsg(props: IBubbleMsgProps) {
  const { text = '', direction = Direction.Right, style = {}, className = '' } = props;

  return (
    <div style={style} className={`${styles.bubbleWrapper} ${className}`}>
      <img
        className={`${styles.bubbleLogo} ${styles[`bubble-direction-${direction}`]}`}
        src={Bubble}
        alt="Logo"
      />
      <div className={styles.bubbleText}>{text}</div>
    </div>
  );
}

export default BubbleMsg;
