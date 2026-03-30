import { VisualizationStep } from "@/types";

/**
 * PPO Training Loop — 可视化步骤
 *
 * 展示 verl 中 PPO 训练循环的完整 6 阶段流程，
 * 包括 GAE 优势计算的数值示例。
 */
export function generatePPOTrainingLoopSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // ---- Step 0: Prompt ----
  steps.push({
    id: stepId++,
    description:
      "一批 prompt 进入 PPO 训练循环。Controller 从数据集中采样一个 batch 的 prompt，封装为 DataProto，准备开始一次完整的 PPO 迭代。",
    data: {},
    variables: {
      phase: "prompt",
      prompts: ["Explain quantum computing", "Write a poem about AI", "Solve x^2 = 4"],
      batchSize: 3,
    },
  });

  // ---- Step 1: Generate Sequences ----
  steps.push({
    id: stepId++,
    description:
      "Actor（Rollout 模式）对每条 prompt 自回归生成 response token 序列。使用 vLLM 等推理引擎加速生成。生成结果包含完整的 prompt+response 序列。",
    data: {},
    variables: {
      phase: "generate",
      component: "Actor / Rollout",
      input: "prompts (DataProto)",
      output: "sequences = prompt + response tokens",
      example: {
        prompt: "Explain quantum computing",
        response: "Quantum computing uses qubits that can exist in superposition...",
      },
    },
  });

  // ---- Step 2: Compute Actor Log Prob ----
  steps.push({
    id: stepId++,
    description:
      "Actor 切换到 training 模式，对生成的完整序列重新做一次 forward pass，计算每个 token 的对数概率 log π_θ(a|s)。这些 log prob 将用于计算 PPO 的重要性采样比率 ratio = π_θ / π_old。",
    data: {},
    variables: {
      phase: "actor-logprob",
      component: "Actor (Training Mode)",
      input: "sequences [B, T]",
      output: "log_probs [B, T]",
      exampleLogProbs: [-0.5, -1.2, -0.3, -0.8, -0.6],
    },
  });

  // ---- Step 3: Compute Ref Log Prob ----
  steps.push({
    id: stepId++,
    description:
      "Reference 模型（冻结的初始 SFT 模型）对相同序列计算 log prob。Ref log prob 用于计算 KL 散度惩罚，防止 Actor 偏离原始策略太远，保持训练稳定性。",
    data: {},
    variables: {
      phase: "ref-logprob",
      component: "Reference Model (Frozen)",
      input: "sequences [B, T]",
      output: "ref_log_probs [B, T]",
      exampleRefLogProbs: [-0.6, -1.0, -0.4, -0.9, -0.7],
      klFormula: "KL = exp(log_prob - ref_log_prob) - (log_prob - ref_log_prob) - 1",
    },
  });

  // ---- Step 4: Compute Values & Rewards ----
  steps.push({
    id: stepId++,
    description:
      "Critic 模型对序列中每个 token 位置估计状态价值 V(s)。Reward 模块（可以是 Reward Model 或规则函数）对完整 response 打分。通常只有序列末尾有非零 reward。",
    data: {},
    variables: {
      phase: "values-rewards",
      criticComponent: "Critic Model",
      rewardComponent: "Reward Model / Rule-based",
      criticInput: "sequences [B, T]",
      criticOutput: "values [B, T]",
      rewardInput: "sequences [B, T]",
      rewardOutput: "rewards [B, T] (sparse, mostly 0)",
      exampleValues: [0.6, 0.7, 0.8, 0.85, 0.9],
      exampleRewards: [0, 0, 0, 0, 1.0],
    },
  });

  // ---- Step 5: Compute Advantages via GAE ----
  // Actually compute GAE numerically
  const rewards = [0, 0, 0, 0, 1.0];
  const values = [0.6, 0.7, 0.8, 0.85, 0.9];
  const gamma = 1.0;
  const lambda = 0.95;
  const T = rewards.length;

  // TD errors: delta_t = r_t + gamma * V(t+1) - V(t), with V(T) = 0
  const tdErrors: number[] = [];
  for (let t = 0; t < T; t++) {
    const nextValue = t < T - 1 ? values[t + 1] : 0;
    const delta = rewards[t] + gamma * nextValue - values[t];
    tdErrors.push(parseFloat(delta.toFixed(4)));
  }

  // GAE advantages: A_t = sum_{l=0}^{T-t-1} (gamma*lambda)^l * delta_{t+l}
  const advantages: number[] = new Array(T).fill(0);
  let gae = 0;
  for (let t = T - 1; t >= 0; t--) {
    gae = tdErrors[t] + gamma * lambda * gae;
    advantages[t] = parseFloat(gae.toFixed(4));
  }

  steps.push({
    id: stepId++,
    description:
      "Controller 使用 GAE (Generalized Advantage Estimation) 计算优势函数。先算 TD error: δ_t = r_t + γ·V(t+1) − V(t)，再反向累积: A_t = Σ (γλ)^l · δ_{t+l}。γ=1.0, λ=0.95。优势值衡量某个 action 比平均水平好多少。",
    data: {},
    variables: {
      phase: "advantages",
      component: "Controller (CPU)",
      gamma,
      lambda,
      rewards,
      values,
      tdErrors,
      advantages,
      gaeFormula: "A_t = delta_t + (gamma * lambda) * A_{t+1}",
      tdFormula: "delta_t = r_t + gamma * V(t+1) - V(t)",
    },
  });

  // ---- Step 6: Update Actor with PPO Clip Loss ----
  steps.push({
    id: stepId++,
    description:
      "Actor 使用 PPO clip 目标函数更新参数。计算 ratio = π_θ(a|s) / π_old(a|s)，clip 到 [1-ε, 1+ε] 范围（通常 ε=0.2），取 min 保证保守更新。这是 PPO 的核心：既利用优势信号改进策略，又限制更新幅度。",
    data: {},
    variables: {
      phase: "actor-update",
      component: "Actor (Training Mode)",
      clipEpsilon: 0.2,
      lossFormula:
        "L_clip = -E[ min( ratio * A, clip(ratio, 1-eps, 1+eps) * A ) ]",
      ratioFormula: "ratio = exp(log_prob - old_log_prob)",
      exampleRatio: 1.15,
      exampleAdvantage: 0.5,
      exampleClipped: 1.15,
      exampleUnclipped: 1.15 * 0.5,
      exampleClippedLoss: 1.15 * 0.5,
      clipRange: "[0.8, 1.2]",
    },
  });

  // ---- Step 7: Update Critic with Value Loss ----
  steps.push({
    id: stepId++,
    description:
      "Critic 使用 value loss 更新参数，使 V(s) 更准确地预测回报。同样可以使用 clip 限制更新幅度。Critic 的目标是 GAE 计算出的 returns = advantages + values。",
    data: {},
    variables: {
      phase: "critic-update",
      component: "Critic Model",
      lossFormula: "L_value = E[ max( (V - returns)^2, (clip(V, V_old-eps, V_old+eps) - returns)^2 ) ]",
      returnsFormula: "returns = advantages + old_values",
      exampleOldValue: 0.7,
      exampleNewValue: 0.75,
      exampleReturn: 0.9,
      exampleLoss: (0.75 - 0.9) ** 2,
    },
  });

  // ---- Step 8: Loop back ----
  steps.push({
    id: stepId++,
    description:
      "一次 PPO 迭代完成！Actor 和 Critic 都已更新。Controller 进入下一个 iteration：采样新的 prompt batch，重复整个流程。通常训练数百到数千个 iteration 直到收敛。",
    data: {},
    variables: {
      phase: "loop",
      finished: true,
      iterationFlow: [
        "prompt",
        "generate",
        "actor-logprob",
        "ref-logprob",
        "values-rewards",
        "advantages",
        "actor-update",
        "critic-update",
      ],
    },
  });

  return steps;
}
