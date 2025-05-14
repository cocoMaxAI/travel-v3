const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// 初始化Express应用
const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 设置静态文件目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 定义路由
app.use('/api/users', require('./routes/users'));
app.use('/api/travel-notes', require('./routes/travelNotes'));

// 简单的首页
app.get('/', (req, res) => {
  res.send('旅游日记平台API服务器正在运行...');
});

// 端口设置
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));