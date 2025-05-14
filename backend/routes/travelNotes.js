const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const travelNoteController = require('../controllers/travelNoteController');
const auth = require('../middlewares/auth');
const { isAdmin, isReviewerOrAdmin } = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// 配置多文件上传
const multiUpload = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);

// @route   POST /api/travel-notes
// @desc    创建游记
// @access  Private
router.post(
  '/',
  [
    auth,
    multiUpload,
    [
      check('title', '标题不能为空').not().isEmpty(),
      check('content', '内容不能为空').not().isEmpty()
    ]
  ],
  travelNoteController.createTravelNote
);

// @route   GET /api/travel-notes
// @desc    获取所有已审核通过的游记
// @access  Public
router.get('/', travelNoteController.getAllApprovedNotes);

// @route   GET /api/travel-notes/user
// @desc    获取当前用户的所有游记
// @access  Private
router.get('/user', auth, travelNoteController.getUserNotes);

// @route   GET /api/travel-notes/:id
// @desc    获取特定游记
// @access  Private/Public
router.get('/:id', auth, travelNoteController.getTravelNoteById);

// @route   PUT /api/travel-notes/:id
// @desc    更新游记
// @access  Private
router.put(
  '/:id',
  [
    auth,
    multiUpload,
    [
      check('title', '标题不能为空').not().isEmpty(),
      check('content', '内容不能为空').not().isEmpty()
    ]
  ],
  travelNoteController.updateTravelNote
);

// @route   DELETE /api/travel-notes/:id
// @desc    删除游记
// @access  Private
router.delete('/:id', auth, travelNoteController.deleteTravelNote);

// 审核相关路由
// @route   GET /api/travel-notes/admin/pending
// @desc    获取待审核游记
// @access  Private/Admin
router.get(
  '/admin/pending',
  [auth, isReviewerOrAdmin],
  travelNoteController.getPendingNotes
);

// @route   PUT /api/travel-notes/admin/approve/:id
// @desc    审核通过游记
// @access  Private/Admin
router.put(
  '/admin/approve/:id',
  [auth, isReviewerOrAdmin],
  travelNoteController.approveNote
);

// @route   PUT /api/travel-notes/admin/reject/:id
// @desc    审核拒绝游记
// @access  Private/Admin
router.put(
  '/admin/reject/:id',
  [
    auth,
    isReviewerOrAdmin,
    [
      check('rejectReason', '请提供拒绝原因').not().isEmpty()
    ]
  ],
  travelNoteController.rejectNote
);

// @route   DELETE /api/travel-notes/admin/:id
// @desc    管理员删除游记
// @access  Private/Admin
router.delete(
  '/admin/:id',
  [auth, isAdmin],
  travelNoteController.adminDeleteNote
);

module.exports = router;