import type { GuidedLessonBlueprint } from "../guidedLessonTypes";

export type ConceptLessonCategory =
  | "data_structure"
  | "algorithm"
  | "operating_system"
  | "network"
  | "database"
  | "compiler"
  | "computer_architecture";

export type ConceptLessonDifficulty = "easy" | "medium" | "hard";

export interface ConceptLessonBlueprint extends GuidedLessonBlueprint {
  slug: string;
  bookId: number;
  category: ConceptLessonCategory;
  difficulty: ConceptLessonDifficulty;
  description: string;
  keyPoints: string[];
  relatedConcepts: string[];
  tags: string[];
  heroNote?: string;
}
