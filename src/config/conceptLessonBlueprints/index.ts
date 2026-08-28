import { compilerLessons } from "./compiler.ts";
import { computerArchitectureLessons } from "./computerArchitecture.ts";
import { dataStructuresAlgorithmsLessons } from "./dataStructuresAlgorithms.ts";
import { databaseLessons } from "./databases.ts";
import { networkLessons } from "./networks.ts";
import { operatingSystemsLessons } from "./operatingSystems.ts";
import type { ConceptLessonBlueprint } from "./types.ts";

export type { ConceptLessonBlueprint } from "./types.ts";

export const conceptLessonBlueprints: ConceptLessonBlueprint[] = [
  ...dataStructuresAlgorithmsLessons,
  ...operatingSystemsLessons,
  ...networkLessons,
  ...databaseLessons,
  ...compilerLessons,
  ...computerArchitectureLessons,
];

const conceptLessonBlueprintMap = new Map(
  conceptLessonBlueprints.map((blueprint) => [blueprint.id, blueprint]),
);

export function getConceptLessonBlueprint(
  id: number,
): ConceptLessonBlueprint | undefined {
  return conceptLessonBlueprintMap.get(id);
}
