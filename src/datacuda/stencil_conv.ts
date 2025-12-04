import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const stencilConvProblems: CudaProblem[] = [
    {
        id: 501,
        slug: "conv2d",
        title: "Conv2d",
        category: CudaCategory.STENCIL_CONV,
        difficulty: Difficulty.HARD,
        description: "标准 2D 卷积。",
        learningGoals: [
            "理解 Im2Col 变换将卷积转化为矩阵乘法",
            "掌握 Implicit GEMM 算法",
            "利用 Shared Memory 缓存 Halo 区域",
        ],
        inputs: [
            "Input: [N, C, H, W]",
            "Weight: [K, C, R, S]",
        ],
        outputs: [
            "Output: [N, K, H', W']",
        ],
        examples: [
            {
                input: "Image, Kernel",
                output: "Feature Map",
            },
        ],
        visualizationFocus: ["Im2Col 变换", "Implicit GEMM", "Shared Memory 缓存 Halo"],
        tags: ["卷积", "Compute Bound"],
    },
    {
        id: 502,
        slug: "max-pool-2d",
        title: "MaxPool2d",
        category: CudaCategory.STENCIL_CONV,
        difficulty: Difficulty.MEDIUM,
        description: "最大池化操作。",
        learningGoals: [
            "理解滑动窗口操作",
            "优化非连续内存访问",
        ],
        inputs: [
            "Input: 特征图",
        ],
        outputs: [
            "Output: 下采样后的特征图",
        ],
        examples: [
            {
                input: "4x4 Input, 2x2 Kernel",
                output: "2x2 Output",
            },
        ],
        visualizationFocus: ["滑动窗口", "非连续内存访问优化"],
        tags: ["池化", "Memory Bound"],
    },
    {
        id: 503,
        slug: "gaussian-blur",
        title: "Gaussian Blur",
        category: CudaCategory.STENCIL_CONV,
        difficulty: Difficulty.MEDIUM,
        description: "高斯模糊，典型的 Stencil 操作。",
        learningGoals: [
            "利用 Constant Memory 存储卷积核",
            "掌握可分离卷积的优化技巧",
        ],
        inputs: [
            "Image: 输入图像",
        ],
        outputs: [
            "Blurred Image: 模糊后的图像",
        ],
        examples: [
            {
                input: "Image",
                output: "Blurred Image",
            },
        ],
        visualizationFocus: ["Constant Memory 利用", "可分离卷积优化"],
        tags: ["图像处理", "Stencil"],
    },
];
