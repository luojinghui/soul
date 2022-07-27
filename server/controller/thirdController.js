/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-27 22:08:07
 */

const axios = require('axios');

const { getUserAgent } = require('../utils/index');

module.exports = {
  happyWrapper: async (req, res) => {
    const { skip = 0, pageSize = 30 } = req.query;
    try {
      const url = `https://service.picasso.adesk.com/v1/vertical/vertical?limit=${pageSize}&skip=${
        skip || 0
      }&adult=false&first=1&order=hot`;

      const userAgent = getUserAgent();
      const result = await axios.get(url, {
        headers: {
          'user-agent': userAgent,
          rejectUnauthorized: false,
        },
      });

      if (result && result.data) {
        res.json({
          data: result.data.res,
          msg: 'success',
          code: 200,
        });

        return;
      }

      res.json({
        data: {},
        msg: 'failed',
        code: 401,
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

  happyWrapperV2: async (req, res) => {
    const { pageIndex = 1, cate } = req.query;
    const cateMap = {
      new: '',
      hot: '10156108437800210000',
      landscape: '10156108437800210013',
    };
    const cateId = cateMap[cate];

    try {
      const url = `http://images.kindofpure.cn/api/images_api/latest?categoryId=${cateId}&page=${pageIndex}`;

      const userAgent = getUserAgent();
      const result = await axios.get(url, {
        headers: {
          'user-agent': userAgent,
          Accept: '*/*',
          'User-Agent': 'request',
        },
      });

      if (result && result.data) {
        const data = result.data.data;
        const nextData = data.map((item) => {
          return {
            ...item,
            full_image_url: item.full_image_url.replace(
              'http://p1-bos.532106.com',
              '/third1'
            ),
            small_image_url: item.small_image_url.replace(
              'http://p1-bos.532106.com',
              '/third1'
            ),
            thumb_url: item.thumb_url.replace(
              'http://p1-bos.532106.com',
              '/third1'
            ),
          };
        });

        res.json({
          data: nextData,
          msg: 'success',
          code: 200,
        });

        return;
      }

      res.json({
        data: {},
        msg: 'failed',
        code: 401,
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
