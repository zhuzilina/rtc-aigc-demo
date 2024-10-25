/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MediaType } from '@volcengine/rtc';
import { Tag, Form, Switch, Select } from 'antd';
import DrawerRowItem from '@/components/DrawerRowItem';
import { RootState } from '@/store';
import RtcClient from '@/lib/RtcClient';
import { updateLocalUser } from '@/store/slices/room';
import { updateSelectedDevice } from '@/store/slices/device';
import styles from './index.module.less';
import MicEnabledSVG from '@/assets/img/MicEnabled.svg';
import MicDisabledSVG from '@/assets/img/MicDisabled.svg';

function MicDrawerButton() {
  const room = useSelector((state: RootState) => state.room);
  const devicePermissions = useSelector((state: RootState) => state.device.devicePermissions);
  const devices = useSelector((state: RootState) => state.device);
  const isMicEnable = room.localUser.publishAudio;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const deviceList = useMemo(() => devices.audioInputs, [devices]);

  const handleSwitchMic = async (checked: boolean) => {
    const publishType = 'publishAudio';

    dispatch(
      updateLocalUser({
        [publishType]: checked,
      })
    );

    await (!isMicEnable
      ? RtcClient.publishStream(MediaType.AUDIO + 4)
      : RtcClient.unpublishStream(MediaType.AUDIO));
  };

  const handleDeviceChange = (value: string) => {
    RtcClient.switchDevice('microphone', value);
    dispatch(
      updateSelectedDevice({
        selectedMicrophone: value,
      })
    );
  };

  return (
    <DrawerRowItem
      btnText="麦克风"
      btnSrc={devicePermissions.audio ? MicEnabledSVG : MicDisabledSVG}
      suffix={
        <Tag
          className={styles.suffix}
          color={devicePermissions.audio ? (isMicEnable ? 'green' : '') : 'red'}
        >
          {!devicePermissions.audio ? '已禁用' : isMicEnable ? '已启用' : '已关闭'}
        </Tag>
      }
      drawer={{
        title: '麦克风设置',
        footer: false,
        onOpen: () => {
          form.setFieldValue('enable', isMicEnable);
        },
        children: (
          <Form className={styles.form} form={form} layout="horizontal">
            <Form.Item
              style={{ marginBottom: 12 }}
              wrapperCol={{ offset: 1 }}
              name="enable"
              label="麦克风"
              colon={false}
              valuePropName="checked"
            >
              <Switch onChange={handleSwitchMic} disabled={!devicePermissions.audio} />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }} name="device" label=" " colon={false}>
              <Select
                defaultValue={devices.selectedMicrophone}
                value={devices.selectedMicrophone}
                onChange={handleDeviceChange}
              >
                {deviceList.map((device) => (
                  <Select.Option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        ),
      }}
    />
  );
}

export default MicDrawerButton;
