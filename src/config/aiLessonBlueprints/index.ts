import {
  normalizeGuidedLessonBlueprint,
  type GuidedLessonBlueprint,
} from "../guidedLessonTypes.ts";
import { cnnLessonBlueprints } from "./cnn.ts";
import { diffusionLessonBlueprints } from "./diffusion.ts";
import { ganLessonBlueprints } from "./gan.ts";
import { gnnLessonBlueprints } from "./gnn.ts";
import { rnnLessonBlueprints } from "./rnn.ts";
import { transformerLessonBlueprints } from "./transformer.ts";
import { vaeLessonBlueprints } from "./vae.ts";

export const aiLessonBlueprints: GuidedLessonBlueprint[] = [
  ...cnnLessonBlueprints,
  ...rnnLessonBlueprints,
  ...transformerLessonBlueprints,
  ...gnnLessonBlueprints,
  ...diffusionLessonBlueprints,
  ...ganLessonBlueprints,
  ...vaeLessonBlueprints,
].map(normalizeGuidedLessonBlueprint);

const aiLessonBlueprintMap = new Map(
  aiLessonBlueprints.map((blueprint) => [blueprint.id, blueprint]),
);

export function getAiLessonBlueprint(id: number): GuidedLessonBlueprint | undefined {
  return aiLessonBlueprintMap.get(id);
}
