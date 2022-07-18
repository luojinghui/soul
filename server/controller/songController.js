/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-19 01:17:00
 */

const {
  playlist_highquality_tags,
  top_playlist,
  recommend_songs,
} = require('NeteaseCloudMusicApi');
const { musicCommentModel } = require('../model/musicComment');

module.exports = {
  registerAnonimous: async (req, res) => {
    try {
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

  playlistHighquality: async (req, res) => {
    try {
      const result = await playlist_highquality_tags();

      console.log('result: ', result);

      res.json({
        data: result,
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

  top_playlist: async (req, res) => {
    try {
      const { cat, limit, offset, order } = req.query;
      console.log('req.query: ', req.query);

      const result = await top_playlist({ cat, limit, offset, order });

      console.log('result: ', result);

      res.json({
        data: result,
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

  recommend_songs: async (req, res) => {
    try {
      const { cat } = req.query;
      const result = await recommend_songs({ cat });

      res.json({
        data: result,
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

  comment_list: async (req, res) => {
    try {
      const query = await musicCommentModel
        .find({})
        .sort({ createTime: -1 })
        .skip(0)
        .limit(30)
        .exec();

      res.json({
        data: query,
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
};
