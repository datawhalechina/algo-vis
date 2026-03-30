import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const tdLearningProblems: DRLProblem[] = [
  {
    id: 30006,
    slug: "sarsa",
    title: "Sarsa",
    category: DRLCategory.TD_LEARNING,
    difficulty: Difficulty.EASY,
    description:
      "Sarsa 是一种在线（on-policy）TD 学习算法，其名称来自更新所用的五元组 (S, A, R, S', A')。Sarsa 每一步用实际执行的下一动作 A' 来更新 Q 值，因此策略改进与策略执行保持一致。",
    learningGoals: [
      "理解 Sarsa 的在线（on-policy）特性",
      "掌握 Sarsa 更新公式：Q(s,a) ← Q(s,a) + α[r + γQ(s',a') - Q(s,a)]",
      "了解 ε-greedy 策略在 Sarsa 中的作用",
      "对比 Sarsa 与 Q-Learning 的收敛行为差异",
    ],
    inputs: [
      "Q(s,a)：当前动作价值表",
      "α：学习率",
      "γ：折扣因子",
      "ε：ε-greedy 探索率",
      "五元组 (s, a, r, s', a')：当前交互数据",
    ],
    outputs: [
      "更新后的 Q(s,a)：沿实际策略路径收敛",
    ],
    tags: ["Sarsa", "TD学习", "在线策略", "ε-greedy", "Q表"],
    examples: [
      {
        input: "s=(0,0), a=右, r=-1, s'=(0,1), a'=下（ε-greedy 选取），α=0.1, γ=0.9",
        output: "Q((0,0), 右) ← Q((0,0), 右) + 0.1×[-1 + 0.9×Q((0,1), 下) - Q((0,0), 右)]",
        explanation: "Sarsa 使用实际执行的下一动作 a' 来引导更新，保证策略评估与改进使用同一策略。",
      },
    ],
    heroNote: "Sarsa 更保守——在悬崖行走（Cliff Walking）等风险环境中，Sarsa 学会绕弯路，而 Q-Learning 会走悬崖边缘。",
  },
  {
    id: 30007,
    slug: "q-learning",
    title: "Q-Learning",
    category: DRLCategory.TD_LEARNING,
    difficulty: Difficulty.EASY,
    description:
      "Q-Learning 是最经典的离线（off-policy）TD 算法。与 Sarsa 不同，Q-Learning 的更新目标使用下一状态的最大 Q 值（贪婪动作），而非实际执行的动作，因此可以从任意行为策略产生的数据中学习最优策略。",
    learningGoals: [
      "理解 Q-Learning 的离线（off-policy）特性",
      "掌握 Q-Learning 更新公式：Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)]",
      "理解为何 Q-Learning 直接收敛到最优 Q*",
      "了解 DQN 如何将 Q-Learning 扩展到深度神经网络",
    ],
    inputs: [
      "Q(s,a)：当前动作价值表或神经网络",
      "α：学习率",
      "γ：折扣因子",
      "四元组 (s, a, r, s')：交互数据",
    ],
    outputs: [
      "更新后的 Q(s,a)：收敛到最优 Q*(s,a)",
    ],
    tags: ["Q-Learning", "TD学习", "离线策略", "DQN前身", "最优策略"],
    examples: [
      {
        input: "s=(0,0), a=右, r=-1, s'=(0,1)，α=0.1, γ=0.9，max_a' Q((0,1),a') = 2.0",
        output: "Q((0,0), 右) ← Q((0,0), 右) + 0.1×[-1 + 0.9×2.0 - Q((0,0), 右)]",
        explanation: "Q-Learning 直接以最优未来价值为目标，无论当前策略是否选择该动作，均朝最优方向更新。",
      },
    ],
    heroNote: "Q-Learning 是 DQN（Deep Q-Network）的理论基础，DQN 用神经网络替代 Q 表，突破了大规模状态空间的限制。",
  },
  {
    id: 30008,
    slug: "multi-step-td-target",
    title: "多步 TD 目标",
    category: DRLCategory.TD_LEARNING,
    difficulty: Difficulty.MEDIUM,
    description:
      "单步 TD 只用下一状态的估计值来引导更新（偏差低但方差大/偏差来自 Bootstrap），而蒙特卡洛方法用完整轨迹回报（无偏但方差大）。多步 TD 在两者之间取得平衡：展开 n 步真实奖励后再用估计值引导，通过调节 n 在偏差与方差间权衡。",
    learningGoals: [
      "理解 n 步回报 G_t^(n) 的定义与计算",
      "掌握多步 TD 更新如何在偏差与方差间权衡",
      "了解 TD(λ) 与 λ-return 的思想（多步 TD 的加权扩展）",
      "理解多步 TD 在 A3C、PPO 等现代算法中的应用",
    ],
    inputs: [
      "n：展开步数",
      "轨迹片段 (s_t, a_t, r_t, ..., s_{t+n})：n 步交互数据",
      "γ：折扣因子",
      "V(s_{t+n}) 或 Q(s_{t+n}, a_{t+n})：n 步后的自举估计值",
    ],
    outputs: [
      "G_t^(n) = r_t + γr_{t+1} + ... + γ^(n-1)r_{t+n-1} + γ^n V(s_{t+n})：n 步目标",
      "更新后的价值估计",
    ],
    tags: ["多步TD", "n步回报", "TD(λ)", "偏差方差权衡", "A3C"],
    examples: [
      {
        input: "n=3，轨迹奖励 r_0=-1, r_1=-1, r_2=10，γ=0.9，V(s_3)=5.0",
        output: "G_0^(3) = -1 + 0.9×(-1) + 0.81×10 + 0.729×5 = 11.545",
        explanation: "3 步展开比单步更准确地反映了未来 3 步的真实奖励，减少了对 Bootstrap 估计的依赖。",
      },
    ],
    heroNote: "n=1 退化为 TD(0)，n=∞ 退化为蒙特卡洛。选择合适的 n（如 5~20）通常获得最佳效果。",
  },
];
