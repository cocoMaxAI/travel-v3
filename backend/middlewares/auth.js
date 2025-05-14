const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // 从请求头获取token
  const token = req.header('x-auth-token');

  // 检查是否存在token
  if (!token) {
    return res.status(401).json({ msg: '无访问权限，请先登录' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token无效' });
  }
};