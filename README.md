# 有趣的算法可视化教程

<div align="center">

**通过交互式动画和图解深入理解算法原理，让抽象的代码变得直观易懂**

[在线演示](https://leetcode-view.vercel.app/) | [快速开始](#-快速开始) | [贡献指南](#-贡献)

</div>

---

## 📖 项目简介

这是一个专注于 **LeetCode 热题 100** 的可视化学习项目，通过动画、图解和交互控制，帮助你直观理解常见算法的执行过程，而不仅仅是看代码。

- 🔍 **分步执行**：逐步查看每一步状态变化
- 💻 **代码同步高亮**：执行位置和源码一一对应
- 🎮 **完整控制面板**：播放 / 暂停 / 单步执行 / 调速
- 🎯 **自定义输入**：支持自行输入测试用例
- 📱 **响应式设计**：桌面端和移动端均有良好体验

## 🛠️ 技术特色

- **现代前端技术栈**：React 18 + TypeScript + Vite，开发体验流畅、构建速度快
- **组件化可视化方案**：每道题目都有独立的可视化组件，方便扩展和维护
- **状态驱动动画**：算法每一步以结构化数据描述，可轻松绑定到任意可视化形式
- **统一控制逻辑**：进度、播放速度、回放等逻辑在全局复用，保持交互体验一致
- **类型安全**：通过严格的类型定义保证算法步骤、可视化状态的一致性

## 🎬 动画与可视化库

- **Framer Motion**：用于组件进入/退出、元素高亮、过渡动画
- **GSAP**：实现复杂时间轴和精细控制的动画效果
- **D3.js**：用于数轴、柱状图、路径等数据可视化场景
- **Cytoscape / Dagre / Vis Network**：用于链表、树、图等结构的可视化与自动布局
- **React Syntax Highlighter**：负责代码区域的语法高亮与行高亮

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/datawhalechina/algo-vis.git
cd algo-vis

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问在线演示：**[https://leetcode-view.vercel.app/](https://leetcode-view.vercel.app/)**  
本地开发服务器默认运行在 `http://localhost:5173`

## 🤝 贡献

欢迎任何形式的贡献！无论是报告 Bug、提出建议还是提交代码，我们都非常感谢。

### 💡 贡献方式

- 🐛 **报告 Bug**：发现问题请提交 [Issue](https://github.com/datawhalechina/algo-vis/issues)
- 💡 **功能建议**：有好的想法欢迎在 Issues 中讨论
- 🎨 **添加题目**：实现新的算法可视化（最受欢迎！）
- 🔧 **代码优化**：改进性能、重构代码
- 📝 **改进文档**：完善项目说明和注释

### 🔧 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [LeetCode](https://leetcode.cn/) - 题目来源
- [React](https://react.dev/) - UI 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- 所有贡献者

## 📮 反馈与支持

如有问题或建议，欢迎通过以下方式联系：

- 💬 提交 [Issue](https://github.com/datawhalechina/algo-vis/issues)
- 📧 发送邮件（如有）

---

<div align="center">

### ⭐ Star History

如果这个项目对你有帮助，请给它一个 Star！

[![Star History Chart](https://api.star-history.com/svg?repos=datawhalechina/algo-vis&type=Date)](https://star-history.com/#datawhalechina/algo-vis&Date)

---

Made with ❤️ by Hoshino-wind

[MIT License](LICENSE) © 2024

</div>
