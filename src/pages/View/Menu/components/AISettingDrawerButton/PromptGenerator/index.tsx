/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { Button } from 'antd';
import styles from './index.module.less';
import { PROMPT_MAP } from '@/config';

interface IProps {
  onItemClick?: (key: string) => void;
  label?: string;
  items?: {
    label: string;
    value: string;
    key?: string;
  }[];
}

function PromptGenerator(props: IProps) {
  const {
    onItemClick,
    label = '生成人设',
    items = Object.keys(PROMPT_MAP).map((type) => ({
      label: type,
      value: PROMPT_MAP[type as keyof typeof PROMPT_MAP],
      key: type,
    })),
  } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      {items.map(({ label, value }, index) => (
        <Button
          key={label}
          className={`${styles.item} ${index !== 0 ? styles.margin : ''}`}
          onClick={() => onItemClick?.(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export default PromptGenerator;
