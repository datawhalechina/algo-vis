import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const imitationLearningProblems: DRLProblem[] = [
  {
    id: 30023,
    slug: "inverse-reinforcement-learning",
    title: "逆强化学习（IRL）",
    category: DRLCategory.IMITATION_LEARNING,
    difficulty: Difficulty.HARD,
    description:
      "逆强化学习（Inverse Reinforcement Learning, IRL）从专家演示中反推奖励函数，而非直接模仿动作。其核心假设是专家行为在真实奖励函数下是近似最优的。学到奖励函数后，可用标准 RL 求解最优策略，使智能体具备更好的泛化能力。",
    learningGoals: [
      "理解 IRL 与行为克隆（Behavioral Cloning）的根本区别",
      "掌握 MaxEnt IRL（最大熵 IRL）的目标函数推导",
      "了解 IRL 的奖励函数泛化性优于直接模仿的原因",
      "理解 IRL 的计算复杂度挑战（内层 RL 求解）",
    ],
    inputs: [
      "专家演示 D = {τ_1, τ_2, ...}：专家轨迹集合",
      "特征函数 φ(s,a)：状态-动作的特征表示",
      "奖励参数 w：待学习的奖励权重 r(s,a) = w·φ(s,a)",
    ],
    outputs: [
      "推断的奖励函数 r_w(s,a)：拟合专家行为的奖励",
      "使用 r_w 训练得到的策略 π（接近专家水平）",
    ],
    tags: ["IRL", "逆强化学习", "奖励学习", "专家演示", "MaxEnt"],
    examples: [
      {
        input: "自动驾驶专家演示 50 段，特征包含速度、车道偏离量、与前车距离",
        output: "IRL 推断：奖励 = -0.8×偏离量 - 0.5×急刹 + 0.3×速度保持（比指定奖励更能捕捉驾驶风格）",
        explanation: "相比手工设计奖励，IRL 学到的奖励函数更贴近专家真实意图，在新路况下泛化更好。",
      },
    ],
    heroNote: "IRL 的计算瓶颈是需要在外层每次更新 w 后，内层重新运行 RL 求解策略——GAIL 通过对抗训练绕过了这一问题。",
  },
  {
    id: 30024,
    slug: "gail",
    title: "生成对抗模仿学习（GAIL）",
    category: DRLCategory.IMITATION_LEARNING,
    difficulty: Difficulty.HARD,
    description:
      "GAIL（Generative Adversarial Imitation Learning）将 GAN 的对抗思想引入模仿学习：判别器（Discriminator）区分智能体轨迹与专家轨迹，智能体（Generator/Policy）则努力生成让判别器无法区分的行为。GAIL 绕过了 IRL 中昂贵的内层 RL 求解，直接端到端地从演示中学习策略。",
    learningGoals: [
      "理解 GAIL 与 GAN 的类比关系",
      "掌握 GAIL 的目标函数：min_π max_D E_π[log D(s,a)] + E_exp[log(1-D(s,a))]",
      "了解判别器奖励如何替代手工奖励函数驱动 RL",
      "理解 GAIL 相对于行为克隆和 IRL 的优缺点",
    ],
    inputs: [
      "专家演示 D_exp = {(s,a)}：专家状态-动作对",
      "判别器 D_w(s,a)：区分智能体与专家的二分类网络",
      "策略 π_θ：智能体策略网络（Generator）",
    ],
    outputs: [
      "判别器输出 D(s,a) ∈ [0,1]：1 表示像专家，0 表示像智能体",
      "内生奖励 r(s,a) = -log D(s,a)：越像专家获得越高奖励",
      "策略 π_θ：最终模仿专家行为的策略",
    ],
    tags: ["GAIL", "GAN", "模仿学习", "对抗训练", "内生奖励", "判别器"],
    examples: [
      {
        input: "专家：人类驾驶 10 小时录像；智能体初始策略：随机驾驶",
        output: "经 2000 步对抗训练，智能体将碰撞率从 85% 降至 12%，驾驶风格指标（平滑度、道路偏离）趋近人类",
        explanation: "判别器提供稠密奖励信号（比+1/-1稀疏奖励丰富），策略不断优化直到判别器无法区分。",
      },
    ],
    heroNote: "GAIL 的实现通常结合 TRPO 或 PPO 作为内层策略优化器，判别器和策略交替更新。",
  },
];
