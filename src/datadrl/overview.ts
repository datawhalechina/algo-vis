import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const overviewProblems: DRLProblem[] = [
  {
    id: 30001,
    slug: "reinforcement-learning-basics",
    title: "强化学习基础",
    category: DRLCategory.OVERVIEW,
    difficulty: Difficulty.EASY,
    description:
      "强化学习是机器学习的一种范式，智能体通过与环境的交互来学习最优策略。智能体在每个时间步选择动作，环境返回奖励信号和新状态，目标是最大化累积奖励（回报）。",
    learningGoals: [
      "理解强化学习的基本框架：智能体、环境、状态、动作、奖励",
      "掌握马尔可夫决策过程（MDP）的核心概念",
      "理解回报（Return）与折扣因子（Discount Factor）的含义",
      "了解策略（Policy）与价值函数（Value Function）的关系",
    ],
    inputs: [
      "state (s)：当前环境状态",
      "action (a)：智能体执行的动作",
      "reward (r)：环境反馈的奖励",
      "discount_factor (γ)：折扣因子，控制对未来奖励的重视程度",
    ],
    outputs: [
      "policy π(a|s)：在状态 s 下选择动作 a 的概率分布",
      "return G_t：从时间步 t 起的折扣累积奖励",
      "value V(s)：状态价值函数",
    ],
    tags: ["MDP", "策略", "价值函数", "奖励", "基础"],
    examples: [
      {
        input: "状态: 迷宫格 (2,3)，动作: 向右移动，γ = 0.9",
        output: "新状态 (2,4)，奖励 r = -1（每步惩罚），继续学习最优路径",
        explanation: "智能体通过不断试错，逐渐学会从任意位置出发找到迷宫出口的最短路径策略。",
      },
    ],
    heroNote: "强化学习的核心思想：通过试错与反馈循环不断改进策略，而非依赖标注数据。",
  },
  {
    id: 30002,
    slug: "value-based-learning",
    title: "基于价值的学习",
    category: DRLCategory.OVERVIEW,
    difficulty: Difficulty.EASY,
    description:
      "基于价值的方法通过估计状态价值函数 V(s) 或动作价值函数 Q(s,a) 来间接推导最优策略。贝尔曼方程是这类方法的理论基础，将当前价值与未来价值联系起来。",
    learningGoals: [
      "理解状态价值函数 V(s) 与动作价值函数 Q(s,a) 的区别",
      "掌握贝尔曼方程（Bellman Equation）及其递推关系",
      "理解最优策略与最优价值函数的关系",
      "了解价值迭代（Value Iteration）算法流程",
    ],
    inputs: [
      "Q(s,a)：在状态 s 执行动作 a 后的期望累积奖励",
      "V(s)：状态 s 的期望累积奖励",
      "transition P(s'|s,a)：状态转移概率",
    ],
    outputs: [
      "optimal Q*(s,a)：最优动作价值函数",
      "optimal policy π*(s)：贪婪选取最大 Q 值对应的动作",
    ],
    tags: ["Q函数", "价值函数", "贝尔曼方程", "价值迭代"],
    examples: [
      {
        input: "状态空间 S = {s1, s2, s3}，动作空间 A = {左, 右}，γ = 0.9",
        output: "Q*(s1, 右) = 10, Q*(s1, 左) = 5 → 最优策略在 s1 选择向右",
        explanation: "通过反复应用贝尔曼最优方程，Q 值收敛到最优解，从而导出贪婪策略。",
      },
    ],
    heroNote: "Q*(s,a) 一旦求得，最优策略只需贪婪地选择 argmax_a Q*(s,a) 即可，无需显式存储策略。",
  },
  {
    id: 30003,
    slug: "policy-based-learning",
    title: "基于策略的学习",
    category: DRLCategory.OVERVIEW,
    difficulty: Difficulty.MEDIUM,
    description:
      "基于策略的方法直接对策略参数化并优化，用梯度上升最大化期望回报。策略梯度定理给出了目标函数对策略参数的梯度表达式，使得在连续动作空间中的优化成为可能。",
    learningGoals: [
      "理解参数化策略 π_θ(a|s) 的含义",
      "掌握策略梯度定理（Policy Gradient Theorem）",
      "理解 REINFORCE 算法的蒙特卡洛采样思路",
      "了解基于价值方法与基于策略方法的优缺点对比",
    ],
    inputs: [
      "π_θ(a|s)：参数为 θ 的随机策略",
      "trajectory τ：完整轨迹 (s0,a0,r0, s1,a1,r1, ...)",
      "return G_t：从 t 时刻起的累积回报",
    ],
    outputs: [
      "∇_θ J(θ)：策略参数的梯度方向",
      "updated θ：梯度上升后更新的策略参数",
    ],
    tags: ["策略梯度", "REINFORCE", "参数化策略", "梯度上升"],
    examples: [
      {
        input: "CartPole 环境，θ 初始化为随机，α = 0.01",
        output: "经过 500 轮训练后平均回报从 15 提升到 195（满分 200）",
        explanation: "REINFORCE 算法通过采样完整轨迹并以回报对数梯度更新策略参数，逐步找到平衡杆的策略。",
      },
    ],
    heroNote: "基于策略的方法天然支持随机策略和连续动作空间，但方差较大，需要方差减小技术。",
  },
  {
    id: 30004,
    slug: "actor-critic-methods",
    title: "Actor-Critic 方法",
    category: DRLCategory.OVERVIEW,
    difficulty: Difficulty.MEDIUM,
    description:
      "Actor-Critic 结合了基于策略（Actor）和基于价值（Critic）的优点：Actor 负责选择动作，Critic 估计价值函数并生成 TD 误差来指导 Actor 更新，从而降低策略梯度的方差。",
    learningGoals: [
      "理解 Actor 与 Critic 各自的职责与更新方式",
      "掌握 TD 误差（Temporal Difference Error）作为优势估计的原理",
      "了解在线（on-policy）Actor-Critic 的完整训练流程",
      "理解 Actor-Critic 相对于纯 REINFORCE 的方差减少效果",
    ],
    inputs: [
      "π_θ(a|s)：Actor 策略网络参数 θ",
      "V_w(s)：Critic 价值网络参数 w",
      "TD target = r + γ V_w(s')：时序差分目标",
    ],
    outputs: [
      "δ = TD target - V_w(s)：TD 误差，即优势近似",
      "更新后的 θ（Actor）和 w（Critic）",
    ],
    tags: ["Actor", "Critic", "TD误差", "优势函数", "在线学习"],
    examples: [
      {
        input: "状态 s, 动作 a, 奖励 r=1, 下一状态 s', γ=0.99, V(s)=5.0, V(s')=5.2",
        output: "TD误差 δ = 1 + 0.99×5.2 - 5.0 = 1.148，Actor 和 Critic 分别沿梯度更新",
        explanation: "正的 TD 误差表示该动作比预期更好，Actor 增加该动作的概率，Critic 同步修正价值估计。",
      },
    ],
    heroNote: "Actor-Critic 是现代深度强化学习（A3C、PPO、SAC 等）的基础架构。",
  },
  {
    id: 30005,
    slug: "alphago",
    title: "AlphaGo",
    category: DRLCategory.OVERVIEW,
    difficulty: Difficulty.HARD,
    description:
      "AlphaGo 是 DeepMind 开发的围棋 AI，将深度神经网络与蒙特卡洛树搜索（MCTS）结合，首次以强化学习方式在全尺寸围棋中超越人类职业选手。其核心包括策略网络、价值网络和 MCTS 搜索。",
    learningGoals: [
      "理解 AlphaGo 中策略网络（Policy Network）的作用",
      "掌握价值网络（Value Network）如何评估棋局",
      "了解蒙特卡洛树搜索（MCTS）与神经网络结合的机制",
      "理解自对弈（Self-play）强化学习训练范式",
    ],
    inputs: [
      "棋盘状态 s：19×19 围棋盘面（含历史局面）",
      "策略网络 p_σ(a|s)：给出落子概率分布",
      "价值网络 v_θ(s)：评估当前局面胜率",
    ],
    outputs: [
      "MCTS 搜索后的最优落子位置",
      "胜率估计（0~1）",
    ],
    tags: ["AlphaGo", "MCTS", "策略网络", "价值网络", "自对弈", "围棋"],
    examples: [
      {
        input: "AlphaGo vs 李世石第三局，黑棋某关键中盘局面",
        output: "MCTS 经 1600 次模拟后选择右下角星位扩张，胜率估计 58%",
        explanation: "策略网络剪枝候选落子，价值网络与 rollout 结合评分，MCTS 整合两者选出最优手。",
      },
    ],
    heroNote: "AlphaGo Zero 进一步去掉人类棋谱，纯靠自对弈从零学起，以 100:0 击败原版 AlphaGo。",
  },
];
