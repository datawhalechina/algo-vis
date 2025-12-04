import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const reshapeTransposeProblems: CudaProblem[] = [
    {
        id: 601,
        slug: "transpose",
        title: "Transpose",
        category: CudaCategory.RESHAPE_TRANSPOSE,
        difficulty: Difficulty.MEDIUM,
        description: "矩阵转置。",
        learningGoals: [
            "理解非合并写入 (Uncoalesced Write) 的性能惩罚",
            "利用 Shared Memory 解决 Bank Conflict",
        ],
        inputs: [
            "Input: M x N 矩阵",
        ],
        outputs: [
            "Output: N x M 转置矩阵",
        ],
        examples: [
            {
                input: "[[1, 2], [3, 4]]",
                output: "[[1, 3], [2, 4]]",
            },
        ],
        visualizationFocus: ["非合并写入 (Uncoalesced Write)", "Shared Memory 避免 Bank Conflict"],
        tags: ["维度变换", "Memory Bound"],
    },
    {
        id: 602,
        slug: "gather-scatter",
        title: "Gather / Scatter",
        category: CudaCategory.RESHAPE_TRANSPOSE,
        difficulty: Difficulty.MEDIUM,
        description: "根据索引进行非连续读写。",
        learningGoals: [
            "理解随机内存访问的性能瓶颈",
            "分析缓存命中率",
        ],
        inputs: [
            "Source: 源数组",
            "Indices: 索引数组",
        ],
        outputs: [
            "Destination: 目标数组",
        ],
        examples: [
            {
                input: "Src=[10, 20, 30], Idx=[2, 0]",
                output: "Dst=[30, 10]",
            },
        ],
        visualizationFocus: ["随机内存访问", "缓存命中率"],
        tags: ["稀疏操作", "Memory Bound"],
    },
];
