/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { createSlice } from '@reduxjs/toolkit';
import { AudioPropertiesInfo, LocalAudioStats, NetworkQuality, RemoteAudioStats } from '@volcengine/rtc';
import config, { SCENE } from '@/config';
import utils from '@/utils/utils';

export interface IUser {
  username?: string;
  userId?: string;
  publishAudio?: boolean;
  publishVideo?: boolean;
  publishScreen?: boolean;
  audioStats?: RemoteAudioStats;
  audioPropertiesInfo?: AudioPropertiesInfo;
}

export type LocalUser = Omit<IUser, 'audioStats'> & {
  loginToken?: string;
  audioStats?: LocalAudioStats;
};

export interface Msg {
  value: string;
  time: string;
  user: string;
  paragraph?: boolean;
  isInterrupted?: boolean;
}

export interface RoomState {
  time: number;
  roomId?: string;
  localUser: LocalUser;
  remoteUsers: IUser[];
  autoPlayFailUser: string[];
  /**
   * @brief 是否已加房
   */
  isJoined: boolean;
  /**
   * @brief 选择的模式
   */
  scene: SCENE;

  /**
   * @brief AI 通话是否启用
   */
  isAIGCEnable: boolean;
  /**
   * @brief AI 是否正在说话
   */
  isAITalking: boolean;
  /**
   * @brief 用户是否正在说话
   */
  isUserTalking: boolean;
  /**
   * @brief AI 基础配置
   */
  aiConfig: ReturnType<any>;
  /**
   * @brief 网络质量
   */
  networkQuality: NetworkQuality;

  /**
   * @brief 对话记录
   */
  msgHistory: Msg[];

  /**
   * @brief 当前的对话
   */
  currentConversation: {
    [user: string]: {
      /**
       * @brief 实时对话内容
       */
      msg: string;
      /**
       * @brief 当前实时对话内容是否能被定义为 "问题"
       */
      definite: boolean;
    };
  };
}

const initialState: RoomState = {
  time: -1,
  scene: SCENE.INTELLIGENT_ASSISTANT,
  remoteUsers: [],
  localUser: {
    publishAudio: true,
    publishVideo: true,
  },
  autoPlayFailUser: [],
  isJoined: false,
  isAIGCEnable: false,
  isAITalking: false,
  isUserTalking: false,
  networkQuality: NetworkQuality.UNKNOWN,

  aiConfig: config.aigcConfig,

  msgHistory: [],
  currentConversation: {},
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    localJoinRoom: (
      state,
      {
        payload,
      }: {
        payload: {
          roomId: string;
          user: LocalUser;
        };
      }
    ) => {
      state.roomId = payload.roomId;
      state.localUser = payload.user;
      state.isJoined = true;
    },
    localLeaveRoom: (state) => {
      state.roomId = undefined;
      state.time = -1;
      state.localUser = {
        publishAudio: true,
        publishVideo: true,
      };
      state.remoteUsers = [];
      state.isJoined = false;
    },
    remoteUserJoin: (state, { payload }) => {
      state.remoteUsers.push(payload);
    },
    remoteUserLeave: (state, { payload }) => {
      const findIndex = state.remoteUsers.findIndex((user) => user.userId === payload.userId);
      state.remoteUsers.splice(findIndex, 1);
    },

    updateScene: (state, { payload }) => {
      state.scene = payload.scene;
    },

    updateLocalUser: (state, { payload }: { payload: Partial<LocalUser> }) => {
      state.localUser = {
        ...state.localUser,
        ...payload,
      };
    },

    updateNetworkQuality: (state, { payload }) => {
      state.networkQuality = payload.networkQuality;
    },

    updateRemoteUser: (state, { payload }: { payload: IUser | IUser[] }) => {
      if (!Array.isArray(payload)) {
        payload = [payload];
      }

      payload.forEach((user) => {
        const findIndex = state.remoteUsers.findIndex((u) => u.userId === user.userId);
        state.remoteUsers[findIndex] = {
          ...state.remoteUsers[findIndex],
          ...user,
        };
      });
    },

    updateRoomTime: (state, { payload }) => {
      state.time = payload.time;
    },

    addAutoPlayFail: (state, { payload }) => {
      const autoPlayFailUser = state.autoPlayFailUser;
      const index = autoPlayFailUser.findIndex((item) => item === payload.userId);
      if (index === -1) {
        state.autoPlayFailUser.push(payload.userId);
      }
    },
    removeAutoPlayFail: (state, { payload }) => {
      const autoPlayFailUser = state.autoPlayFailUser;
      const _autoPlayFailUser = autoPlayFailUser.filter((item) => item !== payload.userId);
      state.autoPlayFailUser = _autoPlayFailUser;
    },
    clearAutoPlayFail: (state) => {
      state.autoPlayFailUser = [];
    },
    updateAIGCState: (state, { payload }) => {
      state.isAIGCEnable = payload.isAIGCEnable;
    },
    updateAITalkState: (state, { payload }) => {
      state.isAITalking = payload.isAITalking;
    },
    updateAIConfig: (state, { payload }) => {
      state.aiConfig = Object.assign(state.aiConfig, payload);
    },
    clearHistoryMsg: (state) => {
      state.msgHistory = [];
    },
    setHistoryMsg: (state, { payload }) => {
      const paragraph = payload.paragraph;
      const aiTalking = payload.user === config.BotName;
      const userTalking = payload.user === state.localUser.userId;
      if (paragraph) {
        if (state.isAITalking) {
          state.isAITalking = false;
        }
        if (state.isUserTalking) {
          state.isUserTalking = false;
        }
      } else {
        if (state.isAITalking !== aiTalking) {
          state.isAITalking = aiTalking;
        }
        if (state.isUserTalking !== userTalking) {
          state.isUserTalking = userTalking;
        }
      }
      /** 如果当前说话人是用户, 并且上一条记录是 AI 的话, 并且不成语句, 则是打断 */
      if (userTalking) {
        const lastMsg = state.msgHistory[state.msgHistory.length - 1];
        const isAI = lastMsg.user === config.BotName;
        if (!lastMsg.paragraph && isAI) {
          lastMsg.isInterrupted = true;
          state.msgHistory[state.msgHistory.length - 1] = lastMsg;
        }
      }
      utils.addMsgWithoutDuplicate(state.msgHistory, {
        user: payload.user,
        value: payload.text,
        time: new Date().toLocaleString(),
        isInterrupted: false,
        paragraph,
      });
    },
    setInterruptMsg: (state) => {
      const msg = state.msgHistory[state.msgHistory.length - 1];
      msg.isInterrupted = true;
      state.msgHistory[state.msgHistory.length - 1] = msg;
    },
    clearCurrentMsg: (state) => {
      state.currentConversation = {};
      state.msgHistory = [];
      state.isAITalking = false;
      state.isUserTalking = false;
    },
    setCurrentMsg: (state, { payload }) => {
      const { user, ...info } = payload;
      state.currentConversation[user || state.localUser.userId] = info;
    },
  },
});

export const {
  localJoinRoom,
  localLeaveRoom,
  remoteUserJoin,
  remoteUserLeave,
  updateRemoteUser,
  updateLocalUser,
  updateRoomTime,
  addAutoPlayFail,
  removeAutoPlayFail,
  clearAutoPlayFail,
  updateAIGCState,
  updateAITalkState,
  updateAIConfig,
  setHistoryMsg,
  setCurrentMsg,
  clearHistoryMsg,
  clearCurrentMsg,
  setInterruptMsg,
  updateNetworkQuality,
  updateScene,
} = roomSlice.actions;

export default roomSlice.reducer;
