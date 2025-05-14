# 🌏 旅游日记平台 TravelJournal
---

## 📌 项目简介  
**TravelJournal** 是一个旅行日记分享平台，支持用户发布图文/视频游记、审核管理、社交互动等功能。

---

## 🚀 核心功能  
| 模块 | 功能点 | 技术实现 |
|------|--------|----------|
| **用户端** | 游记发布、草稿保存、多媒体上传 | React Native + Markdown编辑器 |
| **审核系统** | 内容审核、批量操作、权限分级 | RBAC模型 + WebSocket通知 |
| **数据层** | 游记存储、版本控制、地理索引 | MongoDB + Elasticsearch |

---

## 🧰 技术架构  

---

## 🛠️ 技术栈  
- **前端**：React Native (移动端) / Ant Design Pro (管理后台)
- **后端**：Node.js + Express + TypeScript
- **数据库**：MongoDB 

---

## 📦 安装指南  

### 1. 克隆仓库  
```bash
git clone https://github.com/yourname/travel-journal.git
cd travel-v3
```

### 2. 环境依赖  
```bash
# 安装Node.js依赖
npm install

# 配置数据库（需提前安装MongoDB）
cp .env.example .env
# 修改.env中的数据库连接参数
```

### 3. 启动服务  
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
```

---
