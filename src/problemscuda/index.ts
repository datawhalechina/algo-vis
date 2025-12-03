import { ComponentType, lazy } from "react";

const VectorAdd = lazy(() => import("./VectorAdd/VectorAddVisualizer"));

/**
 * 获取 CUDA 问题的可视化组件
 * @param id 题目 ID
 */
export function getCudaVisualizer(id: number): ComponentType | null {
    switch (id) {
        case 101:
            return VectorAdd;
        default:
            return null;
    }
}
