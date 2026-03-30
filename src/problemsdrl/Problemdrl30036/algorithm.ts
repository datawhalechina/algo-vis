import { VisualizationStep } from "@/types";

/**
 * HybridEngine 3D Resharding — 可视化步骤
 * 展示 verl 中 FSDP ↔ TP 的动态切换机制，实现训练与生成共享模型权重
 */
export function generateHybridEngineSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // Step 1: 为什么需要 HybridEngine
  steps.push({
    id: stepId++,
    description:
      "为什么需要 HybridEngine？训练阶段需要梯度和优化器状态（适合 FSDP），生成阶段需要完整权重和 KV-Cache（适合 TP）。如果分别部署训练和生成的模型副本，需要 2 倍模型权重的显存，造成巨大的内存浪费。HybridEngine 通过在训练和生成之间动态切换并行策略（3D Resharding），实现同一份权重的复用。",
    data: {},
    variables: {
      phase: "problem",
      trainingNeeds: ["梯度 (Gradients)", "优化器状态 (Adam m, v)", "FSDP 参数分片"],
      generationNeeds: ["完整层权重", "KV-Cache 空间", "Tensor Parallel 低延迟"],
      wasteWithout: "2x 模型权重 = 巨大的显存浪费",
    },
  });

  // Step 2: FSDP 训练模式
  steps.push({
    id: stepId++,
    description:
      "训练模式的内存布局（FSDP）：Fully Sharded Data Parallel 将模型参数均匀分片到 N 个 GPU。每个 GPU 只持有 1/N 的参数，但需要额外存储对应的优化器状态（Adam 的 m 和 v）和梯度。前向/反向时通过 all-gather 临时收集完整参数。",
    data: {},
    variables: {
      phase: "fsdp",
      gpus: 4,
      memoryPerGpu: {
        params: "1.75B",
        optimizer: "3.5B",
        gradients: "1.75B",
        total: "7.0B",
      },
      parallelism: "FSDP (ZeRO-3)",
      communication: "all-gather → compute → reduce-scatter",
    },
  });

  // Step 3: TP 生成模式
  steps.push({
    id: stepId++,
    description:
      "生成模式的内存布局（Tensor Parallel）：每个 GPU 持有完整层但按列/行切分权重矩阵。推理时无需 all-gather 完整参数，只需 all-reduce 中间结果，延迟更低。显存中不需要优化器状态和梯度，腾出空间给 KV-Cache。",
    data: {},
    variables: {
      phase: "tp",
      gpus: 4,
      memoryPerGpu: {
        params: "1.75B",
        kvCache: "2.0B",
        total: "3.75B",
      },
      parallelism: "Tensor Parallel",
      communication: "all-reduce（中间结果）",
    },
  });

  // Step 4: FSDP → TP Resharding
  steps.push({
    id: stepId++,
    description:
      "Resharding: FSDP → TP。当从训练切换到生成时：(1) 通过 all-gather 收集完整参数；(2) 按 TP 切分方式重新分配到各 GPU；(3) 释放优化器状态和梯度，腾出显存给 KV-Cache。整个过程在 GPU 间高效完成，无需落盘。",
    data: {},
    variables: {
      phase: "train-to-generate",
      step: "resharding",
      direction: "train→generate",
      gpus: 4,
      operations: [
        "all-gather 收集完整参数",
        "按 TP 维度重新切分",
        "释放 optimizer states",
        "释放 gradients",
        "分配 KV-Cache 空间",
      ],
    },
  });

  // Step 5: TP → FSDP Resharding
  steps.push({
    id: stepId++,
    description:
      "Resharding: TP → FSDP。生成完成后切换回训练模式：(1) 按 FSDP 分片方式重新分配参数；(2) 恢复优化器状态（从 CPU offload 或重新计算）；(3) 释放 KV-Cache 空间，为梯度计算腾出显存。",
    data: {},
    variables: {
      phase: "generate-to-train",
      step: "resharding",
      direction: "generate→train",
      gpus: 4,
      operations: [
        "按 FSDP 维度重新分片参数",
        "恢复 optimizer states (m, v)",
        "释放 KV-Cache",
        "分配 gradient buffer",
      ],
    },
  });

  // Step 6: 性能收益
  steps.push({
    id: stepId++,
    description:
      "性能收益：HybridEngine 通过共享模型权重，节省约 50% 的显存占用。同时由于 TP 在生成阶段的低延迟优势，端到端吞吐量提升约 1.4 倍。这使得在相同硬件上可以训练更大的模型或使用更大的 batch size。",
    data: {},
    variables: {
      phase: "performance",
      finished: true,
      memorySaving: "~50%",
      throughputGain: "1.4x",
      comparison: {
        naive: { memory: 100, throughput: 1.0, label: "Naive (双副本)" },
        hybrid: { memory: 53, throughput: 1.4, label: "HybridEngine" },
      },
      benefits: [
        "显存节省 ~50%，可训练更大模型",
        "生成阶段延迟更低（TP vs FSDP all-gather）",
        "端到端吞吐提升 1.4x",
        "无需额外硬件资源",
      ],
    },
  });

  return steps;
}
