import type { ProblemCoreIdeaConfig } from "./problemCoreIdeas";
import type { VectorAddInput } from "@/problemscuda/VectorAdd/algorithm";

/**
 * CUDA 题目核心思想
 */
export const cudaProblemCoreIdeas: Record<number, ProblemCoreIdeaConfig> = {
  101: {
    idea: "让每个线程只处理一个元素，依据 blockIdx.x · blockDim.x + threadIdx.x 计算全局索引，从全局内存连续读取 A[i]、B[i] 后写回 C[i]，并在越界前及时返回。",
    color: "blue",
    features: [
      "Grid-Block-Thread 计算全局 idx",
      "合并访问保证带宽利用率",
      "写回前进行越界检查",
    ],
  },
};

const vectorAddModeCoreIdeas: Record<
  VectorAddInput["optimizationLevel"],
  ProblemCoreIdeaConfig
> = {
  baseline: {
    idea: "One Thread Per Element：最基础的 CUDA 模式。为数组中的每个元素分配一个线程。当 N 很大时，需要大量 Blocks。",
    color: "blue",
    features: ["逻辑简单", "适合小规模数据", "边界检查必要"],
  },
  "grid-stride": {
    idea: "Grid-Stride Loops：解耦 Grid 大小与数据规模。线程通过 stride 循环处理多个元素，复用度更高。",
    color: "green",
    features: ["提高复用性", "减少 Grid 启动开销", "适应任意 N"],
  },
  vectorized: {
    idea: "Vectorized Memory Access：使用 float4 向量化读写，一次加载 / 写回 4 个 float，减少指令数并提升带宽利用率。",
    color: "purple",
    features: ["提高带宽利用率", "减少指令数", "需要数据对齐"],
  },
};

/**
 * 根据 CUDA 题目 ID 获取核心思想
 */
export function getCudaProblemCoreIdea(
  problemId: number
): ProblemCoreIdeaConfig | undefined {
  return cudaProblemCoreIdeas[problemId];
}

export function getVectorAddCoreIdea(
  mode: VectorAddInput["optimizationLevel"]
): ProblemCoreIdeaConfig | undefined {
  const problemIdea = getCudaProblemCoreIdea(101);
  const modeIdea = vectorAddModeCoreIdeas[mode];
  if (!problemIdea && !modeIdea) {
    return undefined;
  }

  return {
    idea: [problemIdea?.idea, modeIdea?.idea].filter(Boolean).join(" "),
    color: modeIdea?.color || problemIdea?.color || "blue",
    features: [...(problemIdea?.features ?? []), ...(modeIdea?.features ?? [])],
  };
}
