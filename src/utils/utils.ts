/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { v4 as uuidv4 } from 'uuid';
import config from '@/config';
import { Msg, RoomState } from '@/store/slices/room';

interface UserBaseInfo {
  deviceId?: string;
  login_token?: string;
}

class Utils {
  userBaseInfo: UserBaseInfo;

  constructor() {
    const userBaseInfo: UserBaseInfo = JSON.parse(localStorage.getItem('userBaseInfo') || '{}');
    this.userBaseInfo = userBaseInfo;
    this.init();
  }

  private init() {
    if (!this.userBaseInfo.deviceId) {
      const deviceId = uuidv4();
      this.userBaseInfo.deviceId = deviceId;
      localStorage.setItem('userBaseInfo', JSON.stringify(this.userBaseInfo));
    }
  }

  getDeviceId = (): string => this.userBaseInfo.deviceId!;

  getAudioBotEnabled = (): boolean => !!sessionStorage.getItem('audioBotEnabled') || false;

  setLoginToken = (token: string): void => {
    this.userBaseInfo.login_token = token;
  };

  getLoginToken = (): string | null => config.Token;

  formatTime = (time: number): string => {
    if (time < 0) {
      return '00:00';
    }
    let minutes: number | string = Math.floor(time / 60);
    let seconds: number | string = time % 60;
    minutes = minutes > 9 ? `${minutes}` : `0${minutes}`;
    seconds = seconds > 9 ? `${seconds}` : `0${seconds}`;

    return `${minutes}:${seconds}`;
  };

  formatDate = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  setSessionInfo = (params: { [key: string]: any }) => {
    Object.keys(params).forEach((key) => {
      sessionStorage.setItem(key, params[key]);
    });
  };

  getUrlArgs = () => {
    const args = {} as { [key: string]: string };
    const query = window.location.search.substring(1);
    const pairs = query.split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pos = pairs[i].indexOf('=');
      if (pos === -1) continue;
      const name = pairs[i].substring(0, pos);
      let value = pairs[i].substring(pos + 1);
      value = decodeURIComponent(value);
      args[name] = value;
    }
    return args;
  };

  checkLoginInfo = () => {
    const { roomId } = this.getUrlArgs();
    roomId && this.setSessionInfo({ roomId });
    const _roomId = sessionStorage.getItem('roomId');
    const _uid = sessionStorage.getItem('username');
    let hasLogin = true;
    if (!_roomId || !_uid) {
      hasLogin = false;
    } else if (
      !/^[0-9a-zA-Z_\-@.]{1,128}$/.test(_roomId) ||
      !/^[0-9a-zA-Z_\-@.]{1,128}$/.test(_uid)
    ) {
      hasLogin = false;
    }
    return hasLogin;
  };

  getLoginInfo = () => {
    const roomId = sessionStorage.getItem('roomId') as string;
    const username = sessionStorage.getItem('username') as string;
    const publishAudio = sessionStorage.getItem('publishAudio');

    return {
      roomId,
      username,
      publishAudio,
    };
  };

  removeLoginInfo = () => {
    const variable = ['roomId', 'username', 'publishAudio'];
    variable.forEach((v) => sessionStorage.removeItem(v));
  };

  isPureObject = (target: any) => Object.prototype.toString.call(target).includes('Object');

  isArray = Array.isArray;

  debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (...args: any[]) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };

  addMsgWithoutDuplicate = (arr: RoomState['msgHistory'], added: Msg) => {
    if (arr.length) {
      const last = arr.at(-1)!;
      const { user, value, isInterrupted } = last;
      if (user === added.user && (added.value.startsWith(value) || value.startsWith(added.value))) {
        arr.pop();
        added.isInterrupted = isInterrupted;
      }
    }
    arr.push(added);
  };
}

export default new Utils();
