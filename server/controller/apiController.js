/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-03 10:39:47
 */

const axios = require('axios');
const { userModel } = require('../model/userModel');
const { roomModel } = require('../model/roomModel');
const { getRandomString, getRandomNum } = require('../utils/index');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  test: async (req, res) => {
    res.json({
      data: 'hello world',
      msg: 'success',
      code: 200,
    });
  },

  registerUser: async (req, res) => {
    const { agent, platform } = req.body;

    try {
      const initData = {
        name: `星球用户_${getRandomString(4)}`,
        avatar: getRandomNum(0, 11),
        age: '',
        address: '',
        avatarType: 'Local',
        sex: 'boy',
        phone: '',
        pwd: getRandomString(8),
        tag: [],
        agent,
        platform,
      };

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

  createRoom: async (req, res) => {
    console.log('req: ', req);
  },

  createRoomRoot: async (req, res) => {
    const { roomId, userId } = req.body;

    try {
      const query = await roomModel.create({
        roomId,
        roomName: '流浪星球',
        roomTag: ['畅言', '篮球', '🍎'],
        roomType: 'group',
        roomAvatarUrl: '',
        roomDesc: '在流浪星球畅所欲言吧...',
        pwd: '',
        tableName: 'messages_1',
        private: false,
        allowSetting: true,
        ownerId: userId,
        userIds: [],
        limitLen: 100,
        receiveId: '',
        lastMsgId: '',
        lastUserId: '',
        isFixed: true,
      });

      res.json({
        data: query,
        code: 200,
        msg: 'success',
      });
    } catch (err) {
      console.log('err: ', err);

      res.status(500).json({
        data: err,
        code: 500,
        msg: 'create room error',
      });
    }
  },

  getRoomInfo: async (req, res) => {
    const { roomId, userId } = req.query;

    try {
      const query = await roomModel.findOne({ roomId }).exec();

      if (!query) {
        res.json({
          code: 204,
          data: {},
          msg: 'Not found room',
        });
      }

      res.json({
        code: 200,
        data: query,
        msg: 'success',
      });
    } catch (err) {
      console.log('get room info err: ', err);

      res.status(500).json({
        data: err,
        code: 500,
        msg: 'getRoomInfo error',
      });
    }
  },

  getRoomList: async (req, res) => {
    const { userId } = req.query;

    try {
      const query = await roomModel.find({}).exec();

      if (!query) {
        res.json({
          code: 204,
          data: {},
          msg: 'Not found room list',
        });
      }

      res.json({
        code: 200,
        data: query,
        msg: 'success',
      });
    } catch (err) {
      console.log('get room list err: ', err);

      res.status(500).json({
        data: err,
        code: 500,
        msg: 'getRoomList error',
      });
    }
  },

  roomUploadImgs: async (req, res) => {
    let file = req.file || null;

    console.log('upload file: ', req.files);

    if (!file) {
      res.json({
        code: 302,
        data: {},
        msg: 'Not found file',
      });
      return;
    } else {
      const fileInfo = {
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        fileUrl: file.filename,
        originalName: file.originalname,
      };

      res.json({
        code: 200,
        data: fileInfo,
        msg: 'success',
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
