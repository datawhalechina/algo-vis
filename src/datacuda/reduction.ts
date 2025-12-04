import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const reductionProblems: CudaProblem[] = [
    {
        id: 201,
        slug: "sum-reduction",
        title: "Sum Reduction",
        category: CudaCategory.REDUCTION,
        difficulty: Difficulty.MEDIUM,
        description: "计算数组元素之和，涉及线程间通信。",
        learningGoals: [
            "理解并行归约算法",
            "掌握 Shared Memory 的使用",
            "避免 Bank Conflict",
        ],
        inputs: [
            "Input: 输入数组",
        ],
        outputs: [
            "Sum: 所有元素的和",
        ],
        examples: [
            {
                input: "[1, 2, 3, 4]",
                output: "10",
            },
        ],
        visualizationFocus: ["树状归约结构", "Shared Memory Bank Conflict", "Warp Shuffle"],
        tags: ["基础统计", "Shared Memory"],
    },
    {
        id: 202,
        slug: "max-min-reduction",
        title: "Max / Min Reduction",
        category: CudaCategory.REDUCTION,
        difficulty: Difficulty.MEDIUM,
        description: "查找最大值或最小值。",
        learningGoals: [
            "掌握 Warp Shuffle 指令",
            "理解 Block 级归约与 Grid 级归约",
        ],
        inputs: [
            "Input: 输入数组",
        ],
        outputs: [
            "Max/Min: 最大值或最小值",
        ],
        examples: [
            {
                input: "[1, 5, 2, 8]",
                output: "Max: 8",
            },
        ],
        visualizationFocus: ["树状归约结构", "Warp Shuffle"],
        tags: ["基础统计", "Shared Memory"],
    },
    {
        id: 203,
        slug: "l2-norm",
        title: "L2 Norm",
        category: CudaCategory.REDUCTION,
        difficulty: Difficulty.MEDIUM,
        description: "欧几里得范数计算。",
        learningGoals: [
            "理解平方和归约",
            "掌握数值稳定性处理",
        ],
        inputs: [
            "Vector: 输入向量",
        ],
        outputs: [
            "Norm: L2 范数",
        ],
        examples: [
            {
                input: "[3, 4]",
                output: "5",
            },
        ],
        visualizationFocus: ["平方和归约", "数值稳定性"],
        tags: ["范数计算", "Shared Memory"],
    },
];
