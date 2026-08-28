import { VisualizationStep } from "@/types";

/**
 * 分布式 LLM 强化学习系统全景 — 可视化步骤生成
 * 展示整体架构：输入 → 5 大组件 → 数据流 → 输出
 */
export function generateDistributedRLOverviewSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // Step 1: 输入
  steps.push({
    id: stepId++,
    description:
      "分布式 LLM 强化学习的输入由两部分组成：① Prompts 数据集（问题或指令集合）② Pretrained LLM（预训练或 SFT 后的语言模型）。它们是整个训练流水线的起点。",
    data: {},
    variables: {
      phase: "input",
      activeComponents: [] as string[],
      activeArrows: [] as string[],
    },
  });

  // Step 2: 展示 5 大组件
  steps.push({
    id: stepId++,
    description:
      "通用系统由 5 类计算角色构成：Actor（策略模型）、Rollout（推理引擎）、Reference（参考模型）、Reward（奖励模块）与 Critic（价值网络）。它们由集中式控制面统一编排。",
    data: {},
    variables: {
      phase: "components",
      activeComponents: ["actor", "rollout", "reference", "reward", "critic", "controller"],
      activeArrows: [] as string[],
    },
  });

  // Step 3: Rollout 生成
  steps.push({
    id: stepId++,
    description:
      "第一步：Rollout 生成。Controller 将 prompt batch 发送给 Actor/Rollout 组件，Rollout 引擎（vLLM/SGLang）驱动 Actor 对每个 prompt 自回归生成 response。生成结果包含 response tokens 和初始 log probabilities。",
    data: {},
    variables: {
      phase: "rollout",
      activeComponents: ["controller", "actor", "rollout"],
      activeArrows: ["controller-to-actor", "actor-to-rollout"],
      currentStep: 1,
    },
  });

  // Step 4: Reference & Reward 计算
  steps.push({
    id: stepId++,
    description:
      "第二步：评估阶段。生成的 (prompt, response) 对被同时发送到 Reference 模型和 Reward 模块。Reference 计算基准 log_prob（用于 KL 约束），Reward 计算奖励分数（告诉 Actor 回答有多好）。这两个计算互相独立，可以并行执行。",
    data: {},
    variables: {
      phase: "evaluate",
      activeComponents: ["controller", "reference", "reward"],
      activeArrows: ["controller-to-reference", "controller-to-reward"],
      currentStep: 2,
    },
  });

  // Step 5: Critic & Advantage
  steps.push({
    id: stepId++,
    description:
      "第三步：价值估计与优势计算。Critic 对完整序列计算每个 token 的状态价值 V(s)。Controller 收集 values 和 rewards 后用 GAE（Generalized Advantage Estimation）算法计算优势值 A(s,a)——这一步直接在 Controller 本地完成，无需分布式通信。",
    data: {},
    variables: {
      phase: "advantage",
      activeComponents: ["controller", "critic"],
      activeArrows: ["controller-to-critic", "critic-to-controller"],
      currentStep: 3,
    },
  });

  // Step 6: Actor & Critic 更新
  steps.push({
    id: stepId++,
    description:
      "第四步：模型更新。Actor 用 PPO clip loss（基于 advantages 和 log_prob ratio）更新策略参数 θ。Critic 用 value loss（预测值与实际回报的 MSE）更新价值网络参数 φ。更新后开始下一个 iteration。",
    data: {},
    variables: {
      phase: "update",
      activeComponents: ["controller", "actor", "critic"],
      activeArrows: ["controller-to-actor", "controller-to-critic"],
      currentStep: 4,
    },
  });

  // Step 7: 输出
  steps.push({
    id: stepId++,
    description:
      "经过多轮迭代后，Actor 策略逐渐优化，最终得到对齐后的模型。混合执行引擎可让 Actor 在训练态和生成态之间重排参数布局；控制面只需替换目标计算，就能承载 PPO、GRPO、RLOO 等不同算法。",
    data: {},
    variables: {
      phase: "output",
      activeComponents: ["actor"],
      activeArrows: [] as string[],
      currentStep: 5,
      finished: true,
    },
  });

  return steps;
}
