export type DRLCurriculumKind = "course" | "extension";

export interface DRLCurriculumChapter {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  summary: string;
  prerequisite: string;
  kind: DRLCurriculumKind;
  problemIds: number[];
}

export const DRL_SOURCE_URL = "https://github.com/wangshusen/DRL";

export const DRL_CURRICULUM: DRLCurriculumChapter[] = [
  {
    id: "foundations",
    order: 1,
    title: "强化学习基础与 MDP",
    shortTitle: "基础与 MDP",
    summary: "从智能体与环境的交互出发，建立状态、动作、奖励和回报的统一语言。",
    prerequisite: "无需先修",
    kind: "course",
    problemIds: [30001],
  },
  {
    id: "value-foundations",
    order: 2,
    title: "价值学习基础",
    shortTitle: "价值学习",
    summary: "理解状态价值、动作价值和贝尔曼递推如何评价长期收益。",
    prerequisite: "强化学习基础与 MDP",
    kind: "course",
    problemIds: [30002],
  },
  {
    id: "policy-foundations",
    order: 3,
    title: "策略学习基础",
    shortTitle: "策略学习",
    summary: "直接参数化策略，并用期望回报解释策略优化的方向。",
    prerequisite: "强化学习基础与 MDP",
    kind: "course",
    problemIds: [30003],
  },
  {
    id: "actor-critic",
    order: 4,
    title: "Actor-Critic 方法",
    shortTitle: "Actor-Critic",
    summary: "让 Actor 负责行动、Critic 负责评价，连接价值学习与策略学习。",
    prerequisite: "价值学习、策略学习",
    kind: "course",
    problemIds: [30004],
  },
  {
    id: "monte-carlo",
    order: 5,
    title: "蒙特卡洛方法与 AlphaGo",
    shortTitle: "蒙特卡洛",
    summary: "从随机采样估计期望，进一步理解蒙特卡洛树搜索中的选择与回传。",
    prerequisite: "价值学习基础",
    kind: "course",
    problemIds: [30029, 30005],
  },
  {
    id: "td-learning",
    order: 6,
    title: "时序差分学习",
    shortTitle: "TD 学习",
    summary: "比较 Sarsa、Q-Learning 与多步 TD，掌握自举更新和策略差异。",
    prerequisite: "蒙特卡洛方法、价值学习",
    kind: "course",
    problemIds: [30006, 30007, 30008],
  },
  {
    id: "deep-value-learning",
    order: 7,
    title: "深度价值学习",
    shortTitle: "DQN 进阶",
    summary: "用经验回放、目标网络、Double DQN 和 Dueling 架构稳定深度价值学习。",
    prerequisite: "时序差分学习",
    kind: "course",
    problemIds: [30009, 30010, 30011],
  },
  {
    id: "policy-gradient",
    order: 8,
    title: "带基线的策略梯度",
    shortTitle: "策略梯度进阶",
    summary: "从高方差的 REINFORCE 走向 Baseline、Advantage 与 A2C。",
    prerequisite: "策略学习、Actor-Critic",
    kind: "course",
    problemIds: [30012, 30013, 30014, 30015],
  },
  {
    id: "advanced-policy",
    order: 9,
    title: "信赖域与部分观测",
    shortTitle: "TRPO 与 POMDP",
    summary: "约束策略更新幅度，并在不可完全观测时用记忆恢复状态信息。",
    prerequisite: "策略梯度进阶",
    kind: "course",
    problemIds: [30016, 30017],
  },
  {
    id: "continuous-control",
    order: 10,
    title: "连续动作控制",
    shortTitle: "连续控制",
    summary: "从离散选择过渡到连续动作，比较确定性和随机策略梯度。",
    prerequisite: "Actor-Critic、策略梯度",
    kind: "course",
    problemIds: [30018, 30019, 30020],
  },
  {
    id: "multi-agent",
    order: 11,
    title: "多智能体强化学习",
    shortTitle: "多智能体",
    summary: "理解非平稳性、信用分配，以及集中训练与分散执行。",
    prerequisite: "价值学习、策略梯度",
    kind: "course",
    problemIds: [30021, 30022],
  },
  {
    id: "imitation-learning",
    order: 12,
    title: "模仿学习",
    shortTitle: "模仿学习",
    summary: "从专家演示反推奖励，并通过对抗训练学习行为分布。",
    prerequisite: "策略学习、生成模型基础",
    kind: "course",
    problemIds: [30023, 30024],
  },
  {
    id: "llm-alignment",
    order: 13,
    title: "LLM 强化学习与对齐",
    shortTitle: "LLM RL 对齐",
    summary: "理解 PPO、GRPO、RLOO 与 DAPO 如何把奖励信号转化为语言模型更新。",
    prerequisite: "策略梯度、Actor-Critic",
    kind: "extension",
    problemIds: [30025, 30026, 30027, 30028],
  },
  {
    id: "distributed-llm-rl",
    order: 14,
    title: "LLM 分布式强化学习系统",
    shortTitle: "分布式 LLM RL",
    summary: "从算法走向系统，理解控制器、Worker、Rollout、奖励服务和参数重分片。",
    prerequisite: "LLM 强化学习与对齐",
    kind: "extension",
    problemIds: [30030, 30031, 30032, 30033, 30034, 30035, 30036],
  },
];

const chapterByProblemId = new Map(
  DRL_CURRICULUM.flatMap((chapter) =>
    chapter.problemIds.map((problemId) => [problemId, chapter] as const),
  ),
);

export function getDrlChapterByProblemId(
  problemId: number,
): DRLCurriculumChapter | undefined {
  return chapterByProblemId.get(problemId);
}

