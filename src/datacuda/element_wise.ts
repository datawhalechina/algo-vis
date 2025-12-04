import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const elementWiseProblems: CudaProblem[] = [
    {
        id: 101,
        slug: "vector-add",
        title: "VectorAdd / VectorSub",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.EASY,
        description: "向量加减法，并行性最高，线程间无依赖。",
        learningGoals: [
            "理解 Grid-Block-Thread 的层级结构",
            "掌握全局内存的合并访问模式",
            "学习基本的 CUDA 核函数编写",
        ],
        inputs: [
            "A: 输入向量 A",
            "B: 输入向量 B",
            "N: 向量长度",
        ],
        outputs: [
            "C: 输出向量 C = A + B",
        ],
        examples: [
            {
                input: "A = [1, 2, 3], B = [4, 5, 6]",
                output: "C = [5, 7, 9]",
                explanation: "每个线程负责一个元素的加法运算。",
            },
        ],
        heroNote: "这是 CUDA 编程的'Hello World'，理解它是迈向高性能计算的第一步。",
        visualizationFocus: ["Grid-Block-Thread 映射", "内存合并访问 (Coalesced Access)"],
        tags: ["基础算术", "Memory Bound"],
    },
    {
        id: 102,
        slug: "scale",
        title: "Scale (ax + b)",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.EASY,
        description: "标量乘法，常用于数据缩放。",
        learningGoals: [
            "理解标量参数的传递",
            "掌握乘加指令的使用",
        ],
        inputs: [
            "X: 输入向量",
            "a: 缩放因子",
            "b: 偏置项",
        ],
        outputs: [
            "Y: 输出向量 Y = a * X + b",
        ],
        examples: [
            {
                input: "X = [1, 2, 3], a = 2, b = 1",
                output: "Y = [3, 5, 7]",
                explanation: "Y[i] = 2 * X[i] + 1",
            },
        ],
        visualizationFocus: ["Grid-Block-Thread 映射", "内存合并访问"],
        tags: ["基础算术", "Memory Bound"],
    },
    {
        id: 103,
        slug: "activation-relu",
        title: "ReLU / LeakyReLU",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.EASY,
        description: "激活函数，简单的条件判断。",
        learningGoals: [
            "理解条件分支在 GPU 上的执行",
            "掌握 max 函数的使用",
        ],
        inputs: [
            "X: 输入向量",
        ],
        outputs: [
            "Y: 输出向量 Y = max(0, X)",
        ],
        examples: [
            {
                input: "X = [-1, 0, 2]",
                output: "Y = [0, 0, 2]",
                explanation: "负数变为 0，正数保持不变。",
            },
        ],
        visualizationFocus: ["分支发散 (Branch Divergence)"],
        tags: ["激活函数", "Memory Bound"],
    },
    {
        id: 104,
        slug: "activation-sigmoid-tanh",
        title: "Sigmoid / Tanh",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.MEDIUM,
        description: "非线性激活函数，涉及指数运算。",
        learningGoals: [
            "理解特殊函数单元 (SFU) 的作用",
            "掌握指数运算的精度与性能权衡",
        ],
        inputs: [
            "X: 输入向量",
        ],
        outputs: [
            "Y: Sigmoid(X) 或 Tanh(X)",
        ],
        examples: [
            {
                input: "X = [0]",
                output: "Sigmoid(X) = [0.5]",
            },
        ],
        visualizationFocus: ["特殊函数单元 (SFU) 利用"],
        tags: ["激活函数", "Compute Bound"],
    },
    {
        id: 105,
        slug: "cast",
        title: "Cast (FP32 -> FP16)",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.EASY,
        description: "数据类型转换，常用于混合精度训练。",
        learningGoals: [
            "理解不同数据类型的内存占用",
            "掌握向量化读写指令",
        ],
        inputs: [
            "Input: FP32 数组",
        ],
        outputs: [
            "Output: FP16 数组",
        ],
        examples: [
            {
                input: "FP32 [1.0, 2.0]",
                output: "FP16 [1.0, 2.0]",
                explanation: "内存占用减半。",
            },
        ],
        visualizationFocus: ["向量化读写 (Vectorized Access)"],
        tags: ["类型转换", "Memory Bound"],
    },
    {
        id: 106,
        slug: "dropout",
        title: "Dropout",
        category: CudaCategory.ELEMENT_WISE,
        difficulty: Difficulty.MEDIUM,
        description: "随机丢弃神经元，涉及随机数生成。",
        learningGoals: [
            "理解并行随机数生成算法",
            "掌握 Philox 算法的应用",
        ],
        inputs: [
            "X: 输入向量",
            "rate: 丢弃概率",
            "seed: 随机种子",
        ],
        outputs: [
            "Y: 输出向量，部分元素为 0",
        ],
        examples: [
            {
                input: "X = [1, 1, 1, 1], rate = 0.5",
                output: "Y = [1, 0, 0, 1] (随机)",
            },
        ],
        visualizationFocus: ["随机数生成状态管理", "Philox 算法"],
        tags: ["特殊操作", "Random"],
    },
];
