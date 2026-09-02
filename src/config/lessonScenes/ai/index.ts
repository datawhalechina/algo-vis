import { aiLessonBlueprints } from "../../aiLessonBlueprints/index.ts";
import type { LessonSceneSpec } from "../../lessonSceneTypes.ts";
import { cnnSceneProfiles } from "./cnn.ts";
import { diffusionSceneProfiles } from "./diffusion.ts";
import { ganSceneProfiles } from "./gan.ts";
import { gnnSceneProfiles } from "./gnn.ts";
import {
  AI_LESSON_IDS,
  createAiLessonScene,
  type AiLessonId,
  type AiSceneProfile,
} from "./profile.ts";
import { rnnSceneProfiles } from "./rnn.ts";
import { transformerSceneProfiles } from "./transformer.ts";
import { vaeSceneProfiles } from "./vae.ts";

const profiles: Record<AiLessonId, AiSceneProfile> = {
  ...cnnSceneProfiles,
  ...rnnSceneProfiles,
  ...transformerSceneProfiles,
  ...gnnSceneProfiles,
  ...diffusionSceneProfiles,
  ...ganSceneProfiles,
  ...vaeSceneProfiles,
};

const blueprintById = new Map(
  aiLessonBlueprints.map((blueprint) => [blueprint.id, blueprint]),
);

export const aiLessonScenes: LessonSceneSpec[] = AI_LESSON_IDS.map((id) => {
  const blueprint = blueprintById.get(id);
  if (!blueprint) throw new Error(`Missing AI lesson blueprint ${id}`);
  return createAiLessonScene(blueprint, profiles[id]);
});

const sceneById = new Map(
  aiLessonScenes.map((scene) => [scene.lessonId, scene]),
);

export function getAiLessonScene(id: number): LessonSceneSpec | undefined {
  return sceneById.get(id);
}
