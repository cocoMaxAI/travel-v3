// 角色检查中间件
const User = require('../models/User');

// 检查是否为管理员
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: '需要管理员权限' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 检查是否为审核人员或管理员
exports.isReviewerOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'reviewer' && user.role !== 'admin') {
      return res.status(403).json({ msg: '需要审核员或管理员权限' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};