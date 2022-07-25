/**
 * Api Controller Manager
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-26 00:40:02
 * Last modified  : 2022-07-25 11:51:55
 */

const crypto = require('crypto');
const { wxToken } = require('../../config');

const sha1 = (str) => {
  //进行sha1加密
  return crypto.createHash('sha1').update(str, 'utf-8').digest('hex');
};

module.exports = {
  wxToken: async (req, res) => {
    // 请填写对应公众号配置的Token，可自定义
    const token = wxToken;
    const signature = req.query.signature;
    const echostr = req.query.echostr;
    const timestamp = req.query.timestamp;
    const nonce = req.query.nonce;
    const reqArray = [nonce, timestamp, token];

    //连接数组
    const sortStr = reqArray.join('');
    const sha1Str = sha1(sortStr.toString().replace(/,/g, ''));

    if (signature === sha1Str) {
      res.end(echostr);
    } else {
      res.end('false');
      console.log('授权失败!');
    }
  },
};
