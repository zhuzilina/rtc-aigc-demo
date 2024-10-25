/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { Button, Form, Input } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

import Header from '@/components/Header';
import { RootState } from '@/store';
import Utils from '@/utils/utils';
import ResizeWrapper from '@/components/ResizeWrapper';
import BubbleMsg from '@/components/BubbleMsg';
import RippleWave from '@/components/RippleWave';
import { useJoin } from '../../lib/useCommon';

import MagicTools from '@/assets/img/magicTool.svg';
import DouBao from '@/assets/img/doubao.svg';
import styles from './index.module.less';
import Config from '@/config';

export interface FormProps {
  username: string;
  roomId: string;
}

export default function () {
  const localUser = useSelector((state: RootState) => state.room.localUser);

  /**
   * Get roomId & UserId randomly
   */
  const localRoomId = useSelector(
    (state: RootState) => Config.RoomId || state.room.roomId || Utils.getUrlArgs()?.roomId || uuid()
  );
  const username = Config.UserId || Utils.getUrlArgs()?.userId || uuid();

  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [joining, dispatchJoin] = useJoin();

  const handleStart = async (formValues: FormProps) => {
    if (joining) {
      return;
    }
    dispatchJoin(formValues, false);
  };

  return (
    <ResizeWrapper className={styles.container}>
      <Header />
      <div className={styles['form-wrapper']}>
        <div className={styles.main}>
          <div className={styles.doubao}>
            <RippleWave className={styles.rippleWave} />
            <BubbleMsg
              className={`${styles.bubble1} ${styles.animatedElement}`}
              text={t('welcomeViewBubble1')}
            />
            <BubbleMsg
              className={`${styles.bubble2} ${styles.animatedElement15}`}
              direction="left"
              text={t('welcomeViewBubble2')}
            />
            <img src={DouBao} className={styles.doubaoLogo} alt="Logo" />
            <div className={styles.text}>{t('welcomeViewPart1')}</div>
            <div className={styles.text}>{t('welcomeViewPart2')}</div>
          </div>
          <Form
            form={form}
            onFinish={handleStart}
            initialValues={{ ...localUser, roomId: localRoomId, username }}
          >
            {/* User not need to set it, just hidden and gen it randomly */}
            <Form.Item name="roomId" validateTrigger="onChange" hidden>
              <Input />
            </Form.Item>
            {/* User not need to set it, just hidden and gen it randomly */}
            <Form.Item name="username" validateTrigger="onChange" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, curValues) =>
                ['roomId', 'username'].some((key) => prevValues[key] !== curValues[key])
              }
            >
              {({ getFieldValue }) => (
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!getFieldValue('roomId') || !getFieldValue('username') || joining}
                  loading={joining}
                  className={styles.startButton}
                  icon={<img src={MagicTools} alt="Logo" />}
                >
                  {t('startExp')}
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </ResizeWrapper>
  );
}
