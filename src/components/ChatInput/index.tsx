import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, message } from 'antd';
import urlRegex from 'url-regex';
import {
  PictureFilled,
  FolderOpenFilled,
  SmileFilled,
} from '@ant-design/icons';

import e1 from '@/assets/emoji/1.gif';
import e2 from '@/assets/emoji/2.gif';
import e3 from '@/assets/emoji/3.gif';
import e4 from '@/assets/emoji/4.gif';
import e5 from '@/assets/emoji/5.gif';
import e6 from '@/assets/emoji/6.gif';
import e7 from '@/assets/emoji/7.gif';

const emojiList = [
  {
    src: e1,
    alt: '😀',
  },
  {
    src: e2,
    alt: '🤡',
  },
  {
    src: e3,
    alt: '🐷',
  },
  {
    src: e4,
    alt: '🙈',
  },
  {
    src: e5,
    alt: '🍎',
  },
  {
    src: e6,
    alt: '😂',
  },
  {
    src: e7,
    alt: '🚌',
  },
];
let rangeOfInputBox: any;

interface IProps {
  onSendMessage: (value: string) => void;
}

function ChatInput(props: IProps) {
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const [emojiVisible, setEmojiVisible] = useState(false);

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

    console.log('nextValue: ', nextValue);
    props.onSendMessage(nextValue);
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

  const insertEmoji = (src: string) => {
    let emojiEl = document.createElement('img');
    emojiEl.src = src;

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
    const openHeight = 112 + 54;

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

      {emojiVisible && (
        <div className="emoji">
          {emojiList.map(({ src, alt }, index: number) => {
            return (
              <span
                className="emoji-item"
                key={`emoji-${index}`}
                onClick={() => {
                  insertEmoji(src);
                }}
              >
                <img src={src} alt={alt} />
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ChatInput;
