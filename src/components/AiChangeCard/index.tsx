/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import CheckScene from './CheckScene';
import { updateScene } from '@/store/slices/room';
import style from './index.module.less';
import { Scenes, SceneMap } from '@/config';
import { useVisionMode } from '@/lib/useCommon';

function AIChangeCard() {
  const room = useSelector((state: RootState) => state.room);
  const dispatch = useDispatch();
  const [scene, setScene] = useState(room.scene);
  const { isVisionMode } = useVisionMode();
  const avatar = SceneMap[scene]?.icon;

  const handleChecked = (checkedScene: string) => {
    setScene(checkedScene);
    dispatch(updateScene({ scene: checkedScene }));
  };

  return (
    <div className={style.card}>
      <div className={style.avatar}>
        <img id="avatar-card" src={avatar} alt="Avatar" />
      </div>
      <div className={style.title}>
        <div>Hi，欢迎体验实时对话式 AI</div>
        <div className={style.desc}>
          {isVisionMode ? <>支持豆包 Vision 模型和 深度思考模型，</> : ''}
          超多对话场景等你开启
        </div>
      </div>
      <div className={style.sceneContainer}>
        {Scenes.map((key) =>
          key ? (
            <CheckScene
              key={key.name}
              icon={key.icon}
              title={key.name}
              checked={key.name === scene}
              onClick={() => handleChecked(key.name)}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default AIChangeCard;
