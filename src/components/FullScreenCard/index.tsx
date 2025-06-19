/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import UserTag from '../UserTag';
import style from './index.module.less';

function FullScreenCard() {
  return (
    <div className={`${style.card}`} id="local-full-player">
      <UserTag name="我" className={style.tag} />
    </div>
  );
}

export default FullScreenCard;
