# Concepts Systems 教学质量审查

审查范围：`databases.ts`、`compiler.ts`、`computerArchitecture.ts`，ID 40019-40036。`易读`检查标题与原始主题一致性，`易学`检查直觉是否适合初学者；原始主题以课程设计清单及 `src/dataconcepts/books.ts` 的书籍定位为准（基线 `src/dataconcepts/index.ts` 无旧题目记录）。

| ID | 易读 | 易学 | 易调试 | 公式 | 步骤 | 结论 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 40019 | PASS | PASS | PASS | PASS | PASS | 通过 | 关系、元组、键和关系运算一致；公式可作关系实例的简写。 |
| 40020 | PASS | PASS | PASS | FAIL | PASS | 阻断 | `h=ceil(log_f N)` 把平均扇出与键数直接写成精确树高，忽略叶容量、占用率及根/层高口径。 |
| 40021 | PASS | PASS | PASS | PASS | PASS | 通过 | 转账守恒式正确展示一致性；流程与日志/提交/回滚连续。 |
| 40022 | PASS | PASS | PASS | PASS | PASS | 通过 | 时间区间可见性是可理解的简化 MVCC 模型；版本链和诊断量明确。 |
| 40023 | PASS | PASS | PASS | PASS | PASS | 通过 | 候选计划成本最小化与主题一致；估计/实际基数可直接定位偏差。 |
| 40024 | PASS | PASS | PASS | PASS | PASS | 通过 | 复制与分片区分清楚；路由、日志、确认、切换形成可观察链路。 |
| 40025 | PASS | PASS | PASS | PASS | PASS | 通过 | 自动机转移、最长匹配和字符级 trace 一致。 |
| 40026 | PASS | PASS | PASS | PASS | PASS | 通过 | 文法推导式正确，Token 到 AST 的主线连续。 |
| 40027 | PASS | PASS | PASS | PASS | PASS | 通过 | 加法类型规则正确；符号表、绑定、推导和约束检查衔接自然。 |
| 40028 | PASS | PASS | PASS | PASS | PASS | 通过 | 单定义与 phi 合流语义正确；CFG、支配边界、插 phi、重命名顺序合理。 |
| 40029 | PASS | PASS | PASS | FAIL | PASS | 阻断 | 公式是前向 may/GEN-KILL（典型为到达定义），不能作为通用“事实”方程支撑常量传播和死代码删除；后两者的 meet、方向均可能不同。 |
| 40030 | PASS | PASS | PASS | FAIL | PASS | 阻断 | `rho: V -> {r_i}` 声称所有虚拟寄存器均映射到物理寄存器，与同课“无法着色则溢出到栈”矛盾。 |
| 40031 | PASS | PASS | PASS | PASS | PASS | 通过 | 示例固定格式的位宽守恒正确；编码与反汇编校验闭环明确。 |
| 40032 | PASS | PASS | PASS | PASS | PASS | 通过 | 理想周期数与加速比假设已说明；五级处理链可观察。 |
| 40033 | PASS | PASS | PASS | PASS | PASS | 通过 | 两级 AMAT 在局部未命中率口径下正确；地址拆分与逐级命中可核验。 |
| 40034 | PASS | PASS | PASS | PASS | PASS | 通过 | 页号映射且偏移不变的公式正确；TLB、页表、权限到物理地址衔接清楚。 |
| 40035 | PASS | PASS | PASS | PASS | FAIL | 阻断 | 流程写成“猜错时冲刷并更新计数器”，会误导为预测正确时不更新；计数器应在每次分支解析后更新，仅误预测才冲刷。 |
| 40036 | PASS | PASS | PASS | PASS | PASS | 通过 | Amdahl 定律及假设明确；标量基线、通道掩码、分核耗时均可检查。 |

## 入门路径

- 数据库：关系模型 -> 索引 -> 事务 -> 并发可见性 -> 查询优化 -> 分布式扩展，主线合理。
- 编译原理：字符 -> Token -> AST -> 语义 -> IR/SSA -> 优化 -> 机器代码，三组内容中最连贯。
- 计算机组成：指令 -> 流水线 -> 存储/地址 -> 分支预测 -> 并行，覆盖合理；分支预测紧邻流水线会更顺畅。

## BLOCKERS

- 40020：把 B+ 树树高精确式改为带明确容量/占用假设的界，或改写为 `h=O(log_f N)`；同步澄清页读取数的口径。
- 40029：指定一种分析并使用对应方程；若讲常量传播，应使用常量格的 meet，若讲死代码删除，应另示后向活跃分析。
- 40030：将映射限定为未溢出集合（如 `rho: V\\S -> {r_i}`）并显式定义溢出集合 `S`。
- 40035：拆成“解析真实结果 -> 每次更新计数器 -> 仅误预测时冲刷并重定向”。

## NON_BLOCKING

- 40019：建议用 `r(R) subseteq D_1 x ... x D_n` 区分关系模式与关系实例，避免记号复用。
- 40021、40022：分别注明公式只刻画 ACID 的一致性示例、简化时间戳 MVCC 可见性，不代表全部性质/隔离级别。
- 40026：选定 LL 或 LR 示例，避免“展开或归约”把两类解析策略混在同一条 trace 中。
- 40030：发生实际 spill 后补充“重写并重新分配”的回环。
- 40032：在五级阶段之外加入第二条指令或一次 stall/forward，直接展示重叠执行。
- 40034：在有效位检查后补出“无效 -> 缺页处理、有效 -> 拼接地址”的分支。
- 路径：数据库在查询优化前补一句连接/基数桥接；计算机组成可将 40035 调整到 40032 之后。

## 结论

未通过：18 个 ID 全部覆盖，14 个通过，4 个存在阻断项。三条主题序列总体可作为入门路径，但应先修复 40020、40029、40030、40035。

---

## 第二轮复核（最终代码，2026-08-28）

### 复核口径与数据链路

- 逐项重读 `databases.ts`、`compiler.ts`、`computerArchitecture.ts`，并核对共享步骤生成、详情页公式渲染、书架列表和上一节/下一节导航。
- `PASS` 表示知识与教学链路可直接发布；`WARN` 仅表示符号说明仍可更完整，不构成知识错误或课程阻断。
- `src/dataconcepts/index.ts` 由蓝图直接生成列表元数据与 flow 示例；课程正文和 data 不存在双源漂移。

### 逐 ID 第二轮结论

| ID | 知识正确性 | 公式/符号 | 初学者直觉 | 步骤可执行 | 调试建议 | 顺序/data | 二轮结论与证据 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 40019 | PASS | PASS | PASS | PASS | PASS | PASS | 已用 `R(...)`/`r(R)` 区分模式与实例；值域、键、选择和投影一致。 |
| 40020 | PASS | PASS | PASS | PASS | PASS | PASS | 已用页容量、最低占用率和根例外给出树高上下界，并把冷缓存点查明确为根到叶 `h+1` 个索引页。 |
| 40021 | PASS | PASS | PASS | PASS | PASS | PASS | 转账守恒式只作为一致性示例，原子性、隔离性、持久性由流程和故障注入分别核验。 |
| 40022 | PASS | PASS | PASS | PASS | PASS | PASS | 简化时间戳可见性公式成立，且已声明不代表所有 MVCC 与隔离级别实现。 |
| 40023 | PASS | PASS | PASS | PASS | PASS | PASS | 候选物理计划成本最小化正确；估计/实际基数对比给出可执行诊断入口。 |
| 40024 | PASS | PASS | PASS | PASS | PASS | PASS | 复制与分片职责分明；路由、日志、确认和故障切换均有可观察状态。 |
| 40025 | PASS | PASS | PASS | PASS | PASS | PASS | 自动机转移、最近接受状态和最长匹配一致，字符级 trace 可定位边界错误。 |
| 40026 | PASS | PASS | PASS | PASS | PASS | PASS | 已固定为 LL(1) 文法和输入 `id+id*id`，产生式选择到 AST 的每一步可复现。 |
| 40027 | PASS | PASS | PASS | PASS | PASS | PASS | 加法类型规则正确，名称绑定、类型推导与错误约束形成闭环。 |
| 40028 | PASS | PASS | PASS | PASS | PASS | PASS | SSA 单定义与 phi 合流语义正确；支配、插 phi、重命名顺序合理。 |
| 40029 | PASS | WARN | PASS | PASS | PASS | PASS | 已收敛为前向常量传播：常量格、meet、传递函数和不动点一致；严格符号表仍可补 `IN/OUT`、`v`、`P`、`e`。 |
| 40030 | PASS | WARN | PASS | PASS | PASS | PASS | 映射域已限定为 `V\\S`，spill 后重写并重新分配的回环完整；可再单列 `u/v/K` 的符号含义。 |
| 40031 | PASS | PASS | PASS | PASS | PASS | PASS | 示例固定格式的位宽守恒正确，字段检查与反汇编验证可执行。 |
| 40032 | PASS | PASS | PASS | PASS | PASS | PASS | 两条指令的 load-use 示例确实产生一个气泡，`n=2,k=5,b=1` 得 7 周期。 |
| 40033 | PASS | PASS | PASS | PASS | PASS | PASS | 两级 AMAT 明确使用局部 L2 未命中率，逐级命中和计数器可核验。 |
| 40034 | PASS | PASS | PASS | PASS | PASS | PASS | TLB 命中、页表有效、缺页和保护异常分支齐全，只有有效且获准才拼接地址。 |
| 40035 | PASS | PASS | PASS | PASS | PASS | PASS | 已拆成解析真实结果、每次饱和更新、仅误预测时冲刷与重定向；公式、误区和 debug trace 一致。 |
| 40036 | PASS | PASS | PASS | PASS | PASS | PASS | Amdahl 定律假设明确，标量基线、通道掩码、分核耗时及同步开销均可检查。 |

### 原 FAIL 闭环

| ID | 首轮问题 | 最终代码证据 | 二轮状态 |
|---:|---|---|:---:|
| 40020 | 把平均扇出与键数写成精确树高 | 引入 `F/L`、最低占用、根页例外、树高界及 `R_cold=h+1` 的页读取口径 | PASS |
| 40029 | 通用 GEN/KILL 方程混用常量传播与死代码删除 | 标题和内容限定为常量传播，给出常量格、meet、前向 IN/OUT、传递函数和不动点；明确 DCE 需另证 | PASS |
| 40030 | `rho:V->{r_i}` 与 spill 矛盾 | 改为 `rho:V\\S->{r_1,...,r_K}`，定义 `S`，并补上插入 load/store 后重建活跃性与重新分配 | PASS |
| 40035 | 误导为只有猜错才更新计数器 | keyPoints、flow、误区和小结均明确每个已解析分支都更新，只有误预测才冲刷 | PASS |

### 课程顺序与元数据

- 数据库：40019 -> 40020 -> 40021 -> 40022 -> 40023 -> 40024，按模型、索引、事务、并发、优化、分布式扩展推进。
- 编译原理：40025 -> 40026 -> 40027 -> 40028 -> 40029 -> 40030，按字符到 Token、AST、语义、IR、优化、后端推进。
- 计算机组成的实际 data/导航顺序为 40031 -> 40032 -> 40035 -> 40033 -> 40034 -> 40036。40035 虽不按数值排序，但紧接流水线讲控制冒险，教学依赖优于机械 ID 排序；列表页和详情页均消费这一相同顺序。
- 三本书均为 6 题；40019-40036 ID 完整且 slug 唯一，`bookId`、category、difficulty、标题与课程规范一致。

### 验证记录

- 概念契约与 KaTeX 专项：`node --experimental-strip-types --test tests/fullCourseBlueprints.test.ts tests/katexSources.test.ts`，6/6 通过。
- 概念蓝图严格 KaTeX：36 个公式及全部符号共 191 次 `throwOnError` 渲染，全部通过。
- `npx tsc --noEmit`：通过；`npm run lint`：通过。
- 全量 `npm test`：18/18 通过。

**BLOCKERS: 无**

### 第二轮非阻断建议

1. 40029 在符号表补充 `IN/OUT`、变量 `v`、前驱块 `P` 和表达式 `e`，降低初学者阅读长公式的负担。
2. 40030 在符号表单列干涉边端点 `u/v` 与物理寄存器数 `K`；公式本身和 spill 语义已经正确。
