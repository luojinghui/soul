const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const { getRandomString } = require('./index');

const distDit = 'static/upload/';

const uploadMulter = () => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const userId = req.query.userId;
      const nextPath = `${distDit}${userId}/`;

      // 指定上传后保存到哪一个文件夹中
      // 创建目录
      await mkdirp(nextPath);

      cb(null, nextPath);
    },
    filename: (req, file, cb) => {
      // 获取后缀名
      let extname = path.extname(file.originalname);
      // 获取上传的文件名
      let fileName = path.parse(file.originalname).name;
      const nextName = `${fileName}-${getRandomString(
        4
      )}${Date.now()}${extname}`;

      cb(null, nextName);
    },
  });

  return multer({ storage, fileFilter });
};

const fileFilter = (req, file, cb) => {
  const originalname = Buffer.from(file.originalname, 'latin1').toString(
    'utf8'
  );

  file.originalname = originalname;

  cb(null, true);
};

const upload = uploadMulter().single('file');

module.exports = {
  upload,
};
