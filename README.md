# LeetCode 热题 100 - 算法可视化教程

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**通过交互式动画和图解深入理解算法原理，让抽象的代码变得直观易懂**

[在线演示](https://leetcode-view.vercel.app/) | [快速开始](#-快速开始) | [贡献指南](#-贡献)

</div>

---

## 📖 项目简介

这是一个专注于 **LeetCode 热题 100** 的算法可视化教程项目。通过交互式动画、代码高亮同步、分步执行等方式，帮助开发者更直观地理解算法的执行过程。

### ✨ 特性

- 🎨 **精美的可视化动画** - 使用 Framer Motion 实现流畅的动画效果
- 🔍 **分步执行** - 可以逐步查看算法的每一步执行过程
- 💻 **代码同步高亮** - 代码执行与可视化动画实时同步
- 🎮 **交互式控制** - 播放/暂停/单步执行/调速等完整控制
- 📝 **详细解释** - 每一步都有清晰的文字说明和变量状态展示
- 🎯 **自定义输入** - 可以输入自己的测试用例
- 🏷️ **题型分类** - 按算法类型和难度筛选题目
- 🚀 **题目导航** - 上一题/下一题/学完等快捷操作
- 📱 **响应式设计** - 支持桌面端和移动端
- 🌈 **现代化 UI** - 基于 Tailwind CSS 的美观界面

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0
- npm >= 8.0 或 yarn >= 1.22

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Hoshino-wind/leetcode-view.git
cd leetcode-view

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 🌐 在线演示

访问 **[https://leetcode-view.vercel.app/](https://leetcode-view.vercel.app/)** 体验完整功能

本地开发服务器默认运行在 `http://localhost:5173`

## 📂 项目结构

```
leetcode-view/
├── src/
│   ├── components/          # 通用组件
│   ├── problems/           # 题目实现（68题）
│   ├── pages/              # 页面
│   ├── data/               # 题目数据
│   ├── hooks/              # 自定义 Hooks
│   ├── store/              # 状态管理
│   └── types/              # 类型定义
├── public/                 # 静态资源
└── package.json
```

## 🎯 已实现的题目

### 📊 统计（40/100）

## 🛠️ 技术栈

### 核心框架

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

### 样式和动画

- **Tailwind CSS** - 原子化 CSS
- **Framer Motion** - 动画库

### 路由和状态

- **React Router** - 路由管理
- **Zustand** - 状态管理（预留）

### 图标

- **Lucide React** - 图标库

## 📚 如何添加新题目

### 步骤一：添加题目信息

在 `src/data/problems.ts` 中添加题目元数据：

```typescript
{
  id: 2,
  leetcodeNumber: 206,
  title: '反转链表',
  difficulty: Difficulty.EASY,
  category: [Category.LINKED_LIST],
  description: '给定单链表的头节点 head，请你反转链表，并返回反转后的链表。',
  examples: [
    {
      input: '[1,2,3,4,5]',
      output: '[5,4,3,2,1]',
    },
  ],
}
```

### 步骤二：创建题目文件

```bash
# 创建题目目录
mkdir src/problems/ReverseLinkedList

# 创建必要文件
touch src/problems/ReverseLinkedList/ReverseLinkedListVisualizer.tsx
touch src/problems/ReverseLinkedList/algorithm.ts
touch src/problems/ReverseLinkedList/types.ts
```

### 步骤三：实现算法逻辑

在 `algorithm.ts` 中定义步骤生成函数：

```typescript
export function generateReverseLinkedListSteps(input: number[]) {
  const steps: Step[] = [];
  // 实现算法并记录每一步的状态
  return steps;
}
```

### 步骤四：实现可视化组件

在 `ReverseLinkedListVisualizer.tsx` 中创建可视化界面：

```typescript
import { useState } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { generateReverseLinkedListSteps } from "./algorithm";

export default function ReverseLinkedListVisualizer() {
  // 实现可视化逻辑和动画
  return <div>{/* 可视化界面 */}</div>;
}
```

### 步骤五：注册到路由

在 `src/pages/ProblemPage.tsx` 中导入并注册：

```typescript
import ReverseLinkedListVisualizer from "@/problems/ReverseLinkedList/ReverseLinkedListVisualizer";

// 在渲染逻辑中添加
{
  problem.id === 2 && <ReverseLinkedListVisualizer />;
}
```

### 💡 开发建议

- 遵循现有题目的代码结构和命名规范
- 确保每个步骤都有清晰的描述和状态快照
- 使用 Framer Motion 实现流畅的过渡动画
- 添加边界情况的处理和错误提示
- 编写简洁的代码注释

## 🗺️ 开发路线图

### Phase 1: 基础建设 ✅ (已完成)

- ✅ 项目框架搭建
- ✅ 基础可视化组件
- ✅ 第一个示例（两数之和）
- ✅ 播放控制系统

### Phase 2: 核心扩展 (进行中)

- ✅ 题目导航系统（上一题/下一题/学完）
- ✅ 题型分类筛选
- ✅ 难度筛选
- 🔜 实现 5-10 道经典题目
- 🔜 链表可视化组件
- 🔜 树形可视化组件
- 🔜 图可视化组件

### Phase 3: 功能完善

- 🔜 学习进度追踪（本地存储）
- 🔜 多种解法对比
- 🔜 题目收藏功能
- 🔜 暗黑模式
- 🔜 代码编辑器集成

### Phase 4: 内容扩展

- 🔜 完成所有 100 道题目
- 🔜 添加题解文章
- 🔜 添加视频讲解链接
- 🔜 社区讨论功能

### Phase 5: 优化和发布

- 🔜 性能优化
- 🔜 移动端适配
- 🔜 SEO 优化
- ✅ Vercel 部署配置
- 🔜 正式部署上线

## 🤝 贡献

欢迎任何形式的贡献！无论是报告 Bug、提出建议还是提交代码，我们都非常感谢。

### 💡 贡献方式

- 🐛 **报告 Bug** - 发现问题请提交 [Issue](https://github.com/Hoshino-wind/leetcode-view/issues)
- 💡 **功能建议** - 有好的想法欢迎在 Issues 中讨论
- 📝 **改进文档** - 帮助完善项目文档和注释
- 🎨 **添加题目** - 实现新的算法可视化（最受欢迎！）
- 🔧 **代码优化** - 改进性能、重构代码
- 🌐 **国际化** - 添加多语言支持

### 🔧 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 📋 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置的代码风格
- 组件使用函数式组件和 Hooks
- 保持代码简洁，添加必要的注释
- 提交前确保代码可以正常运行

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [LeetCode](https://leetcode.cn/) - 题目来源
- [React](https://react.dev/) - UI 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- 所有贡献者

## 📮 反馈与支持

如有问题或建议，欢迎通过以下方式联系：

- 💬 提交 [Issue](https://github.com/Hoshino-wind/leetcode-view/issues)
- 📧 发送邮件（如有）
- 🐦 关注项目更新

---

<div align="center">

### ⭐ Star History

如果这个项目对你有帮助，请给它一个 Star！

[![Star History Chart](https://api.star-history.com/svg?repos=Hoshino-wind/leetcode-view&type=Date)](https://star-history.com/#Hoshino-wind/leetcode-view&Date)

---

Made with ❤️ by Hoshino-wind

[MIT License](LICENSE) © 2024

</div>
