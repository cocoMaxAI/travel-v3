const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// @route   POST /api/users/register
// @desc    注册用户
// @access  Public

router.post(
    '/register',
    upload.single('avatar'),
    [
      check('username', '用户名不能为空').not().isEmpty(),
      check('password', '密码长度必须在6到20个字符之间').isLength({ min: 6, max: 20 }),
      check('password', '密码需包含字母和数字').matches(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      check('nickname', '昵称不能为空').not().isEmpty()
    ],
    userController.register
  );
  



// @route   POST /api/users/login
// @desc    用户登录
// @access  Public
router.post(
  '/login',
  [
    check('username', '请输入用户名').not().isEmpty(),
    check('password', '请输入密码').exists()
  ],
  userController.login
);

// @route   GET /api/users/me
// @desc    获取当前用户信息
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   POST /api/users/avatar
// @desc    上传用户头像
// @access  Private
router.post(
  '/avatar',
  auth,
  upload.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;