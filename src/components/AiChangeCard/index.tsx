/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import xiaohongImg from '@/assets/img/xiaohong.png';
import { useScene } from '@/lib/useCommon';
import style from './index.module.less';

function AIChangeCard() {
  const { isVision } = useScene();

  return (
    <div className={style.card}>
      <div className={style.avatar}>
        <img id="avatar-card" src={xiaohongImg} alt="小红同学" />
      </div>
      <div className={style.title}>
        <div>你好,我是小红同学</div>
        <div className={style.desc}>
          {isVision ? <>支持豆包 Vision 模型和 深度思考模型</> : ''}
        </div>
      </div>
    </div>
  );
}

export default AIChangeCard;
