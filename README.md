<h1 align="center">交互式算法与 AI 可视化课程</h1>

<p align="center">
  用可回放的步骤动画、严格渲染的公式和可执行的调试检查，理解算法与模型如何一步步得到结果。
</p>

<p align="center">
  <a href="https://datawhalechina.github.io/algo-vis/">在线演示</a> |
  <a href="#课程地图">课程地图</a> |
  <a href="#快速开始">快速开始</a> |
  <a href="#参与贡献">参与贡献</a>
</p>

<p align="center">
  <img alt="React 18" src="https://img.shields.io/badge/React-18-149ECA?logo=react&amp;logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&amp;logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&amp;logoColor=white" />
</p>

## 项目简介

这是一个面向初学者的交互式计算机科学课程。它不只给出最终代码或公式，而是把输入、符号、运算、中间状态、数据传递、输出和调试检查拆成可以前进、后退、直接跳转与自动播放的步骤。

项目目前包含 **346 个学习条目**，覆盖经典算法、AI、强化学习、CUDA 和计算机基础。原有的 LeetCode 热题可视化仍被完整保留，并在此基础上扩展为五个相互关联的学习专区。

| 专区 | 数量 | 内容范围 | 主要交互形式 |
| --- | ---: | --- | --- |
| 经典算法 | 118 | 数组、字符串、链表、树、图、回溯、二分、栈、贪心、动态规划等 | 题目专用动画、代码同步高亮、自定义输入 |
| AI | 134 | 视觉、NLP、LLM、语音、多模态、CNN、RNN、Transformer、GNN、Diffusion、GAN、VAE | 71 个专用可视化 + 63 个引导式动画课程 |
| 强化学习 | 36 | MDP、价值学习、策略梯度、Actor-Critic、连续控制、多智能体、LLM RL 与分布式系统 | 14 章课程路线、逐关节动画推演 |
| CUDA | 22 | Element-wise、Reduction、Scan、矩阵、卷积、数据重排、归一化 | 1 个专用可视化 + 21 个引导式动画课程 |
| 计算机基础 | 36 | 数据结构与算法、操作系统、网络、数据库、编译原理、计算机组成 | 6 本主题书、逐步状态与数据流动画 |

其中 156 个引导式课程拥有独立教学蓝图和语义场景，不是只更换标题与说明文字的通用模板。

## 学习体验

### 一步一帧，而不是只有文字

每个引导式课程的数据流关节都对应一个可点击的视觉帧。切换步骤时，页面会同步展示：

- 当前读取的输入和仍然不可见的数据
- 正在执行的操作、公式或控制条件
- 在实体之间移动的 payload 和对应连接
- 本步新产生的中间值、输出和指标
- 可以直接核对的调试断言

数组、矩阵、图、序列、流水线和概率分布使用不同的场景布局。动画只表达真实的状态变化，不依赖装饰性漂移来制造“正在运行”的效果。

### 可自由回看每个关节

所有经典算法题与引导式课程统一提供：

- 播放、暂停、重置、上一步和下一步
- `0.5x`、`1x`、`1.5x`、`2x` 播放速度
- 可横向滚动的步骤时间线
- 直接点击任意步骤跳转，无需从头播放
- 当前步骤、总步骤和学习进度提示

### 面向初学者的讲解顺序

引导式课程遵循同一套认知节奏：

1. 用直觉和具体问题说明“为什么需要它”。
2. 在公式出现前逐一解释符号。
3. 用 KaTeX 展示核心公式，并绑定到场景中的真实对象。
4. 按数据流逐关节推演，每一步都显示可观察变化。
5. 指出常见误区，并给出可以执行的调试检查。
6. 用一句话收束本课结论。

公式源会经过严格渲染测试；长公式拥有独立横向滚动区域，不会挤压或遮挡相邻内容。

### 算法题学习工具

经典算法题还提供题目描述、样例、复杂度分析、源码高亮、自定义测试输入和变量状态；大多数题目提供多种解法对比。学习进度、进行中状态和收藏保存在浏览器本地，刷新后仍可继续。

## 课程地图

### 经典算法

118 道题按数据结构与解题方法双维度组织，覆盖数组、字符串、链表、树、图、矩阵、栈、堆、哈希、数学、双指针、滑动窗口、二分查找、DFS、BFS、回溯、贪心和动态规划等主题。

适合从一道具体题目进入，在动画、代码和变量状态之间建立对应关系。入口路由为 `/problems`。

### AI

AI 专区从基础算子延伸到完整模型与生产流程：

- 应用方向：计算机视觉、自然语言处理、语音、多模态和大语言模型
- 模型结构：CNN、RNN、Transformer 和图神经网络
- 生成模型：扩散模型、GAN 和 VAE
- 典型机制：注意力、位置编码、KV Cache、卷积、消息传递、采样、生成与对齐

前 71 个主题保留各自的专用可视化，后续 63 个主题使用独立蓝图和共享动画引擎。入口路由为 `/ai`。

### 强化学习

课程主线参考[王树森老师公开的强化学习课程资料](https://github.com/wangshusen/DRL)，再补充现代 LLM 强化学习与工程系统内容。当前路线分为 14 章：

1. 强化学习基础与 MDP
2. 价值学习基础
3. 策略学习基础
4. Actor-Critic 方法
5. 蒙特卡洛方法与 AlphaGo
6. 时序差分学习
7. 深度价值学习
8. 带基线的策略梯度
9. 信赖域与部分观测
10. 连续动作控制
11. 多智能体强化学习
12. 模仿学习
13. LLM 强化学习与对齐
14. LLM 分布式强化学习系统

最后一章讲的是通用的分布式 LLM 强化学习框架设计，包括控制器、Worker、Rollout、奖励服务、参数同步与重分片，不绑定或命名为某一个具体框架。入口路由为 `/drl`。

### CUDA

CUDA 专区按算子形态组织为七类：逐元素操作、规约、扫描与排序、矩阵运算、模板与卷积、数据变换与重排、复合归一化。课程不仅展示公式，也显式画出线程、lane、共享内存、同步点、中间结果和跨阶段传输。入口路由为 `/cuda`。

例如 Reduction 课程会依次展示寄存器读取、共享内存写入、块级同步、树形规约、warp shuffle、部分和写回与最终归并，而不是把整段过程叠在同一个画面中。

### 计算机基础

36 个概念被组织为六本主题书，每本六节：

| 主题书 | 示例内容 |
| --- | --- |
| 数据结构与算法 | 数组局部性、链表、栈与队列、树遍历、图搜索、动态规划 |
| 操作系统原理 | 进程与线程、调度、虚拟内存、同步与死锁、文件系统与 I/O |
| 计算机网络 | 分层封装、IP 路由、TCP 可靠传输、拥塞控制、DNS、HTTP 与 TLS |
| 数据库系统 | 关系模型、B+ 树、ACID、MVCC、查询优化、复制与分片 |
| 编译原理 | 词法分析、AST、类型检查、IR/SSA、数据流优化、代码生成 |
| 计算机组成原理 | 指令编码、流水线、缓存、地址转换、分支预测、SIMD 与多核 |

入口路由为 `/concepts`。

## 建议学习方式

- 第一次学习某个主题时，从“直觉”开始自动播放一遍，再逐个点击流程关节回看。
- 推导时同时观察公式高亮对象与场景中的输入、操作、输出，避免只记符号形式。
- 遇到结果不一致时，先看当前帧的调试检查，再对照输入快照和数据传输。
- 学算法题时先使用内置样例理解状态变化，再切换自定义输入验证边界情况。
- 强化学习建议按章节顺序学习；有策略梯度基础后再进入 LLM RL 与分布式系统扩展。

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- pnpm 9
- 支持现代 JavaScript、SVG 和 CSS 的浏览器

### 安装与启动

```bash
git clone https://github.com/datawhalechina/algo-vis.git
cd algo-vis
pnpm install
pnpm dev
```

项目默认在 `http://localhost:3000/` 启动，并在源码变化后热更新。

如需与浏览器验收环境保持一致，可显式使用 5173 端口：

```bash
pnpm dev -- --host 0.0.0.0 --port 5173
```

然后访问 `http://127.0.0.1:5173/`。

### 生产构建

```bash
pnpm build
pnpm preview
```

`pnpm build` 会先执行 TypeScript 检查，再生成 Vite 生产包。构建产物位于 `dist/`。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器和热更新 |
| `pnpm build` | TypeScript 检查并构建生产包 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm lint` | 执行 ESLint |
| `pnpm test` | 运行课程协议、公式和数值语义测试 |
| `pnpm test:bundle` | 在 `pnpm build` 后检查引导课程分包，防止共享入口退化成超大 bundle |
| `pnpm test:e2e` | 使用 Playwright 验收真实页面、步骤与响应式布局 |
| `pnpm audit --prod --audit-level high` | 检查生产依赖中的高危漏洞 |

首次执行端到端测试前，如果本机还没有 Chromium：

```bash
pnpm exec playwright install chromium
```

Playwright 失败时会把报告、截图、视频或 trace 写入 `artifacts/playwright/lesson-scenes/`。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 应用 | React 18、TypeScript、Vite、React Router |
| UI 与样式 | Tailwind CSS、Ant Design、Lucide React |
| 动画 | Framer Motion、GSAP |
| 数学公式 | KaTeX、React KaTeX |
| 数据与图结构 | D3、Dagre |
| 可扩展图形依赖 | Cytoscape、Vis Network、Three.js、React Three Fiber、Drei（已安装，当前主流程未启用） |
| 状态管理 | Zustand + localStorage 持久化 |
| 代码展示 | React Syntax Highlighter |
| 测试 | Node Test Runner、Playwright、ESLint、TypeScript |

## 项目结构

```text
algo-vis/
├── src/
│   ├── components/              # 通用 UI、播放控件与共享可视化组件
│   ├── config/                  # 教学蓝图、课程清单与动画场景规格
│   │   ├── aiLessonBlueprints/
│   │   ├── cudaLessonBlueprints/
│   │   ├── conceptLessonBlueprints/
│   │   └── lessonScenes/        # 每题逐关节的语义帧
│   ├── data/                    # 经典算法题元数据
│   ├── dataai/                  # AI 课程元数据
│   ├── datacuda/                # CUDA 课程元数据
│   ├── datadrl/                 # 强化学习课程元数据
│   ├── dataconcepts/            # 计算机基础书架与概念数据
│   ├── problems/                # 经典算法专用可视化
│   ├── problemsai/              # AI 专用可视化与注册表
│   ├── problemscuda/            # CUDA 专用可视化与注册表
│   ├── problemsdrl/             # 强化学习可视化注册表
│   ├── concepts/                # 计算机基础可视化注册表
│   ├── pages/                   # 五大专区及详情页
│   ├── hooks/                   # 播放、输入与滚动恢复逻辑
│   ├── store/                   # 学习进度与收藏状态
│   └── types/                   # 题目、课程与动画协议类型
├── tests/                       # 单元、契约、语义与 E2E 测试
├── docs/                        # 设计规格、实现任务板与独立复核记录
├── scripts/                     # 构建产物检查脚本
└── .github/workflows/           # CI 与 GitHub Pages 部署
```

## 实现架构

经典算法题使用题目专用的步骤生成器和可视化组件。大规模课程内容使用“独立内容数据 + 共享渲染能力”的结构：

```text
课程元数据
    -> 教学蓝图（直觉、符号、公式、流程、误区、调试、总结）
    -> 语义场景（实体、连接、每个关节的完整帧）
    -> 领域包装器
    -> 共享动画引擎 + 播放控制器
```

共享的是交互与布局，不是课程知识文本。每个引导课程都拥有独立的公式、数据、步骤、因果说明和调试断言。

场景协议支持六种布局：`array`、`matrix`、`graph`、`sequence`、`pipeline` 和 `distribution`。每帧都保存完整状态，因而从任意步骤来回跳转时不会依赖上一帧残留，也不会把多个步骤的动画叠在一起。

## 如何新增内容

### 新增经典算法题

1. 在 `src/data/` 对应分类文件中添加题目元数据和题解。
2. 在 `src/problems/Problem<ID>/` 中实现步骤生成器与可视化组件。
3. 在 `src/problems/index.ts` 注册懒加载组件。
4. 使用内置样例和边界输入验证前进、后退、重置与自动播放。
5. 运行 lint、单测、构建和相关 E2E 测试。

`VisualizationLayout`、`useVisualization`、`PlaybackControls` 和现有模板可复用输入解析、播放状态、时间线与步骤说明。

### 新增引导式课程

1. 在对应的 `dataai/`、`datacuda/`、`datadrl/` 或 `dataconcepts/` 数据源中加入课程元数据。
2. 编写独立教学蓝图，至少包含直觉、公式、符号解释、三个流程关节、误区、调试提示和总结。
3. 为每个流程关节提供同 ID 的场景帧，明确输入、操作、输出、实体状态、传输和断言。
4. 把课程 ID 加入 `src/config/guidedLessonManifest.ts`，并确保对应领域注册表可以解析它。
5. 为公式、数值关系、场景变化和路由补充测试。

新增场景时请遵守以下约束：

- 流程关节使用稳定、可读的语义 ID，不使用 `step-1` 一类位置编号。
- 相邻帧必须产生真实的数据、拓扑、位置、传输或指标变化。
- `entityStates` 是帧数值的唯一事实来源，输入和输出只是它的命名视图。
- 公式与场景实体需要显式绑定，并通过 KaTeX 严格渲染。
- 每帧至少包含一个可判定的调试断言。
- 桌面和移动视口都不能出现文字、节点、连线或控制器重叠。

完整设计见[全项目补全规格](docs/superpowers/specs/2026-08-28-full-project-completion-design.md)和[逐步动画规格](docs/superpowers/specs/2026-08-28-guided-lesson-step-animation-design.md)。当前任务覆盖与复核结论位于 `docs/implementation/` 和 `docs/reviews/`。

## 质量保证

自动化检查覆盖：

- 346 个课程 ID、数据与可视化入口的一致性
- 156 个引导课程的蓝图、场景、公式绑定和逐关节状态变化
- KaTeX `throwOnError` 严格渲染
- 关键公式与示例数值的语义正确性
- 场景实体、连接、数据传输和调试断言的契约
- 不同专区之间的学习进度 ID 隔离
- 320 px、390 px 移动端和 1440 px 桌面端的逐步骤浏览器验收
- 动画元素、文字、连接与控制区域的重叠检查

CI 会依次执行生产依赖审计、lint、单测、构建、分包检查和 Playwright E2E。每个内容分片也在 `docs/reviews/` 中保留“易读、易学、易调试、公式正确、步骤连贯”的独立复核记录。

## GitHub Pages 部署

正式站点：<https://datawhalechina.github.io/algo-vis/>

`.github/workflows/deploy.yml` 在代码进入 `main` 后构建并部署，也支持从 Actions 手动触发。工作流会根据仓库名设置 `VITE_BASE_PATH`，因此项目仓库可正确部署到 `/<repository>/` 子路径。

Pull Request 只运行 CI，不会覆盖正式站点，也不会自动生成 Pages 预览链接。合并到 `main` 并且部署工作流成功后，线上内容才会更新。

在 Fork 中部署时，需要在仓库中启用 Actions 和 GitHub Pages，并选择 **GitHub Actions** 作为 Pages 来源；站点地址通常为 `https://<username>.github.io/<repository>/`。仓库首页 About 区域的 Website 链接属于单独的仓库元数据，需要在仓库设置中填写，并不会由部署工作流自动出现。

仓库也保留了 `vercel.json`，其中配置了 `dist` 输出目录和单页应用回退规则，可作为 Vercel 部署入口；README 不再引用无法确认状态的旧 Vercel 演示地址。

## 参与贡献

欢迎报告问题、完善讲解、修正公式、增加测试或提交新的可视化：

1. Fork 仓库并从 `main` 创建特性分支。
2. 保持改动聚焦，并为行为变化补充相应测试。
3. 提交前运行 `pnpm lint`、`pnpm test`、`pnpm build` 和相关 E2E。
4. 检查 `git diff`，确认没有生成物、调试文件或凭据进入提交。
5. 推送分支并创建 Pull Request，说明课程范围、交互变化和验证结果。

发现 Bug 或希望讨论内容规划时，请提交 [Issue](https://github.com/datawhalechina/algo-vis/issues)。

## 致谢

- [LeetCode](https://leetcode.cn/) 提供经典算法题目语境。
- [王树森强化学习课程资料](https://github.com/wangshusen/DRL)为强化学习主线提供参考。
- React、Vite、Framer Motion、KaTeX、D3、Cytoscape、Three.js 等开源项目提供基础能力。
- 感谢原项目作者 Hoshino-wind 以及所有贡献者。

## 许可证

历史 README 将本项目标记为 MIT，但当前仓库尚未包含 `LICENSE` 文件。正式复用或分发前，请等待仓库维护者补充明确的许可证文本。

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=datawhalechina/algo-vis&type=Date)](https://star-history.com/#datawhalechina/algo-vis&Date)

</div>
