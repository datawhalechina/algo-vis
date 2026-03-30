import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const llmRLProblems: DRLProblem[] = [
  {
    id: 30025,
    slug: "ppo-rlhf",
    title: "PPO（近端策略优化）与 RLHF",
    category: DRLCategory.LLM_RL,
    difficulty: Difficulty.HARD,
    description:
      "PPO（Proximal Policy Optimization）是当前 LLM 对齐训练（RLHF）的核心算法。InstructGPT 和 ChatGPT 均采用 PPO 从人类反馈中学习。PPO 通过 clip 机制限制策略更新幅度（代替 TRPO 的二阶优化），在保证稳定性的同时大幅简化实现。RLHF 流程依次经过：监督微调（SFT）→ 训练奖励模型（RM）→ 用 PPO 最大化奖励 + KL 惩罚。",
    learningGoals: [
      "掌握 PPO-Clip 目标函数：L = E[min(r·Â, clip(r, 1-ε, 1+ε)·Â)]，其中 r = π_θ/π_old",
      "理解 RLHF 的三阶段流程：SFT → 奖励模型训练 → PPO 微调",
      "了解 KL 散度惩罚项在 PPO-RLHF 中防止策略偏离 SFT 模型的作用",
      "理解为何 LLM 训练中需要同时维护 Actor、Critic、Reference、Reward 四个模型",
    ],
    inputs: [
      "π_θ(y|x)：待优化的 LLM 策略（Actor）",
      "π_ref(y|x)：SFT 参考模型（固定，用于 KL 惩罚）",
      "r_φ(x, y)：奖励模型（固定）",
      "ε：clip 超参数（通常 0.1～0.2）",
      "β：KL 惩罚系数",
    ],
    outputs: [
      "PPO-Clip Loss：防止策略更新过大的目标函数",
      "总奖励：r_φ(x,y) - β·KL(π_θ || π_ref)",
      "微调后的对齐 LLM 策略 π_θ",
    ],
    tags: ["PPO", "RLHF", "近端策略优化", "LLM对齐", "奖励模型", "KL惩罚", "InstructGPT", "ChatGPT"],
    examples: [
      {
        input: "用户问：「法国首都是哪里？」，SFT 模型输出「巴黎」，奖励模型给分 0.9",
        output: "PPO 更新策略使「巴黎」输出概率上升，但 clip(r, 0.8, 1.2) 限制单步变化幅度，KL 惩罚防止模型偏离 SFT 基础能力",
        explanation: "r = π_θ(巴黎)/π_old(巴黎)，若 r > 1.2 则被 clip，防止单次更新过于激进，保持训练稳定性。",
      },
    ],
    heroNote:
      "RLHF + PPO 是 ChatGPT 背后的核心对齐技术；工程上需要同时运行 4 个大模型（Actor/Critic/Ref/RM），显存压力极大，催生了 GRPO、RLOO 等更轻量的替代方案。",
  },
  {
    id: 30026,
    slug: "grpo",
    title: "GRPO（组相对策略优化）",
    category: DRLCategory.LLM_RL,
    difficulty: Difficulty.HARD,
    description:
      "GRPO（Group Relative Policy Optimization）由 DeepSeek 提出，用于训练 DeepSeek-R1 等推理模型。核心思想：对同一个问题采样一组答案（Group），以组内答案的平均奖励作为基线（baseline），替代 PPO 中需要单独训练的 Critic 网络。这使 GRPO 去掉了 Critic 模型，将显存需求减少约 50%，同时保留了 PPO 的 clip 稳定性。",
    learningGoals: [
      "理解 GRPO 用组内均值作 baseline 替代 Critic 的核心创新",
      "掌握 GRPO 优势估计：Â_i = (r_i - mean(r)) / std(r)，i 为组内第 i 条输出",
      "了解 GRPO 相比 PPO 在 LLM 训练中的显存与工程优势",
      "理解 GRPO 在可验证推理任务（数学、代码）上效果显著的原因",
    ],
    inputs: [
      "x：一道问题（如数学题）",
      "G：每个问题采样的输出数量（group size，如 G=8）",
      "{y_1, ..., y_G}：对 x 的 G 条采样输出",
      "{r_1, ..., r_G}：每条输出对应的奖励（规则奖励或模型打分）",
    ],
    outputs: [
      "组内标准化优势：Â_i = (r_i - μ_r) / σ_r",
      "GRPO Loss：L = -E[min(r_i·Â_i, clip(r_i, 1-ε, 1+ε)·Â_i)] + β·KL",
      "无需 Critic 模型的策略更新",
    ],
    tags: ["GRPO", "DeepSeek", "组相对优化", "推理模型", "LLM对齐", "无Critic", "DeepSeek-R1"],
    examples: [
      {
        input: "数学题「3x+5=14，求x」，采样 G=8 条输出：6 条正确（r=1）/ 2 条错误（r=0）",
        output: "均值 μ=0.75，正确答案 Â=(1-0.75)/std≈+1.0，错误答案 Â=(0-0.75)/std≈-3.0；PPO clip 防止更新过大",
        explanation: "组内对比让模型更有效识别「相对好」的输出，无需额外 Critic 网络即可提供稳定的 baseline。",
      },
    ],
    heroNote:
      "GRPO 是 DeepSeek-R1 取得突破性推理能力的关键技术之一；在可验证任务（数学、代码）上，规则奖励信号清晰、无需人工标注，与 GRPO 的结合尤其有效。",
  },
  {
    id: 30027,
    slug: "rloo",
    title: "RLOO（REINFORCE Leave-One-Out）",
    category: DRLCategory.LLM_RL,
    difficulty: Difficulty.MEDIUM,
    description:
      "RLOO（REINFORCE Leave-One-Out）是对经典 REINFORCE 算法的改进版本，专为 LLM 对齐优化。核心思想：对每个问题采样 K 条输出，将「除自身以外其余 K-1 条输出的平均奖励」作为当前输出的基线，从而消除高方差的同时无需训练 Critic 网络。RLOO 是 GRPO 思路的简化前身，实现更简单，适合资源受限场景。",
    learningGoals: [
      "理解 Leave-One-Out 基线的构造方式：baseline_i = mean({r_j | j ≠ i})",
      "掌握 RLOO 优势估计相比 vanilla REINFORCE（单条输出）的方差降低原理",
      "了解 RLOO 与 GRPO 的异同：RLOO 不使用 clip，GRPO 使用 PPO-Clip 稳定训练",
      "理解 K 值（每题采样数）对 RLOO 效果的影响",
    ],
    inputs: [
      "x：输入问题",
      "K：每题采样数（通常 K=4～16）",
      "{y_1, ..., y_K}：K 条采样输出",
      "{r_1, ..., r_K}：对应奖励",
    ],
    outputs: [
      "Leave-One-Out 优势：Â_i = r_i - mean({r_j | j≠i})",
      "RLOO Loss：-E_i[Â_i · log π_θ(y_i|x)]",
      "低方差的策略梯度更新",
    ],
    tags: ["RLOO", "REINFORCE", "Leave-One-Out", "LLM对齐", "基线方差", "无Critic"],
    examples: [
      {
        input: "问题 x，K=4，采样奖励 [1, 1, 0, 0]",
        output: "y_1 基线 = (1+0+0)/3 = 0.33，Â_1 = 1−0.33 = 0.67；y_3 基线 = (1+1+0)/3 = 0.67，Â_3 = 0−0.67 = −0.67",
        explanation: "每条输出与「其余输出」比较，好于平均则强化，差于平均则抑制，无需 Critic 即可实现低方差更新。",
      },
    ],
    heroNote:
      "RLOO 是连接经典 REINFORCE 与 GRPO 的桥梁：比 REINFORCE 方差低、比 PPO-RLHF 实现简单；Anthropic 等机构将其作为快速验证对齐算法的基准方法。",
  },
  {
    id: 30028,
    slug: "dapo",
    title: "DAPO（解耦 Clip 与动态采样）",
    category: DRLCategory.LLM_RL,
    difficulty: Difficulty.HARD,
    description:
      "DAPO（Decoupled Clip and Dynamic sAmpling Policy Optimization）是字节跳动与清华大学提出的 LLM RL 训练改进方案。针对 GRPO 在长链推理训练中的两大问题：①对 Actor 和 Reference 使用同一 clip 值导致熵坍塌、②训练后期有效样本比例下降（\"token 级别\" vs \"序列级别\" KL 的差异）。DAPO 提出解耦 clip 比率（ε_low/ε_high）和动态采样过滤策略，在数学推理和代码生成任务上超越 GRPO。",
    learningGoals: [
      "理解 GRPO 熵坍塌问题：统一 clip [1-ε, 1+ε] 导致策略过早确定化",
      "掌握 DAPO 解耦 Clip：对 ratio < 1 使用 ε_low，对 ratio > 1 使用 ε_high，鼓励探索",
      "了解动态采样：过滤奖励全为 0 或全为 1 的「无信息」样本组，提升数据效率",
      "理解 Token 级别 KL 惩罚相比 Sequence 级别的训练稳定性差异",
    ],
    inputs: [
      "ε_low：clip 下界（如 0.2），控制概率下降幅度",
      "ε_high：clip 上界（如 0.28），控制概率上升幅度",
      "采样组 {y_1,...,y_G}：同一问题的 G 条输出",
      "过滤条件：剔除所有输出奖励相同（全对/全错）的组",
    ],
    outputs: [
      "DAPO Loss：使用非对称 clip 的策略梯度目标",
      "动态有效数据集：只含「有区分度」的训练样本",
      "更高的训练熵：避免策略过早坍缩至单一输出模式",
    ],
    tags: ["DAPO", "字节跳动", "解耦Clip", "动态采样", "熵正则", "LLM推理", "PPO家族"],
    examples: [
      {
        input: "某组 G=8 输出全部正确（奖励全为 1），GRPO 正常处理",
        output: "DAPO 动态采样：过滤该组（无区分度），替换为新的有效样本组；避免模型从「全对组」中学到无意义梯度",
        explanation: "全对/全错组的 Â_i ≈ 0，梯度噪声大；过滤后只保留「部分对」的组，确保每次更新信噪比最高。",
      },
    ],
    heroNote:
      "DAPO 由字节跳动 Seed 团队开源发布，在多个数学推理 benchmark 上超越 GRPO；解耦 Clip 和动态采样的思路已被多个后续 LLM RL 工作所借鉴。",
  },
];
