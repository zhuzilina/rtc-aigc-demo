/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import styles from './index.module.less';
import DotSVG from '@/assets/img/Dot.svg';

interface IProps {
  title: string;
}

function FieldTitle(props: IProps) {
  const { title } = props;

  return (
    <div className={styles.wrapper}>
      <img src={DotSVG} alt="dot" />
      <div className={styles.title}>{title}</div>
    </div>
  );
}

export default FieldTitle;
