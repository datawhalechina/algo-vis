import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const policyGradientProblems: DRLProblem[] = [
  {
    id: 30012,
    slug: "policy-gradient-with-baseline",
    title: "带基线的策略梯度",
    category: DRLCategory.POLICY_GRADIENT,
    difficulty: Difficulty.MEDIUM,
    description:
      "纯策略梯度（REINFORCE）的梯度估计方差极大，导致训练不稳定。引入基线 b(s)（通常为状态价值函数 V(s)）后，将回报替换为优势 A(s,a) = G_t - b(s)，在不引入偏差的前提下显著降低方差，加速收敛。",
    learningGoals: [
      "理解策略梯度高方差问题的根源",
      "掌握基线（Baseline）不引入偏差的数学证明",
      "理解优势函数 A(s,a) = G_t - V(s) 的物理含义",
      "对比有无基线时梯度估计的方差大小",
    ],
    inputs: [
      "π_θ(a|s)：参数化策略",
      "b(s) 或 V(s)：基线函数（状态价值估计）",
      "G_t：蒙特卡洛回报",
    ],
    outputs: [
      "∇_θ J(θ) ≈ Σ_t (G_t - b(s_t)) ∇_θ log π_θ(a_t|s_t)：低方差梯度估计",
    ],
    tags: ["策略梯度", "基线", "方差减少", "优势函数", "REINFORCE"],
    examples: [
      {
        input: "G_t = 50（高于平均），b(s) = 30（平均回报），log 梯度 = 0.2",
        output: "梯度贡献 = (50 - 30) × 0.2 = 4（正更新，增加该动作概率）",
        explanation: "基线将绝对回报转化为相对优势，使得仅在回报高于平均时才正向强化该动作。",
      },
    ],
    heroNote: "基线可以是任意不依赖于动作的函数，用 V(s) 作为基线时即得到 Advantage Actor-Critic（A2C）。",
  },
  {
    id: 30013,
    slug: "reinforce-with-baseline",
    title: "REINFORCE with Baseline",
    category: DRLCategory.POLICY_GRADIENT,
    difficulty: Difficulty.MEDIUM,
    description:
      "REINFORCE with Baseline 在经典 REINFORCE 基础上引入学习型基线 V_w(s)（Critic 网络），同时用蒙特卡洛回报更新策略网络（Actor）和价值网络（Critic）。整个算法每隔完整一条轨迹才进行一次参数更新。",
    learningGoals: [
      "掌握 REINFORCE with Baseline 完整训练流程",
      "理解 Actor 使用优势 (G_t - V_w(s)) 进行策略梯度更新",
      "理解 Critic 使用 MSE loss 拟合蒙特卡洛回报 G_t",
      "了解算法的蒙特卡洛特性及其局限（必须等待完整轨迹）",
    ],
    inputs: [
      "θ：Actor（策略网络）参数",
      "w：Critic（价值网络）参数",
      "完整轨迹 τ = (s_0,a_0,r_0, ..., s_T)：每幕采样结果",
    ],
    outputs: [
      "Actor 更新：θ ← θ + α_θ Σ_t (G_t - V_w(s_t)) ∇_θ log π_θ(a_t|s_t)",
      "Critic 更新：w ← w - α_w Σ_t (G_t - V_w(s_t)) ∇_w V_w(s_t)",
    ],
    tags: ["REINFORCE", "基线", "蒙特卡洛", "Actor-Critic", "完整轨迹"],
    examples: [
      {
        input: "CartPole 轨迹长 200 步，某状态 G_t=15.3, V_w(s)=12.0，α_θ=0.001",
        output: "优势 = 3.3，Actor 参数沿 3.3 × ∇log π 方向更新，增加该状态下选此动作的概率",
        explanation: "Critic 先拟合回报作为基线，Actor 只在回报正优势时正向更新，负优势时减弱。",
      },
    ],
    heroNote: "与在线 Actor-Critic 不同，REINFORCE with Baseline 属于蒙特卡洛方法，必须等到回合结束才能计算。",
  },
  {
    id: 30014,
    slug: "advantage-actor-critic-a2c",
    title: "Advantage Actor-Critic（A2C）",
    category: DRLCategory.POLICY_GRADIENT,
    difficulty: Difficulty.MEDIUM,
    description:
      "A2C（Advantage Actor-Critic）是在线 Actor-Critic 算法的同步并行版本。它使用 TD 误差 δ = r + γV(s') - V(s) 近似优势函数，每步（而非每幕）都进行 Actor 和 Critic 的更新，并支持多个并行环境同步采样以提升数据多样性。",
    learningGoals: [
      "理解 A2C 与 REINFORCE with Baseline 的关键区别（在线 vs 蒙特卡洛）",
      "掌握 TD 优势估计 δ = r + γV(s') - V(s) 的推导",
      "了解同步多环境并行采样对训练稳定性的作用",
      "理解 A2C 是 A3C（异步优势 Actor-Critic）的同步版本",
    ],
    inputs: [
      "π_θ(a|s)：策略网络（Actor）",
      "V_w(s)：价值网络（Critic）",
      "n_envs：并行环境数量",
      "每步数据 (s, a, r, s', done)：来自 n_envs 个环境",
    ],
    outputs: [
      "Actor loss：-Σ δ·log π_θ(a|s)（梯度上升）",
      "Critic loss：Σ (r + γV(s') - V(s))²（均方误差）",
      "Entropy bonus：-Σ π log π（鼓励探索的熵正则项）",
    ],
    tags: ["A2C", "优势函数", "在线策略", "并行采样", "熵正则"],
    examples: [
      {
        input: "8 个并行环境，某并行步：r=[1,-1,0,...], s' 对应 V(s')=[3.2,...], V(s)=[2.8,...], γ=0.99",
        output: "δ = 1 + 0.99×3.2 - 2.8 = 1.368，Actor 增加该动作概率，Critic 向 r+γV(s') 校正",
        explanation: "8 个环境同步提供不同状态的数据，批量更新降低梯度方差，加速稳定收敛。",
      },
    ],
    heroNote: "A2C/A3C 奠定了现代策略优化算法（PPO、SAC）的基础，熵正则项是防止策略过早收敛的常用技巧。",
  },
  {
    id: 30015,
    slug: "reinforce-versus-a2c",
    title: "REINFORCE vs A2C 对比",
    category: DRLCategory.POLICY_GRADIENT,
    difficulty: Difficulty.EASY,
    description:
      "REINFORCE 和 A2C 都是策略梯度算法，但在时序性、方差/偏差权衡和适用场景上有本质差异。本题通过直观对比，帮助理解两种方法各自的优缺点及适用条件。",
    learningGoals: [
      "对比 REINFORCE（蒙特卡洛）与 A2C（TD 自举）的梯度估计方式",
      "理解蒙特卡洛无偏但高方差、TD 有偏但低方差的权衡",
      "了解在线（on-policy）更新频率对样本效率的影响",
      "掌握在不同任务场景下选择算法的基本原则",
    ],
    inputs: [
      "任务类型：回合制（episodic）或连续（continuous）",
      "状态空间复杂度",
      "计算资源：是否支持并行环境",
    ],
    outputs: [
      "推荐算法选择及其权衡分析",
    ],
    tags: ["REINFORCE", "A2C", "对比", "方差偏差", "算法选择"],
    examples: [
      {
        input: "任务：CartPole（回合长度 ≤ 500，离散动作，奖励稀疏度低）",
        output: "REINFORCE 可达到 195+ 分；A2C 收敛更快且方差更低，推荐使用 A2C",
        explanation: "CartPole 回合较短时 REINFORCE 也可收敛，但 A2C 在线更新更高效，适合快速实验。",
      },
    ],
    heroNote: "简单记忆：REINFORCE = 等待整幕 + 无偏高方差；A2C = 每步更新 + 有偏低方差 + 快速收敛。",
  },
];
