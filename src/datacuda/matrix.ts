import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const matrixProblems: CudaProblem[] = [
    {
        id: 401,
        slug: "sgemm",
        title: "SGEMM",
        category: CudaCategory.MATRIX,
        difficulty: Difficulty.HARD,
        description: "单精度矩阵乘法，深度学习的核心算子。",
        learningGoals: [
            "理解矩阵分块 (Tiling) 技术",
            "掌握 Global -> Shared -> Register 的数据流动",
            "学习 Double Buffering 掩盖延迟",
        ],
        inputs: [
            "A: M x K 矩阵",
            "B: K x N 矩阵",
        ],
        outputs: [
            "C: M x N 矩阵",
        ],
        examples: [
            {
                input: "A(2x2), B(2x2)",
                output: "C(2x2) = A * B",
            },
        ],
        visualizationFocus: ["Tiling 分块", "Global -> Shared -> Register 流水线", "Double Buffering"],
        tags: ["矩阵乘法", "Compute Bound"],
    },
    {
        id: 402,
        slug: "gemv",
        title: "GEMV",
        category: CudaCategory.MATRIX,
        difficulty: Difficulty.MEDIUM,
        description: "矩阵向量乘法。",
        learningGoals: [
            "理解矩阵存储布局（行主序 vs 列主序）",
            "掌握 Warp 级归约优化",
        ],
        inputs: [
            "A: M x N 矩阵",
            "x: N 维向量",
        ],
        outputs: [
            "y: M 维向量",
        ],
        examples: [
            {
                input: "A(2x2), x(2)",
                output: "y(2) = A * x",
            },
        ],
        visualizationFocus: ["行主序 vs 列主序访问", "Warp 级归约"],
        tags: ["矩阵乘法", "Memory Bound"],
    },
    {
        id: 403,
        slug: "matmul-bias-relu",
        title: "MatMul + Bias + ReLU",
        category: CudaCategory.MATRIX,
        difficulty: Difficulty.HARD,
        description: "全连接层融合算子。",
        learningGoals: [
            "理解算子融合 (Kernel Fusion) 的优势",
            "掌握 Epilogue 模式的处理",
        ],
        inputs: [
            "A, B: 输入矩阵",
            "Bias: 偏置向量",
        ],
        outputs: [
            "Output = ReLU(A * B + Bias)",
        ],
        examples: [
            {
                input: "A, B, Bias",
                output: "Fused Result",
            },
        ],
        visualizationFocus: ["算子融合 (Kernel Fusion)", "Epilogue 处理"],
        tags: ["融合算子", "Compute Bound"],
    },
];
