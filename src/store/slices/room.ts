/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { createSlice } from '@reduxjs/toolkit';
import { AudioPropertiesInfo, LocalAudioStats, RemoteAudioStats } from '@volcengine/rtc';
import config from '@/config';
import utils from '@/utils/utils';

export interface IUser {
  username?: string;
  userId?: string;
  publishAudio?: boolean;
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
   * @brief Whether AI enabled
   */
  isAIGCEnable: boolean;
  /**
   * @brief Whether AI saying
   */
  isAITalking: boolean;
  /**
   * @brief Whether user saying
   */
  isUserTalking: boolean;
  /**
   * @brief AI basic configuration
   */
  aiConfig: ReturnType<typeof config.getAIGCConfig>;

  /**
   * @brief conversation
   */
  msgHistory: Msg[];

  /**
   * @brief Current conversation
   */
  currentConversation: {
    [user: string]: {
      /**
       * @brief real time conversation content
       */
      msg: string;
      /**
       * @brief Whether the current real-time conversation content can be defined as a "question"
       */
      definite: boolean;
    };
  };
}

const initialState: RoomState = {
  time: -1,
  remoteUsers: [],
  localUser: {
    publishAudio: true,
  },
  autoPlayFailUser: [],
  isAIGCEnable: utils.getAudioBotEnabled(),
  isAITalking: false,
  isUserTalking: false,

  aiConfig: config.getAIGCConfig(),

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
    },
    localLeaveRoom: (state) => {
      state.roomId = undefined;
      state.time = -1;
      state.localUser = {
        publishAudio: true,
      };
      state.remoteUsers = [];
    },
    remoteUserJoin: (state, { payload }) => {
      state.remoteUsers.push(payload);
    },
    remoteUserLeave: (state, { payload }) => {
      const findIndex = state.remoteUsers.findIndex((user) => user.userId === payload.userId);
      state.remoteUsers.splice(findIndex, 1);
    },

    updateLocalUser: (state, { payload }: { payload: LocalUser }) => {
      state.localUser = {
        ...state.localUser,
        ...payload,
      };
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
        if (payload.user === state.localUser.userId) {
          return;
        }
      }
      /** If the current speaker is a user, and the previous record is AI, and it is not a sentence, then interrupt */
      if (userTalking) {
        const lastMsg = state.msgHistory[state.msgHistory.length - 1];
        const isAI = lastMsg.user !== state.localUser.userId;
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
} = roomSlice.actions;

export default roomSlice.reducer;
