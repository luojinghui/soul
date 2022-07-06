/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-06 18:59:01
 */

const { userModel } = require('../model/userModel');
const { roomModel } = require('../model/roomModel');
const { getRandomString, getRandomNum } = require('../utils/index');

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

  getUserInfo: async (req, res) => {
    const userId = req.query.userId;

    try {
      const query = await await userModel.findById(userId);

      if (!query) {
        console.log('not found user: ', userId);

        res.json({
          data: {},
          msg: 'failed, not found',
          code: 302,
        });
        return;
      }

      res.json({
        data: {
          name: query.name,
          id: query.id,
          avatar: query.avatar,
          avatarType: query.avatarType,
        },
        msg: 'success',
        code: 200,
      });
    } catch (err) {
      res.status(500).json({
        data: err,
        code: 500,
        msg: 'get userinfo error',
      });
    }
  },

  updateUserInfo: async (req, res) => {
    const { file, userId, name } = req.body;
    const uploadFile = req.file;
    const updateObj = {};

    updateObj.name = name;
    if (uploadFile) {
      updateObj.avatarType = 'Remote';
      updateObj.avatar = uploadFile.filename;
    }

    const query = await userModel
      .findByIdAndUpdate(userId, updateObj, { new: true })
      .exec();

    res.json({
      data: {
        name: query.name,
        id: query.id,
        avatar: query.avatar,
        avatarType: query.avatarType,
      },
      msg: 'success',
      code: 200,
    });
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
};
