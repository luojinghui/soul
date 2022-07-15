import React, { useRef } from 'react';
import {
  message,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Tabs,
} from 'antd';
import { UploadImg } from '@/components';
import action from '@/action';

const { Option } = Select;
const tags = [
  {
    key: 'wangzhe',
    name: '王者荣耀',
  },
  {
    key: 'guangyu',
    name: '光遇',
  },
  {
    key: 'juezhan',
    name: '决战平安京',
  },
  {
    key: 'danzai',
    name: '蛋仔派对',
  },
  {
    key: 'xuexi',
    name: '学习监督',
  },
  {
    key: 'lanqiu',
    name: '篮球🏀',
  },
  {
    key: 'changge',
    name: '唱歌',
  },
  {
    key: 'tiaowu',
    name: '跳舞💃',
  },
  {
    key: 'duanshipin',
    name: '短视频',
  },
];

interface IPorps {
  userId: string;
  visible: boolean;
  onCancel: () => void;
  onCreateOK: () => void;
}

const AddRoomMoel = (props: IPorps) => {
  const { userId, visible } = props;
  const imgRef = useRef<any>('');
  const [form] = Form.useForm();

  const handleOk = () => {};

  const handleCancel = () => {
    props.onCancel();
  };

  const onFinish = async (e: any) => {
    const oriRoomName = e.roomName.trim();
    const data = {
      ...e,
      roomName: oriRoomName + '星球',
      roomImg: imgRef.current?.response?.data?.fileUrl || '',
    };

    console.log('data:', data);

    if (!oriRoomName.length) {
      message.info('填写星球名称');

      return;
    }

    if (!data.roomImg) {
      message.info('上传一张星球头像');

      return;
    }

    try {
      const result = await action.createRoom(data, userId);

      if (result.code === 200) {
        message.info('创建星球成功');

        props.onCreateOK();
      }
    } catch (err: any) {}
    form.resetFields();
    props.onCancel();
  };

  const onUploadChange = (fileList: any) => {
    console.log('fileList: ', fileList);

    imgRef.current = fileList[0] || '';
  };

  const children: React.ReactNode[] = [];

  tags.forEach(({ key, name }) => {
    children.push(
      <Option key={key} value={name}>
        {name}
      </Option>
    );
  });

  return (
    <Modal
      title="创建兴趣星球"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="创建"
      cancelText="取消"
      footer={false}
      wrapClassName="room-model"
      width={350}
    >
      <Form
        form={form}
        name="roomInfo"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          className="item room-name-item"
          label="名称"
          name="roomName"
          initialValue={''}
        >
          <div>
            <Input />
            <span>星球</span>
          </div>
        </Form.Item>

        <Form.Item
          initialValue={''}
          className="item"
          label="头像"
          name="roomImg"
        >
          <UploadImg fileList={[]} onChange={onUploadChange} userId={userId} />
        </Form.Item>

        <Form.Item
          className="item"
          initialValue={[]}
          label="标签"
          name="roomTag"
        >
          <Select
            dropdownClassName="ins-item"
            mode="tags"
            size="middle"
            placeholder=""
            showArrow={true}
          >
            {children}
          </Select>
        </Form.Item>

        <Form.Item
          className="item"
          label="介绍"
          name="roomDesc"
          initialValue={''}
        >
          <Input />
        </Form.Item>

        <Form.Item className="item" initialValue={''} label="密码" name="pwd">
          <Input />
        </Form.Item>

        <Form.Item
          initialValue={false}
          className="item item-bottom"
          label="私有"
          name="private"
          valuePropName="checked"
        >
          <Switch></Switch>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
          <Button type="primary" htmlType="submit">
            创建
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoomMoel;
