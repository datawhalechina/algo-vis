import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const valueBasedProblems: DRLProblem[] = [
  {
    id: 30009,
    slug: "experience-replay",
    title: "经验回放与优先经验回放",
    category: DRLCategory.VALUE_BASED,
    difficulty: Difficulty.MEDIUM,
    description:
      "经验回放（Experience Replay）将智能体的历史交互数据存入回放缓冲区（Replay Buffer），训练时随机采样 mini-batch 进行更新。优先经验回放（Prioritized ER）进一步用 TD 误差的绝对值作为采样优先级，让网络更频繁地从「惊讶」的样本中学习。",
    learningGoals: [
      "理解经验回放如何打破样本间的时序相关性",
      "掌握回放缓冲区的存储与采样机制",
      "了解优先经验回放（PER）的优先级计算与重要性采样修正",
      "理解经验回放对 DQN 训练稳定性的关键作用",
    ],
    inputs: [
      "replay_buffer：存储 (s, a, r, s', done) 的环形队列",
      "batch_size：每次训练采样的样本数",
      "priority p_i = |δ_i| + ε：优先经验回放中的优先级（PER）",
      "α, β：PER 的优先级指数与重要性采样补偿参数",
    ],
    outputs: [
      "sampled batch：随机（或按优先级）采样的训练样本",
      "importance weights w_i：PER 中用于修正采样偏差的权重",
    ],
    tags: ["经验回放", "Replay Buffer", "PER", "DQN", "采样效率"],
    examples: [
      {
        input: "缓冲区大小 100k，batch_size=32，优先级 α=0.6，β=0.4",
        output: "TD 误差大（δ=5）的样本被采样概率是 TD 误差小（δ=0.1）样本的约 16 倍",
        explanation: "优先经验回放让网络集中学习价值估计误差大的困难样本，加速收敛。",
      },
    ],
    heroNote: "经验回放是 DQN 能在 Atari 游戏上成功的两大关键技术之一（另一个是目标网络）。",
  },
  {
    id: 30010,
    slug: "double-dqn-target-network",
    title: "过估计、目标网络与 Double DQN",
    category: DRLCategory.VALUE_BASED,
    difficulty: Difficulty.MEDIUM,
    description:
      "标准 Q-Learning 由于用同一网络选择和评估动作，会系统性地高估 Q 值（过估计问题）。目标网络（Target Network）通过延迟同步主网络参数来稳定训练目标。Double DQN 进一步将动作选择与价值评估解耦：用在线网络选择动作，用目标网络评估 Q 值，从根本上缓解过估计。",
    learningGoals: [
      "理解 Q-Learning 过估计问题的产生原因",
      "掌握目标网络的作用：提供稳定的 Bootstrap 目标",
      "理解 Double DQN 的解耦思路",
      "比较 DQN、目标网络 DQN 与 Double DQN 的性能差异",
    ],
    inputs: [
      "Q_online(s,a;θ)：在线网络（频繁更新）",
      "Q_target(s,a;θ⁻)：目标网络（定期从在线网络复制）",
      "update_freq：目标网络同步频率（如每 1000 步）",
    ],
    outputs: [
      "Double DQN target = r + γ Q_target(s', argmax_a Q_online(s', a; θ); θ⁻)",
      "减少过估计的更稳定 Q 值",
    ],
    tags: ["Double DQN", "目标网络", "过估计", "DQN", "稳定训练"],
    examples: [
      {
        input: "在线网络选择 a* = argmax Q_online(s')，目标网络评估 Q_target(s', a*)",
        output: "过估计量从标准 DQN 的 +5.2 降低到 Double DQN 的 +0.8",
        explanation: "解耦选择与评估后，最大化偏差不再被叠加，过估计得到有效抑制。",
      },
    ],
    heroNote: "目标网络参数更新有两种方式：硬更新（每 N 步整体复制）和软更新（每步 θ⁻ ← τθ + (1-τ)θ⁻）。",
  },
  {
    id: 30011,
    slug: "dueling-networks",
    title: "Dueling Networks（决斗网络）",
    category: DRLCategory.VALUE_BASED,
    difficulty: Difficulty.MEDIUM,
    description:
      "Dueling Network 将 Q 网络的输出分解为两个流：状态价值函数 V(s) 和优势函数 A(s,a)，最终 Q(s,a) = V(s) + A(s,a) - mean_a A(s,a)。这种分解使网络能够更高效地学习哪些状态本身价值更高，即便某些动作对最终结果影响不大。",
    learningGoals: [
      "理解优势函数 A(s,a) = Q(s,a) - V(s) 的含义",
      "掌握 Dueling Network 的双流架构设计",
      "理解为何需要减去均值来保证可识别性",
      "了解 Dueling Network 在动作与状态价值解耦方面的优势",
    ],
    inputs: [
      "共享特征提取层输出 φ(s)：卷积/全连接特征",
      "V 流：输出标量 V(s)",
      "A 流：输出向量 A(s,a) for all a",
    ],
    outputs: [
      "Q(s,a) = V(s) + [A(s,a) - (1/|A|) Σ_a A(s,a)]",
    ],
    tags: ["Dueling DQN", "优势函数", "价值分解", "双流架构", "Atari"],
    examples: [
      {
        input: "φ(s) → V(s) = 3.5，A(s, 左) = 1.2，A(s, 右) = 2.8，A(s, 停) = 0.1，均值 = 1.37",
        output: "Q(s,左) = 3.5 + (1.2 - 1.37) = 3.33，Q(s,右) = 3.5 + (2.8 - 1.37) = 4.93",
        explanation: "V(s) 捕捉状态的整体价值，A(s,a) 捕捉不同动作相对优劣，组合得到 Q 值。",
      },
    ],
    heroNote: "在很多 Atari 游戏中，特别是那些动作不总是立即影响结果的场景，Dueling Network 比标准 DQN 提升显著。",
  },
];
