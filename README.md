# 飞行者图鉴

开放型航空科普知识平台 Demo，面向中文用户，支持飞行器、航空事件、航空专家三类内容浏览，并提供飞行器横向对比、专题导览、收藏、时间线和管理员后台录入能力。

## 项目功能

- 飞行器、航空事件、航空专家三类知识内容浏览
- 飞行器关键词搜索、分类筛选、标签筛选、只看收藏
- 飞行器多机型横向对比
- 对比页自动结论与参数可视化
- 航空时间线按年代分段浏览
- 普通用户 / 管理员双角色登录
- 普通用户注册
- 管理员后台新增飞行器数据与图片

## 技术栈

- 前端：React 18 + TypeScript + Vite + React Router + Tailwind CSS + Zustand
- 后端：Express + TypeScript
- 数据存储：本地 JSON 文件
- 图片存储：`public/uploads`

## 运行环境

- Node.js 18 及以上
- npm 9 及以上

建议先检查：

```powershell
node -v
npm -v
```

## 本地启动

在项目根目录执行：

```powershell
cd d:\trae_project
npm install
npm run dev
```

启动后默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`

## 分开启动

只启动前端：

```powershell
cd d:\trae_project
npm run client:dev
```

只启动后端：

```powershell
cd d:\trae_project
npm run server:dev
```

## 关闭项目

如果你是通过终端启动的项目，在终端里按：

```powershell
Ctrl + C
```

如果终端提示是否终止批处理，输入：

```powershell
Y
```

然后回车。

## 让别人运行这个项目

如果你要在别人的电脑上运行这个项目，建议这样做：

### 方案一：直接发源码，让对方本地运行

1. 把整个项目文件夹打包发给对方
2. 对方先安装 Node.js
3. 对方进入项目目录
4. 执行下面命令

```powershell
npm install
npm run dev
```

5. 浏览器打开：

```text
http://localhost:5173
```

### 建议发送的内容

建议发送整个项目目录，但不要强制携带以下目录：

- `node_modules`
- `dist`

保留以下核心内容即可：

- `src`
- `api`
- `shared`
- `data`
- `public`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `nodemon.json`
- `tsconfig.json`

## 测试账号

普通用户：

```text
viewer / viewer123
```

管理员：

```text
admin / admin123
```

如果你已经在本地注册过普通用户，新账号会保存在 `data/users.json` 中。

## 常用命令

类型检查：

```powershell
npm run check
```

构建项目：

```powershell
npm run build
```

## 数据位置

- 飞行器数据：`data/aircraft.json`
- 事件数据：`data/events.json`
- 专家数据：`data/experts.json`
- 用户数据：`data/users.json`
- 上传图片：`public/uploads`

## GitHub 上传前说明

如果你要把项目上传到 GitHub，建议先：

1. 安装 Git
2. 在 GitHub 创建一个空仓库
3. 再在项目目录中初始化并推送

如果当前电脑未安装 Git，终端里会无法识别 `git` 命令。
