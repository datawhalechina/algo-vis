import { CudaProblem, CudaCategory } from "@/types/cuda";
import {
    cudaProblems as allCudaProblems,
    getCudaProblemById as getCudaProblemByIdFromData,
    getCudaProblemsByCategory as getCudaProblemsByCategoryFromData,
} from ".";

/**
 * 导出所有 CUDA 题目数据
 * 数据已按题型分类存放在 datacuda 目录中
 */
export const cudaProblems: CudaProblem[] = allCudaProblems;

/**
 * 工具函数
 */
export function getCudaProblemById(id: number): CudaProblem | undefined {
    return getCudaProblemByIdFromData(id);
}

export function getCudaProblemsByCategory(category: CudaCategory): CudaProblem[] {
    return getCudaProblemsByCategoryFromData(category);
}
