/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { useSelector, useDispatch } from 'react-redux';
import VERTC from '@volcengine/rtc';
import { Typography, Tooltip, Button, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { localLeaveRoom } from '@/store/slices/room';
import { resetConfig } from '@/store/slices/stream';
import MicDrawerButton from './components/MicDrawerButton';
import AISettingDrawerButton from './components/AISettingDrawerButton';
import { useGetRestExperienceTime } from '@/lib/useCommon';
import styles from './index.module.less';

function Menu() {
  const room = useSelector((state: RootState) => state.room);
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const time = useGetRestExperienceTime();

  const handleLogout = async () => {
    dispatch(localLeaveRoom());
    dispatch(resetConfig());
    try {
      navigate(`/login?roomId=${room.roomId}&userId=${room.localUser.userId}`);
    } catch (error) {
      console.error('error', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <div className={styles.titleLine}>
          房间ID:{' '}
          <Tooltip placement="bottom" title={room.roomId || '-'}>
            <Typography.Paragraph
              ellipsis={{
                rows: 1,
                expandable: false,
              }}
              copyable={{
                tooltips: false,
              }}
              className={styles.value}
            >
              {room.roomId || '-'}
            </Typography.Paragraph>
          </Tooltip>
        </div>
        <div className={styles.normalLine}>Demo Version: 1.3.0</div>
        <div className={styles.normalLine}>SDK Version: {VERTC.getSdkVersion()}</div>
        <div className={styles.buttonArea}>
          <Button className={styles.logoutButton} onClick={handleLogout}>
            退出
          </Button>
          <Button
            className={styles.getMore}
            href="https://www.volcengine.com/docs/6348/1315561"
            target="_blank"
          >
            开通正式版
          </Button>
        </div>
      </div>
      <div className={styles.setting}>
        <MicDrawerButton />
        <Divider className={styles.divider} />
        <AISettingDrawerButton />
      </div>
      <div className={styles.resetTime}>
        <div className={styles.normalLine}>剩余体验时长: {time}</div>
      </div>
    </div>
  );
}

export default Menu;
