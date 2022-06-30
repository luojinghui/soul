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
          <div className="tool" onClick={onToggleEmoji}>
            <SmileFilled className="icon" />
          </div>
          <div className="tool">
            <PictureFilled className="icon" />
          </div>
          <div className="tool">
            <FolderOpenFilled className="icon" />
          </div>
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
          <div className="emoji-list">
            {emojiMaxList.map(({ src, alt, type }, index: number) => {
              return (
                <a
                  className="item"
                  key={`emoji-${index}`}
                  onClick={(e) => {
                    insertMaxEmoji(e.currentTarget);
                  }}
                >
                  <img src={src} alt={alt} data-emoji-type="max" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default ChatInput;
