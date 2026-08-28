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
        title: "Gather / ScatterAdd",
        category: CudaCategory.RESHAPE_TRANSPOSE,
        difficulty: Difficulty.MEDIUM,
        description: "根据索引进行非连续读写；重复 Scatter 索引固定采用整型求和语义。",
        learningGoals: [
            "理解随机内存访问的性能瓶颈",
            "分析缓存命中率",
            "用 atomicAdd 实现确定的重复索引求和语义",
        ],
        inputs: [
            "Source: 源数组",
            "GatherIndices / ScatterIndices: 索引数组",
            "DestinationSize: ScatterAdd 目标长度",
        ],
        outputs: [
            "GatherOutput: 按索引读取的结果",
            "ScatterOutput: 清零后按索引累加的整型结果",
        ],
        examples: [
            {
                input: "Gather: Src=[10, 20, 30], Idx=[2, 0]",
                output: "Dst=[30, 10]",
            },
            {
                input: "ScatterAdd: Src=[10, 20, 30], Idx=[1, 1, 0], DestinationSize=3",
                output: "Dst=[30, 30, 0]",
                explanation: "两个指向下标 1 的值通过 atomicAdd 相加，不采用不确定的覆盖顺序。",
            },
        ],
        visualizationFocus: ["随机内存访问", "缓存命中率", "重复索引的整型原子求和"],
        tags: ["稀疏操作", "Memory Bound", "Atomic"],
    },
];
