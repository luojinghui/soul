import { getDateTimeBefore, compareTime } from './';

/**
 * 消息差值时间计算
 *
 * 每条消息间隔大于>=5分钟时，才显示消息时间
 */
export const MessageTime = {
  previousTime: 0,
  get(createTime: any) {
    const compare = compareTime(createTime, MessageTime.previousTime, 5);
    let time = null;

    if (compare) {
      time = getDateTimeBefore(createTime);

      MessageTime.previousTime = createTime;
    }

    return time;
  },
  clear() {
    this.previousTime = 0;
  },
};
