/**
 * Route Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:17:34
 * Last modified  : 2022-06-23 00:33:54
 */

const express = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');
const { connectDB, disconnectDB } = require('../db/index');
const { userModel } = require('../db/userModel');

const router = express.Router();

router.get('/api/rest/test', async (req, res) => {
  res.json({
    data: 'hello world',
    msg: 'success',
    code: 200,
  });
});

router.get('/api/rest/registerUser', async (req, res) => {
  const result = await connectDB();

  if (result) {
    const initData = {
      name: `星球用户_${Math.ceil(Math.random() * 10000)}`,
      avatar: `${Math.ceil(Math.random() * 11)}`,
      age: 18,
      address: '',
      avatarType: 'Local',
      sex: '',
    };
    const user = new userModel(initData);
    user.save(async (err) => {
      if (err) {
        console.log('save error:' + err);
      }

      console.log('save sucess');
      await disconnectDB();
    });

    res.json({
      data: {
        name: user.name,
        id: user.id,
        avatar: user.avatar,
        avatarType: user.avatarType,
      },
      msg: 'success',
      code: 200,
    });
  }

  res.status(500).json({
    data: '',
    code: 500,
    msg: 'db error',
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
