import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const scanSortProblems: CudaProblem[] = [
    {
        id: 301,
        slug: "inclusive-scan",
        title: "Inclusive Scan",
        category: CudaCategory.SCAN_SORT,
        difficulty: Difficulty.HARD,
        description: "包含当前元素的累加前缀和。",
        learningGoals: [
            "理解 Hillis-Steele 和 Blelloch 算法",
            "掌握 Block 间的数据传递与同步",
        ],
        inputs: [
            "Input: 输入数组",
        ],
        outputs: [
            "Output: 前缀和数组",
        ],
        examples: [
            {
                input: "[1, 2, 3, 4]",
                output: "[1, 3, 6, 10]",
            },
        ],
        visualizationFocus: ["Hillis-Steele 算法", "Blelloch 算法", "Block 间数据接力"],
        tags: ["前缀和", "Data Dependency"],
    },
    {
        id: 302,
        slug: "radix-sort",
        title: "Radix Sort",
        category: CudaCategory.SCAN_SORT,
        difficulty: Difficulty.HARD,
        description: "基数排序，GPU 上最高效的排序算法之一。",
        learningGoals: [
            "理解基于位的排序原理",
            "掌握直方图统计与前缀和的结合",
        ],
        inputs: [
            "Input: 无序数组",
        ],
        outputs: [
            "Output: 有序数组",
        ],
        examples: [
            {
                input: "[3, 1, 4, 2]",
                output: "[1, 2, 3, 4]",
            },
        ],
        visualizationFocus: ["位操作", "直方图统计", "前缀和重排"],
        tags: ["排序", "Compute Bound"],
    },
    {
        id: 303,
        slug: "histogram",
        title: "Histogram",
        category: CudaCategory.SCAN_SORT,
        difficulty: Difficulty.MEDIUM,
        description: "直方图统计。",
        learningGoals: [
            "理解原子操作的性能影响",
            "掌握 Shared Memory 原子操作优化",
        ],
        inputs: [
            "Input: 数据数组",
            "Bins: 桶的数量",
        ],
        outputs: [
            "Output: 每个桶的计数",
        ],
        examples: [
            {
                input: "[1, 1, 2, 3], Bins=4",
                output: "Bin1: 2, Bin2: 1, Bin3: 1",
            },
        ],
        visualizationFocus: ["原子操作 (AtomicAdd)", "Shared Memory 原子操作"],
        tags: ["辅助操作", "Atomic"],
    },
];
