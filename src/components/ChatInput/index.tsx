import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import { Button, Form, message } from 'antd';
import urlRegex from 'url-regex';
import {
  PictureFilled,
  FolderOpenFilled,
  SmileFilled,
  FileMarkdownFilled,
} from '@ant-design/icons';
import { emojiList, emojiMaxList } from './emoji';
import action from '@/action';
import FileQueue, { Status } from './queue';
import { IUserInfo } from '@/type';
import { parseMD } from '@/utils/markdown';

let rangeOfInputBox: any;
const fileQueue = new FileQueue();

interface IProps {
  onSendMessage: (value: any) => void;
  onStateChange: () => void;
  chatRef: any;
  user: IUserInfo | null;
}

function ChatInput(props: IProps) {
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const [emojiVisible, setEmojiVisible] = useState(false);
  const [isMdMode, setIsMdMode] = useState(false);

  useImperativeHandle(props.chatRef, () => ({
    clickChatContent: () => {
      if (emojiVisible) {
        setEmojiVisible(false);
      }
    },
  }));

  const getKeyWords = (str: string, type: string = 'src') => {
    let reg = /src="(.*?)\"/g;

    if (type === 'href') {
      reg = /href="(.*?)\"/g;
    }

    const matchList = str.match(reg) || [];
    const len = matchList.length || 0;
    const list = [];

    for (let i = 0; i < len; i++) {
      let val = matchList[i];
      const data = val.match(reg) || [];
      val = val.replace(data[0], '');

      list.push(RegExp.$1);
    }

    return list;
  };

  const dealInnerHtml = (content: string) => {
    const srcList = getKeyWords(content, 'src');
    const hrefList = getKeyWords(content, 'href');
    const excludeList = srcList.concat(hrefList);
    const urlReg = urlRegex({ strict: true, exact: false });

    content = content.replace(urlReg, (url: string) => {
      if (excludeList.includes(url)) {
        return url;
      }

      const firstWrod = url.substring(0, 4);
      let nextUrl = url;

      if (firstWrod !== 'http') {
        nextUrl = `http://${nextUrl}`;
      }

      return `<a href="${nextUrl}" target="_blank">${url}</a>`;
    });
    return content;
  };

  const validate = (innerText: string, innerHtml: string) => {
    const splitValue = innerText.split('\n');
    const isValidateTrim = splitValue.some(
      (val: string) => !!val.trim().length
    );
    const isValidateHtml = innerHtml.includes('<img');

    return isValidateTrim || isValidateHtml;
  };

  const onFinishFrom = () => {
    // @ts-ignore
    const { innerText = '', innerHTML = '' } = inputRef.current;
    const isValidate = validate(innerText, innerHTML);

    if (!isValidate) {
      message.info('臣妾发送不了空白内容！');
      return;
    }

    let nextValue;

    if (!isMdMode) {
      // @ts-ignore
      const value = inputRef.current.innerHTML;
      nextValue = dealInnerHtml(value);
    } else {
      // @ts-ignore
      const value = inputRef.current.innerText;

      nextValue = parseMD.render(value);
    }

    console.log('nextValue: ', nextValue);

    if (emojiVisible) {
      setEmojiVisible(false);
    }

    props.onSendMessage({
      content: nextValue,
      msgType: 'text',
    });
    // @ts-ignore
    inputRef.current.innerText = '';
  };

  const onInputContent = () => {
    removeDomClass(inputRef.current);
  };

  const removeDomClass = (domNode: any) => {
    const domLen = domNode.children.length;

    for (let i = 0; i < domLen; i++) {
      // 遍历第一级子元素
      const childNode = domNode.children[i];

      childNode.removeAttribute('class');
      childNode.removeAttribute('style');

      if (childNode.nodeName === 'A') {
        childNode.setAttribute('target', '_blank');
      }

      removeDomClass(childNode);
    }
  };

  const insertMaxEmoji = (key: string) => {
    props.onSendMessage({
      content: key,
      msgType: 'super_emoji',
    });
  };

  const insertEmoji = (src: string) => {
    let emojiEl = document.createElement('img');
    emojiEl.src = src;
    emojiEl.setAttribute(`data-emoji-type`, 'min');

    if (!rangeOfInputBox) {
      rangeOfInputBox = new Range();
      rangeOfInputBox.selectNodeContents(inputRef.current);
    }

    if (rangeOfInputBox.collapsed) {
      rangeOfInputBox.insertNode(emojiEl);
    } else {
      rangeOfInputBox.deleteContents();
      rangeOfInputBox.insertNode(emojiEl);
    }
    rangeOfInputBox.collapse(false);
  };

  const handleBoxClick = useCallback(
    (e: any) => {
      if (emojiVisible) {
        setEmojiVisible(false);
      }
      setCaretForEmoji(e.target);
    },
    [emojiVisible]
  );

  const setCaretForEmoji = (target: any) => {
    if (target.tagName.toLowerCase() === 'img') {
      let range = new Range();
      range.setStartBefore(target);
      range.collapse(true);

      // @ts-ignore
      document.getSelection().removeAllRanges();
      // @ts-ignore
      document.getSelection().addRange(range);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', onSelection);

    return () => {
      document.removeEventListener('selectionchange', onSelection);
    };
  }, []);

  const onSelection = () => {
    let selection: any = document.getSelection();

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // @ts-ignore
      if (inputRef.current.contains(range.commonAncestorContainer)) {
        rangeOfInputBox = range;
      }
    }
  };

  useEffect(() => {
    const root: any = document.querySelector(':root');
    const openHeight = 130;

    if (emojiVisible) {
      root.setAttribute('style', `--im-footer-height: ${openHeight}px`);
    } else {
      root.setAttribute('style', `--im-footer-height: 112px`);
    }

    props.onStateChange();
  }, [emojiVisible]);

  const onToggleEmoji = useCallback(() => {
    setEmojiVisible(!emojiVisible);
  }, [emojiVisible]);

  const renderEmojiMax = () => {
    const keys = Object.keys(emojiMaxList);

    return keys.map((key: string, index: number) => {
      // @ts-ignore
      const { src, alt } = emojiMaxList[key];

      return (
        <a
          className="item"
          key={`emoji-${index}`}
          onClick={() => {
            insertMaxEmoji(key);
          }}
        >
          <img src={src} alt={alt} data-emoji-type="max" />
        </a>
      );
    });
  };

  const toggleMDMode = () => {
    setIsMdMode(!isMdMode);

    if (!isMdMode) {
      message.info('已开启 Markdown 输入模式');
    } else {
      message.info('已切换至正常输入模式');
    }
  };

  const onInputImgs = async (e: any) => {
    const fileList = e.target.files;
    console.log('on input fileList: ', fileList);

    fileQueue.onCompleteAll = (list: any[]) => {
      console.log('上传完成: ', list);
    };

    const insertIndex = fileQueue.addList(fileList.length);
    const fileLen = fileList.length;

    if (fileLen > 9) {
      message.info('臣妾一次最多只能接收9个文件哦');
      return;
    }

    for (let i = 0; i < fileLen; i++) {
      const formData = new FormData();
      const userId = props.user?.id || '';

      console.log('fileList[i]: ', fileList[i]);

      formData.append('file', fileList[i]);
      formData.append('userId', userId);

      action
        .uploadImg(formData, userId)
        .then((res) => {
          fileQueue.updateItem(insertIndex + i, Status.Success, res);
        })
        .catch((err) => {
          fileQueue.updateItem(insertIndex + i, Status.Fail, err);
        })
        .finally(() => {
          fileQueue.check((result: any) => {
            console.log('result: ', result);

            const { data } = result;
            const { fileUrl, fileName, mimeType, size, originalName } = data;

            props.onSendMessage({
              msgType: 'file',
              fileUrl,
              fileName,
              mimeType,
              originalName,
              size,
            });
          });
        });
    }
  };

  const onKeyDown = (e: any) => {
    const key = e.keyCode;

    if (key === 13 && !e.shiftKey) {
      e.preventDefault();

      // @ts-ignore
      formRef.current.submit();
    }
  };

  return (
    <>
      <div className="wrap">
        <Form
          ref={formRef}
          className="chat-form"
          name="chat-form"
          onFinish={onFinishFrom}
          autoComplete="off"
        >
          <Form.Item name="message" className="form-item">
            <div
              ref={inputRef}
              onClick={handleBoxClick}
              onInput={onInputContent}
              className="from-input"
              contentEditable="true"
              onKeyDown={onKeyDown}
            ></div>
          </Form.Item>

          <Form.Item className="form-submit-item">
            <Button className="submit-btn" type="primary" htmlType="submit">
              发送
            </Button>
          </Form.Item>
        </Form>
      </div>

      {!emojiVisible && (
        <div className="wrap toolbar">
          <a className="tool" onClick={onToggleEmoji}>
            <SmileFilled className="icon" />
          </a>
          <a className="tool">
            <PictureFilled className="icon" />
            <label className="upload-file" htmlFor="upload">
              上传图片
            </label>
            <input
              id="upload"
              type="file"
              accept="image/*,.pdf,video/*,audio/*"
              multiple={true}
              className="upload-input"
              onChange={onInputImgs}
            ></input>
          </a>
          <a className="tool">
            <FolderOpenFilled className="icon" />
            <label className="upload-file" htmlFor="upload-file">
              上传文件
            </label>
            <input
              id="upload-file"
              type="file"
              accept="*"
              multiple={true}
              className="upload-input"
              onChange={onInputImgs}
            ></input>
          </a>
          <a className={`tool ${isMdMode && 'active'}`} onClick={toggleMDMode}>
            <FileMarkdownFilled className="icon" />
          </a>
        </div>
      )}

      {emojiVisible && (
        <div className="emoji">
          <div className="emoji-title">小黄人表情</div>
          <div className="emoji-list">
            {emojiList.map(({ src, alt, type }, index: number) => {
              return (
                <a
                  className="item"
                  key={`emoji-${index}`}
                  onClick={() => {
                    insertEmoji(src);
                  }}
                >
                  <img src={src} alt={alt} />
                </a>
              );
            })}
          </div>
          <div className="emoji-title">发送超级表情</div>
          <div className="emoji-list">{renderEmojiMax()}</div>
        </div>
      )}
    </>
  );
}

export default ChatInput;
