import { CudaProblem, CudaCategory } from "@/types/cuda";
import { elementWiseProblems } from "./element_wise";
import { reductionProblems } from "./reduction";
import { scanSortProblems } from "./scan_sort";
import { matrixProblems } from "./matrix";
import { stencilConvProblems } from "./stencil_conv";
import { reshapeTransposeProblems } from "./reshape_transpose";
import { compositeNormProblems } from "./composite_norm";

/**
 * 合并所有 CUDA 题目数据
 * 按题型分类，便于管理和扩展
 */
export const cudaProblems: CudaProblem[] = [
    ...elementWiseProblems,
    ...reductionProblems,
    ...scanSortProblems,
    ...matrixProblems,
    ...stencilConvProblems,
    ...reshapeTransposeProblems,
    ...compositeNormProblems,
].sort((a, b) => a.id - b.id);

/**
 * 按题型导出
 */
export {
    elementWiseProblems,
    reductionProblems,
    scanSortProblems,
    matrixProblems,
    stencilConvProblems,
    reshapeTransposeProblems,
    compositeNormProblems,
};

/**
 * 工具函数
 */
export function getCudaProblemById(id: number): CudaProblem | undefined {
    return cudaProblems.find((problem) => problem.id === id);
}

export function getCudaProblemsByCategory(category: CudaCategory): CudaProblem[] {
    return cudaProblems.filter((problem) => problem.category === category);
}
