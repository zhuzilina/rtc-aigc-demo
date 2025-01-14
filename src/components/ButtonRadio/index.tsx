/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useMemo } from 'react';
import { Button } from '@arco-design/web-react';
import styles from './index.module.less';

interface IProps {
  value?: string;
  onChange: (key: string) => void;
  options: {
    label: string;
    key: string;
  }[];
}

function ButtonRadio(props: IProps) {
  const { value, onChange, options } = props;
  const selected = useMemo(() => options.find((item) => item.key === value), [value]) || options?.[0];
  const handleClick = (key: string) => {
    onChange?.(key);
  };

  return (
    <div className={styles.wrapper}>
      {options.map(({ label, key }) => (
        <Button type="text" key={key} className={`${styles.item} ${key === selected.key ? styles.selected : ''}`} onClick={() => handleClick(key)}>
          <span className={key === selected.key ? styles['selected-text'] : ''}>{label}</span>
        </Button>
      ))}
    </div>
  );
}

export default ButtonRadio;
