import { useRef } from 'react';
import { Button, Form } from 'antd';
import urlRegex from 'url-regex';

interface IProps {
  onSendMessage: (value: string) => void;
}

function ChatInput(props: IProps) {
  const formRef = useRef(null);
  const inputRef = useRef(null);

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

    console.log('content: ', content);
    console.log('excludeList: ', excludeList);

    const urlReg = urlRegex({ strict: true, exact: false });

    content = content.replace(urlReg, (url: string) => {
      console.log('url: ', url);

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

  const onFinishFrom = () => {
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
    </>
  );
}

export default ChatInput;
