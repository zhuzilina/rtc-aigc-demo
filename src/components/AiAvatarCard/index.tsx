/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import UserTag from '../UserTag';
import style from './index.module.less';
import { useDeviceState } from '@/lib/useCommon';
import { SceneMap } from '@/config';

interface IAiAvatarCardProps {
  showStatus: boolean;
  showUserTag: boolean;
  className?: string;
}

const THRESHOLD_VOLUME = 18;

function AiAvatarCard(props: IAiAvatarCardProps) {
  const { showStatus, showUserTag, className } = props;
  const room = useSelector((state: RootState) => state.room);
  const { scene, isAITalking, isFullScreen } = room;
  const avatar = SceneMap[scene]?.icon;
  const volume = room.localUser.audioPropertiesInfo?.linearVolume || 0;
  const { isAudioPublished } = useDeviceState();
  const isLoading = volume >= THRESHOLD_VOLUME && isAudioPublished;

  return (
    <div className={`${style.card} ${className} ${isFullScreen ? style.fullScreen : ''}`}>
      <div className={style.avatar}>
        <img id="avatar-card" src={avatar} alt="Avatar" />
        {showStatus ? (
          isAITalking ? (
            <div className={style.aiStatus}>
              <div className={style.barContainer}>
                <div className={style.bar} />
                <div className={style.bar} />
                <div className={style.bar} />
              </div>
            </div>
          ) : isLoading ? (
            <div className={style.aiStatus}>正在听...</div>
          ) : null
        ) : null}
      </div>
      {showUserTag ? <UserTag name={scene} /> : null}
    </div>
  );
}

export default AiAvatarCard;
