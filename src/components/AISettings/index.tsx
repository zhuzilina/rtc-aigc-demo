/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { Button, Drawer, Input, Message } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconSwap } from '@arco-design/web-react/icon';
import { StreamIndex } from '@volcengine/rtc';
import CheckIcon from '../CheckIcon';
import Config, {
  Icon,
  Name,
  SCENE,
  Prompt,
  Welcome,
  Voice,
  Model,
  AI_MODEL,
  ModelSourceType,
  VOICE_INFO_MAP,
  VOICE_TYPE,
  isVisionMode,
} from '@/config';
import TitleCard from '../TitleCard';
import CheckBoxSelector from '@/components/CheckBoxSelector';
import RtcClient from '@/lib/RtcClient';
import { clearHistoryMsg, updateAIConfig, updateScene } from '@/store/slices/room';
import { RootState } from '@/store';
import utils from '@/utils/utils';
import { useDeviceState } from '@/lib/useCommon';

import VoiceTypeChangeSVG from '@/assets/img/VoiceTypeChange.svg';
import DoubaoModelSVG from '@/assets/img/DoubaoModel.svg';
import ModelChangeSVG from '@/assets/img/ModelChange.svg';
import styles from './index.module.less';

export interface IAISettingsProps {
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

const SCENES = [
  SCENE.INTELLIGENT_ASSISTANT,
  SCENE.SCREEN_READER,
  SCENE.VIRTUAL_GIRL_FRIEND,
  SCENE.TRANSLATE,
  SCENE.CHILDREN_ENCYCLOPEDIA,
  SCENE.CUSTOMER_SERVICE,
  SCENE.TEACHING_ASSISTANT,
  SCENE.CUSTOM,
];

function AISettings({ open, onCancel, onOk }: IAISettingsProps) {
  const dispatch = useDispatch();
  const { isVideoPublished, isScreenPublished, switchScreenCapture, switchCamera } =
    useDeviceState();
  const room = useSelector((state: RootState) => state.room);
  const [loading, setLoading] = useState(false);
  const [use3Part, setUse3Part] = useState(false);
  const [scene, setScene] = useState(room.scene);
  const [data, setData] = useState({
    prompt: Prompt[scene],
    welcome: Welcome[scene],
    voice: Voice[scene],
    model: Model[scene],

    Url: '',
    APIKey: '',
    customModelName: '',
  });

  const handleVoiceTypeChanged = (key: string) => {
    setData((prev) => ({
      ...prev,
      voice: key as VOICE_TYPE,
    }));
  };

  const handleChecked = (checkedScene: SCENE) => {
    setScene(checkedScene);
    setData((prev) => ({
      ...prev,
      prompt: Prompt[checkedScene],
      welcome: Welcome[checkedScene],
      voice: Voice[checkedScene],
      model: Model[checkedScene],
    }));
  };

  const handleUseThirdPart = () => {
    setUse3Part(!use3Part);
    Config.ModeSourceType = use3Part ? ModelSourceType.Custom : ModelSourceType.Available;
  };

  const handleUpdateConfig = async () => {
    dispatch(updateScene({ scene }));
    if (use3Part) {
      if (!data.Url) {
        Message.error('请输入正确的第三方模型地址');
        return;
      }
      if (!data.Url.startsWith('http://') && !data.Url.startsWith('https://')) {
        Message.error('第三方模型请求地址格式不正确, 请以 http:// 或 https:// 为开头');
        return;
      }
      Config.Url = data.Url;
      Config.APIKey = data.APIKey;
      Config.ModeSourceType = ModelSourceType.Custom;
    } else {
      Config.Url = undefined;
      Config.APIKey = undefined;
      Config.ModeSourceType = ModelSourceType.Available;
    }
    setLoading(true);
    Config.Model = use3Part ? (data.customModelName as AI_MODEL) : (data.model as AI_MODEL);
    Config.Prompt = data.prompt;
    Config.VoiceType = data.voice;
    Config.WelcomeSpeech = data.welcome;
    dispatch(updateAIConfig(Config.aigcConfig));

    if (isVisionMode(data.model)) {
      switch (scene) {
        case SCENE.SCREEN_READER:
          /** 关摄像头，打开屏幕采集 */
          room.isJoined && isVideoPublished && switchCamera();
          Config.VisionSourceType = StreamIndex.STREAM_INDEX_SCREEN;
          break;
        default:
          /** 关屏幕采集，打开摄像头 */
          room.isJoined && !isVideoPublished && switchCamera();
          room.isJoined && isScreenPublished && switchScreenCapture();
          Config.VisionSourceType = StreamIndex.STREAM_INDEX_MAIN;
          break;
      }
    } else {
      /** 全关 */
      room.isJoined && isVideoPublished && switchCamera();
      room.isJoined && isScreenPublished && switchScreenCapture();
    }

    if (RtcClient.getAudioBotEnabled()) {
      dispatch(clearHistoryMsg());
      await RtcClient.updateAudioBot();
    }

    setLoading(false);
    onOk?.();
  };

  useEffect(() => {
    if (open) {
      setScene(room.scene);
    }
  }, [open]);

  return (
    <Drawer
      width={utils.isMobile() ? '100%' : 940}
      closable={false}
      maskClosable={false}
      title={null}
      className={styles.container}
      style={{
        padding: utils.isMobile() ? '0px' : '16px 8px',
      }}
      footer={
        <div className={styles.footer}>
          <div className={styles.suffix}>AI 配置修改后，退出房间将不再保存该配置方案</div>
          <Button loading={loading} className={styles.cancel} onClick={onCancel}>
            取消
          </Button>
          <Button loading={loading} className={styles.confirm} onClick={handleUpdateConfig}>
            确定
          </Button>
        </div>
      }
      visible={open}
      onCancel={onCancel}
    >
      <div className={styles.title}>
        选择你所需要的
        <span className={styles['special-text']}> AI 人设</span>
      </div>
      <div className={styles['sub-title']}>
        我们已为您配置好对应人设的基本参数，您也可以根据自己的需求进行自定义设置
      </div>
      <div className={utils.isMobile() ? styles['scenes-mobile'] : styles.scenes}>
        {[...SCENES, null].map((key) =>
          key ? (
            <CheckIcon
              key={key}
              tag={
                [SCENE.TEACHING_ASSISTANT, SCENE.SCREEN_READER].includes(key) ? '视觉理解模型' : ''
              }
              icon={Icon[key as keyof typeof Icon]}
              title={Name[key as keyof typeof Name]}
              checked={key === scene}
              blur={key !== scene && key === SCENE.CUSTOM}
              onClick={() => handleChecked(key as SCENE)}
            />
          ) : utils.isMobile() ? (
            <div style={{ width: '100px', height: '100px' }} />
          ) : null
        )}
      </div>
      <div className={styles.configuration}>
        {utils.isMobile() ? null : (
          <div
            className={styles.anchor}
            style={{
              /**
               * @note 单个场景卡片 100px, 间距 14px;
               */
              left: `${SCENES.indexOf(scene) * 100 + 50 + SCENES.indexOf(scene) * 14}px`,
            }}
          />
        )}
        <TitleCard title="Prompt">
          <Input.TextArea
            autoSize
            value={data.prompt}
            onChange={(val) => {
              setData((prev) => ({
                ...prev,
                prompt: val,
              }));
            }}
            placeholder="请输入你需要的 Prompt 设定"
          />
        </TitleCard>
        <TitleCard title="欢迎语">
          <Input.TextArea
            autoSize
            value={data.welcome}
            onChange={(val) => {
              setData((prev) => ({
                ...prev,
                welcome: val,
              }));
            }}
            placeholder="请输入欢迎语"
          />
        </TitleCard>
        <div
          className={styles['ai-settings']}
          style={{
            flexWrap: utils.isMobile() ? 'wrap' : 'nowrap',
          }}
        >
          <TitleCard title="音色">
            <div className={styles['ai-settings-wrapper']}>
              <CheckBoxSelector
                label="音色选择"
                data={Object.keys(VOICE_TYPE).map((type) => {
                  const info = VOICE_INFO_MAP[VOICE_TYPE[type as keyof typeof VOICE_TYPE]];
                  return {
                    key: VOICE_TYPE[type as keyof typeof VOICE_TYPE],
                    label: type,
                    icon: info.icon,
                    description: info.description,
                  };
                })}
                onChange={handleVoiceTypeChanged}
                value={data.voice}
                moreIcon={VoiceTypeChangeSVG}
                moreText="更换音色"
                placeHolder="请选择你需要的音色"
              />
            </div>
          </TitleCard>
          <div className={styles['ai-settings-model']}>
            {use3Part ? (
              <>
                <TitleCard required title="第三方模型地址">
                  <Input.TextArea
                    autoSize
                    value={data.Url}
                    onChange={(val) => {
                      setData((prev) => ({
                        ...prev,
                        Url: val,
                      }));
                    }}
                    placeholder="请输入第三方模型地址"
                  />
                </TitleCard>
                <TitleCard title="请求密钥">
                  <Input.TextArea
                    autoSize
                    value={data.APIKey}
                    onChange={(val) => {
                      setData((prev) => ({
                        ...prev,
                        APIKey: val,
                      }));
                    }}
                    placeholder="请输入请求密钥"
                  />
                </TitleCard>
                <TitleCard title="模型名称">
                  <Input.TextArea
                    autoSize
                    value={data.customModelName}
                    onChange={(val) => {
                      setData((prev) => ({
                        ...prev,
                        customModelName: val,
                      }));
                    }}
                    placeholder="请输入模型名称"
                  />
                </TitleCard>
              </>
            ) : (
              <TitleCard title="官方模型">
                <CheckBoxSelector
                  label="模型选择"
                  data={Object.keys(AI_MODEL).map((type) => ({
                    key: AI_MODEL[type as keyof typeof AI_MODEL],
                    label: type.replaceAll('_', ' '),
                    icon: DoubaoModelSVG,
                  }))}
                  moreIcon={ModelChangeSVG}
                  moreText="更换模型"
                  placeHolder="请选择你需要的模型"
                  onChange={(key) => {
                    setData((prev) => ({
                      ...prev,
                      model: key as AI_MODEL,
                    }));
                  }}
                  value={data.model}
                />
              </TitleCard>
            )}

            <Button size="mini" type="text" onClick={handleUseThirdPart}>
              {use3Part ? '使用官方模型' : '使用第三方模型'} <IconSwap />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default AISettings;
