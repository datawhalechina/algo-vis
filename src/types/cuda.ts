import { Difficulty } from "./index";

export enum CudaCategory {
    ELEMENT_WISE = "element_wise",
    REDUCTION = "reduction",
    SCAN_SORT = "scan_sort",
    MATRIX = "matrix",
    STENCIL_CONV = "stencil_conv",
    RESHAPE_TRANSPOSE = "reshape_transpose",
    COMPOSITE_NORM = "composite_norm",
}

export const cudaCategoryNames: Record<CudaCategory, string> = {
    [CudaCategory.ELEMENT_WISE]: "逐元素操作 (Element-wise)",
    [CudaCategory.REDUCTION]: "规约操作 (Reduction)",
    [CudaCategory.SCAN_SORT]: "扫描与排序 (Scan & Sort)",
    [CudaCategory.MATRIX]: "矩阵与稠密代数 (Matrix)",
    [CudaCategory.STENCIL_CONV]: "模板与卷积 (Stencil & Conv)",
    [CudaCategory.RESHAPE_TRANSPOSE]: "数据变换与重排 (Reshape)",
    [CudaCategory.COMPOSITE_NORM]: "复合归一化层 (Normalization)",
};

export interface CudaProblem {
    id: number;
    slug: string;
    title: string;
    category: CudaCategory;
    difficulty: Difficulty;
    description: string;
    learningGoals: string[];
    inputs: string[];
    outputs: string[];
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    heroNote?: string;
    visualizationFocus: string[]; // 可视化重点
    tags: string[];
}
