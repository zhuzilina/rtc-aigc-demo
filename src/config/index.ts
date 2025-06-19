/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import CustomScene from '@/config/scenes/Custom.json';
import VirtualGirlfriend from '@/config/scenes/VirtualGirlfriend.json';

export * from './config';

export const Disclaimer = 'https://www.volcengine.com/docs/6348/68916';
export const ReversoContext = 'https://www.volcengine.com/docs/6348/68918';
export const UserAgreement = 'https://www.volcengine.com/docs/6348/128955';

/**
 * @note 请求的 API Proxy Server(对应此 Demo 中包含的 Node server) 地址。
 *       您可按需改成自己需要访问的地址。
 */
export const AIGC_PROXY_HOST = 'http://localhost:3001';

export interface IScene {
  icon: string;
  name: string;
  questions: string[];
  agentConfig: Record<string, any>;
  llmConfig: Record<string, any>;
  asrConfig: Record<string, any>;
  ttsConfig: Record<string, any>;
}

export const Scenes: IScene[] = [CustomScene, VirtualGirlfriend];
export const SceneMap: Record<string, IScene> = {
  [CustomScene.name]: CustomScene,
  [VirtualGirlfriend.name]: VirtualGirlfriend,
};
