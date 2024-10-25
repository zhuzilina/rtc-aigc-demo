/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import React, { useState } from 'react';
import { Drawer, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { CloseOutlined, RightOutlined } from '@ant-design/icons';
import styles from './index.module.less';

type IDrawerRowItemProps = {
  btnSrc: string;
  btnText: string;
  suffix?: React.ReactNode;
  drawer?: {
    title: string;
    width?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    children?: React.ReactNode;
    footer?: boolean;
  };
} & React.HTMLAttributes<HTMLDivElement>;

function DrawerRowItem(props: IDrawerRowItemProps) {
  const { btnSrc, btnText, suffix, drawer, style = {}, className = '' } = props;
  const [open, setOpen] = useState(false);
  const { onClose, onOpen, footer = true } = drawer!;

  const { t } = useTranslation();

  const handleClose = async () => {
    setOpen(false);
    onClose?.();
  };

  const handleOpen = () => {
    setOpen(true);
    if (drawer) {
      onOpen?.();
    }
  };

  return (
    <>
      <div style={style} className={`${styles.row} ${className}`} onClick={handleOpen}>
        <div className={styles.firstPart}>
          {btnSrc ? <img src={btnSrc} className={styles.icon} alt="svg" /> : ''}
          {btnText}
          {suffix}
        </div>
        <div className={styles.finalPart}>
          <RightOutlined className={styles.rightOutlined} />
        </div>
      </div>
      <Drawer
        closable={false}
        title={drawer?.title || ''}
        width={drawer?.width || 400}
        className={styles.drawer}
        visible={open}
        footer={
          footer ? (
            <div className={styles.footer}>
              <Button
                className={styles.cancel}
                onClick={() => {
                  drawer?.onCancel?.();
                  handleClose();
                }}
              >
                {t('Cancel')}
              </Button>
              <Button
                className={styles.confirm}
                onClick={() => {
                  drawer?.onConfirm?.();
                  handleClose();
                }}
              >
                {t('OK')}
              </Button>
            </div>
          ) : (
            ''
          )
        }
        extra={
          <Space>
            <Button onClick={handleClose} type="text" icon={<CloseOutlined />} />
          </Space>
        }
      >
        {drawer?.children}
      </Drawer>
    </>
  );
}

export default DrawerRowItem;
