/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { Form, Input, Alert, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import DrawerRowItem from '@/components/DrawerRowItem';
import FieldTitle from './FieldTitle';
import RtcClient from '@/lib/RtcClient';
import {
  AI_MODEL,
  ModelSourceType,
  VOICE_TYPE,
  AI_MODEL_MODE,
  Config,
  TTS_CLUSTER,
  TTS_CLUSTER_MAP,
  VOICE_INFO_MAP,
  PROMPT,
} from '@/config';
import { clearCurrentMsg, updateAIConfig } from '@/store/slices/room';
import { RootState } from '@/store';
import PromptGenerator from './PromptGenerator';
import CheckBoxSelector from './CheckBoxSelector';
import ButtonRadio from '@/components/ButtonRadio';
import styles from './index.module.less';
import ModelChangeSVG from '@/assets/img/ModelChange.svg';
import VoiceTypeChangeSVG from '@/assets/img/VoiceTypeChange.svg';
import AISettingSVG from '@/assets/img/AISetting.svg';
import DoubaoModelSVG from '@/assets/img/DoubaoModel.svg';
import InfoIconSVG from '@/assets/img/InfoIcon.svg';

function AISettingDrawerButton() {
  const room = useSelector((state: RootState) => state.room);
  const aiConfig = room.aiConfig;
  const [form] = Form.useForm<{
    voiceType: VOICE_TYPE;
    modelName: AI_MODEL;
    welcomeSpeech: string;
    prompt: PROMPT;

    modelSourceType: ModelSourceType;

    customModelUrl?: string;
    customModelAPIKey?: string;
    customModelName?: string;
  }>();

  const dispatch = useDispatch();

  const handleOk = async () => {
    const formValues = await form.validateFields();
    const config: {
      TTSConfig: Partial<Config['TTSConfig']>;
      LLMConfig: Partial<Config['LLMConfig']> & {
        Url?: string;
        APIKey?: string;
      };
    } = {
      TTSConfig: {
        VoiceType: formValues.voiceType,
        Cluster: TTS_CLUSTER_MAP[formValues.voiceType] || TTS_CLUSTER.TTS,
      },
      LLMConfig: {
        ModelName: formValues.modelName,
        WelcomeSpeech: formValues.welcomeSpeech,
        Mode: AI_MODEL_MODE.ARK_V3,
        EndPointId: '',
        SystemMessages: [formValues.prompt],
        ModeSourceType: ModelSourceType.Available,
      },
    };

    if (formValues.modelSourceType === ModelSourceType.Custom) {
      config.LLMConfig.ModeSourceType = ModelSourceType.Custom;
      config.LLMConfig.Url = formValues.customModelUrl;
      config.LLMConfig.APIKey = formValues.customModelAPIKey;
      config.LLMConfig.Feature = JSON.stringify({ Http: true });
    }

    const isAudioEnable = RtcClient.getAudioBotEnabled();
    if (isAudioEnable) {
      dispatch(clearCurrentMsg());
    }
    await RtcClient.updateAudioBot(room.roomId!, room.localUser.userId!, config);

    dispatch(
      updateAIConfig({
        Config: config,
      })
    );
  };

  const handleModelTypeChanged = (type: string) => {
    if (type === ModelSourceType.Custom) {
      form.setFieldValue('modelName', undefined);
    }
    if (type === ModelSourceType.Available) {
      form.setFieldValue('modelName', AI_MODEL.DOUBAO_LITE_4K);
    }
  };

  const handlePromptGenItemClick = (value: string) => {
    form.setFieldValue('prompt', value);
  };

  const handleVoiceTypeChanged = (key: string) => {
    form.setFieldValue('voiceType', key);
  };

  const handleConfirm = async () => {
    Modal.confirm({
      title: (
        <div className={styles.confirmModal}>
          <img src={InfoIconSVG} alt="info" />
          刷新频道以启用配置
        </div>
      ),
      icon: null,
      content: '修改 AI 配置将刷新频道, 是否确定要修改配置',
      onOk: handleOk,
      okButtonProps: {
        style: { borderRadius: 4 },
      },
      okText: '确定',
      cancelText: '取消',
      cancelButtonProps: {
        style: { borderRadius: 4 },
      },
    });
  };

  const handleDrawerOpen = () => {
    form.setFieldsValue({
      voiceType: aiConfig.Config.TTSConfig.VoiceType,
      modelName: aiConfig.Config.LLMConfig.ModelName,
      welcomeSpeech: aiConfig.Config.LLMConfig.WelcomeSpeech,
      prompt: aiConfig.Config.LLMConfig.SystemMessages[0]!,
      modelSourceType: aiConfig.Config.LLMConfig.ModeSourceType,
      customModelUrl: aiConfig.Config.LLMConfig.Url,
      customModelAPIKey: aiConfig.Config.LLMConfig.APIKey,
    });
  };

  return (
    <DrawerRowItem
      btnText="AI 设置"
      btnSrc={AISettingSVG}
      drawer={{
        width: 720,
        title: 'AI 设置',
        onConfirm: handleConfirm,
        onCancel: handleDrawerOpen,
        onOpen: handleDrawerOpen,
        children: (
          <div className={styles.wrapper}>
            <Form
              colon={false}
              form={form}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              initialValues={{
                modelSourceType: ModelSourceType.Available,
              }}
            >
              <FieldTitle title="输入欢迎语" />
              <Form.Item
                label=""
                name="welcomeSpeech"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
              >
                <Input.TextArea autoSize className={styles.input} />
              </Form.Item>
              <FieldTitle title="输入 Prompt" />
              <Form.Item
                style={{ marginBottom: 8 }}
                label=""
                name="prompt"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
              >
                <Input.TextArea autoSize className={styles.input} />
              </Form.Item>
              <PromptGenerator onItemClick={handlePromptGenItemClick} />
              <FieldTitle title="选择音色" />
              {/* <Form.Item label="" name="voiceType" hidden /> */}
              <Form.Item label="" name="voiceType" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
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
                  moreIcon={VoiceTypeChangeSVG}
                  moreText="更换音色"
                />
              </Form.Item>
              <FieldTitle title="选择模型" />
              <Form.Item name="modelSourceType" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
                <ButtonRadio
                  onChange={handleModelTypeChanged}
                  options={[
                    { label: '官方模型', key: ModelSourceType.Available },
                    { label: '三方模型', key: ModelSourceType.Custom },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const modelSourceType = getFieldValue('modelSourceType');
                  return modelSourceType === ModelSourceType.Available ? (
                    <Form.Item name="modelName" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
                      <CheckBoxSelector
                        label="模型选择"
                        data={Object.keys(AI_MODEL).map((type) => ({
                          key: AI_MODEL[type as keyof typeof AI_MODEL],
                          label: type.replaceAll('_', ' '),
                          icon: DoubaoModelSVG,
                        }))}
                        moreIcon={ModelChangeSVG}
                        moreText="更换模型"
                      />
                    </Form.Item>
                  ) : (
                    <>
                      <Alert
                        type="info"
                        style={{ width: '100%', marginBottom: '16px' }}
                        message={
                          <>
                            您可以使用工具来验证模型请求接口是否符合第三方大模型接口标准,
                            详情可查阅:
                            <a
                              style={{ marginLeft: 12 }}
                              href="https://bytedance.larkoffice.com/docx/DTpEdcLTXorMqcxszVOcnkZ1nlh"
                              target="_blank"
                              rel="noreferrer"
                            >
                              验证指南
                            </a>
                          </>
                        }
                        banner
                      />
                      <Form.Item
                        label="模型地址"
                        name="customModelUrl"
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 21 }}
                        rules={[
                          { required: true, message: '' },
                          {
                            validator: (_, value: string, cb) => {
                              if (value) {
                                if (!value.startsWith('http://') && !value.startsWith('https://')) {
                                  cb('模型请求地址格式不正确, 请以 http:// 或 https:// 为开头');
                                } else {
                                  cb();
                                }
                              } else {
                                cb();
                              }
                            },
                          },
                        ]}
                      >
                        <Input
                          className={`${styles.third} ${
                            form.getFieldValue('customModelUrl') ? styles.hasContent : ''
                          }`}
                          placeholder="模型地址"
                        />
                      </Form.Item>
                      <Form.Item
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 21 }}
                        label="请求密钥"
                        name="customModelAPIKey"
                      >
                        <Input
                          className={`${styles.third} ${
                            form.getFieldValue('customModelAPIKey') ? styles.hasContent : ''
                          }`}
                          placeholder="Authorization Bearer your_token"
                        />
                      </Form.Item>
                      <Form.Item
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 21 }}
                        label="模型名称"
                        name="modelName"
                      >
                        <Input
                          className={`${styles.third} ${
                            form.getFieldValue('modelName') ? styles.hasContent : ''
                          }`}
                          placeholder="模型名称"
                        />
                      </Form.Item>
                    </>
                  );
                }}
              </Form.Item>
            </Form>
          </div>
        ),
      }}
    />
  );
}

export default AISettingDrawerButton;
