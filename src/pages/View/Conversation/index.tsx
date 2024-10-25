/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MediaType } from '@volcengine/rtc';
import { Button, Tag, Spin } from 'antd';

import { RootState } from '@/store';
import Loading from '@/components/Loading';
import RtcClient from '@/lib/RtcClient';
import { setInterruptMsg, updateLocalUser } from '@/store/slices/room';
import Config from '@/config';

import styles from './index.module.less';
import WaveGIF from '@/assets/img/Wave.gif';
import DoubaoProfileSVG from '@/assets/img/DoubaoProfile.svg';
import MicEnabledSVG from '@/assets/img/MicEnabled.svg';
import MicDisabledSVG from '@/assets/img/MicDisabled.svg';
import StopRobotBtn from '@/assets/img/StopRobotBtn.svg';

const lines: (string | React.ReactNode)[] = [
  <div key="space" className={styles.space} />,
  <img
    className={styles.doubaoIcon}
    key="doubao_profile"
    src={DoubaoProfileSVG}
    alt="doubao_profile"
  />,
  <div key="welcome" className={styles.welcome}>
    <span>我是火山引擎</span>
    <span className={styles.weight}> RTC AI 语音助手</span>
    <span>, 有什么可以帮您?</span>
  </div>,
  <div key="tip" className={styles.tip}>
    您可以直接语音与我对话, 例如尝试以下几个问题进行提问:
  </div>,
  <Tag key="problem1" className={styles.tagProblem}>
    火山引擎 RTC 有什么优势能力?
  </Tag>,
  <Tag key="problem2" className={styles.tagProblem}>
    你能帮我解决什么问题?
  </Tag>,
  <Tag key="problem3" className={styles.tagProblem} style={{ marginBottom: 24 }}>
    你有什么爱好吗?
  </Tag>,
];

function Conversation() {
  const dispatch = useDispatch();
  const msgHistory = useSelector((state: RootState) => state.room.msgHistory);
  const { userId, publishAudio: isMicEnable } = useSelector(
    (state: RootState) => state.room.localUser
  );
  const { isAITalking, isUserTalking, roomId } = useSelector((state: RootState) => state.room);
  const isAIReady = msgHistory.length > 0;
  const devicePermissions = useSelector((state: RootState) => state.device.devicePermissions);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [msgHistory.length]);

  const handleInterrupt = () => {
    RtcClient.commandAudioBot(roomId!, userId!, 'interrupt');
    dispatch(setInterruptMsg());
  };

  const handleOpenMic = () => {
    const publishType = 'publishAudio';

    dispatch(
      updateLocalUser({
        [publishType]: true,
      })
    );

    !isMicEnable
      ? RtcClient.publishStream(MediaType.AUDIO)
      : RtcClient.unpublishStream(MediaType.AUDIO);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.conversation}>
        {lines.map((line) => line)}
        {!isAIReady ? (
          <div className={styles.aiReadying}>
            <Spin size="small" className={styles['aiReading-spin']} />
            AI 准备中, 请稍侯
          </div>
        ) : (
          ''
        )}
        {msgHistory?.map(({ value, user, isInterrupted }, index) => {
          const isUserMsg = user === userId;
          const isRobotMsg = user === Config.BotName;
          if (!isUserMsg && !isRobotMsg) {
            return '';
          }
          return (
            <div
              className={`${styles.sentence} ${isUserMsg ? styles.user : styles.robot}`}
              key={`msg-${index}`}
            >
              {value}
              {!isUserMsg && isInterrupted ? (
                <>
                  ...
                  <Tag className={styles.interruptTag}>已打断</Tag>
                </>
              ) : (
                ''
              )}
              {isAITalking && index === msgHistory.length - 1 ? <Loading /> : ''}
            </div>
          );
        })}
        {isAITalking ? (
          <Button
            type="text"
            onClick={handleInterrupt}
            className={styles.interrupt}
            icon={<img src={StopRobotBtn} alt="StopRobotBtn" />}
          >
            手动停止，或者语音打断我
          </Button>
        ) : (
          ''
        )}
        {isUserTalking ? (
          <div
            key={`loading-isUserTalking-${isUserTalking}`}
            className={`${styles.sentence} ${styles.user}`}
          >
            <Loading />
          </div>
        ) : (
          ''
        )}
      </div>
      <div className={styles.status}>
        <img
          className={isUserTalking ? styles.userTalkingWave : styles.userStopTalkingWave}
          src={WaveGIF}
        />
        <div className={styles['status-row']}>
          <img
            src={isMicEnable && devicePermissions.audio ? MicEnabledSVG : MicDisabledSVG}
            className={styles['status-icon']}
          />
          <div className={styles['status-text']}>
            {devicePermissions.audio ? (
              isMicEnable ? (
                '麦克风已开启, 您可以直接开始对话'
              ) : (
                <div className={styles.micNotify}>
                  麦克风已关闭, 请先
                  <Button className={styles.micReopen} onClick={handleOpenMic}>
                    开启麦克风
                  </Button>
                  来体验 AI 语音能力
                </div>
              )
            ) : (
              '麦克风权限已禁用，请在浏览器设置中手动开启后重试'
            )}
          </div>
        </div>
        <div className={styles.desc}>AI生成内容由大模型生成，不能完全保障真实</div>
      </div>
    </div>
  );
}

export default Conversation;
