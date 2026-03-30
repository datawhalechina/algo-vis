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
      "verl 的 Single-Controller 设计：一个 Driver 进程统一持有训练循环的控制逻辑（如 PPO 的 6 步流程），所有 Worker 只负责执行计算任务。算法逻辑集中在 Controller，像写单机代码一样简单。",
    data: {},
    variables: { phase: "single-controller", workers: [0, 1, 2, 3] },
  });

  steps.push({
    id: stepId++,
    description:
      "RayWorkerGroup：Controller 通过 Ray 框架管理一组 GPU Worker。每个 WorkerGroup 对应一类角色（如 ActorRolloutRefWorker、CriticWorker、RewardWorker）。Controller 调用 WorkerGroup 的方法就像调用本地函数。",
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
      "ONE_TO_ALL 调度模式：Controller 将同一条指令广播给 WorkerGroup 中的所有 Worker。典型场景：init_model()（所有 Worker 加载模型）、save_checkpoint()（所有 Worker 保存参数）。",
    data: {},
    variables: {
      phase: "one-to-all",
      workers: [0, 1, 2, 3],
      dispatchMode: "ONE_TO_ALL",
      message: "init_model()",
      activeWorkers: [0, 1, 2, 3],
    },
  });

  steps.push({
    id: stepId++,
    description:
      "DP_COMPUTE_PROTO 调度模式：Controller 将数据按 Data Parallel 维度分片，每个 Worker 只接收 1/N 的数据。典型场景：generate_sequences()（每个 Worker 生成一部分 response）、compute_log_prob()。",
    data: {},
    variables: {
      phase: "dp-compute",
      workers: [0, 1, 2, 3],
      dispatchMode: "DP_COMPUTE_PROTO",
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
      "DataProto 数据容器：verl 中所有组件间传递的数据都封装在 DataProto 中。它包含多个命名张量（如 input_ids、attention_mask、log_probs、values），支持按 batch 维度自动切分和合并。DataProto 是 Controller 与 Worker 之间的统一数据接口。",
    data: {},
    variables: {
      phase: "dataproto",
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
      "完整调度流程：Controller 调用 actor_wg.generate_sequences(prompts) → DP_COMPUTE_PROTO 分发 → 4 个 Worker 各生成 1/4 batch → 结果自动收集合并 → Controller 拿到完整的 DataProto 继续下一步。整个过程对用户透明，算法代码无需关心分布式细节。",
    data: {},
    variables: {
      phase: "full-flow",
      workers: [0, 1, 2, 3],
      finished: true,
    },
  });

  return steps;
}
