/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-06-26 01:27:40
 */

const axios = require('axios');
const { connectDB, disconnectDB } = require('../model/index');
const { userModel } = require('../model/userModel');

module.exports = {
  test: async (req, res) => {
    res.json({
      data: 'hello world',
      msg: 'success',
      code: 200,
    });
  },

  registerUser: async (req, res) => {
    try {
      const initData = {
        name: `星球用户_${Math.ceil(Math.random() * 10000)}`,
        avatar: `${Math.ceil(Math.random() * 11)}`,
        age: 18,
        address: '',
        avatarType: 'Local',
        sex: '',
      };

      await connectDB('soul_users');
      const user = await userModel.create(initData);

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
    } catch (err) {
      console.log('err: ', err);

      res.status(500).json({
        data: err,
        code: 500,
        msg: 'register error',
      });
    }
  },

  happyWrapper: async (req, res) => {
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
  },

  happyWrapperUrl: async (req, res) => {
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
  },
};
