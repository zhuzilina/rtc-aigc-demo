/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useDispatch, useSelector } from 'react-redux';
import AudioLoading from '@/components/Loading/AudioLoading';
import { RootState } from '@/store';
import RtcClient from '@/lib/RtcClient';
import style from './index.module.less';
import StopRobotBtn from '@/assets/img/StopRobotBtn.svg';
import { setInterruptMsg } from '@/store/slices/room';

function AudioController(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const volume = room.localUser.audioPropertiesInfo?.linearVolume || 0;
  const isAITalking = room.isAITalking;
  const isUserTalking = room.isUserTalking || volume >= 35;

  const handleInterrupt = () => {
    RtcClient.commandAudioBot('interrupt');
    dispatch(setInterruptMsg());
  };

  return (
    <div className={`${className}`} {...rest}>
      {isAITalking ? (
        <div onClick={handleInterrupt} className={style.interrupt}>
          <img src={StopRobotBtn} alt="StopRobotBtn" />
          <span className={style['interrupt-text']}>点击打断</span>
        </div>
      ) : (
        <div className={style.text}>正在听...</div>
      )}
      <AudioLoading loading={isUserTalking} />
    </div>
  );
}
export default AudioController;
