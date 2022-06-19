/**
 * Route Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:17:34
 * Last modified  : 2022-06-14 14:22:12
 */

const express = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');

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
  console.log('url: ', url);

  // const instance = axios.create({
  //   httpsAgent: new https.Agent({
  //     rejectUnauthorized: false,
  //   }),
  // });

  // const agent = new https.Agent({
  //   rejectUnauthorized: false,
  // });

  try {
    console.log('success');

    const result = await axios.get(url, {
      headers: { ...req.headers },
      // httpsAgent: agent,
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
    console.log('error send file');
  });
});

module.exports = router;
