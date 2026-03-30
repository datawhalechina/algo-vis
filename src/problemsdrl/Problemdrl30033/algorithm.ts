import { VisualizationStep } from "@/types";

/**
 * Actor & Rollout (ActorRolloutRefWorker) — 可视化步骤
 * 展示 verl 中 ActorRolloutRefWorker 的双重角色：
 * 1. Rollout: 使用 vLLM 高速生成 response
 * 2. Actor: 重新计算可微分的 log_probs 用于 PPO 训练
 */
export function generateActorRolloutSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // Step 1: dual-role
  steps.push({
    id: stepId++,
    description:
      "ActorRolloutRefWorker 是 verl 中最核心的 Worker，它承担双重角色：作为 Rollout 负责高速生成 response（使用 vLLM），作为 Actor 负责计算可微分的 log_probs 用于 PPO 策略梯度更新。两个角色共享同一套模型权重。",
    data: {},
    variables: {
      phase: "dual-role",
      roles: ["Rollout (生成)", "Actor (训练)"],
      sharedWeights: true,
    },
  });

  // Step 2: prompt-prep
  steps.push({
    id: stepId++,
    description:
      "输入准备：Controller 通过 DP_COMPUTE_PROTO 模式将 DataProto 分片发送给每个 Worker。DataProto 中包含 input_ids（prompt token 序列）和 attention_mask。每个 Worker 接收 1/N 的 batch 数据。",
    data: {},
    variables: {
      phase: "prompt-prep",
      dataProtoFields: ["input_ids", "attention_mask"],
      exampleInputIds: [8, 42, 15, 7, 3],
      exampleMask: [1, 1, 1, 1, 1],
    },
  });

  // Step 3: autoregressive
  steps.push({
    id: stepId++,
    description:
      "自回归生成（Autoregressive Generation）：Rollout 引擎逐 token 生成 response。每一步将当前序列送入模型，得到下一个 token 的概率分布（logits），然后采样得到下一个 token，追加到序列末尾，重复直到生成 EOS 或达到 max_length。",
    data: {},
    variables: {
      phase: "autoregressive",
      promptTokens: [8, 42, 15, 7, 3],
      generatedTokens: [12, 9, 22, 8],
      currentToken: 8,
      logits: [0.05, 0.02, 0.7, 0.1, 0.13],
      vocabSample: ["the", "a", "end", "is", "..."],
    },
  });

  // Step 4: sampling
  steps.push({
    id: stepId++,
    description:
      "采样策略（Sampling）：从 logits 分布中选择 token 的方式。Temperature 控制分布的平滑度（T→0 趋近 greedy，T→∞ 趋近均匀）；Top-k 只保留概率最高的 k 个 token；Top-p (nucleus) 只保留累积概率达到 p 的最小 token 集合。verl 中这些参数在 generation config 中配置。",
    data: {},
    variables: {
      phase: "sampling",
      strategies: [
        { name: "Temperature", desc: "控制随机性: T=0.7 常用", formula: "p_i = exp(z_i/T) / Σ exp(z_j/T)" },
        { name: "Top-k", desc: "只保留概率最高的 k 个", example: "k=50" },
        { name: "Top-p", desc: "累积概率截断", example: "p=0.9" },
      ],
    },
  });

  // Step 5: vllm
  steps.push({
    id: stepId++,
    description:
      "vLLM 加速引擎：verl 使用 vLLM 作为 Rollout 后端，获得极高的生成吞吐量。核心优化包括：(1) KV-Cache —— 缓存已计算的 Key/Value，避免重复计算前缀；(2) Continuous Batching —— 动态合并不同长度的请求，GPU 利用率接近 100%。比朴素 HuggingFace generate 快 10-20x。",
    data: {},
    variables: {
      phase: "vllm",
      optimizations: [
        {
          name: "KV-Cache",
          desc: "缓存历史 token 的 Key/Value 矩阵",
          benefit: "生成第 t 个 token 时只需计算 1 个位置，而非重算全部 t 个",
        },
        {
          name: "Continuous Batching",
          desc: "请求完成即释放，新请求动态加入",
          benefit: "无需等最长序列完成，GPU 利用率近 100%",
        },
      ],
    },
  });

  // Step 6: logprob-recompute
  steps.push({
    id: stepId++,
    description:
      "Log-prob 重计算（两次前向传播）：vLLM 生成时不保留 PyTorch 计算图（为了速度和显存），因此 log_probs 不可微分。Actor 需要用生成好的 response_ids 做一次完整的前向传播，得到可微分的 log_probs，才能用于 PPO 的策略梯度 ∇log π(a|s) · A(s,a)。这是 \"两次前向\" 的设计：vLLM forward (快, no grad) → Actor forward (慢, with grad)。",
    data: {},
    variables: {
      phase: "logprob-recompute",
      twoPass: [
        { name: "vLLM Forward", speed: "快", grad: false, purpose: "生成 response tokens" },
        { name: "Actor Forward", speed: "慢", grad: true, purpose: "计算可微分 log_probs" },
      ],
    },
  });

  // Step 7: output
  steps.push({
    id: stepId++,
    description:
      "输出结果：ActorRolloutRefWorker 将生成的 response_ids、Actor 重计算得到的 log_probs、以及 attention_mask 打包进 DataProto 返回给 Controller。Controller 收集所有 Worker 的结果后合并，传递给下一个阶段（Critic / Reward）。",
    data: {},
    variables: {
      phase: "output",
      outputFields: [
        { name: "response_ids", desc: "生成的 token 序列" },
        { name: "log_probs", desc: "可微分的对数概率" },
        { name: "attention_mask", desc: "注意力掩码（含 prompt + response）" },
      ],
      finished: true,
    },
  });

  return steps;
}
