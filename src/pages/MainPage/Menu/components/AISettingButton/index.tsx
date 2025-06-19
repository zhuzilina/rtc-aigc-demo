/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useState } from 'react';
import { Button } from '@arco-design/web-react';
import AISettings from '@/components/AISettings';
import styles from './index.module.less';

function AISettingButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  return (
    <>
      <Button className={styles.button} onClick={handleOpen}>
        <div className={styles['button-text']}>修改 AI 人设</div>
      </Button>
      <AISettings open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} />
    </>
  );
}

export default AISettingButton;
