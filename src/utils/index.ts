/**
 * 根据时间戳获取具体的时间
 *
 * @param { Number } data 时间戳数字，毫秒
 * @param { 'M' | 'H' | 'Y' } type 转换格式
 * @returns
 */
export const getTime = (data: any, type: any) => {
  let time = new Date(data);
  let Y = time.getFullYear();
  let Mon = time.getMonth() + 1;
  let Day = time.getDate();
  let H: string | number = time.getHours();
  let Min: string | number = time.getMinutes();

  if (H < 10) {
    H = `0${H}`;
  }

  if (Min < 10) {
    Min = `0${Min}`;
  }

  //自定义选择想要返回的类型
  if (type === 'M') {
    //返回月日10-10 20:10
    return `${Mon}-${Day} ${H}:${Min}`;
  } else if (type === 'H') {
    //返回时分20:10
    return `${H}:${Min}`;
  } else if (type === 'Y') {
    //返回年月日时分2020-10-10 10:26
    return `${Y}-${Mon}-${Day} ${H}:${Min}`;
  }
};

export const getDateTimeBefore = (dataTime: any) => {
  const currentTime = new Date().valueOf();
  const nextTime = new Date(dataTime).valueOf();
  const diffTime = currentTime - nextTime;
  // 少于一分钟
  const time = diffTime / 1000;

  // 秒转小时
  const hours = time / 3600;
  if (hours < 24) {
    return getTime(dataTime, 'H');
  }

  //秒转月
  const months = time / 3600 / 24 / 30;
  if (months < 12) {
    return getTime(dataTime, 'M');
  }

  //秒转年
  return getTime(dataTime, 'Y');
};

/**
 * 计算两个时间的分钟差值
 *
 * @param currentTime
 * @param preTime
 * @returns
 */
export const compareTime = (
  currentTime: any,
  preTime: any,
  difference: number
) => {
  const cTime = new Date(currentTime).valueOf();
  const pTime = new Date(preTime).valueOf();
  // 转化为分钟做差值计算
  const diff = (cTime - pTime) / 1000 / 60;

  return diff >= difference;
};
