import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const advancedPolicyProblems: DRLProblem[] = [
  {
    id: 30016,
    slug: "trpo",
    title: "信任域策略优化（TRPO）",
    category: DRLCategory.ADVANCED_POLICY,
    difficulty: Difficulty.HARD,
    description:
      "普通策略梯度方法步长难以控制：步长过大会破坏策略，步长过小收敛缓慢。TRPO 通过在 KL 散度约束下最大化代理目标函数，保证每次更新不偏离旧策略太远，从而实现单调性策略改进（Monotonic Policy Improvement）。",
    learningGoals: [
      "理解策略更新步长过大的危害",
      "掌握 TRPO 的目标函数：最大化代理优势 L(θ)，约束 KL(π_old, π_new) ≤ δ",
      "了解共轭梯度法与线搜索在 TRPO 中的应用",
      "理解单调性策略改进定理的直观含义",
    ],
    inputs: [
      "π_θ_old(a|s)：旧策略",
      "δ：KL 散度约束上限（信任域半径，如 δ=0.01）",
      "优势估计 Â(s,a)：使用 GAE 计算",
    ],
    outputs: [
      "新策略参数 θ_new：满足 KL 约束的最优更新方向",
      "代理目标 L(θ) = E[π_θ(a|s)/π_θ_old(a|s) · Â(s,a)]",
    ],
    tags: ["TRPO", "信任域", "KL散度约束", "单调改进", "共轭梯度"],
    examples: [
      {
        input: "KL 约束 δ=0.01，旧策略 π_old 在某状态选 a=右 的概率 0.3",
        output: "新策略最多将该概率调整到约 0.33（Δ受 KL ≤ 0.01 限制），避免策略剧烈变化",
        explanation: "TRPO 在信任域内安全更新，找到约束最优点后用线搜索确保满足 KL 约束。",
      },
    ],
    heroNote: "TRPO 理论严格但实现复杂（需要二阶优化）；PPO 是其简化版，用 clip 机制近似约束，工程实用性更强。",
  },
  {
    id: 30017,
    slug: "partial-observation-rnn",
    title: "部分观测与 RNN",
    category: DRLCategory.ADVANCED_POLICY,
    difficulty: Difficulty.HARD,
    description:
      "现实世界的强化学习任务往往是部分可观测马尔可夫决策过程（POMDP）：智能体每步只能观测到部分环境状态（如第一人称视角、噪声传感器）。RNN（LSTM/GRU）通过维护隐藏状态来整合历史观测，近似还原完整状态，从而在 POMDP 中有效决策。",
    learningGoals: [
      "理解完全可观测（MDP）与部分可观测（POMDP）的区别",
      "掌握 LSTM/GRU 在 RL 中作为记忆单元的角色",
      "了解 DRQN（Deep Recurrent Q-Network）的训练方式",
      "理解序列采样与随机采样在 Replay Buffer 中的差异",
    ],
    inputs: [
      "观测 o_t：不完整的环境状态信息",
      "RNN 隐藏状态 h_t：记录历史信息",
      "历史观测序列 (o_0, o_1, ..., o_t)：RNN 的输入",
    ],
    outputs: [
      "隐藏状态 h_{t+1} = RNN(o_t, h_t)：更新后的记忆状态",
      "Q(h_t, a) 或 π(a|h_t)：基于记忆的决策输出",
    ],
    tags: ["POMDP", "LSTM", "GRU", "DRQN", "部分观测", "记忆"],
    examples: [
      {
        input: "Atari MsPacman 游戏，每次仅输入单帧图像（无速度信息）",
        output: "DRQN 用 LSTM 整合最近 4-8 帧历史，推断鬼怪移动方向，做出安全逃跑决策",
        explanation: "单帧图像无法判断运动速度，LSTM 通过时序记忆弥补观测不完整性。",
      },
    ],
    heroNote: "训练 DRQN 时，从 Replay Buffer 采样完整序列而非随机步骤，以保证 RNN 隐藏状态的有效传递。",
  },
];
