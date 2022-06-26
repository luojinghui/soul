export const utcToTime = (utc_datetime: string) => {
  // 转为正常的时间格式 年-月-日 时:分:秒
  const T_pos = utc_datetime.indexOf('T');
  const Z_pos = utc_datetime.indexOf('Z');
  const year_month_day = utc_datetime.substr(0, T_pos);
  const hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  const new_datetime = year_month_day + ' ' + hour_minute_second; // 2017-03-31 08:02:06
  let timestamp: any;

  // 处理成为时间戳
  timestamp = new Date(Date.parse(new_datetime));
  timestamp = timestamp.getTime();
  timestamp = timestamp / 1000;

  // 增加8个小时，北京时间比utc时间多八个时区
  timestamp = timestamp + 8 * 60 * 60;

  // 时间戳转为时间
  const beijing_datetime = getTime(
    new Date(parseInt(timestamp) * 1000).valueOf(),
    'M'
  );
  return beijing_datetime;
};

const getTime = (data: any, type: any) => {
  //data时间戳，type返回的类型默认Y,可传参Y和H
  let time = new Date(data);
  let Y = time.getFullYear();
  let Mon = time.getMonth() + 1;
  let Day = time.getDate();
  let H = time.getHours();
  let Min = time.getMinutes();
  let S = time.getSeconds();

  //自定义选择想要返回的类型
  if (type === 'M') {
    //返回年月日2020-10-10
    return `${Mon}-${Day} ${H}:${Min}`;
  } else if (type === 'H') {
    //返回时分秒20：10：10
    return `${H}:${Min}:${S}`;
  } else {
    //返回年月日时分秒2020-10-10 10:26:38
    return `${Y}-${Mon}-${Day} ${H}:${Min}:${S}`;
  }
};
