# 引导式课程逐步动画修复设计

日期：2026-08-28

状态：已获用户批准采用方案 A，等待最终规格复审

## 1. 背景与问题

项目中的已有专用可视化可以展示算法或模型状态变化，但后续补齐的 156 个引导式课程共用了文字型渲染器：

- AI：63 题（`10072-10134`）
- CUDA：21 题（除专用 Vector Add 外）
- 强化学习：36 题（`30001-30036`）
- 计算机基础：36 个概念（`40001-40036`）

这些页面虽然可以前进、后退和点击流程关节，也能渲染公式，但当前步骤只切换说明文字和流程卡片。用户看不到输入、运算中间态、数据传输或输出如何变化，因此不构成真正的逐步动画。

本次修复覆盖全部 156 页，而不是只修复 `/cuda/201`。已有专用可视化保持原样。

## 2. 目标与验收定义

每个受影响课程必须同时满足以下条件：

1. 页面始终展示一个与题目语义对应的视觉场景，而不只是公式和文字卡片。
2. 每个 `flow` 关节恰好映射到一个可直接点击的视觉帧。
3. 相邻视觉帧必须至少改变以下一项：数值、带 payload 的连线传输、可见拓扑、结构位置、概率/指标或可见中间产物；只切换激活/完成高亮不算语义变化。
4. 点击上一步、下一步、流程关节、重置或自动播放时，场景与步骤说明保持同步。
5. 状态变化使用短促的位移、缩放、颜色或连线脉冲过渡；动画服务于理解，不使用无意义装饰。
6. 每帧显示“当前输入、正在发生的操作、当前输出”中的至少两项，帮助初学者定位数据变化。
7. 公式继续通过 KaTeX 严格渲染，并与当前视觉帧共同显示。
8. 桌面和移动端均无溢出、遮挡或因内容变化造成的布局跳动。

“流程按钮变色”“文字说明变化”或“给现有卡片加漂移动效”单独出现时，不算满足动画验收。

## 3. 方案选择

采用方案 A：共享动画引擎 + 领域化场景数据。

不为 156 题复制 156 套 React 状态机。每题提供独立、可测试的场景规格；共享渲染器只负责动画、布局、步骤同步和无障碍语义。这样既能让每题拥有具体数值和中间态，又能避免大量无法维护的重复组件。

未采用的方案：

- 每题手写完整组件：定制能力最高，但改动量和回归面过大，难以保证 156 页一致可用。
- 在现有文字卡片上增加过渡：开发快，但仍无法展示数据如何变化，不能解决用户指出的问题。

## 4. 模块边界

### 4.1 场景协议

现有 `flow: string[]` 迁移为稳定关节协议。ID 使用题目内唯一、能表达语义的短横线命名，例如 CUDA 201 的 `read-registers`、`write-shared`、`block-barrier`；禁止使用只表达位置的 `step-1`。页面顺序只能来自该数组：

```ts
interface LessonFlowJoint {
  id: string;
  label: string;
}

interface GuidedLessonBlueprint {
  // 其他既有字段保持不变
  flow: LessonFlowJoint[];
}
```

新增纯 TypeScript 场景协议。以下是规范性字段，而不是示意伪代码：

```ts
type SceneScalar = string | number | boolean;
type LessonSceneKind =
  | "array"
  | "matrix"
  | "graph"
  | "sequence"
  | "pipeline"
  | "distribution";

type EntityRole = "input" | "operator" | "intermediate" | "output" | "control";
type EntityStatus = "waiting" | "active" | "complete" | "blocked" | "warning";

interface LessonSceneEntity {
  id: string;
  label: string;
  role: EntityRole;
  groupId?: string;
  unit?: string;
}

interface SceneDatum {
  entityId: string;
  label: string;
  value: SceneScalar | SceneScalar[] | SceneScalar[][];
  unit?: string;
}

interface SceneEntityState {
  value?: SceneScalar | SceneScalar[] | SceneScalar[][];
  status: EntityStatus;
  visible: boolean;
  position?: { x: number; y: number }; // 归一化到 0..1
}

interface LessonSceneTransfer {
  id: string;
  from: string;
  to: string;
  payload: SceneScalar | SceneScalar[];
  label: string;
}

interface SceneOperation {
  label: string;
  sourceEntityIds: string[];
  targetEntityIds: string[];
  expression?: string; // 存在时必须通过 KaTeX 严格解析
}

interface SceneDebugAssertion {
  label: string;
  entityId: string;
  operator: "eq" | "approx" | "range" | "finite" | "visible";
  expected: SceneScalar | [number, number];
}

interface LessonSceneFrame {
  jointId: string;
  title: string;
  inputs: SceneDatum[];
  operation: SceneOperation;
  outputs: SceneDatum[];
  entityStates: Record<string, SceneEntityState>;
  visibleConnectionIds: string[];
  transfers: LessonSceneTransfer[];
  metrics: SceneDatum[];
  result: string;
  explanation: string;
  debugAssertions: SceneDebugAssertion[];
}

interface LessonSceneConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface FormulaBinding {
  symbol: string;
  entityIds: string[];
}

interface LessonSceneBase<K extends LessonSceneKind, L> {
  lessonId: number;
  kind: K;
  ariaLabel: string;
  entities: LessonSceneEntity[];
  connections: LessonSceneConnection[];
  formulaBindings: FormulaBinding[];
  layout: L;
  framesByJointId: Record<string, LessonSceneFrame>;
}
```

`LessonSceneSpec` 是以下六种布局的判别联合：

```ts
type ArraySceneSpec = LessonSceneBase<"array", {
  orientation: "horizontal" | "vertical";
  groups: Array<{ id: string; label: string; entityIds: string[] }>;
}>;

type MatrixSceneSpec = LessonSceneBase<"matrix", {
  rows: number;
  columns: number;
  cellEntityIds: string[][];
}>;

type GraphSceneSpec = LessonSceneBase<"graph", {
  nodeEntityIds: string[];
  positions: Record<string, { x: number; y: number }>;
}>;

type SequenceSceneSpec = LessonSceneBase<"sequence", {
  trackIds: string[];
  trackByEntityId: Record<string, string>;
  orderedEntityIds: string[];
}>;

type PipelineSceneSpec = LessonSceneBase<"pipeline", {
  laneIds: string[];
  laneByEntityId: Record<string, string>;
  stageEntityIds: string[];
}>;

type DistributionSceneSpec = LessonSceneBase<"distribution", {
  categoryEntityIds: string[];
  xLabel: string;
  yLabel: string;
  yDomain: [number, number];
}>;

type LessonSceneSpec =
  | ArraySceneSpec
  | MatrixSceneSpec
  | GraphSceneSpec
  | SequenceSceneSpec
  | PipelineSceneSpec
  | DistributionSceneSpec;
```

所有实体、连接和传输引用必须可解析。`entityStates` 必须恰好覆盖题目声明的所有实体。`visibleConnectionIds` 必须是已声明连接的无重复子集。每种布局的实体 ID 列表都必须是场景全部实体 ID 的无重复排列：数组 `groups[].entityIds` 的扁平结果、矩阵 `cellEntityIds` 的扁平结果、图 `nodeEntityIds`、序列 `orderedEntityIds`、流水线 `stageEntityIds`、分布 `categoryEntityIds` 都不能漏项或重复。

矩阵必须满足 `rows > 0`、`columns > 0`、`cellEntityIds.length === rows` 且每行长度都等于 `columns`。图的 `positions` 键集合必须与 `nodeEntityIds` 完全相等，坐标必须是 `0..1` 内的有限数。`trackByEntityId`、`laneByEntityId` 的键集合必须分别与序列、流水线实体集合完全相等，值只能引用无重复、非空的 `trackIds`/`laneIds`。分布纵轴必须是递增有限区间。

协议概念对应如下：

- `LessonSceneSpec`：题目级场景定义。
- `LessonSceneKind`：视觉布局种类。
- `LessonSceneEntity`：数组单元、矩阵单元、节点、处理器、内存区、阶段或指标。
- `LessonSceneConnection`：有方向的数据或控制依赖。
- `LessonSceneFrame`：某一流程关节的完整可视状态。
- `LessonSceneTransfer`：当前帧中从一个实体移动到另一个实体的数据。

每个帧至少包含：

- `title`：当前操作的短名称。
- `inputs`：本帧读取的具体值。
- `operation`：本帧的运算、源实体和目标实体。
- `outputs`：本帧写出的具体值。
- `entityStates`：本帧完整而非增量的实体状态。
- `visibleConnectionIds`：本帧实际出现的静态拓扑边；临时数据移动仍由 `transfers` 表达。
- `result`：本帧产生的可观察结果。
- `explanation`：一条面向初学者的因果说明。
- `debugAssertions`：至少一个可判定的核对点。

`entityStates[entityId].value` 是本帧数值的唯一事实来源。`inputs`、`outputs` 和 `metrics` 是用于讲解与无障碍表格的命名视图：每个 datum 必须引用本帧可见实体，且 `datum.value` 必须与该实体的 `value` 深度相等；它们不得维护另一份可独立变化的数据。三者中 `inputs` 与 `outputs` 不得同时为空。`operation` 必须引用至少一个源实体和一个目标实体，且这些实体在本帧可见。

`blueprint.symbols[].symbol` 与 `formulaBindings[].symbol` 各自都必须非空且唯一，两者集合完全相等。每个绑定的 `entityIds` 必须非空、无重复且只引用已声明实体；在任何显示课程公式的 phase 所解析到的帧中，每个公式绑定都至少有一个关联实体可见。不通过解析 LaTeX 字符串猜测符号。调试模式直接显示当前帧的结构化断言，而不是只显示课程级调试 prose。

协议与帧解析保持为纯函数，Node 测试无需启动浏览器即可检查全量课程。

### 4.2 场景类型

共享引擎支持六类视觉语法：

| 场景类型 | 表现形式 | 主要用途 |
| --- | --- | --- |
| `array` | 单元格、分组、指针、局部值和归并树 | CUDA 归约/扫描/排序、数组算法 |
| `matrix` | 网格、滑窗、注意力热区、输入输出矩阵 | CNN、Transformer、矩阵 CUDA |
| `graph` | 节点、边、消息脉冲、状态/价值标签 | GNN、MDP、图搜索、多智能体 |
| `sequence` | 时间步、隐藏状态、token、动作和回报 | RNN、轨迹、策略更新、编译 token 流 |
| `pipeline` | 处理阶段、队列、设备/内存泳道、移动数据包 | CUDA 内存流、网络、编译器、分布式 LLM RL |
| `distribution` | 柱形概率、采样点、损失/回报曲线、噪声变化 | Diffusion、GAN、VAE、策略分布与优化 |

场景类型是布局语法，不是题目知识。每题仍需独立规格和真实示例值。

### 4.3 内容注册表

场景规格按领域分开，避免多人同时修改同一文件：

- `src/config/lessonScenes/ai/*`
- `src/config/lessonScenes/cuda/*`
- `src/config/lessonScenes/drl/*`
- `src/config/lessonScenes/concepts/*`

每个领域导出 `get...LessonScene(id)`。统一入口根据课程类型和 ID 返回场景，不根据标题进行脆弱的运行时字符串猜测。蓝图 `flow` 必须非空，所有 `id` 必须非空且在题目内唯一。`Object.keys(framesByJointId)` 与 `flow[].id` 必须数量相等且集合完全相等，并且每个 `framesByJointId[key].jointId === key`。transition 步骤的顺序必须逐项等于 `flow` 顺序；渲染顺序、按钮标签和帧解析都读取蓝图的同一组 `LessonFlowJoint`，不允许再维护第二个位置数组。

允许使用小型场景构造器减少重复，例如数组逐轮折半、流水线逐站传输、图消息传播、概率分布更新；构造器接收题目自己的实体、数值和阶段结果，不能只把 `flow` 文案重新包装成节点。

### 4.4 视觉渲染器

新增 `AnimatedLessonScene` 作为共享入口，并按场景种类拆成小组件。它接收：

- `spec`
- `jointId`
- `phase`
- `isPlaying`

渲染器职责：

- 使用稳定尺寸的画布区域，防止帧切换造成布局抖动。
- 使用 Framer Motion 的 keyed/layout transition 展示实体移动、数值替换和连线脉冲。
- 将帧中的每个语义变化投射到对应视觉实体：值变化必须出现在实体上，位置变化必须移动实体，拓扑变化必须显隐对应边，`transfers` 必须沿 `from -> to` 可见运动；不能只在场景旁边更新文字摘要。
- 在动画区域显示帧标题、操作、结果和进度 `n / total`。
- 为当前实体、已完成实体、等待实体和警告实体提供清晰且不只依赖颜色的状态标记。
- 在 `prefers-reduced-motion` 下关闭位移动画，但保留完整状态变化。

现有 `GuidedLessonVisualizer` 和 `GuidedDRLLessonVisualizer` 都调用同一个场景入口。DRL 可以保留自己的教学蓝图协议，但不能继续维护另一套视觉实现。

## 5. 步骤与数据流

课程仍保留现有学习节奏：直觉、符号、公式、逐步推演、误区、调试、总结。

场景帧映射规则：

- 直觉、符号和公式阶段显示第 0 帧，分别叠加直觉提示、符号图例和公式映射，不提前播放后续结果。
- 第 `i` 个推演步骤显示第 `i` 个场景帧。
- 误区阶段显示最后一帧并突出该题定义的风险实体或错误路径。
- 调试阶段显示最后一帧，并给关键中间值增加可检查标记。
- 总结阶段显示完成态，保留最终结果和公式。

交互事件流：

```text
上一步 / 下一步 / 自动播放 / 点击关节
                  |
                  v
        useVisualization.currentStep
                  |
                  v
      教学 phase + activeFlowIndex
                  |
                  v
       resolveLessonSceneFrame(...)
                  |
                  v
 AnimatedLessonScene 渲染同一事实来源的视觉状态
```

流程按钮不维护第二份局部状态，避免文字步骤与动画帧失步。规范性解析函数为：

```ts
resolveSceneJointId(phase, activeJointId, flow) =
  phase === "transition" ? activeJointId
  : phase === "reflection" || phase === "debug" || phase === "summary"
    ? flow[flow.length - 1].id
    : flow[0].id;
```

`createGuidedLessonSteps` 在 transition 步骤保存 `activeJointId`，不再保存脆弱的数组索引；`activeFlowIndex` 仅可作为由 `flow.findIndex(id)` 即时导出的显示值，不能持久化为事实来源。重置和路由变化回到教学 step 0；直接跳转、前进、后退和自动播放都只改变 `currentStep`，再由上述纯函数解析场景。渲染器以 `jointId` 读取 `framesByJointId[jointId]`，不存在时进入明确错误态，不能静默回退到错误帧。

## 6. 各领域内容策略

### 6.1 CUDA 21 题

重点展示线程、warp、block、shared/global memory、同步边界和真实数值变化。

- Element-wise：线程到元素的映射、越界线程、读写位置。
- Reduction：寄存器局部值、shared memory、屏障、折半值、block 部分量和跨 kernel 合并。
- Scan/Sort：up-sweep/down-sweep、前缀结果、digit bucket、稳定位置。
- Matrix/Conv：二维线程块、tile、滑窗和累加器。
- Transpose/Norm：访存合并、shared tile、尺度与归约中间量。

#### CUDA 201 必须实现的逐帧故事板

输入固定使用 `[1,2,3,4,5,6,7,8]`，恰好包含以下七帧，并使用稳定关节 ID：

1. `read-registers`：八个线程分别读取一个值，线程寄存器为 `[1,2,3,4,5,6,7,8]`。
2. `write-shared`：八个值写入 shared memory，对应槽位可见。
3. `block-barrier`：`__syncthreads()` 屏障实体的可见 `value` 从上一帧的 `waiting` 变为 `released`，所有写入完成后才允许读取邻居；不能只改变 `status` 或颜色。
4. `shared-tree-reduce`：同一帧的归并层展示 `[3,7,11,15] -> [10,26]`。六个加法对 `(1,2)->3`、`(3,4)->7`、`(5,6)->11`、`(7,8)->15`、`(3,7)->10`、`(11,15)->26` 都各用两条 operand-to-result transfer 表达，transfer payload 必须分别等于两个输入值，结果实体显示精确和。
5. `warp-tail`：有效 lane 用两条 payload 分别为 `10`、`26` 的 operand-to-result transfer 把 `[10,26]` 合成 `[36]`，lane 0 持有 block 和。
6. `write-block-sum`：lane 0 把 block 部分和 `[36]` 传到全局部分量数组。
7. `finalize-grid-sum`：kernel 边界后读取部分量，最终全局输出 `S=36`。

每一帧必须同时展示当前活跃线程/槽位、运算或传输方向、具体数值和该帧结果。前后点击应能稳定复现同一状态。

### 6.2 AI 63 题

- CNN：特征网格、卷积窗口、通道/尺度变换。
- RNN：token 时间线、隐藏状态和门值。
- Transformer：Q/K/V、注意力矩阵、mask 和残差路径。
- GNN：节点消息、聚合邻域和节点表示。
- Diffusion/GAN/VAE：样本状态、噪声/潜变量、概率或损失变化。

数值示例保持小而可手算。矩阵最多展示必要子块，避免初学者被大规模数据淹没。

### 6.3 强化学习 36 题

- MDP、MC、TD、价值学习：状态图、动作边、回报和价值更新。
- 策略方法：动作概率、优势、比率、裁剪前后目标。
- 连续控制：均值/方差、动作采样和 critic 反馈。
- 多智能体/模仿学习：多条轨迹、联合状态和监督信号。
- LLM RL 与通用分布式 LLM 强化学习：prompt、rollout、reward、advantage、更新批次以及 actor/critic/reward/reference worker 间的数据流。

通用分布式部分不以某个具体框架命名；动画展示职责和通信关系，而非绑定某个实现品牌。

### 6.4 计算机基础 36 个概念

- 数据结构：单元、指针、树/图节点和遍历顺序。
- 操作系统：进程/线程、调度队列、页表、锁和 I/O 路径。
- 网络：分层封装、路由跳转、TCP 窗口和重传。
- 数据库：记录页、B+ 树路径、事务版本和执行计划。
- 编译器：token、AST、IR、数据流和寄存器分配。
- 体系结构：流水级、cache line、地址转换、分支和 SIMD lane。

## 7. 异常、降级与可访问性

- 找不到课程或场景规格时显示明确错误状态，并保留返回入口；正式注册的 156 个 ID 不允许走此分支。
- 场景帧为空、实体引用不存在、相邻帧没有变化或帧数与 `flow` 不一致时，测试直接失败。
- 长公式继续使用横向滚动容器；场景标签设置最大宽度并允许换行。
- 动画实体提供文字标签、数值和状态图标，不以颜色作为唯一含义。
- 所有流程关节保持原生按钮，可键盘聚焦，并通过 `aria-pressed` 表示当前帧。
- 场景容器提供可读的 `aria-label`；每次切换更新隐藏的 live region。
- 场景还提供屏幕阅读器可见的数据表，逐项列出当前输入、运算和输出；视觉实体不能是信息的唯一载体。
- 使用键盘 Enter/Space 激活流程关节后，焦点留在该按钮；自动播放不会抢走当前焦点。
- 移动端把图例、场景和步骤说明纵向排列；画布内部可横向滚动，但页面主体不产生横向溢出。

## 8. 性能约束

- 只渲染当前帧及动画所需的前一帧，不同时挂载全部帧。
- 每帧最多 48 个可见实体、72 条可见连接和 12 个移动传输；纯逻辑测试遍历 156 题逐帧断言这三个上限。场景容器最多 300 个 DOM 后代；Playwright 在每个代表路线的每一帧等待动画稳定后统计，超过即失败。大型矩阵展示抽样窗口而非完整张量。
- 场景 DOM 用 `data-scene-frame` 标记帧根节点：动画期间最多同时存在当前帧和前一帧，稳定后恰好一个。Playwright 在帧切换中和稳定后分别断言 `<= 2` 与 `=== 1`。
- 场景规格为静态数据或确定性纯函数，不在渲染阶段重复构建大对象。
- 不引入新的 3D 或图形依赖，继续使用 React、SVG/CSS 和现有 Framer Motion。
- 不创建一个同步导入四个领域场景的总注册表。四个现有路由包装器各自在懒加载 chunk 内只导入本领域场景；共享渲染器独立成公共 chunk。
- 生产构建开启 `build.manifest: true`。构建测试从 `.vite/manifest.json` 定位四个路由包装器的解析后入口，递归遍历 `imports` 与 `dynamicImports`，检查每个领域各自形成懒加载 chunk 且没有领域入口导入另一个领域。
- 对每个领域入口，把上述可达图中的每个项目自有 JS 文件只计一次，并用 Node `zlib.gzipSync` 对 `dist` 中实际文件求 transitive gzip 总和，必须不超过 100 KB。文件名以既有 `vendor-` 前缀开头的第三方 manual chunk 不计入预算；共享的项目自有渲染器仍计入每个领域的可达总和。

## 9. TDD 与自动验收

先添加失败的契约测试并提交 RED 检查点，再实现并提交 GREEN 检查点。

### 9.1 纯逻辑测试

新增 `guidedLessonManifest.ts` 作为权威目标清单：AI `10072-10134`、DRL `30001-30036`、概念 `40001-40036`，CUDA 明确为 `102-106, 201-203, 301-303, 401-403, 501-503, 601-602, 701-702`。测试还会从运行时 data 和专用 visualizer 注册表反向推导 guided 集合，并要求 data、manifest、blueprint、scene 和 routed visualizer 五个集合完全相等。

对全部 156 个目标 ID 验证：

- 场景存在且 ID 唯一。
- 场景种类属于受支持集合。
- `flow` 非空且 ID 非空唯一；frames 键数量相等、集合完全相等、每个 frame 的 `jointId` 与键相等；生成的 transition 顺序逐项等于 `flow` 顺序。
- 每帧均有标题、输入/输出、结构化运算、完整实体状态、结果、解释和调试断言。
- 所有实体/连线/传输引用均指向已声明实体。
- 六种布局的实体 ID 都是完整无重复排列；矩阵形状、图 position 精确键集合、轨道/泳道精确映射、有限坐标和分布范围均满足协议不变量。
- `formulaBindings[].symbol` 与 `blueprint.symbols[].symbol` 集合完全相等且实体绑定有效；课程公式和帧内 `operation.expression` 都通过 KaTeX 严格解析。
- 每个 `inputs`、`outputs`、`metrics` datum 都引用可见实体且等于该实体的权威 value；渲染器读取的视觉值也只来自 `entityStates`。
- `semanticSceneSignature(frame)` 只序列化按实体 ID 排序后的可见性/权威 value/位置、排序后的 `visibleConnectionIds`，以及按 `{from,to,payload}` 排序后的 transfers；明确排除重复的 inputs/outputs/metrics datum、transfer ID/label、`jointId`、标题、说明、颜色、状态徽标、active/highlight/complete/warning 等呈现元数据。
- 每一对相邻帧的语义签名都必须不同；变化必须来自渲染实体的权威值/可见性/位置、可见拓扑或带数据的传输端点/payload。只改变输入输出摘要、指标摘要、标题、高亮或活动索引测试仍失败。
- 每课至少包含一个数值状态和一个带预期值的调试断言；禁止把 `flow` 文案原样写入 value 伪装状态变化。
- 每个流程关节仍可直接寻址。
- 所有公式和符号继续通过 KaTeX 严格渲染。

CUDA 201 额外断言恰好七帧、七个固定关节 ID、屏障可见 value 的 `waiting -> released`、六组 shared reduction 的双输入 transfer/payload/精确和、warp 尾归约的双输入 transfer、block 部分和与最终 `36`。

### 9.2 组件与浏览器验收

新增可复现的 Playwright 入口：把 `@playwright/test` 加入 devDependencies，增加 `playwright.config.ts`、`tests/e2e/lesson-scenes.spec.ts` 和 `pnpm run test:e2e`。开发服务器由 Playwright 的 `webServer` 用 `pnpm exec vite --host 127.0.0.1 --port 5173` 启动，并在本地允许复用已有热更新进程、CI 禁止复用；截图、trace 和报告存放到 `artifacts/playwright/lesson-scenes/`。CI 在运行 E2E 前执行 `pnpm exec playwright install --with-deps chromium`。

现有测试命令依赖 Node 原生 TypeScript strip-types，CI 的 Node 20 与其不兼容；实现时把 CI 与 deploy workflow 统一升级到 Node 24，并让 CI 合并门禁顺序明确执行 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e`。本地门禁执行同一组命令。

浏览器自动化覆盖：

- `320x720`、`390x844` 和 `1440x900` 三种视口。
- 六种场景各至少一条路线；另外从场景注册表自动选出实体数、连线数和流程数最大的课程作为密集场景回归。
- `/cuda/201` 点击全部七个关节，检查帧索引、数值和场景快照均变化。
- 对六种场景各抽一课检查语义差异确实反映到带 `data-entity-value`/`data-entity-position`/`data-connection-id`/`data-transfer-payload` 的可见 DOM/SVG 属性，而不只出现在标题、说明或隐藏数据表中。
- 前进、后退、重置、自动播放、速度调整和直接跳转保持同步。
- Enter/Space 激活、焦点保留、live region 内容、实体数据表和 `aria-pressed` 均正确。
- 模拟 `prefers-reduced-motion: reduce` 时位移/缩放 transition duration 为 0，但帧值仍变化。
- 场景可见、公式可见、页面 `scrollWidth <= clientWidth`、场景外框在所有帧高度不变、无控制台错误。自动重叠检查读取同一布局层内所有 `[data-scene-entity]` 的 bounding box，要求任意两个实体框不相交；每个 `[data-scene-label]` 的 scroll 尺寸不得大于其实体容器 client 尺寸。连接线、transfer 和明确标记为 `data-overlay="true"` 的装饰层不参与实体框碰撞。

另执行全量 156 路由冒烟检查：每页有场景、至少一个实体、正确的帧总数，首帧和末帧状态签名不同。截图人工复审覆盖六种场景在桌面和 320px 移动端的共 12 张基线图。

### 9.3 完整质量门禁

- 相关测试与全量测试通过。
- TypeScript、ESLint、生产构建通过。
- 浏览器截图人工检查桌面与移动版。
- `npm audit` 结果记录；不把已有上游依赖告警误报为本次代码回归。

## 10. 多代理分工与复审

主代理先完成并提交 RED 契约，冻结场景协议、manifest、构造器接口与测试；内容代理不得修改冻结文件。精确所有权如下：

- 主代理：`lessonSceneTypes.ts`、`sceneBuilders/*`、`AnimatedLessonScene*`、两个 guided renderer、四个 guided 路由包装器、manifest、单测/E2E、`package.json`、`pnpm-lock.yaml`、`vite.config.ts`、`playwright.config.ts`、`.github/workflows/ci.yml`、`.github/workflows/deploy.yml` 与最终集成。
- AI 代理：`aiLessonBlueprints/**` 的 flow ID 迁移及 `lessonScenes/ai/**`，ID `10072-10134`。
- CUDA 代理：`cudaLessonBlueprints/**` 的 flow ID 迁移及 `lessonScenes/cuda/**`，21 个 manifest ID。
- 强化学习代理：`drlLessonBlueprints.ts` 的 flow ID 迁移及 `lessonScenes/drl/**`，ID `30001-30036`。
- 概念代理：`conceptLessonBlueprints/**` 的 flow ID 迁移及 `lessonScenes/concepts/**`，ID `40001-40036`。
- reviewer 只写 `docs/reviews/*-step-animation-review.md`，不修改实现文件。

任务板在内容代理启动前记录 owner、文件范围、ID 范围、RED 契约 commit 和合并门禁。若共享协议确需变化，内容代理先停止，主代理更新协议与测试并广播新的冻结 commit，禁止各分片自行分叉协议。

每组实现完成后，由未参与该组编写的 reviewer 检查：

- 是否能从输入看懂中间计算和输出。
- 每一关节是否真的改变视觉状态。
- 示例数值和公式是否一致。
- 是否容易通过显示的中间值调试。
- 是否存在文字代替动画、重复模板或领域语义错误。

任何阻断项修复后必须重新审查。主代理最后运行全量逻辑和浏览器门禁，并保留 TDD 证据报告。

## 11. 完成定义

只有在以下事项全部完成后，任务才算结束：

- 156 个引导式课程都有题目相关的动态场景规格。
- 所有流程关节都可来回点击并展示不同、可解释的中间状态。
- `/cuda/201` 按七帧故事板展示归约过程，而不是文字流程卡片。
- 公式全部可渲染，既有专用可视化不回归。
- 全量契约测试、类型检查、lint、构建和浏览器验收通过。
- 四个内容分片都完成独立可读性、可学习性、可调试性复审。
- 热更新开发服务器保持可访问，并向用户提供实际 URL。
