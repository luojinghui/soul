const schedule = require('node-schedule');
const axios = require('axios');
const { getUserAgent } = require('./index');
const { musicCommentModel } = require('../model/musicComment');

const setCommentMusic = async () => {
  try {
    const url = `https://tenapi.cn/comment/`;
    const userAgent = getUserAgent();

    const result = await axios.get(url, {
      headers: {
        'user-agent': userAgent,
      },
    });

    if (
      result &&
      result.data &&
      result.data.code === 200 &&
      result.data.data.url
    ) {
      const id = result.data.data.id;
      const isExistId = await musicCommentModel.exists({ id: id });

      if (!isExistId) {
        await musicCommentModel.create(result.data.data);
      }
    }
  } catch (err) {
    console.log('get comment err: ', err);
  }
};

// 定义规则
const rule = new schedule.RecurrenceRule();
// 每周1，2，3，4，5
rule.dayOfWeek = [1, 2, 3, 4, 5];
// 每小时0，1点
rule.hour = [0, 1, 3, 5];
rule.minute = [5, 15, 30, 45, 55];
// 每隔 30 秒执行一次
rule.second = [30];

// 启动任务
let job;

const startNodeSchedule = () => {
  if (job) {
    job.cancel();
  }

  job = schedule.scheduleJob(rule, () => {
    console.log('job...');

    setCommentMusic();
  });
};

module.exports = startNodeSchedule;
