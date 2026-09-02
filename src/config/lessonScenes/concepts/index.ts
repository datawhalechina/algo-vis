import {
  getConceptLessonBlueprint,
} from "../../conceptLessonBlueprints/index.ts";
import type { LessonSceneSpec } from "../../lessonSceneTypes.ts";
import { compilerSceneProfiles } from "./compiler.ts";
import { computerArchitectureSceneProfiles } from "./computerArchitecture.ts";
import { dataStructuresAlgorithmSceneProfiles } from "./dataStructuresAlgorithms.ts";
import { databaseSceneProfiles } from "./databases.ts";
import { networkSceneProfiles } from "./networks.ts";
import { operatingSystemSceneProfiles } from "./operatingSystems.ts";
import {
  CONCEPT_LESSON_IDS,
  createConceptLessonScene,
  type ConceptLessonId,
  type ConceptSceneProfile,
} from "./profile.ts";

const conceptSceneProfiles: Record<ConceptLessonId, ConceptSceneProfile> = {
  ...dataStructuresAlgorithmSceneProfiles,
  ...operatingSystemSceneProfiles,
  ...networkSceneProfiles,
  ...databaseSceneProfiles,
  ...compilerSceneProfiles,
  ...computerArchitectureSceneProfiles,
};

function requireConceptBlueprint(id: ConceptLessonId) {
  const blueprint = getConceptLessonBlueprint(id);
  if (!blueprint) throw new Error(`Missing concept lesson blueprint ${id}`);
  return blueprint;
}

export const conceptLessonScenes: LessonSceneSpec[] = CONCEPT_LESSON_IDS.map(
  (id) => createConceptLessonScene(
    requireConceptBlueprint(id),
    conceptSceneProfiles[id],
  ),
);

const conceptLessonSceneMap = new Map(
  conceptLessonScenes.map((scene) => [scene.lessonId, scene]),
);

export function getConceptLessonScene(id: number): LessonSceneSpec | undefined {
  return conceptLessonSceneMap.get(id);
}
