import { CudaCategory, CudaProblem } from "@/types/cuda";
import { Difficulty } from "@/types";

export const compositeNormProblems: CudaProblem[] = [
    {
        id: 701,
        slug: "layer-norm",
        title: "LayerNorm",
        category: CudaCategory.COMPOSITE_NORM,
        difficulty: Difficulty.MEDIUM,
        description: "层归一化，常用于 Transformer。",
        learningGoals: [
            "理解多阶段归约 (Mean -> Var -> Norm) 的流程",
            "掌握 Warp Shuffle 在归一化中的应用",
        ],
        inputs: [
            "Input: [Batch, Hidden]",
            "Gamma: [Hidden] 可学习缩放参数",
            "Beta: [Hidden] 可学习平移参数",
            "Epsilon: 防止除零的小正数",
        ],
        outputs: [
            "Output: 对归一化值执行 Gamma/Beta 仿射变换后的特征",
        ],
        examples: [
            {
                input: "Feature Vector, Gamma, Beta",
                output: "Affine Output（均值约 0、方差约 1 指仿射前的归一化值）",
            },
        ],
        visualizationFocus: ["多阶段归约 (Mean -> Var -> Norm)", "Warp Shuffle"],
        tags: ["归一化", "Memory Bound"],
    },
    {
        id: 702,
        slug: "softmax",
        title: "Softmax",
        category: CudaCategory.COMPOSITE_NORM,
        difficulty: Difficulty.MEDIUM,
        description: "Softmax 归一化。",
        learningGoals: [
            "理解 Max -> Exp -> Sum -> Div 的计算流水线",
            "掌握数值稳定性处理 (Minus Max)",
        ],
        inputs: [
            "Logits: 原始分数",
        ],
        outputs: [
            "Probs: 概率分布",
        ],
        examples: [
            {
                input: "[1.0, 2.0, 3.0]",
                output: "[0.09, 0.24, 0.67]",
            },
        ],
        visualizationFocus: ["Max -> Exp -> Sum -> Div 流水线", "数值稳定性 (Minus Max)"],
        tags: ["归一化", "Memory Bound"],
    },
];
