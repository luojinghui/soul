/**
 * Route Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:17:34
 * Last modified  : 2022-06-13 01:25:59
 */

const express = require('express');
const axios = require('axios');
const https = require('https');

const router = express.Router();

router.get('/api/test', async (req, res) => {
  res.json({
    data: 'hello world',
    msg: 'success',
    code: 200,
  });
});

router.get('/api/happy/wrappaper', async (req, res) => {
  const { skip = 0, pageSize = 30 } = req.query;
  const url = `https://service.picasso.adesk.com/v1/vertical/vertical?limit=${pageSize}&skip=${
    skip || 0
  }&adult=false&first=1&order=hot`;
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  try {
    console.log('success');

    const result = await instance.get(url, {
      headers: { ...req.headers },
    });

    res.json({
      data: result.data.res,
      msg: 'success',
      code: 200,
    });
  } catch (err) {
    console.log('err: ', err);

    res.json({
      data: {},
      msg: 'failed',
      code: 400,
    });
  }

  console.log('333');
});

// 获取转发图片内容
router.get('/api/happy/wrapperUrl', async (req, res) => {
  const { id, sign, t } = req.query;

  if (!id || !sign || !t) {
    res.send({
      code: 300,
      msg: 'failed, params is not invlid',
      data: {},
    });

    return;
  }
  const url = `http://img5.adesk.com/${id}?sign=${sign}&t=${t}`;

  console.log('url: ', url);
  console.log('req.headers: ', req.headers);

  try {
    const result = await axios.get(url, {
      //这里只能是arraybuffer，不能是json等其他项，blob也不行
      responseType: 'arraybuffer',
      headers: {},
    });
    console.log('result: ', result.headers);

    res.set(result.headers);
    res.end(result.data.toString('binary'), 'binary');
  } catch (err) {
    console.log('err: ', err);
  }
});

// 获取首页数据
router.get('/*', (req, res) => {
  const file = path.join(__dirname, 'build', 'index.html');

  res.sendFile(file, () => {
    res.send('稍等片刻，文档正在更新中');
  });
});

module.exports = router;
