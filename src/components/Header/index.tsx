/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import Logo from '@/assets/img/Logo.svg';
import styles from './index.module.less';

interface HeaderProps {
  children?: React.ReactNode;
  hide?: boolean;
}

function Header(props: HeaderProps) {
  const { children, hide } = props;
  const { t } = useTranslation();

  return (
    <div
      className={styles.header}
      style={{
        display: hide ? 'none' : 'flex',
      }}
    >
      <div className={styles['header-logo']}>
        <img src={Logo} alt="Logo" />
        <Divider type="vertical" />
        <span className={styles['header-logo-text']}>{t('demoTitle')}</span>
      </div>
      {children}
    </div>
  );
}

export default Header;
