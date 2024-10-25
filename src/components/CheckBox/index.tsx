/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { ReactNode } from 'react';
import CheckedSVG from '@/assets/img/Checked.svg';
import styles from './index.module.less';

interface IProps {
  className?: string;
  checked: boolean;
  onClick?: () => void;
  icon?: string;
  label?: string | ReactNode;
  description?: string | ReactNode;
  suffix?: string | ReactNode;
}

function CheckBox(props: IProps) {
  const { className = '', icon = '', checked, label, description, suffix, onClick } = props;

  return (
    <div
      className={`${className} ${styles.wrapper} ${checked ? styles.active : ''}`}
      onClick={onClick}
    >
      {icon ? <img className={styles.icon} src={icon} alt="icon" /> : ''}
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.description}>{description}</div>
      </div>
      {suffix}
      {checked ? <img className={styles.checkIcon} src={CheckedSVG} alt="checked" /> : ''}
    </div>
  );
}

export default CheckBox;
