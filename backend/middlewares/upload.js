const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// // 文件类型过滤器
// const fileFilter = (req, file, cb) => {
//   // 允许的文件类型
//   const allowedImageTypes = /jpeg|jpg|png|gif/;
//   const allowedVideoTypes = /mp4|mov|avi|wmv/;
  
//   // 检查文件mimetype
//   const isValidImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
//   const isValidVideo = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
  
//   if (file.fieldname === 'images' && isValidImage) {
//     cb(null, true);
//   } else if (file.fieldname === 'video' && isValidVideo) {
//     cb(null, true);
//   } else {
//     cb(new Error('不支持的文件类型'), false);
//   }
// };


// 修改 F:\travel-diary-v3\backend\middlewares\upload.js 中的 fileFilter
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedVideoTypes = /mp4|mov|avi|wmv/;
    
    // 获取文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    const isValidImage = allowedImageTypes.test(ext);
    const isValidVideo = allowedVideoTypes.test(ext);
    
    // 允许 avatar 字段上传图片
    if (file.fieldname === 'avatar' && isValidImage) {
      return cb(null, true);
    }
    
    // 允许 images 字段上传图片
    if (file.fieldname === 'images' && isValidImage) {
      return cb(null, true);
    }
    
    // 允许 video 字段上传视频
    if (file.fieldname === 'video' && isValidVideo) {
      return cb(null, true);
    }
    
    // 其他情况拒绝
    cb(new Error('不支持的文件类型'), false);
  };

// 导出配置好的multer实例
module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  }
});