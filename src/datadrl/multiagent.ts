import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const multiAgentProblems: DRLProblem[] = [
  {
    id: 30021,
    slug: "marl-basics-and-challenges",
    title: "多智能体强化学习：基础与挑战",
    category: DRLCategory.MULTI_AGENT,
    difficulty: Difficulty.MEDIUM,
    description:
      "多智能体强化学习（MARL）研究多个智能体在共享环境中协同或竞争学习。与单智能体 RL 相比，MARL 面临非平稳性（其他智能体策略变化导致环境不稳定）、维度爆炸（联合动作空间指数增长）和信度分配（Credit Assignment）等独特挑战。",
    learningGoals: [
      "理解 MARL 的基本设置：多个智能体、共享/分离环境、联合奖励/独立奖励",
      "掌握非平稳性（Non-stationarity）问题的来源",
      "了解合作、竞争与混合场景的典型示例",
      "理解信度分配问题（Credit Assignment）：如何判断每个智能体对团队奖励的贡献",
    ],
    inputs: [
      "N：智能体数量",
      "观测 o_i：每个智能体的局部观测",
      "联合动作 A = (a_1, ..., a_N)：所有智能体的动作组合",
      "奖励机制：全局共享奖励 or 个体奖励",
    ],
    outputs: [
      "各智能体策略 π_i(a_i | o_i)（分散执行）",
      "联合奖励或个体奖励信号",
    ],
    tags: ["MARL", "多智能体", "非平稳性", "信度分配", "合作", "竞争"],
    examples: [
      {
        input: "StarCraft II 微操（SMAC）：8 只陆战队 vs 8 只小狗，全局奖励=胜利+1/失败-1",
        output: "8 个 Agent 需协同走位、集火、互相保护，最终以 87% 胜率战胜内置 AI",
        explanation: "全局共享奖励下信度分配困难（谁的走位更关键？），QMIX 等算法通过 VDN/混合网络解决此问题。",
      },
    ],
    heroNote: "MARL 的终极挑战：如何在不交换私有信息的前提下，让多个智能体涌现出复杂的协作行为。",
  },
  {
    id: 30022,
    slug: "centralized-vs-decentralized",
    title: "集中式训练与去中心化执行（CTDE）",
    category: DRLCategory.MULTI_AGENT,
    difficulty: Difficulty.MEDIUM,
    description:
      "集中式训练-去中心化执行（Centralized Training with Decentralized Execution, CTDE）是 MARL 的主流框架：训练时中心化 Critic 可以访问全局状态和其他智能体信息以稳定训练；执行时每个智能体只依赖自身局部观测独立行动，满足现实部署中通信受限的要求。MADDPG 和 QMIX 是两类代表算法。",
    learningGoals: [
      "理解完全集中式（Central）、完全去中心化（Independent）与 CTDE 三种架构的权衡",
      "掌握 MADDPG：每个 Agent 有独立 Actor，共享一个能看全局的 Critic",
      "了解 QMIX 的混合网络（Mixing Network）如何分解联合 Q 值",
      "理解 CTDE 如何在训练效果与执行可扩展性之间取得平衡",
    ],
    inputs: [
      "训练时：全局状态 s 或所有智能体观测 (o_1,...,o_N) + 联合动作 (a_1,...,a_N)",
      "执行时：仅局部观测 o_i",
    ],
    outputs: [
      "MADDPG：集中 Critic Q_i(s, a_1,...,a_N)，分散 Actor μ_i(o_i)",
      "QMIX：Q_tot(s, a_1,...,a_N) = f_mix(Q_1(o_1,a_1), ..., Q_N(o_N,a_N))（单调混合）",
    ],
    tags: ["CTDE", "MADDPG", "QMIX", "集中训练", "分散执行", "混合网络"],
    examples: [
      {
        input: "2 个机器人搬运任务，训练时中心 Critic 看双方位置，执行时各机器人只看自身传感器",
        output: "MADDPG 让两机器人无需通信自发协作：一个托底，一个推货，完成联合搬运",
        explanation: "训练时中心 Critic 消除了非平稳性（知道另一方在做什么），执行时分散行动保持可扩展性。",
      },
    ],
    heroNote: "CTDE 是目前合作型 MARL 的主流范式，用于自动驾驶编队、无人机集群等现实场景。",
  },
];
