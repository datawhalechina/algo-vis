import { Difficulty } from "@/types";
import { DRLProblem, DRLCategory } from "@/types/drl";

export const verlProblems: DRLProblem[] = [
  {
    id: 30030,
    slug: "verl-framework-overview",
    title: "verl 框架全景",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.EASY,
    description:
      "verl（原名 HybridFlow）是字节跳动 Seed 团队开源的 LLM 强化学习训练框架，用于实现 RLHF/RLAIF 等 post-training 流程。整体架构由 Single-Controller（单控制器）统一调度 5 大核心组件：Actor（策略模型）、Critic（价值网络）、Rollout（生成引擎）、Reward（奖励模块）和 Reference（参考模型）。数据从 Prompts 出发，经过 Rollout 生成 → Reward 打分 → Advantage 计算 → Actor/Critic 更新的循环，最终输出对齐后的策略模型。verl 支持 FSDP/Megatron-LM 训练后端和 vLLM/SGLang 推理后端，通过 HybridEngine 实现训练态与生成态的高效切换。",
    learningGoals: [
      "建立对 verl 框架整体架构的直觉认知",
      "理解 5 大核心组件（Actor、Critic、Rollout、Reward、Reference）的职责",
      "掌握数据在各组件间的流向关系",
      "了解 verl 相比传统 RLHF 方案的工程优势",
    ],
    inputs: [
      "Prompts 数据集：用于生成训练样本的问题/指令集合",
      "Pretrained LLM：预训练或 SFT 后的语言模型作为初始策略",
    ],
    outputs: [
      "Trained Policy：经过 RL 对齐训练后的策略模型",
      "Training Metrics：训练过程中的 reward、KL divergence 等指标",
    ],
    tags: ["verl", "RLHF", "框架总览", "HybridFlow", "字节跳动", "LLM训练"],
    examples: [
      {
        input: "Prompts 数据集 + Qwen2.5-7B SFT 模型",
        output: "经过 PPO 训练 1000 步后的对齐模型，reward 从 0.3 提升到 0.8",
        explanation:
          "verl 统一调度 Actor/Critic/Rollout/Reward/Reference 五个组件完成 PPO 训练循环，HybridEngine 在训练和生成之间复用模型权重，节省约 50% 显存。",
      },
    ],
    heroNote:
      "verl 是目前最活跃的开源 LLM RL 框架之一，支持 PPO、GRPO、RLOO、DPO 等多种算法，已在 DeepSeek、Qwen 等模型训练中得到验证。项目地址：https://github.com/volcengine/verl",
  },
  {
    id: 30031,
    slug: "verl-single-controller",
    title: "Single-Controller 调度架构",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "verl 采用 Hybrid-Controller（混合控制器）编程模型：一个 Driver 进程（Single-Controller）统一编排整个训练流程的控制逻辑，而实际计算由多个 RayWorkerGroup 分布式执行。Controller 通过两种调度模式分发任务：ONE_TO_ALL（广播模式，如模型初始化），DP_COMPUTE_PROTO（数据并行模式，按 DP 维度分片分发数据）。数据通过 DataProto 容器在 Controller 和 Worker 之间传递，DataProto 封装了 input_ids、attention_mask、log_probs 等张量。这种设计使算法逻辑与计算后端完全解耦，用户可以在不修改控制逻辑的情况下切换 FSDP/Megatron 后端。",
    learningGoals: [
      "理解 Single-Controller 相比 Multi-Controller 的优势（简化编程、统一调度）",
      "掌握 RayWorkerGroup 的工作原理（Controller 管理多个 GPU Worker）",
      "区分 ONE_TO_ALL 和 DP_COMPUTE_PROTO 两种调度模式",
      "理解 DataProto 数据容器的作用和结构",
    ],
    inputs: [
      "DataProto：封装 input_ids、attention_mask 等张量的数据容器",
      "WorkerGroup 配置：GPU 数量、并行策略等",
    ],
    outputs: [
      "DataProto：Worker 计算后返回的结果容器（包含 log_probs、values 等）",
    ],
    tags: ["verl", "Single-Controller", "RayWorkerGroup", "DataProto", "调度", "分布式"],
    examples: [
      {
        input: "Controller 调用 actor_wg.generate_sequences(prompts_proto)",
        output: "4 个 GPU Worker 各生成 1/4 batch 的 response，结果汇总回 Controller",
        explanation:
          "DP_COMPUTE_PROTO 模式下，Controller 将 batch 按 DP 维度切分成 4 份分发给 4 个 Worker，每个 Worker 独立生成，结果自动收集合并。",
      },
    ],
    heroNote:
      "Single-Controller 设计让用户像写单机代码一样编写分布式 RL 训练逻辑，极大降低了开发复杂度。参考：https://github.com/volcengine/verl",
  },
  {
    id: 30032,
    slug: "verl-ppo-training-loop",
    title: "PPO 训练循环（主流程）",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "verl 中的 PPO 训练循环是整个框架的核心流程。每个训练 iteration 包含 6 个阶段：① Generate Sequences — Actor 通过 Rollout 引擎生成 response；② Compute Actor Log Prob — Actor 重新计算精确的对数概率（可微分）；③ Compute Ref Log Prob — Reference 模型计算基准对数概率（用于 KL 约束）；④ Compute Values & Rewards — Critic 计算状态价值，Reward 模块计算奖励分数；⑤ Compute Advantages — 在 Controller 上用 GAE 计算优势值；⑥ Update Actor & Critic — 用 PPO clip loss 和 value loss 分别更新两个模型。这 6 步构成一个完整的 on-policy 循环，不断迭代直到模型收敛。",
    learningGoals: [
      "掌握 verl PPO 循环的完整 6 步流程",
      "理解每步的输入输出和数据依赖关系",
      "了解 Advantage 在 Controller 本地计算的设计考量",
      "理解 on-policy 循环的迭代机制",
    ],
    inputs: [
      "Prompt batch：一批待处理的输入问题",
      "Actor 参数 θ：当前策略模型参数",
      "Critic 参数 φ：当前价值网络参数",
    ],
    outputs: [
      "Updated Actor θ'：PPO 更新后的策略参数",
      "Updated Critic φ'：Value loss 更新后的价值网络参数",
      "Training metrics：reward mean、KL divergence、loss 等指标",
    ],
    tags: ["verl", "PPO", "训练循环", "GAE", "on-policy", "Actor-Critic"],
    examples: [
      {
        input: "batch_size=8 的 prompt batch，当前 Actor 和 Critic 参数",
        output: "一个 iteration 后：生成 8 条 response → 计算 log_probs → 计算 rewards → GAE advantages → 更新 Actor/Critic",
        explanation:
          "每个 iteration 走完完整的 6 步循环。Generate 阶段用 vLLM 高速生成，Log Prob 阶段用 PyTorch 前向传播获取可微分梯度，GAE 在 CPU 上快速计算。",
      },
    ],
    heroNote:
      "PPO 训练循环中最独特的设计是 Log Prob 的「两次计算」：生成时用 vLLM（快但不可微分），训练时用 Actor 重算（慢但可微分），HybridEngine 使两者共享权重。参考：https://github.com/volcengine/verl",
  },
  {
    id: 30033,
    slug: "verl-actor-rollout",
    title: "Actor & Rollout 生成阶段",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "在 verl 中，Actor 和 Rollout 由同一个 ActorRolloutRefWorker 承载，通过 HybridEngine 在训练态（Actor）和生成态（Rollout）之间切换。生成阶段：模型参数从 FSDP 分片重组为 Tensor Parallel 分片 → vLLM/SGLang 引擎接管 → 自回归逐 token 生成（每步：logits → softmax → sampling → 追加 token）→ 生成完成后收集 response_ids。Log Prob 重计算阶段：模型切回训练态 → 用完整序列做前向传播 → 输出每个 token 位置的精确 log_prob（可微分，用于 PPO loss 计算）。之所以需要两次计算，是因为 vLLM 的 KV-Cache 优化虽然快，但不保留完整计算图。",
    learningGoals: [
      "理解 ActorRolloutRefWorker 的双重角色",
      "掌握自回归生成的 token-by-token 过程",
      "理解为什么需要「两次计算」log probability",
      "了解 vLLM KV-Cache 和 Continuous Batching 的加速原理",
    ],
    inputs: [
      "prompt_ids：输入 token 序列",
      "attention_mask：注意力掩码",
      "generation_config：温度、top-k、top-p、max_length 等生成参数",
    ],
    outputs: [
      "response_ids：生成的 token 序列",
      "log_probs：每个 token 的对数概率（可微分）",
      "attention_mask：更新后的掩码（覆盖 prompt + response）",
    ],
    tags: ["verl", "Actor", "Rollout", "vLLM", "自回归生成", "Log Prob", "HybridEngine"],
    examples: [
      {
        input: "prompt: '计算 3+5 的结果' → token_ids: [8, 42, 15, 7, 3]",
        output: "response: '3+5=8' → token_ids: [12, 9, 22, 8], log_probs: [-0.3, -0.1, -0.5, -0.2]",
        explanation:
          "vLLM 利用 KV-Cache 避免重复计算 attention，Continuous Batching 动态调度多请求共享 GPU。生成结束后 Actor 重算 log_prob 以获取可微分梯度。",
      },
    ],
    heroNote:
      "Actor 和 Rollout 共享同一份模型权重是 verl 的核心创新之一，通过 HybridEngine 实现零拷贝切换，避免了传统方案中需要维护两份独立模型的显存浪费。参考：https://github.com/volcengine/verl",
  },
  {
    id: 30034,
    slug: "verl-critic-advantage",
    title: "Critic & Advantage 估计",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "Critic 网络在 verl 的 PPO 训练中负责估计每个 token 位置的状态价值 V(s)。输入完整序列（prompt + response）到 Critic 网络，输出每个位置的标量 value。结合 Reward 模块给出的奖励信号（通常只在序列末尾有值），通过 GAE（Generalized Advantage Estimation）算法计算每个 token 的优势值 A(s,a)。GAE 从序列末尾反向递推：先算 TD error δ_t = r_t + γ·V(s_{t+1}) - V(s_t)，再累积 A_t = δ_t + (γλ)·A_{t+1}。优势值告诉 Actor 每个决策「比平均好多少」，是 PPO 更新的核心信号。Actor 用 PPO clip loss: L = min(r·A, clip(r, 1-ε, 1+ε)·A) 更新；Critic 用 value loss: L = (V_pred - V_target)² 更新。",
    learningGoals: [
      "理解 Critic 在 PPO 中的角色：估计状态价值 V(s)",
      "掌握 GAE 的反向递推计算过程",
      "理解 TD error 和优势值的关系",
      "了解 PPO clip loss 防止策略更新过大的机制",
    ],
    inputs: [
      "sequences：prompt + response 的完整 token 序列",
      "rewards：Reward 模块输出的奖励（通常只有末尾非零）",
      "γ (gamma)：折扣因子（通常 0.99~1.0）",
      "λ (lambda)：GAE 平滑因子（通常 0.95）",
    ],
    outputs: [
      "values：每个 token 位置的状态价值 V(s_t)",
      "advantages：每个 token 的优势值 A(s_t, a_t)",
      "returns：每个 token 的回报 R_t = A_t + V_t",
    ],
    tags: ["verl", "Critic", "GAE", "Advantage", "TD Error", "PPO Clip", "Value Function"],
    examples: [
      {
        input: "序列长度 T=5，rewards=[0,0,0,0,1.0]，values=[0.6,0.7,0.8,0.85,0.9]，γ=1.0，λ=0.95",
        output: "TD errors: [-0.1,-0.1,-0.05,-0.05,0.1], advantages 从后向前累积，最后一个 token advantage 最高",
        explanation:
          "奖励只在末尾（r_4=1.0），GAE 从 t=4 反向递推，将奖励信号逐步传播到前面的 token，离奖励越近 advantage 越大。",
      },
    ],
    heroNote:
      "在 verl 中，Advantage 计算（GAE）直接在 Controller 进程上执行，不需要分布式通信——这是 verl Single-Controller 架构的优势之一。参考：https://github.com/volcengine/verl",
  },
  {
    id: 30035,
    slug: "verl-reward-module",
    title: "Reward 模块",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.EASY,
    description:
      "Reward 模块是 verl 训练循环中的「评价者」，负责告诉 Actor「这个回答有多好」。verl 支持三种 Reward 计算方式：① Reward Model（模型打分）— 用经过人类偏好训练的 RM 对 (prompt, response) 打分，输出标量分数，适用于开放式对话等无标准答案的场景；② Rule-based Reward（规则奖励）— 对数学题提取答案与标准答案比对（0/1），对代码题运行测试用例计算通过率，简单高效但仅适用于可验证任务；③ Verifiable Rewards（可验证奖励）— 结合 sandbox 执行、格式检查、多维度评分（正确性 + 格式 + 推理过程），比纯规则更灵活。verl 的 Reward 模块支持自定义 reward function，用户可以灵活组合多种 reward 信号。",
    learningGoals: [
      "理解三种 Reward 计算方式的原理和适用场景",
      "掌握 Reward Model 的训练来源（人类偏好数据）",
      "了解 Rule-based Reward 在可验证任务（数学、代码）上的优势",
      "理解 Reward 信号质量对 RL 训练效果的决定性影响",
    ],
    inputs: [
      "prompt：输入问题/指令",
      "response：Actor 生成的回答",
      "ground_truth（可选）：标准答案（用于 Rule-based）",
    ],
    outputs: [
      "reward score：标量奖励分数（通常归一化到 [-1, 1] 或 [0, 1]）",
    ],
    tags: ["verl", "Reward", "Reward Model", "Rule-based", "Verifiable", "RLHF"],
    examples: [
      {
        input: "prompt='3+5=?'，response='答案是 8'，ground_truth='8'",
        output: "Rule-based reward: 1.0（提取答案 '8' == ground_truth '8'）",
        explanation:
          "Rule-based reward 通过正则提取答案并与 ground_truth 比对。对数学题这种有明确答案的任务，比 Reward Model 更准确且无需额外训练。",
      },
      {
        input: "prompt='写一首关于春天的诗'，response='春风拂面...'",
        output: "Reward Model score: 0.82",
        explanation:
          "开放式创作无标准答案，需要 Reward Model 从人类偏好数据中学到的评判标准来打分。",
      },
    ],
    heroNote:
      "Reward 信号是 RL 训练的「指南针」——信号越准确、越细粒度，模型学习越高效。verl 支持灵活组合多种 reward 来源，这是 DeepSeek-R1 等推理模型成功的关键因素之一。参考：https://github.com/volcengine/verl",
  },
  {
    id: 30036,
    slug: "verl-hybrid-engine",
    title: "HybridEngine 3D 重分片",
    category: DRLCategory.VERL_FRAMEWORK,
    difficulty: Difficulty.HARD,
    description:
      "HybridEngine 是 verl 的核心创新，解决了传统 RLHF 训练中「训练和生成需要两套模型副本」的显存浪费问题。核心思想：Actor 模型在训练态（FSDP 分片）和生成态（Tensor Parallel 分片）之间通过参数重分片（resharding）切换，共享同一份权重。训练态：FSDP 将模型参数均匀分片到 N 张 GPU，每张只存 1/N 参数 + 优化器状态，前向/反向时 all-gather 临时聚合。生成态：参数重组为 Tensor Parallel 分片（按列/行切分），释放优化器状态和梯度，腾出空间给 KV-Cache。切换过程：Train→Generate 时进行 FSDP→TP 重分片 + 释放优化器；Generate→Train 时进行 TP→FSDP 重分片 + 恢复优化器。3D-HybridEngine 实现了约 1.4x 吞吐量提升，同时节省约 50% 显存。",
    learningGoals: [
      "理解训练态和生成态对模型分片策略的不同需求",
      "掌握 FSDP 分片和 Tensor Parallel 分片的区别",
      "了解重分片过程中的参数迁移和通信开销",
      "理解 HybridEngine 如何通过共享权重节省显存",
    ],
    inputs: [
      "FSDP 分片参数：训练态下 N 张 GPU 上的分片参数",
      "优化器状态：Adam 的 m (momentum) 和 v (variance) 缓存",
    ],
    outputs: [
      "TP 分片参数：生成态下按列/行切分的参数",
      "KV-Cache 空间：释放优化器后腾出的 GPU 显存",
    ],
    tags: ["verl", "HybridEngine", "重分片", "FSDP", "Tensor Parallel", "显存优化", "3D-HybridEngine"],
    examples: [
      {
        input: "4 GPU，7B 模型，FSDP 训练态（每 GPU: 1.75B 参数 + 3.5B 优化器状态）",
        output: "切换到 TP 生成态：每 GPU: 1.75B 参数（TP 切分）+ 释放 3.5B 优化器 → 腾出空间给 KV-Cache",
        explanation:
          "FSDP→TP 重分片通过 all-to-all 通信重新排列参数，优化器状态 offload 到 CPU 或直接释放，腾出的显存用于 vLLM 的 KV-Cache，显著提升生成吞吐量。",
      },
    ],
    heroNote:
      "HybridEngine 让 verl 在单集群上用同一组 GPU 同时完成训练和生成，无需像传统方案那样为 Actor 训练和 Actor 推理分别部署两套模型。参考：https://github.com/volcengine/verl",
  },
];
