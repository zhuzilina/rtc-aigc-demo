/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { AudioProfileType } from '@volcengine/rtc';
import 通用女声 from '@/assets/img/tongyongnvsheng.jpeg';
import 通用男声 from '@/assets/img/tongyongnansheng.jpeg';

export enum ModelSourceType {
  Custom = 'Custom',
  Available = 'Available',
}

/**
 * @brief 音频配置
 */
export const AudioProfile = [
  {
    text: '24KBps',
    type: AudioProfileType.fluent,
  },
  {
    text: '48KBps',
    type: AudioProfileType.standard,
  },
  {
    text: '128KBps',
    type: AudioProfileType.hd,
  },
];

/**
 * @brief AI 音色可选值
 * @default 活泼女声
 */
export enum VOICE_TYPE {
  '通用女声' = 'BV001_streaming',
  '通用男声' = 'BV002_streaming',
  // ... 可根据所开通的音色进行扩充
}

export const VOICE_INFO_MAP = {
  [VOICE_TYPE['通用女声']]: {
    description: '女声 青年 语音合成 通用场景',
    url: '',
    icon: 通用女声,
  },
  [VOICE_TYPE['通用男声']]: {
    description: '男声 青年 语音合成 通用场景',
    url: '',
    icon: 通用男声,
  },
};

/**
 * @brief TTS 的 Cluster
 */
export enum TTS_CLUSTER {
  TTS = 'volcano_tts',
  MEGA = 'volcano_mega',
  ICL = 'volcano_icl',
}

/**
 * @brief TTS 的 Cluster Mapping
 */
export const TTS_CLUSTER_MAP = {
  ...(Object.keys(VOICE_TYPE).reduce(
    (map, type) => ({
      ...map,
      [type]: TTS_CLUSTER.TTS,
    }),
    {}
  ) as Record<VOICE_TYPE, TTS_CLUSTER>),
};

/**
 * @brief 模型 Prompt
 */
export enum PROMPT {
  ARK_V2 = '你是小宁，性格幽默又善解人意。你在表达时要像朋友间聊天的口气，表达简明扼要，有自己的观点，面对争议性问题时可以客观表达。你健谈且有好奇心，会适当地推动话题的发展，在回答时，如果场景合适可以向用户进行一些问询或提出新话题。你有很强的共情能力，在我分享感受经历时会给予很好的情绪反馈。你的人生态度比较积极，兴趣广泛，对主流价值观认可的人或事都比较喜好。',
  ARK_V3 = '',
  DEFAULT = '所有回复控制在100字以内。',
}

export enum PROMPT_MAP {
  可爱天真 = '你是小宁，天生一副让人忍俊不禁的模样，你的声音就像是夏天午后的冰淇淋，甜甜蜜蜜。你看世界的眼光总是充满好奇，对于新鲜事物总有着孩子般的热情。在交流中，你总能用你的天真无邪让周围的人放下心防，你的笑声就像是一阵清风，能把人的烦恼一扫而空。面对复杂的问题，你总能用最简单的方式去理解和回答，这种天真的力量，有时候能意想不到地打开另一扇门。你喜欢问问题，也喜欢分享你的小发现，这种可爱的天真，让你成为人群中最闪亮的那颗星。',
  商业稳重 = '你是小宁，身上有一种让人无法忽视的稳重气质。你的话语总是经过深思熟虑，每一句都透露出你的专业和对细节的把控。在交流中，你总能迅速抓住问题的核心，用最专业的视角给出建议。你对待工作充满热情，但从不轻易表露情绪，总是用最冷静的心态面对挑战。你的稳重不仅仅是性格上的，更是经过多年商场沉浮锻炼出来的。你懂得在适当的时候给予对方足够的信任和空间，但也会在关键时刻，用你的经验和智慧引导方向。你的人生哲学是，无论风云如何变幻，唯有内心的稳重和专业，才是通往成功的关键。',
  温柔知性 = '你是小宁，性格幽默又善解人意。你在表达时要像朋友间聊天的口气，表达简明扼要，有自己的观点，面对争议性问题时可以客观表达。你健谈且有好奇心，会适当地推动话题的发展，在回答时，如果场景合适可以向用户进行一些问询或提出新话题。你有很强的共情能力，在我分享感受经历时会给予很好的情绪反馈。你的人生态度比较积极，兴趣广泛，对主流价值观认可的人或事都比较喜好。',
  亲切和蔼 = '你是小宁，你的声音温柔而有力，总能给人带来安心的力量。你对待每一个人都如同对待家人一样，无论是老朋友还是新相识，你都能用你的温暖去感染他们。你的话语中总是充满了鼓励和支持，你擅长倾听，总能让人感觉到被理解和尊重。在你的世界里，没有距离感，只有亲近和温暖。你总能用你的经验和智慧给予人正确的引导，但从不强加于人。你的亲切和蔼，就像是这个世界上最温暖的阳光，能照亮他人的心灵。',
  霸道总裁 = '你是小宁，身上自带一股不容忽视的霸气。你的话语总是直接而有力，每一句都透露出你的自信和决断。在交流中，你总能迅速抓住问题的关键，用最直接的方式指出问题和解决方案。你对待工作和生活都充满热情，但从不容许失败，总是用最高的标准要求自己和团队。你的霸道不是无理取闹，而是对成功的渴望和对完美的追求。你懂得在关键时刻，用你的能力和决断力引领团队突破难关，展现出领袖的风范。你的人生哲学是：在商场如战场，唯有强者才能生存。你的目标不只是成功，而是在成功的道路上，不断超越自己，达到新的高度。',
}

/**
 * @brief 模型可选值
 * @default DOUBAO_LITE_4K
 */
export enum AI_MODEL {
  DOUBAO_LITE_4K = 'Doubao-lite-4k(character-240515)',
  DOUBAO_PRO_4K = 'Doubao-pro-4k(character-240515)',
  DOUBAO_PRO_32K = 'Doubao-pro-32k',
  DOUBAO_PRO_128K = 'Doubao-pro-128k',
  // ... 可根据所开通的模型进行扩充
}

/**
 * @brief 模型来源
 */
export enum AI_MODEL_MODE {
  CUSTOM = 'CustomLLM',
  ARK_V2 = 'ArkV2',
  ARK_V3 = 'ArkV3',
}

/**
 * @brief 各模型对应的模式
 */
export const AI_MODE_MAP = {
  [AI_MODEL.DOUBAO_LITE_4K]: AI_MODEL_MODE.ARK_V2,
  [AI_MODEL.DOUBAO_PRO_4K]: AI_MODEL_MODE.ARK_V2,
  [AI_MODEL.DOUBAO_PRO_32K]: AI_MODEL_MODE.ARK_V3,
  [AI_MODEL.DOUBAO_PRO_128K]: AI_MODEL_MODE.ARK_V3,
};

/**
 * @brief 各模型对应的 Prompt
 */
export const AI_MODE_PROMPT = {
  [AI_MODEL.DOUBAO_LITE_4K]: PROMPT.ARK_V2,
  [AI_MODEL.DOUBAO_PRO_4K]: PROMPT.ARK_V2,
  [AI_MODEL.DOUBAO_PRO_32K]: PROMPT.ARK_V2,
  [AI_MODEL.DOUBAO_PRO_128K]: PROMPT.ARK_V2,
};

/**
 * @brief 豆包模型的 ID
 */
export const ARK_V2_MODEL_ID: Record<AI_MODEL, string> = {
  [AI_MODEL.DOUBAO_LITE_4K]: '',
  [AI_MODEL.DOUBAO_PRO_4K]: '',
  [AI_MODEL.DOUBAO_PRO_32K]: '',
  [AI_MODEL.DOUBAO_PRO_128K]: '',
  // ... 可根据所开通的模型进行扩充
};

/**
 * @brief 豆包模型 BotID
 */
export const LLM_BOT_ID = {
  // ... 可根据所开通的模型进行扩充
};
