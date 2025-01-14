/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useSelector } from 'react-redux';
import AISettings from '../AISettings';
import style from './index.module.less';
import DouBaoAvatar from '@/assets/img/DoubaoAvatarGIF.webp';
import { RootState } from '@/store';
import { Name, VOICE_TYPE } from '@/config';

interface IAvatarCardProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: string;
}

const ReversedVoiceType = Object.entries(VOICE_TYPE).reduce<Record<string, string>>((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

function AvatarCard(props: IAvatarCardProps) {
  const room = useSelector((state: RootState) => state.room);
  const scene = room.scene;
  const { LLMConfig, TTSConfig } = room.aiConfig.Config || {};
  const { avatar, className, ...rest } = props;

  return (
    <div className={`${style.card} ${className}`} {...rest}>
      <div className={style.corner} />
      <div className={style.avatar}>
        <img id="avatar-card" src={avatar || DouBaoAvatar} className={style['doubao-gif']} alt="Avatar" />
      </div>
      <div className={style.body} />
      <div className={style['text-wrapper']}>
        <div className={style['user-info']}>
          <div className={style.title}>{Name[scene]}</div>
          <div className={style.description}>声源来自 {ReversedVoiceType[TTSConfig?.VoiceType || '']}</div>
          <div className={style.description}>模型 {LLMConfig.ModelName}</div>
          <AISettings />
        </div>
      </div>
    </div>
  );
}

export default AvatarCard;
