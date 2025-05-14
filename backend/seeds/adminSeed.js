const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

// 管理员和审核员数据
const adminData = [
  {
    username: 'admin',
    password: 'admin123',
    nickname: '超级管理员',
    role: 'admin'
  },
  {
    username: 'reviewer',
    password: 'reviewer123',
    nickname: '内容审核员',
    role: 'reviewer'
  }
];

// 连接数据库并添加管理员
const importData = async () => {
  try {
    await connectDB();
    
    // 清空现有用户
    await User.deleteMany({});
    
    // 检查是否已存在管理员
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('管理员账户已存在，无需重新创建');
      process.exit();
    }
    
    // 创建管理员账户
    await User.create(adminData);
    
    console.log('管理员账户创建成功');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// 执行导入
importData();