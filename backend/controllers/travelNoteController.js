const TravelNote = require('../models/TravelNote');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// 创建游记
exports.createTravelNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content } = req.body;
    
    // 检查是否上传了图片
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ msg: '至少需要上传一张图片' });
    }

    // 处理图片路径
    const images = req.files.images.map(file => file.filename);
    
    // 处理视频路径
    let video = null;
    if (req.files.video && req.files.video.length > 0) {
      video = req.files.video[0].filename;
    }

    // 创建新游记
    const newTravelNote = new TravelNote({
      title,
      content,
      images,
      video,
      author: req.user.id
    });

    await newTravelNote.save();
    res.json(newTravelNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取所有已审核通过的游记
exports.getAllApprovedNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 搜索条件
    const searchQuery = req.query.search 
      ? {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { 'author.nickname': { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    // 联合查询构建
    const query = {
      status: 'approved',
      isDeleted: false,
      ...searchQuery
    };

    // 查询游记并填充作者信息
    const travelNotes = await TravelNote.find(query)
      .populate('author', 'nickname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 获取总数用于分页
    const total = await TravelNote.countDocuments(query);

    res.json({
      travelNotes,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取用户自己的游记
exports.getUserNotes = async (req, res) => {
  try {
    const travelNotes = await TravelNote.find({ 
      author: req.user.id,
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    res.json(travelNotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取特定游记
exports.getTravelNoteById = async (req, res) => {
  try {
    const travelNote = await TravelNote.findById(req.params.id)
      .populate('author', 'nickname avatar');
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 检查游记是否已删除
    if (travelNote.isDeleted) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 检查是否为公开游记或是否为作者本人
    if (travelNote.status !== 'approved' && 
        travelNote.author._id.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'reviewer') {
      return res.status(404).json({ msg: '游记不存在或未审核通过' });
    }

    res.json(travelNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新游记
exports.updateTravelNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let travelNote = await TravelNote.findById(req.params.id);
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 检查是否为作者
    if (travelNote.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: '无权更新此游记' });
    }

    // 检查游记状态是否允许编辑
    if (travelNote.status === 'approved') {
      return res.status(400).json({ msg: '已审核通过的游记不能修改' });
    }

    const { title, content } = req.body;
    
    // 更新文本内容
    travelNote.title = title;
    travelNote.content = content;
    
    // 如果上传了新图片，处理图片
    if (req.files && req.files.images && req.files.images.length > 0) {
      // 删除旧图片文件
      travelNote.images.forEach(image => {
        const imagePath = path.join(__dirname, '../uploads', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      
      // 添加新图片
      travelNote.images = req.files.images.map(file => file.filename);
    }
    
    // 如果上传了新视频，处理视频
    if (req.files && req.files.video && req.files.video.length > 0) {
      // 删除旧视频文件
      if (travelNote.video) {
        const videoPath = path.join(__dirname, '../uploads', travelNote.video);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
      
      // 添加新视频
      travelNote.video = req.files.video[0].filename;
    }
    
    // 更新状态为待审核
    travelNote.status = 'pending';
    travelNote.rejectReason = null;
    
    await travelNote.save();
    res.json(travelNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除游记
exports.deleteTravelNote = async (req, res) => {
  try {
    const travelNote = await TravelNote.findById(req.params.id);
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    // 检查是否为作者
    if (travelNote.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: '无权删除此游记' });
    }

    // 物理删除游记及相关文件
    // 删除图片
    travelNote.images.forEach(image => {
      const imagePath = path.join(__dirname, '../uploads', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    // 删除视频
    if (travelNote.video) {
      const videoPath = path.join(__dirname, '../uploads', travelNote.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    await TravelNote.findByIdAndDelete(req.params.id);
    res.json({ msg: '游记已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 审核游记相关方法
// 获取待审核游记列表
exports.getPendingNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 状态过滤
    const status = req.query.status || 'pending';
    
    // 查询
    const travelNotes = await TravelNote.find({ 
      status,
      isDeleted: false
    })
      .populate('author', 'nickname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 获取总数用于分页
    const total = await TravelNote.countDocuments({ 
      status,
      isDeleted: false
    });

    res.json({
      travelNotes,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 审核通过游记
exports.approveNote = async (req, res) => {
  try {
    const travelNote = await TravelNote.findById(req.params.id);
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    travelNote.status = 'approved';
    travelNote.rejectReason = null;
    
    await travelNote.save();
    res.json(travelNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 审核拒绝游记
exports.rejectNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rejectReason } = req.body;
    
    if (!rejectReason) {
      return res.status(400).json({ msg: '请提供拒绝原因' });
    }

    const travelNote = await TravelNote.findById(req.params.id);
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    travelNote.status = 'rejected';
    travelNote.rejectReason = rejectReason;
    
    await travelNote.save();
    res.json(travelNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 管理员删除游记（逻辑删除）
exports.adminDeleteNote = async (req, res) => {
  try {
    const travelNote = await TravelNote.findById(req.params.id);
    
    if (!travelNote) {
      return res.status(404).json({ msg: '游记不存在' });
    }

    travelNote.isDeleted = true;
    
    await travelNote.save();
    res.json({ msg: '游记已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};