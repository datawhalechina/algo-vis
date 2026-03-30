import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const continuousActionProblems: DRLProblem[] = [
  {
    id: 30018,
    slug: "discrete-vs-continuous-control",
    title: "离散与连续控制",
    category: DRLCategory.CONTINUOUS_ACTION,
    difficulty: Difficulty.EASY,
    description:
      "离散动作空间（如 Atari 的按键、围棋落子）可用 Q-Learning/DQN 对所有动作打分后取最大值。连续动作空间（如机器人关节角、油门大小）中动作维度无限，无法枚举，需要专门的算法（如 DPG、PPO+Gaussian、SAC）直接输出动作值。",
    learningGoals: [
      "理解离散动作空间与连续动作空间的本质区别",
      "了解 DQN 等离散算法无法直接应用于连续空间的原因",
      "掌握高斯策略如何在连续动作空间中表示随机策略",
      "了解连续控制的主要基准环境（MuJoCo HalfCheetah、Pendulum 等）",
    ],
    inputs: [
      "动作空间类型：Discrete(n) 或 Box(low, high, shape)（连续）",
      "状态 s：环境观测",
    ],
    outputs: [
      "离散：Q(s, a_i) for i in 1..n，选 argmax",
      "连续：μ(s)（均值）+ σ(s)（标准差），从高斯分布采样",
    ],
    tags: ["离散动作", "连续动作", "高斯策略", "MuJoCo", "动作空间"],
    examples: [
      {
        input: "Pendulum-v1：连续扭矩动作 a ∈ [-2, 2]，状态 (cos θ, sin θ, θ̇)",
        output: "策略输出 μ = -1.3，σ = 0.2，采样动作 a = -1.15（施加反向扭矩平衡摆杆）",
        explanation: "连续空间中直接输出动作值（或分布参数），而非对所有动作打分。",
      },
    ],
    heroNote: "MuJoCo（现已免费）是连续控制 RL 的标准基准，PPO、SAC、TD3 等算法均在此评测。",
  },
  {
    id: 30019,
    slug: "deterministic-policy-gradient",
    title: "确定性策略梯度（DPG）",
    category: DRLCategory.CONTINUOUS_ACTION,
    difficulty: Difficulty.HARD,
    description:
      "确定性策略梯度（DPG）由 Silver 等人提出，直接让策略网络输出确定性动作 a = μ_θ(s)，通过链式法则计算 Q 对策略参数的梯度。DDPG（Deep DPG）将 DPG 与 DQN 技术（经验回放、目标网络）结合，实现高维连续控制。",
    learningGoals: [
      "理解确定性策略梯度定理 ∇_θ J ≈ E[∇_a Q(s,a)|_{a=μ(s)} · ∇_θ μ_θ(s)]",
      "掌握 DDPG 的四网络结构：在线/目标各一个 Actor 和 Critic",
      "了解 DDPG 中 OU 噪声与高斯噪声用于探索的作用",
      "理解软目标网络更新对训练稳定性的贡献",
    ],
    inputs: [
      "μ_θ(s)：确定性策略网络（Actor），输出连续动作",
      "Q_w(s,a)：Critic 网络，评估 (s,a) 对的价值",
      "exploration noise ε：Ornstein-Uhlenbeck 或高斯噪声",
    ],
    outputs: [
      "Actor loss = -E[Q(s, μ_θ(s))]（最大化 Q 值）",
      "Critic loss = MSE(r + γ Q_target(s', μ_target(s')), Q(s,a))",
      "探索动作 a = μ_θ(s) + ε",
    ],
    tags: ["DPG", "DDPG", "确定性策略", "连续控制", "目标网络", "四网络结构"],
    examples: [
      {
        input: "HalfCheetah-v4，Actor 输出关节扭矩 μ(s) = [0.3, -0.1, 0.5, ...]（6 维）",
        output: "Critic 评估 Q(s, μ(s)) = 200，Actor 沿 ∇_a Q 方向调整输出以增大 Q 值",
        explanation: "Actor 通过 Critic 的反馈知道「往哪个方向调整动作能获得更高回报」，无需枚举动作空间。",
      },
    ],
    heroNote: "TD3（Twin Delayed DDPG）是 DDPG 的改进版，引入双 Critic 和延迟 Actor 更新，进一步缓解过估计。",
  },
  {
    id: 30020,
    slug: "stochastic-policy-gradient-continuous",
    title: "随机策略梯度（连续动作）",
    category: DRLCategory.CONTINUOUS_ACTION,
    difficulty: Difficulty.HARD,
    description:
      "在连续动作空间中，随机策略用参数化的概率分布（如高斯分布）表示；策略梯度通过重参数化技巧（reparameterization trick）或 REINFORCE 估计梯度。SAC（Soft Actor-Critic）是其代表算法，通过最大熵框架同时优化回报和策略熵，实现优秀的样本效率与鲁棒性。",
    learningGoals: [
      "理解连续动作空间中高斯策略的参数化形式",
      "掌握重参数化技巧（a = μ + σ·ε，ε~N(0,1)）使梯度可反传",
      "了解最大熵强化学习（Maximum Entropy RL）的目标函数",
      "理解 SAC 的温度参数 α 如何平衡回报与探索熵",
    ],
    inputs: [
      "μ_θ(s)：策略均值网络",
      "σ_θ(s)：策略标准差网络",
      "温度参数 α：回报与熵之间的权衡系数",
    ],
    outputs: [
      "采样动作 a = tanh(μ + σ·ε)（SAC 用 tanh 压缩到有界范围）",
      "SAC 目标：最大化 E[r + α·H(π(·|s))]（回报 + 熵奖励）",
    ],
    tags: ["SAC", "最大熵RL", "重参数化", "高斯策略", "连续控制", "样本效率"],
    examples: [
      {
        input: "Ant-v4，α=0.2，某状态下 μ=[0.1,...], σ=[0.3,...]（8维），ε~N(0,I)",
        output: "采样动作 a = tanh(μ + σ·ε)，熵奖励 -α·log π(a|s) 加入 TD 目标",
        explanation: "高熵策略在早期鼓励广泛探索，α 自适应调整后策略逐步收敛到高回报区域。",
      },
    ],
    heroNote: "SAC 是目前连续控制任务的最强基线之一，自动调节温度 α 消除了手动调参的负担。",
  },
];
