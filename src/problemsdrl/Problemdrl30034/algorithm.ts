import { VisualizationStep } from "@/types";

/**
 * Critic & Advantage 计算 — 可视化步骤
 * 使用实际数值演示 TD error 和 GAE 的计算过程
 *
 * 样本数据:
 *   T = 5 tokens
 *   rewards   = [0, 0, 0, 0, 1.0]
 *   gamma     = 1.0
 *   lambda    = 0.95
 *   values    = [0.6, 0.7, 0.8, 0.85, 0.9]  (Critic 输出)
 *   V(T) = 0 (终止状态)
 *
 * TD errors: delta_t = r_t + gamma * V(t+1) - V(t)
 *   delta_0 = 0 + 1.0*0.7  - 0.6  = 0.1
 *   delta_1 = 0 + 1.0*0.8  - 0.7  = 0.1
 *   delta_2 = 0 + 1.0*0.85 - 0.8  = 0.05
 *   delta_3 = 0 + 1.0*0.9  - 0.85 = 0.05
 *   delta_4 = 1 + 1.0*0    - 0.9  = 0.1
 *
 * GAE: A_t = delta_t + gamma * lambda * A_{t+1}  (backward from T-1)
 *   A_4 = 0.1
 *   A_3 = 0.05 + 1.0*0.95*0.1     = 0.145
 *   A_2 = 0.05 + 1.0*0.95*0.145   = 0.18775
 *   A_1 = 0.1  + 1.0*0.95*0.18775 = 0.27836
 *   A_0 = 0.1  + 1.0*0.95*0.27836 = 0.36444
 */
export function generateCriticAdvantageSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const T = 5;
  const rewards = [0, 0, 0, 0, 1.0];
  const gamma = 1.0;
  const lambda = 0.95;
  const values = [0.6, 0.7, 0.8, 0.85, 0.9];

  // Compute TD errors
  const deltas: number[] = [];
  for (let t = 0; t < T; t++) {
    const vNext = t < T - 1 ? values[t + 1] : 0;
    deltas.push(rewards[t] + gamma * vNext - values[t]);
  }

  // Compute GAE advantages (backward)
  const advantages: number[] = new Array(T).fill(0);
  advantages[T - 1] = deltas[T - 1];
  for (let t = T - 2; t >= 0; t--) {
    advantages[t] = deltas[t] + gamma * lambda * advantages[t + 1];
  }

  // Step 1: critic-role
  steps.push({
    id: stepId++,
    description:
      "Critic 的角色：估计每个 token 位置的状态价值 V(s_t)。在 RLHF/PPO 中，状态 s_t 是 prompt + 已生成的前 t 个 token。Critic 是一个独立的模型（通常由 SFT 模型初始化），输出一个标量值表示 \"从当前状态开始，预期能获得多少总奖励\"。",
    data: {},
    variables: {
      phase: "critic-role",
      T,
    },
  });

  // Step 2: value-compute
  steps.push({
    id: stepId++,
    description:
      "Critic 前向传播：将 prompt + response 序列输入 Critic 模型，为每个 token 位置输出一个价值估计。这里 T=5 个 token 位置，Critic 输出 values = [0.6, 0.7, 0.8, 0.85, 0.9]。值越大表示 Critic 认为该位置的 \"前途\" 越好。",
    data: {},
    variables: {
      phase: "value-compute",
      T,
      values,
      tokenPositions: [0, 1, 2, 3, 4],
    },
  });

  // Step 3: reward-signal
  steps.push({
    id: stepId++,
    description:
      "奖励信号（Reward Signal）：在 RLHF 场景中，Reward Model 通常只在序列末尾给出一个分数，中间 token 的奖励为 0。这就是稀疏奖励问题 —— 只有最后一步知道 \"好不好\"，需要 GAE 将这个信号传播回每个 token。rewards = [0, 0, 0, 0, 1.0]",
    data: {},
    variables: {
      phase: "reward-signal",
      T,
      rewards,
    },
  });

  // Step 4: td-error
  steps.push({
    id: stepId++,
    description:
      "TD Error（时序差分误差）：delta_t = r_t + gamma * V(s_{t+1}) - V(s_t)。它衡量 \"实际收到的奖励 + 下一状态的价值\" 与 \"当前状态的价值估计\" 之间的差距。正的 delta 表示比预期好，负的表示比预期差。V(T)=0 因为序列结束后没有未来价值。",
    data: {},
    variables: {
      phase: "td-error",
      T,
      rewards,
      values,
      gamma,
      deltas: deltas.map((d) => Math.round(d * 100000) / 100000),
      // Show computation details for each position
      tdDetails: Array.from({ length: T }, (_, t) => ({
        t,
        r_t: rewards[t],
        V_t: values[t],
        V_next: t < T - 1 ? values[t + 1] : 0,
        delta: Math.round(deltas[t] * 100000) / 100000,
      })),
    },
  });

  // Step 5: gae
  steps.push({
    id: stepId++,
    description:
      "GAE（Generalized Advantage Estimation）：A_t = delta_t + gamma * lambda * A_{t+1}。从后向前递推，将未来的 TD error 以 gamma*lambda 的衰减因子累积到当前位置。lambda=0.95 接近 1，意味着较远的未来 TD error 也会有较大影响。这是 bias-variance trade-off：lambda 越大 variance 越大但 bias 越小。",
    data: {},
    variables: {
      phase: "gae",
      T,
      gamma,
      lambda,
      deltas: deltas.map((d) => Math.round(d * 100000) / 100000),
      advantages: advantages.map((a) => Math.round(a * 100000) / 100000),
      // Show backward computation details
      gaeDetails: Array.from({ length: T }, (_, i) => {
        const t = T - 1 - i; // backward order
        return {
          t,
          delta_t: Math.round(deltas[t] * 100000) / 100000,
          A_next: t < T - 1 ? Math.round(advantages[t + 1] * 100000) / 100000 : 0,
          A_t: Math.round(advantages[t] * 100000) / 100000,
        };
      }),
    },
  });

  // Step 6: ppo-clip
  steps.push({
    id: stepId++,
    description:
      "PPO Clip Loss：L^CLIP = E[min(r_t * A_t, clip(r_t, 1-eps, 1+eps) * A_t)]。其中 r_t = pi_new(a|s) / pi_old(a|s) 是新旧策略的概率比。clip 机制限制策略更新幅度：当 A>0 时 r 不超过 1+eps（防止过度利用好动作）；当 A<0 时 r 不低于 1-eps（防止过度惩罚坏动作）。eps 通常取 0.2。",
    data: {},
    variables: {
      phase: "ppo-clip",
      epsilon: 0.2,
      formula: "L = E[min(r * A, clip(r, 1-eps, 1+eps) * A)]",
      ratioFormula: "r = pi_new(a|s) / pi_old(a|s)",
    },
  });

  // Step 7: critic-update
  steps.push({
    id: stepId++,
    description:
      "Critic 更新：Value Loss = E[(V_pred - V_target)^2]。V_target = advantages + old_values（即 GAE 优势值 + 旧的价值估计）。Critic 通过最小化该 MSE 损失来提升价值估计的准确性。在 verl 中，Critic 的更新与 Actor 的 PPO 更新交替进行。",
    data: {},
    variables: {
      phase: "critic-update",
      values,
      advantages: advantages.map((a) => Math.round(a * 100000) / 100000),
      vTargets: values.map((v, i) => Math.round((advantages[i] + v) * 100000) / 100000),
      finished: true,
    },
  });

  return steps;
}
