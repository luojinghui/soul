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
} from '@ant-design/icons';
import { emojiList, emojiMaxList } from './emoji';

let rangeOfInputBox: any;
interface IProps {
  onSendMessage: (value: any) => void;
  chatRef: any;
}

function ChatInput(props: IProps) {
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const [emojiVisible, setEmojiVisible] = useState(false);

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

  const validate = (value: string) => {
    const splitValue = value.split('\n');

    return splitValue.some((val: string) => !!val.trim().length);
  };

  const onFinishFrom = () => {
    // @ts-ignore
    // const isValidate = validate(inputRef.current.innerText || '');

    // if (!isValidate) {
    //   message.info('臣妾发送不了空白内容！');
    //   return;
    // }

    // @ts-ignore
    const value = inputRef.current.innerHTML;
    const nextValue = dealInnerHtml(value);

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

  const insertMaxEmoji = (e: any) => {
    props.onSendMessage({
      content: e.innerHTML,
      msgType: 'super_emoji',
    });
  };

  const insertEmoji = (src: string, key: string) => {
    let emojiEl = document.createElement('img');
    emojiEl.src = src;
    emojiEl.setAttribute(`data-${key}`, key);

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
    const openHeight = 120;

    if (emojiVisible) {
      root.setAttribute('style', `--im-footer-height: ${openHeight}px`);
    } else {
      root.setAttribute('style', `--im-footer-height: 112px`);
    }
  }, [emojiVisible]);

  const onToggleEmoji = useCallback(() => {
    setEmojiVisible(!emojiVisible);
  }, [emojiVisible]);

  return (
    <>
      <Form
        ref={formRef}
        className="msg"
        name="msg"
        onFinish={onFinishFrom}
        autoComplete="off"
      >
        <Form.Item name="msg" className="input">
          <div
            ref={inputRef}
            onClick={handleBoxClick}
            onInput={onInputContent}
            id="msg-input"
            className="msg-input"
            contentEditable="true"
          ></div>
        </Form.Item>
        <Form.Item className="send">
          <Button className="send-btn" type="primary" htmlType="submit">
            发送
          </Button>
        </Form.Item>
      </Form>

      {!emojiVisible && (
        <div className="funcs">
          <div className="func" onClick={onToggleEmoji}>
            <SmileFilled className={`icon ${emojiVisible && 'activeIcon'}`} />
          </div>
          <div className="func">
            <PictureFilled className="icon" />
          </div>
          <div className="func">
            <FolderOpenFilled className="icon" />
          </div>
        </div>
      )}

      {emojiVisible && (
        <div className="emoji">
          <div className="emoji_type">普通表情</div>
          <div className="miniEmoji">
            {emojiList.map(({ src, alt, type }, index: number) => {
              return (
                <span
                  className="emoji-item"
                  key={`emoji-${index}`}
                  onClick={() => {
                    insertEmoji(src, `emoji-${type}`);
                  }}
                >
                  <img src={src} alt={alt} />
                </span>
              );
            })}
          </div>
          <div className="emoji_type">发送超级表情</div>
          <div className="miniEmoji">
            {emojiMaxList.map(({ src, alt, type }, index: number) => {
              return (
                <span
                  className="emoji-item"
                  key={`emoji-${index}`}
                  onClick={(e) => {
                    insertMaxEmoji(e.currentTarget);
                  }}
                >
                  <img src={src} alt={alt} data-emoji-max="emoji-max" />
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default ChatInput;
