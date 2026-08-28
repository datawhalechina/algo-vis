# 交互式算法与 AI 可视化课程

这是一个面向初学者的分步可视化学习项目。课程不只展示最终代码，而是把公式、符号、状态变化和调试方法拆成可以前进、后退和直接跳转的学习步骤。

当前共包含 346 个学习条目：

- 118 道经典算法题：数组、链表、树、图、动态规划等
- 134 个 AI 主题：CNN、RNN、Transformer、GNN、扩散模型、GAN、VAE 等
- 36 个强化学习主题：从 MDP、价值学习到策略优化和通用 LLM 分布式强化学习系统
- 22 个 CUDA 主题：线程层级、归约、扫描、卷积、内存访问和融合算子
- 36 个计算机基础概念：数据结构、操作系统、网络、数据库、编译原理和体系结构

## 学习体验

- 每个教学流程的关节都可以单独点击，并支持上一步、下一步、时间线跳转和自动播放
- 公式由 KaTeX 渲染，符号在进入推导前逐项解释
- 通用课程遵循“直觉 -> 符号 -> 公式 -> 流程 -> 误区 -> 调试 -> 总结”的节奏
- 算法题保留输入编辑、源码高亮、执行状态和收藏/进度记录
- 页面适配桌面端与移动端，长公式和时间线在各自区域内滚动

## 技术栈

React 18、TypeScript、Vite、Tailwind CSS、Framer Motion、D3、Cytoscape、KaTeX 与 React Syntax Highlighter。

## 本地运行

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

默认访问地址为 `http://localhost:5173/`。Vite 会在源码变化后热更新页面。

## 质量检查

```bash
npm test
npm run lint
npm run build
```

测试覆盖课程 ID 完整性、每个流程关节的步骤映射、KaTeX 严格渲染、跨专区进度隔离和关键数值示例。实现任务板与逐专区复核记录位于 `docs/implementation/` 和 `docs/reviews/`。

## 许可证

本项目采用 [MIT License](LICENSE)。
