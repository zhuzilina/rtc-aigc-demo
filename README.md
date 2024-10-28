# 交互式AIGC场景 AIGC Demo

## 简介
在 AIGC 对话场景下，火山引擎 AIGC-RTC Server 云端服务，通过整合 RTC 音视频流处理，ASR 语音识别，大模型接口调用集成，以及 TTS 语音生成等能力，提供基于流式语音的端到端AIGC能力链路。
用户只需调用基于标准的 OpenAPI 接口即可配置所需的 ASR、LLM、TTS 类型和参数。火山引擎云端计算服务负责边缘用户接入、云端资源调度、音视频流压缩、文本与语音转换处理以及数据订阅传输等环节。简化开发流程，让开发者更专注在对大模型核心能力的训练及调试，从而快速推进AIGC产品应用创新。
       
同时火山引擎 RTC拥有成熟的音频 3A 处理、视频处理等技术以及大规模音视频聊天能力，可支持 AIGC 产品更便捷的支持多模态交互、多人互动等场景能力，保持交互的自然性和高效性。 

# 快速开始
## 环境准备
- Node 版本: 16.0+
- 需要准备两个 Terminal，分别启动服务端、前端页面。
- 根据你自定义的 
RoomId、UserId 以及申请的 AppID、BusinessID、Token、ASR AppID、TTS AppID，修改 `src/config/index.ts` 文件中的配置信息。
- 根据你申请到的 AK、SK、SessionToken, 修改 `Server/app.js` 文件中的配置信息。
- 如果您已经自己完成了服务端的逻辑，可以修改前端代码文件 `src/config/index.ts` 中的 `AIGC_PROXY_HOST` 修改请求的域名，并在 `src/app/api.ts` 中修改接口的参数配置。

## 服务端
进到项目根目录
### 安装依赖
```shell
cd Server
yarn
```
### 运行项目
```shell
node app.js
```

## 前端页面
进到项目根目录
### 安装依赖
```shell
yarn
```
### 运行项目
```shell
yarn dev
```

## 相关文档
- [场景介绍](https://www.volcengine.com/docs/6348/1310537)
- [Demo 体验](https://www.volcengine.com/docs/6348/1310559)
- [场景搭建方案](https://www.volcengine.com/docs/6348/1310560)
