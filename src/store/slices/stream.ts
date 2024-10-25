/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { createSlice } from '@reduxjs/toolkit';
import { AudioProfileType } from '@volcengine/rtc';
import { AudioProfile } from '@/config';

export interface StreamState {
  audioProfile: AudioProfileType;
}
const initialState: StreamState = {
  audioProfile: AudioProfile[0].type,
};

export const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    updateAudioProfile: (state, { payload }) => {
      state.audioProfile = payload.audioProfile;
    },
    updateAllStreamConfig: (state, { payload }) => {
      state.audioProfile = payload.audioProfile;
    },
    resetConfig: (state) => {
      state.audioProfile = initialState.audioProfile;
    },
  },
});

export const { updateAudioProfile, updateAllStreamConfig, resetConfig } = streamSlice.actions;

export default streamSlice.reducer;
