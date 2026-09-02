import {
  cudaLessonBlueprints,
  getCudaLessonBlueprint,
} from "../../cudaLessonBlueprints/index.ts";
import type { LessonSceneSpec } from "../../lessonSceneTypes.ts";
import { elementWiseSceneDefinitions } from "./elementWiseScenes.ts";
import { matrixSceneDefinitions } from "./matrixScenes.ts";
import { normalizationSceneDefinitions } from "./normalizationScenes.ts";
import { createCudaReduction201Scene } from "./reduction201.ts";
import { reductionSceneDefinitions } from "./reductionScenes.ts";
import { reshapeSceneDefinitions } from "./reshapeScenes.ts";
import { scanSortSceneDefinitions } from "./scanSortScenes.ts";
import {
  createCudaStoryboardScene,
  type CudaStoryboardDefinition,
} from "./storyboard.ts";
import { stencilSceneDefinitions } from "./stencilScenes.ts";

const GUIDED_CUDA_IDS = [
  102, 103, 104, 105, 106,
  201, 202, 203,
  301, 302, 303,
  401, 402, 403,
  501, 502, 503,
  601, 602,
  701, 702,
] as const;

const storyboardDefinitions: Record<number, CudaStoryboardDefinition> = {
  ...elementWiseSceneDefinitions,
  ...reductionSceneDefinitions,
  ...scanSortSceneDefinitions,
  ...matrixSceneDefinitions,
  ...stencilSceneDefinitions,
  ...reshapeSceneDefinitions,
  ...normalizationSceneDefinitions,
};

function requireBlueprint(id: number) {
  const blueprint = getCudaLessonBlueprint(id);
  if (!blueprint) throw new Error(`Missing CUDA lesson blueprint ${id}`);
  return blueprint;
}

export const cudaLessonScenes: LessonSceneSpec[] = GUIDED_CUDA_IDS.map((id) => {
  const blueprint = requireBlueprint(id);
  if (id === 201) return createCudaReduction201Scene(blueprint);

  const definition = storyboardDefinitions[id as keyof typeof storyboardDefinitions];
  if (!definition) throw new Error(`Missing CUDA lesson scene definition ${id}`);
  return createCudaStoryboardScene(blueprint, definition);
});

if (cudaLessonBlueprints.length !== cudaLessonScenes.length) {
  throw new Error("CUDA lesson blueprint and scene counts differ");
}

const cudaLessonSceneMap = new Map(
  cudaLessonScenes.map((scene) => [scene.lessonId, scene]),
);

export function getCudaLessonScene(id: number): LessonSceneSpec | undefined {
  return cudaLessonSceneMap.get(id);
}
