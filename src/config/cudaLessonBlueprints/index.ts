import {
  normalizeGuidedLessonBlueprint,
  type GuidedLessonBlueprint,
} from "../guidedLessonTypes.ts";
import { compositeNormLessonBlueprints } from "./compositeNorm.ts";
import { elementWiseLessonBlueprints } from "./elementWise.ts";
import { matrixLessonBlueprints } from "./matrix.ts";
import { reductionLessonBlueprints } from "./reduction.ts";
import { reshapeTransposeLessonBlueprints } from "./reshapeTranspose.ts";
import { scanSortLessonBlueprints } from "./scanSort.ts";
import { stencilConvLessonBlueprints } from "./stencilConv.ts";

export const cudaLessonBlueprints: GuidedLessonBlueprint[] = [
  ...elementWiseLessonBlueprints,
  ...reductionLessonBlueprints,
  ...scanSortLessonBlueprints,
  ...matrixLessonBlueprints,
  ...stencilConvLessonBlueprints,
  ...reshapeTransposeLessonBlueprints,
  ...compositeNormLessonBlueprints,
].map(normalizeGuidedLessonBlueprint);

const cudaLessonBlueprintMap = new Map(
  cudaLessonBlueprints.map((blueprint) => [blueprint.id, blueprint]),
);

export function getCudaLessonBlueprint(id: number): GuidedLessonBlueprint | undefined {
  return cudaLessonBlueprintMap.get(id);
}
