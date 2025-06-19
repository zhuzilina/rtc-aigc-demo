/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { v4 as uuid } from 'uuid';

export const Configuration = {
  /**
   * @note 房间 ID, 可自定义，例如 "Room123"。
   *       此处使用 uuid 防止重复。
   *       建议使用有特定规则、不重复的房间号名称。
   */
  RoomId: uuid(),
  /**
   * @note 当前和 AI 对话的用户的 ID, 可自定义，例如 "User123"。
   *       此处使用 uuid 防止重复。
   *       建议使用有特定规则、不重复的用户名称。
   */
  UserId: uuid(),
  /**
   * @brief RTC Token, 由 AppId、AppKey、RoomId、UserId、时间戳等等信息计算得出。
   *        可于 https://console.volcengine.com/rtc/listRTC?s=g 列表中手动生成 Token, 找到对应 AppId 行中 "操作" 列的 "临时Token" 按钮点击进行生成, 用于本地 RTC 通信进房鉴权校验。
   *        **建议**: 「 不修改 Token 」，Demo 将通过调用 api 自动生成（src/lib/useCommon.ts），这需要您在 /Server/sensitve.js 中先填入 RTC_INFO.appKey。
   *
   * @note 生成临时 Token 时, 页面上的 RoomId、UserId 填的与此处的 RoomId、UserId 保持一致。
   */
  Token: undefined,

  /**
   * @brief AI Robot 名
   * @default RobotMan_
   */
  BotName: 'RobotMan_',

  /**
   * @brief 是否为打断模式
   */
  InterruptMode: true,
};
