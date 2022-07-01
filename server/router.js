/**
 * router manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:17:34
 * Last modified  : 2022-07-01 13:17:47
 */

const express = require('express');
const path = require('path');
const apiController = require('./controller/apiController');

const router = express.Router();

// 测试接口
router.get('/api/rest/test', apiController.test);
// 用户注册
router.post('/api/rest/user/register', apiController.registerUser);
// 获取房间信息
router.get('/api/rest/room/info', apiController.getRoomInfo);
router.get('/api/rest/room/list', apiController.getRoomList);
// 创建房间
router.post('/api/rest/room/create', apiController.createRoom);
// 创建大厅房间
router.post('/api/rest/room/createRoot', apiController.createRoomRoot);
// 获取热门图片壁纸
router.get('/api/happy/wrappaper', apiController.happyWrapper);
// 获取转发图片内容
router.get('/api/happy/wrapperUrl', apiController.happyWrapperUrl);

router.get('/*', (e) => {
  console.log('match /* route');

  e.res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

module.exports = router;
