/**
 * router manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:17:34
 * Last modified  : 2022-07-19 01:12:04
 */

const express = require('express');
const path = require('path');
const apiController = require('./controller/apiController');
const thirdController = require('./controller/thirdController');
const songController = require('./controller/songController.js');
const { upload } = require('./utils/upload');

const router = express.Router();

// 测试接口
router.get('/api/rest/test', apiController.test);

/**
 * 主服务接口
 */
// 用户注册
router.post('/api/rest/user/register', apiController.registerUser);
// 获取用户信息
router.get('/api/rest/user/info', apiController.getUserInfo);
// 更新用户信息
router.post('/api/rest/user/update', upload, apiController.updateUserInfo);
// 更新用户信息
router.post('/api/rest/user/updatev2', apiController.updateUserInfoV2);
// 获取房间信息
router.get('/api/rest/room/info', apiController.getRoomInfo);
// 获取房间列表
router.get('/api/rest/room/list', apiController.getRoomList);
// 创建房间
router.post('/api/rest/room/create', apiController.createRoom);
// 创建大厅房间
router.post('/api/rest/room/createRoot', apiController.createRoomRoot);
// 上传多张图片
router.post('/api/rest/room/uploadImg', upload, apiController.roomUploadImgs);

/**
 * 获取热门图片壁纸
 */
router.get('/api/happy/wrappaper', thirdController.happyWrapper);
// 获取转发图片内容
router.get('/api/happy/wrapperUrl', thirdController.happyWrapperUrl);
// new app api
router.get('/api/happy/v2/wrappaper', thirdController.happyWrapperV2);

/**
 * 三方音乐API
 */
router.get(
  '/api/song/playlist/highquality',
  songController.playlistHighquality
);
// 获取网友精选碟歌单
router.get('/api/song/top/playlist', songController.top_playlist);
// 获取获得每日推荐歌曲 ( 需要登录 )
router.get('/api/song//recommend/songs', songController.recommend_songs);
// 获取获得每日推荐歌曲
router.get('/api/song/comment/list', songController.comment_list);

/**
 * 主页面加载入口
 */
router.get('/*', (e) => {
  console.log('match /* route');

  e.res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

module.exports = router;
