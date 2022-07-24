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
rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
rule.hour = [1, 2, 3, 4];
rule.minute = [5, 18, 25, 43, 52];
rule.second = [36];

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
