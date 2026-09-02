import { VisualizationStep } from "@/types";

/**
 * Single-Controller 调度架构 — 可视化步骤
 */
export function generateSingleControllerSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description:
      "传统 Multi-Controller 方式：每个 Worker 都有独立的控制逻辑，Worker 之间需要复杂的通信协调。代码编写和调试都非常困难，且算法逻辑与计算后端紧耦合。",
    data: {},
    variables: { phase: "multi-controller", workers: [0, 1, 2, 3] },
  });

  steps.push({
    id: stepId++,
    description:
      "集中式编排设计由一个 Driver 进程统一持有训练循环的控制逻辑（如 PPO 的 6 步流程），所有 Worker 只负责执行计算任务。算法逻辑集中在 Controller，读起来接近单机流程。",
    data: {},
    variables: { phase: "single-controller", workers: [0, 1, 2, 3] },
  });

  steps.push({
    id: stepId++,
    description:
      "Worker Group：Controller 通过分布式运行时管理一组 GPU Worker。每个 Worker Group 对应一类角色（如 Actor、Critic、Reward）。Controller 通过统一接口发起远程计算。",
    data: {},
    variables: {
      phase: "worker-group",
      workers: [0, 1, 2, 3],
      groups: ["ActorRolloutRef", "Critic", "Reward"],
    },
  });

  steps.push({
    id: stepId++,
    description:
      "广播调度：Controller 将同一条指令发送给 Worker Group 中的所有 Worker。典型场景包括让所有 Worker 加载模型或共同保存参数。",
    data: {},
    variables: {
      phase: "one-to-all",
      workers: [0, 1, 2, 3],
      dispatchMode: "BROADCAST",
      message: "init_model()",
      activeWorkers: [0, 1, 2, 3],
    },
  });

  steps.push({
    id: stepId++,
    description:
      "数据并行调度：Controller 沿 batch 维度切分数据，每个 Worker 只接收 $1/N$。典型场景包括并行生成序列和计算 token 概率。",
    data: {},
    variables: {
      phase: "dp-compute",
      workers: [0, 1, 2, 3],
      dispatchMode: "DATA_PARALLEL",
      batches: [
        { worker: 0, data: "batch[0:2]" },
        { worker: 1, data: "batch[2:4]" },
        { worker: 2, data: "batch[4:6]" },
        { worker: 3, data: "batch[6:8]" },
      ],
    },
  });

  steps.push({
    id: stepId++,
    description:
      "结构化批数据容器保存 input_ids、attention_mask、log_probs、values 等命名张量，并支持沿 batch 维度切分和合并。它是 Controller 与 Worker 之间的统一数据接口。",
    data: {},
    variables: {
      phase: "batch-payload",
      fields: [
        { name: "input_ids", shape: "[B, T]", desc: "token ID 序列" },
        { name: "attention_mask", shape: "[B, T]", desc: "注意力掩码" },
        { name: "log_probs", shape: "[B, T]", desc: "对数概率" },
        { name: "values", shape: "[B, T]", desc: "状态价值" },
        { name: "rewards", shape: "[B]", desc: "奖励分数" },
      ],
    },
  });

  steps.push({
    id: stepId++,
    description:
      "完整调度流程：Controller 发起生成调用 → 数据并行分发 → 4 个 Worker 各生成 $1/4$ batch → 结果按原顺序聚合 → Controller 携带完整批数据进入下一阶段。算法代码无需处理底层通信细节。",
    data: {},
    variables: {
      phase: "full-flow",
      workers: [0, 1, 2, 3],
      finished: true,
    },
  });

  return steps;
}
