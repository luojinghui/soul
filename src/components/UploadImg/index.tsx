import { useState } from 'react';
import { httpServer } from '@/enum';
import ImgCrop from 'antd-img-crop';
import { Upload } from 'antd';

import './index.less';

interface IProps {
  onChange: (list: any) => void;
  userId: string;
}

export default function UploadImg(props: IProps) {
  const userId = props.userId;
  const [fileList, setFileList] = useState<any[]>([]);

  const handleImgChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);

    props.onChange(newFileList);
  };

  return (
    <div className="soul_upload_img">
      <ImgCrop
        modalCancel={'取消'}
        modalOk={'确定'}
        modalTitle="编辑图片"
        quality={0.6}
        modalWidth={350}
      >
        <Upload
          showUploadList={{
            showRemoveIcon: true,
            showPreviewIcon: false,
          }}
          action={`${httpServer}/api/rest/room/uploadImg?userId=${userId}`}
          data={{ userId }}
          onChange={handleImgChange}
          maxCount={1}
          accept="image/*"
          fileList={fileList}
          listType="picture-card"
        >
          {!fileList.length && '上传'}
        </Upload>
      </ImgCrop>
    </div>
  );
}
