import { Difficulty } from "@/types";
import { DRLCategory, DRLProblem } from "@/types/drl";

const category = DRLCategory.DISTRIBUTED_LLM_RL;

export const distributedLlmRlProblems: DRLProblem[] = [
  {
    id: 30030,
    slug: "distributed-llm-rl-overview",
    title: "分布式 LLM RL 系统全景",
    category,
    difficulty: Difficulty.EASY,
    description:
      "大模型强化学习把生成、策略训练、价值估计、参考策略和奖励计算拆成不同角色，再由控制面编排数据流。核心循环是 $\\text{prompt}\\rightarrow\\text{rollout}\\rightarrow\\text{reward}\\rightarrow\\text{advantage}\\rightarrow\\text{update}$。不同框架的命名和运行时各异，但算法依赖基本一致。",
    learningGoals: [
      "识别 Actor、Rollout、Reference、Critic 与 Reward 五类角色",
      "理解一批训练数据在角色之间的流动顺序",
      "区分算法语义、分布式调度和计算后端",
      "认识吞吐、显存和样本新鲜度之间的权衡",
    ],
    inputs: ["Prompt 数据集", "预训练或 SFT 后的策略模型"],
    outputs: ["更新后的策略参数 $\\theta'$", "奖励、KL、吞吐等训练指标"],
    tags: ["LLM RL", "系统架构", "Actor", "Rollout", "Critic", "Reward"],
    examples: [{
      input: "一批 prompts 与当前策略 $\\pi_\\theta$",
      output: "生成回答、完成评估并更新一次 Actor/Critic",
      explanation: "控制面保证依赖顺序，计算角色可分别扩展到不同数量的设备。",
    }],
    heroNote: "本章讲通用系统模型；具体框架只作为实现案例，不作为概念定义。",
  },
  {
    id: 30031,
    slug: "centralized-orchestration-workers",
    title: "集中式编排与 Worker Group",
    category,
    difficulty: Difficulty.MEDIUM,
    description:
      "控制器集中表达训练循环，Worker Group 在多张设备上执行生成、前向或更新。调用可以广播到所有 Worker，也可以把 batch 切成 $B_1,\\ldots,B_N$ 并行计算，结果再聚合回控制器。",
    learningGoals: [
      "理解控制流集中与计算分布式并不矛盾",
      "区分广播调用和数据并行调用",
      "掌握批次切分、执行与聚合的数据路径",
      "理解统一批数据容器的价值",
    ],
    inputs: ["训练阶段描述", "Worker 角色与设备映射", "批数据 $B$"],
    outputs: ["各角色的并行调用", "聚合后的结构化批数据"],
    tags: ["Controller", "Worker Group", "调度", "数据并行"],
    examples: [{
      input: "$B=8$ 个 prompts，$N=4$ 个 Rollout Worker",
      output: "每个 Worker 处理 2 个 prompts，随后按原顺序聚合",
      explanation: "算法代码只表达生成动作，运行时负责切分和收集。",
    }],
    heroNote: "好的控制面让研究者能像写单机流程一样描述分布式算法。",
  },
  {
    id: 30032,
    slug: "distributed-on-policy-loop",
    title: "分布式 On-policy 训练循环",
    category,
    difficulty: Difficulty.MEDIUM,
    description:
      "每轮 on-policy 训练先用当前策略生成数据，再计算新旧策略概率、参考概率、奖励、价值与优势，最后更新 Actor 和 Critic。数据来自 $\\pi_{\\theta_k}$，因此更新后旧样本会逐渐失去时效性。",
    learningGoals: [
      "掌握生成、评估、优势计算和更新的依赖关系",
      "理解 on-policy 数据新鲜度",
      "识别可并行阶段与必须同步的边界",
      "理解 Actor 和 Critic 的更新输入",
    ],
    inputs: ["当前策略 $\\pi_{\\theta_k}$", "Prompt batch", "奖励与参考策略配置"],
    outputs: ["新策略 $\\pi_{\\theta_{k+1}}$", "更新后的价值模型与训练指标"],
    tags: ["On-policy", "PPO", "训练循环", "流水线"],
    examples: [{
      input: "一批 8 个 prompts 与当前 Actor/Critic",
      output: "完成生成、评分、GAE 和一次参数更新",
      explanation: "生成通常吞吐受限，模型更新通常计算受限，系统需要平衡两个阶段。",
    }],
    heroNote: "分布式并不改变 PPO 的数学目标，只改变计算如何被切分、同步和调度。",
  },
  {
    id: 30033,
    slug: "actor-rollout-generation",
    title: "Actor 与 Rollout 生成",
    category,
    difficulty: Difficulty.MEDIUM,
    description:
      "Actor 表示可训练策略，Rollout 引擎负责高吞吐采样。生成概率满足 $p(y\\mid x)=\\prod_t\\pi_\\theta(y_t\\mid x,y_{<t})$。推理引擎可以使用 KV Cache 和连续批处理，而训练引擎需要重算可微的 token 概率。",
    learningGoals: [
      "理解 Actor 与 Rollout 的职责边界",
      "掌握自回归 token 生成过程",
      "理解为何训练阶段需要可微概率",
      "认识 KV Cache 与连续批处理的作用",
    ],
    inputs: ["Prompt tokens", "生成参数：temperature、top-k、top-p"],
    outputs: ["Response tokens", "旧策略与当前策略的 token log probability"],
    tags: ["Actor", "Rollout", "自回归生成", "KV Cache", "Continuous Batching"],
    examples: [{
      input: "Prompt：计算 $3+5$",
      output: "Response tokens 与每个 token 的 $\\log\\pi_\\theta$",
      explanation: "生成引擎重吞吐，训练引擎重梯度；二者需要一致的权重和概率语义。",
    }],
    heroNote: "系统性能常受 Rollout 制约，但数值一致性不能为吞吐让路。",
  },
  {
    id: 30034,
    slug: "critic-advantage-estimation",
    title: "Critic 与优势估计",
    category,
    difficulty: Difficulty.MEDIUM,
    description:
      "Critic 为每个 token 状态估计 $V(s_t)$，GAE 再从序列末端反向递推：$\\delta_t=r_t+\\gamma V(s_{t+1})-V(s_t)$，$A_t=\\delta_t+\\gamma\\lambda A_{t+1}$。",
    learningGoals: [
      "理解 token 级价值预测",
      "掌握 TD 残差与 GAE 的反向递推",
      "理解 $\\lambda$ 对偏差和方差的影响",
      "看懂优势与 return 的关系",
    ],
    inputs: ["Token rewards $r_t$", "Values $V(s_t)$", "$\\gamma$ 与 $\\lambda$"],
    outputs: ["Advantages $A_t$", "Returns $A_t+V(s_t)$"],
    tags: ["Critic", "GAE", "Advantage", "TD Error"],
    examples: [{
      input: "$r=[0,0,0,1]$，$V=[0.5,0.6,0.7,0.8]$",
      output: "从末尾向前得到每个 token 的优势",
      explanation: "反向递推把末端奖励传播到更早的生成决策。",
    }],
    heroNote: "优势估计负责把稀疏的结果奖励变成稠密的 token 学习信号。",
  },
  {
    id: 30035,
    slug: "reward-services",
    title: "奖励服务与可验证奖励",
    category,
    difficulty: Difficulty.EASY,
    description:
      "奖励可来自偏好模型、规则验证器、代码沙箱或多个信号的组合。系统需要批量路由请求、处理超时，并确保同一输入可复现地得到评分。最终奖励常写成 $R=\\lambda_{rm}R_{model}+\\lambda_{rule}R_{rule}-\\beta KL$。",
    learningGoals: [
      "区分奖励模型、规则奖励和可验证奖励",
      "理解奖励组合与归一化",
      "认识 reward hacking 风险",
      "理解奖励服务的吞吐和容错需求",
    ],
    inputs: ["Prompt 与 response", "可选标准答案", "一组奖励函数"],
    outputs: ["标量或 token 级奖励", "各奖励分量与校验状态"],
    tags: ["Reward Model", "Rule-based", "Verifiable Reward", "Reward Hacking"],
    examples: [{
      input: "数学回答、标准答案和格式约束",
      output: "正确性 1.0、格式 0.8，经权重组合得到总奖励",
      explanation: "保留分量便于发现模型只优化格式却忽略答案的异常。",
    }],
    heroNote: "奖励信号是训练的目标定义；可观测、可复现和抗投机与模型规模同样重要。",
  },
  {
    id: 30036,
    slug: "training-inference-resharding",
    title: "训练推理资源切换与参数重分片",
    category,
    difficulty: Difficulty.HARD,
    description:
      "训练偏好参数、梯度和优化器分片，推理偏好低延迟张量并行与更大的 KV Cache。共置架构通过 $W_{train}^{(DP/FSDP)}\\leftrightarrow W_{infer}^{(TP/PP)}$ 重排同一组参数，减少重复权重，但付出通信与切换成本。",
    learningGoals: [
      "比较训练与推理的资源需求",
      "理解 FSDP、TP 与 PP 的分片维度",
      "跟踪一次参数重分片的数据移动",
      "权衡共置与分离部署",
    ],
    inputs: ["训练态参数分片", "优化器状态", "推理并行拓扑"],
    outputs: ["推理态参数分片", "可供 KV Cache 使用的显存"],
    tags: ["Resharding", "FSDP", "Tensor Parallel", "Pipeline Parallel", "显存"],
    examples: [{
      input: "4 张 GPU 上的 FSDP 参数分片",
      output: "按张量维度重新分布到推理 Worker",
      explanation: "重分片以通信换取同一批设备在训练和生成间复用。",
    }],
    heroNote: "共置不是唯一答案；最优部署取决于模型规模、生成长度和训练更新频率。",
  },
];
