import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { useRecoilState } from "recoil";
import { wrapperSizeState, wrapperSelectKey } from "@/store";
import { IImgSize, IWrapperSelectKey } from "@/type";
import { Header } from "@/components";
import { Tabs } from "antd";
import WrapperList from "./WrapperList";

import "./index.less";

const { TabPane } = Tabs;

const addMeta = (name: string, content: string) => {
  const meta = document.createElement("meta");
  meta.content = content;
  meta.name = name;
  document.getElementsByTagName("head")[0].appendChild(meta);
};

export default function Wrapper() {
  const contentRef = useRef(null);
  const [style, setStyle] = useRecoilState(wrapperSizeState);
  const [activeKey, setActiveKey] =
    useRecoilState<IWrapperSelectKey>(wrapperSelectKey);

  const [model, setVisible] = useState({
    visible: false,
    url: "",
  });

  useLayoutEffect(() => {
    addMeta("referrer", "no-referrer");
  }, []);

  // 初始化计算每个item的size信息
  useEffect(() => {
    resizePage();
    window.addEventListener("resize", resizePage);
    return () => {
      window.removeEventListener("resize", resizePage);
      addMeta("referrer", "strict-origin-when-cross-origin");
    };
  }, []);

  const resizePage = () => {
    const size = getImgSize();

    setStyle(size);
  };

  const calcImgSize = (size: number): IImgSize => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    // @ts-ignore
    const height = document.body.clientHeight;

    const realWidth = Math.floor((width - 15) / size);
    const realHeight = Math.floor(realWidth * 1.6);

    let realH = height;
    let realW = height / 2;

    return {
      height: realHeight,
      width: realWidth,
      realH,
      realW,
    };
  };

  const getImgSize = () => {
    // @ts-ignore
    const width = contentRef.current.clientWidth;
    let size: IImgSize;

    if (width <= 500) {
      size = calcImgSize(3);
    } else if (width <= 900) {
      size = calcImgSize(4);
    } else if (width <= 1300) {
      size = calcImgSize(5);
    } else if (width <= 1700) {
      size = calcImgSize(6);
    } else if (width <= 2100) {
      size = calcImgSize(7);
    } else if (width <= 2500) {
      size = calcImgSize(8);
    } else {
      size = calcImgSize(8);
    }

    return size;
  };

  const onToggleModel = () => {
    setVisible({
      visible: false,
      url: "",
    });
  };

  const onChange = (key: string) => {
    setActiveKey(key as IWrapperSelectKey);
  };

  const onSelectImg = (data: any) => {
    setVisible(data);
  };

  const renderList = () => {
    console.log("activeKey: ", activeKey);

    return (
      <>
        <WrapperList
          visible={activeKey === "hot"}
          activeKey="hot"
          style={style}
          onSelectImg={onSelectImg}
        ></WrapperList>
        <WrapperList
          visible={activeKey === "new"}
          activeKey="new"
          style={style}
          onSelectImg={onSelectImg}
        ></WrapperList>
        <WrapperList
          visible={activeKey === "landscape"}
          activeKey="landscape"
          style={style}
          onSelectImg={onSelectImg}
        ></WrapperList>
      </>
    );
  };

  return (
    <div className="app wrapper-page">
      <Header
        title={
          <Tabs
            className="sour_header_tabs"
            activeKey={activeKey}
            onChange={onChange}
            items={[
              { label: "热门", key: "hot" },
              { label: "最新", key: "new" },
              { label: "风景", key: "landscape" },
            ]}
          ></Tabs>
        }
      ></Header>

      <div className="content" style={{}} id="content" ref={contentRef}>
        {renderList()}
      </div>

      {model.visible && (
        <div className="wrapper-model" onClick={onToggleModel}>
          <div className="model">
            <img src={model.url} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
