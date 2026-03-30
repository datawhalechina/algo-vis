import { VisualizationStep } from "@/types";

/**
 * Reward Module — 可视化步骤
 * 展示 RLHF / RL 训练中三种奖励机制：Reward Model、Rule-based、Verifiable Rewards
 */
export function generateRewardModuleSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // Step 1: Reward 的角色
  steps.push({
    id: stepId++,
    description:
      "Reward 的角色：在强化学习训练中，Reward 模块负责告诉 Actor「这个 response 有多好」。它是连接「生成质量」与「策略优化」的桥梁——Actor 生成 response，Reward 打分，然后 PPO/GRPO 据此更新策略。",
    data: {},
    variables: {
      phase: "role",
      actor: "Actor",
      action: "生成 response",
      reward: "Reward",
      feedback: "打分 → 策略更新",
    },
  });

  // Step 2: Reward Model 打分
  steps.push({
    id: stepId++,
    description:
      "Reward Model（RM）打分：将 prompt + response 拼接后输入一个专门训练的打分模型，输出一个标量分数（如 0.82）。RM 通常基于人类偏好数据训练——标注员对同一 prompt 的多个 response 排序，模型学习这些偏好。",
    data: {},
    variables: {
      phase: "reward-model",
      prompt: "写一首关于春天的诗",
      response: "春风拂面花自开，细雨润物燕归来。绿柳垂丝映碧水，桃红李白满园栽。",
      score: 0.82,
      trainingData: "人类偏好排序数据",
      modelType: "Bradley-Terry / Pairwise Ranking",
    },
  });

  // Step 3: Rule-based Reward
  steps.push({
    id: stepId++,
    description:
      "Rule-based Reward：用确定性规则直接判断 response 的正确性。数学题：提取最终答案 → 与 ground truth 比较 → 0/1。代码题：在沙箱中运行测试用例 → 通过率作为奖励。规则明确、无需训练，适合有标准答案的场景。",
    data: {},
    variables: {
      phase: "rule-based",
      mathExample: {
        prompt: "3+5=?",
        response: "让我计算一下：3+5=8，答案是 8",
        extracted: "8",
        groundTruth: "8",
        reward: 1.0,
      },
      codeExample: {
        prompt: "实现 fibonacci(n)",
        response: "def fibonacci(n):\n  if n <= 1: return n\n  return fibonacci(n-1) + fibonacci(n-2)",
        testCases: 5,
        passed: 5,
        reward: 1.0,
      },
    },
  });

  // Step 4: Verifiable Rewards
  steps.push({
    id: stepId++,
    description:
      "Verifiable Rewards：结合沙箱执行、格式检查和多维度打分的综合奖励方式。不仅检查最终答案是否正确，还评估推理过程、输出格式、代码风格等多个维度，给出更细粒度的反馈信号。",
    data: {},
    variables: {
      phase: "verifiable",
      prompt: "请用 Python 实现快速排序，并解释时间复杂度",
      dimensions: [
        { name: "正确性", score: 1.0, weight: 0.4, detail: "代码通过全部测试用例" },
        { name: "格式", score: 0.8, weight: 0.2, detail: "有代码块但缺少类型注解" },
        { name: "推理过程", score: 0.6, weight: 0.2, detail: "解释了平均情况，未分析最坏情况" },
        { name: "代码风格", score: 0.9, weight: 0.2, detail: "命名规范，有注释" },
      ],
      finalScore: 0.84,
    },
  });

  // Step 5: 三种方式对比
  steps.push({
    id: stepId++,
    description:
      "三种 Reward 方式对比：Reward Model 适合开放域、主观评价场景，但需要大量标注数据且可能被 hack；Rule-based 简单高效但只适用于有明确答案的题目；Verifiable Rewards 兼顾准确性和细粒度，但实现复杂度更高。",
    data: {},
    variables: {
      phase: "comparison",
      types: [
        {
          name: "Reward Model",
          accuracy: "中等（可能被 hack）",
          useCases: "对话、写作、创意生成",
          computeCost: "高（需推理 RM）",
          scalability: "需持续标注更新",
          pros: "通用性强，可处理主观评价",
          cons: "reward hacking、标注成本高",
        },
        {
          name: "Rule-based",
          accuracy: "高（确定性规则）",
          useCases: "数学、代码、事实问答",
          computeCost: "低（规则匹配）",
          scalability: "规则扩展有限",
          pros: "简单可靠，无需训练",
          cons: "仅限有标准答案的场景",
        },
        {
          name: "Verifiable",
          accuracy: "高（多维验证）",
          useCases: "代码生成、复杂推理",
          computeCost: "中（沙箱执行）",
          scalability: "可灵活扩展维度",
          pros: "细粒度反馈，抗 hack",
          cons: "实现复杂，需设计评分维度",
        },
      ],
    },
  });

  // Step 6: 总结
  steps.push({
    id: stepId++,
    description:
      "总结与选择建议：如果任务有明确答案（数学/代码），优先使用 Rule-based 或 Verifiable Rewards，它们更准确且不易被 hack。如果是开放域生成任务（对话/写作），使用 Reward Model。实际项目中常混合使用多种 Reward，verl 支持灵活配置不同的 Reward 函数。",
    data: {},
    variables: {
      phase: "summary",
      finished: true,
      recommendations: [
        { scenario: "数学/逻辑推理", recommended: "Rule-based" },
        { scenario: "代码生成", recommended: "Verifiable Rewards" },
        { scenario: "对话/写作", recommended: "Reward Model" },
        { scenario: "混合任务", recommended: "多种组合" },
      ],
    },
  });

  return steps;
}
