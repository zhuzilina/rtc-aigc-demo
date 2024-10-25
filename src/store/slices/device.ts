/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeviceType } from '@/interface';

export const medias = [DeviceType.Microphone];

export const MediaName = {
  [DeviceType.Microphone]: 'microphone',
};

export interface DeviceState {
  audioInputs: MediaDeviceInfo[];
  selectedCamera?: string;
  selectedMicrophone?: string;
  devicePermissions: {
    audio: boolean;
  };
}
const initialState: DeviceState = {
  audioInputs: [],
  devicePermissions: {
    audio: true,
  },
};

export const DeviceSlice = createSlice({
  name: 'deivce',
  initialState,
  reducers: {
    updateMediaInputs: (state, { payload }) => {
      state.audioInputs = payload.audioInputs;
    },
    updateSelectedDevice: (state, { payload }) => {
      if (payload.selectedCamera) {
        state.selectedCamera = payload.selectedCamera;
      }
      if (payload.selectedMicrophone) {
        state.selectedMicrophone = payload.selectedMicrophone;
      }
    },

    setMicrophoneList: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.audioInputs = action.payload;
    },

    setDevicePermissions: (
      state,
      action: PayloadAction<{
        audio: boolean;
      }>
    ) => {
      state.devicePermissions = action.payload;
    },
  },
});
export const { updateMediaInputs, updateSelectedDevice, setMicrophoneList, setDevicePermissions } =
  DeviceSlice.actions;

export default DeviceSlice.reducer;
