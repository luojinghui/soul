/**
 * 获取当前时间
 */
export const getTimeText = () => {
  const now = new Date();
  const hour = now.getHours();
  let respectText = '夜里好';

  if (hour < 6) {
    respectText = '凌晨好';
  } else if (hour < 9) {
    respectText = '早上好';
  } else if (hour < 12) {
    respectText = '上午好';
  } else if (hour < 14) {
    respectText = '中午好';
  } else if (hour < 17) {
    respectText = '下午好';
  } else if (hour < 19) {
    respectText = '傍晚好';
  } else if (hour < 22) {
    respectText = '晚上好';
  }

  return respectText;
};
