/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-06 19:36:02
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
      console.log('url: ', url);

      const userAgent = getUserAgent();
      const result = await axios.get(url, {
        headers: {
          'user-agent': userAgent,
          rejectUnauthorized: false,
        },
      });

      if (result && result.data) {
        res.json({
          data: result.data.res.vertical,
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
