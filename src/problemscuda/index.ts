import { ComponentType, lazy } from "react";
import { getCudaLessonBlueprint } from "@/config/cudaLessonBlueprints";

const VectorAdd = lazy(() => import("./VectorAdd/VectorAddVisualizer"));
const GuidedCudaLessonVisualizer = lazy(
    () => import("@/components/visualizers/GuidedCudaLessonVisualizer"),
);

/**
 * 获取 CUDA 问题的可视化组件
 * @param id 题目 ID
 */
export function getCudaVisualizer(id: number): ComponentType | null {
    switch (id) {
        case 101:
            return VectorAdd;
        default:
            return getCudaLessonBlueprint(id) ? GuidedCudaLessonVisualizer : null;
    }
}
