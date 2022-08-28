import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import { Button, Form, message, Carousel } from 'antd';
import urlRegex from 'url-regex';
import {
  PictureFilled,
  FolderOpenFilled,
  SmileFilled,
  FileMarkdownFilled,
  HeartOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { emojiList, emojiMaxList } from './emoji';
import action from '@/action';
import FileQueue, { Status } from './queue';
import { IUserInfo } from '@/type';
import { parseMD } from '@/utils/markdown';
import logger from '@/utils/log';

import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  emojiSelectedIndex,
  RoomMusicList,
  MusicBarVisible,
  MusicInfo,
} from '@/store';

import { AutoCenter, FloatingPanel } from 'antd-mobile';
// import APng from '@/components/APNG';

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
  const swiperRef = useRef(null);
  const musicBoxRef = useRef(null);
  const swiperContentRef = useRef(null);

  const contaierHeight = window.innerHeight * 0.7;

  const [emojiSelectIndex, setEmojiSelectIndex] =
    useRecoilState(emojiSelectedIndex);
  const [musicList, setMusicList] = useRecoilState(RoomMusicList);
  const setMusicBarVisible = useSetRecoilState(MusicBarVisible);
  const setMusicInfo = useSetRecoilState(MusicInfo);

  const [emojiVisible, setEmojiVisible] = useState(false);
  const [isMdMode, setIsMdMode] = useState(false);
  const [fileProcess, setFileProcess] = useState<any>({});
  const fileProcessRef = useRef<any>({});

  useImperativeHandle(props.chatRef, () => ({
    clickChatContent: () => {
      if (emojiVisible) {
        setEmojiVisible(false);
      }
    },
  }));

  useEffect(() => {
    props.onStateChange();
  }, [fileProcess]);

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

        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 300);
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
          {/* <APng src={src} data-emoji-type="max" className='super0'></APng> */}
        </a>
      );
    });
  };

  const renderYelloEmoji = () => {
    return emojiList.map(({ src, alt }, index: number) => {
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

  const onChange = (current: number) => {
    if (swiperContentRef.current) {
      // @ts-ignore
      swiperContentRef.current.scrollTop = 0;
    }

    setEmojiSelectIndex(current);
  };

  const onSendMusic = (item: any) => {
    logger.log('item: ', item);

    toggleMusicBox(false);

    props.onSendMessage({
      content: JSON.stringify({
        id: item.id,
        sing: item.sing,
        song: item.song,
        url: item.url,
        cover: item.cover,
      }),
      msgType: 'music',
    });
  };

  const onPlayMusic = (item: any) => {
    setMusicBarVisible(true);
    setMusicInfo(item);
  };

  const toggleMusicBox = (show: boolean) => {
    if (musicBoxRef.current) {
      // @ts-ignore
      musicBoxRef.current.setHeight(show ? contaierHeight : 0);
    }
  };

  const onHeightChange = (height: number, animating: boolean) => {
    if (!animating && height === contaierHeight && !musicList.length) {
      (async () => {
        const { list } = await getCommentList();

        setMusicList(list);
      })();
    }
  };

  const getCommentList = async () => {
    try {
      const result = await action.getCommentList();

      if (result?.code === 200) {
        logger.log('result: ', result);

        return {
          list: result.data,
          code: 200,
        };
      }
    } catch (err) {
      logger.log('get list error: ', err);
    }

    return {
      list: [],
      code: 300,
    };
  };

  const updateProcessObj = (name: string) => {
    const nextprocessObj = JSON.parse(JSON.stringify(fileProcessRef.current));

    nextprocessObj[name] = {
      ...nextprocessObj[name],
      state: 'Failed',
    };

    setFileProcess(nextprocessObj);
    fileProcessRef.current = nextprocessObj;
  };

  const uploadCallback = (e: any, file: any) => {
    logger.log('callback:', e, file);

    const nextprocessObj = JSON.parse(JSON.stringify(fileProcessRef.current));
    const { lengthComputable, loaded, total } = e;

    const item = nextprocessObj[file.name];
    const procent = +(loaded / total).toFixed(2) * 100;
    const completed = loaded === total;

    nextprocessObj[file.name] = {
      ...item,
      completed: lengthComputable ? loaded === total : true,
      precent: `${procent}%`,
      state: completed && item.state !== 'Failed' ? 'Done' : 'Uploading',
    };

    logger.log('nextprocessObj: ', nextprocessObj);
    setFileProcess(nextprocessObj);
    fileProcessRef.current = nextprocessObj;
  };

  const onInputImgs = async (e: any) => {
    const fileList = e.target.files;
    logger.log('on input fileList: ', fileList);

    fileQueue.onCompleteAll = (list: any[]) => {
      logger.log('上传完成: ', list);
    };

    const insertIndex = fileQueue.addList(fileList.length);
    const fileLen = fileList.length;

    if (fileLen > 9) {
      message.info('臣妾一次最多只能接收9个文件哦');
      return;
    }

    const fileProcessObj: any = Object.assign({}, fileProcessRef.current);

    for (let i = 0; i < fileLen; i++) {
      const item = fileList[i];

      fileProcessObj[item.name] = {
        name: item.name,
        completed: false,
        precent: '0%',
        state: 'Uploading',
      };
    }

    setFileProcess(fileProcessObj);
    fileProcessRef.current = fileProcessObj;

    for (let i = 0; i < fileLen; i++) {
      const formData = new FormData();
      const userId = props.user?.id || '';

      formData.append('file', fileList[i]);
      formData.append('userId', userId);

      action
        .uploadImg(formData, userId, (e: any) => {
          uploadCallback(e, fileList[i]);
        })
        .then((res) => {
          if (res && res.code === 200) {
            logger.log('upload success');
            fileQueue.updateItem(insertIndex + i, Status.Success, res);
          } else {
            message.warn(`（${fileList[i].name}）发送失败`);
            fileQueue.updateItem(insertIndex + i, Status.Fail, res);

            updateProcessObj(fileList[i].name);
          }
        })
        .catch((err) => {
          message.warn(`（${fileList[i].name}）发送失败`);
          fileQueue.updateItem(insertIndex + i, Status.Fail, err);
        })
        .finally(() => {
          logger.log('finally result');

          fileQueue.check((result: any) => {
            logger.log('result: ', result);

            if (result && result.data) {
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

              setTimeout(() => {
                setFileProcess({});
                fileProcessRef.current = {};
              }, 2000);
            }
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

  const onSwipe = (index: number) => {
    if (swiperRef.current) {
      // @ts-ignore
      swiperRef.current.goTo(index, true);
      setEmojiSelectIndex(index);
    }
  };

  const renderUploadFileProcess = () => {
    const keys = Object.keys(fileProcess);

    return keys.map((key: string) => {
      return (
        <div className="file" key={key}>
          <span className="name">{key}: </span>
          <span className="process">
            <span
              className="line"
              style={{
                transform: `translateX(${fileProcess[key].precent})`,
              }}
            ></span>
          </span>
          <span className="state">{fileProcess[key].state}</span>
        </div>
      );
    });
  };

  return (
    <>
      <div className="file-process">{renderUploadFileProcess()}</div>
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
              accept="image/*,video/*,audio/*"
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
          <a
            className={`tool`}
            onClick={() => {
              toggleMusicBox(true);
            }}
          >
            <span className={`iconfont icon-yinleyule icon`}></span>
          </a>
        </div>
      )}

      {emojiVisible && (
        <div className="emoji">
          <div className="tabs">
            <ul className="tab">
              <li
                className={`item ${emojiSelectIndex === 0 && 'active'}`}
                onClick={() => {
                  onSwipe(0);
                }}
              >
                <SmileOutlined className="icon" />
              </li>
              <li
                className={`item ${emojiSelectIndex === 1 && 'active'}`}
                onClick={() => {
                  onSwipe(1);
                }}
              >
                <HeartOutlined className="icon" />
              </li>
            </ul>
          </div>

          <div className="swiper" ref={swiperContentRef}>
            <Carousel
              className="wrap-swiper"
              dots={false}
              afterChange={onChange}
              infinite={false}
              ref={swiperRef}
              initialSlide={emojiSelectIndex}
            >
              <div className="emoji-box">
                <div className="emoji-title">小黄人表情</div>
                <div className="emoji-list">{renderYelloEmoji()}</div>
              </div>
              <div className="emoji-box">
                <div className="emoji-title">发送超级表情</div>
                <div className="emoji-list">{renderEmojiMax()}</div>
              </div>
            </Carousel>
          </div>
        </div>
      )}

      <FloatingPanel
        ref={musicBoxRef}
        anchors={[0, contaierHeight]}
        onHeightChange={onHeightChange}
      >
        <div className="music-panel">
          <h3>
            <AutoCenter>随心听</AutoCenter>
          </h3>
          {musicList.map(({ id, song, sing, cover }: any, index: number) => {
            return (
              <div key={id} className="panel">
                <div className="info">
                  <div className="cover">
                    <img src={cover} loading="lazy" alt="" />
                  </div>
                  <div className="song">
                    {song} - {sing}
                  </div>
                </div>
                <div className="btns">
                  <Button
                    className="btn"
                    type="text"
                    onClick={() => {
                      onPlayMusic(musicList[index]);
                    }}
                  >
                    播放
                  </Button>
                  <Button
                    className="btn"
                    type="text"
                    onClick={() => {
                      onSendMusic(musicList[index]);
                    }}
                  >
                    发送
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </FloatingPanel>
    </>
  );
}

export default ChatInput;
