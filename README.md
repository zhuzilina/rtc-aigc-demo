# 交互式AIGC场景 AIGC Demo

## 简介
- 在 AIGC 对话场景下，火山引擎 AIGC-RTC Server 云端服务，通过整合 RTC 音视频流处理，ASR 语音识别，大模型接口调用集成，以及 TTS 语音生成等能力，提供基于流式语音的端到端AIGC能力链路。
- 用户只需调用基于标准的 OpenAPI 接口即可配置所需的 ASR、LLM、TTS 类型和参数。火山引擎云端计算服务负责边缘用户接入、云端资源调度、音视频流压缩、文本与语音转换处理以及数据订阅传输等环节。简化开发流程，让开发者更专注在对大模型核心能力的训练及调试，从而快速推进AIGC产品应用创新。     
- 同时火山引擎 RTC拥有成熟的音频 3A 处理、视频处理等技术以及大规模音视频聊天能力，可支持 AIGC 产品更便捷的支持多模态交互、多人互动等场景能力，保持交互的自然性和高效性。 

## 【必看】环境准备
- Node 版本: 16.0+
1. 需要准备两个 Terminal，分别启动服务端、前端页面。
2. **根据你自定义的 
RoomId、UserId 以及申请的 AppID、BusinessID(如有)、Token、ASR AppID、TTS AppID，修改 `src/config/config.ts` 文件中 `ConfigFactory` 中 `BaseConfig` 的配置信息**。
3. 使用火山引擎控制台账号的 [AK、SK](https://console.volcengine.com/iam/keymanage)、[SessionToken](https://www.volcengine.com/docs/6348/1315561#sub)(临时token, 子账号才需要), 修改 `Server/app.js` 文件中的 `ACCOUNT_INFO`。
4. 您需要在 [火山方舟-在线推理](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint?config=%7B%7D) 中创建接入点, 并将模型对应的接入点 ID 填入 `src/config/common.ts` 文件中的 `ARK_V3_MODEL_ID`, 否则无法正常启动智能体。
5. 如果您已经自行完成了服务端的逻辑，可以不依赖 Demo 中的 Server，直接修改前端代码文件 `src/config/index.ts` 中的 `AIGC_PROXY_HOST` 请求域名和接口，并在 `src/app/api.ts` 中修改接口的参数配置 `APIS_CONFIG`。

## 快速开始
### 服务端
进到项目根目录
#### 安装依赖
```shell
cd Server
yarn
```
#### 运行项目
```shell
node app.js
```

### 前端页面
进到项目根目录
#### 安装依赖
```shell
yarn
```
#### 运行项目
```shell
yarn dev
```

### 常见问题
| 问题 | 解决方案 |
| :-- | :-- |
| `Server/app.js` 中的 `sessionToken` 是什么，该怎么填，为什么要填 | `sessionToken` 是火山引擎子账号发起 OpenAPI 请求时所必须携带的临时 Token，获取方式可参考 [此文章末尾](https://www.volcengine.com/docs/6348/1315561)。 |
| 不清楚什么是主账号，什么是子账号 | 可以参考[官方概念](https://www.volcengine.com/docs/6257/64963?hyperlink_open_type=lark.open_in_browser) 。|
| **启动智能体之后, 对话无反馈** | <li>参数传递可能有问题, 例如参数大小写、类型等问题，请再次确认下这类型问题是否存在。</li><li>另一方面，可能是因为控制台中相关权限没有正常授予，请参考[流程](https://www.volcengine.com/docs/6348/1315561)再次确认下是否完成相关操作。</li><li>相关资源可能未开通或者用量不足，请再次确认。</li><li>请检查本地的网络/带宽情况</li> |
| **浏览器报了 `Uncaught (in promise) r: token_error` 错误** | 请检查您填在项目中的 RTC Token 是否合法，检测用于生成 Token 的 UserId、RoomId 是否与项目中填写的一致。 |
| 什么是 RTC | **R**eal **T**ime **C**ommunication, RTC 的概念可参考[官网文档](https://www.volcengine.com/docs/6348/66812)。 |
| 为什么我的麦克风正常、摄像头也正常，但是设备没有正常工作? | 可能是设备权限未授予，详情可参考 [Web 排查设备权限获取失败问题](https://www.volcengine.com/docs/6348/1356355)。 |

如果有上述以外的问题，也可以参考[问题反馈收集](https://bytedance.larkoffice.com/docx/FM51drJNFoSFcAxciXYcZkpmnBl)，或者联系我们帮忙排查处理。

### 相关文档
- [场景介绍](https://www.volcengine.com/docs/6348/1310537)
- [Demo 体验](https://www.volcengine.com/docs/6348/1310559)
- [场景搭建方案](https://www.volcengine.com/docs/6348/1310560)
