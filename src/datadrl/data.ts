import { DRLCategory } from "@/types/drl";
import {
  drlProblems as allDrlProblems,
  getDrlProblemById as getDrlProblemByIdFromData,
  getDrlProblemsByCategory as getDrlProblemsByCategoryFromData,
} from ".";

export const drlProblems = allDrlProblems;

export function getDrlProblemById(id: number) {
  return getDrlProblemByIdFromData(id);
}

export function getDrlProblemsByCategory(category: DRLCategory) {
  return getDrlProblemsByCategoryFromData(category);
}
