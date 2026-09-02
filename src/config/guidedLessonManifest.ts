export type GuidedLessonDomain = "ai" | "cuda" | "drl" | "concepts";

export const GUIDED_LESSON_MANIFEST: Record<GuidedLessonDomain, readonly number[]> = {
  ai: Array.from({ length: 63 }, (_, index) => 10072 + index),
  cuda: [
    102, 103, 104, 105, 106,
    201, 202, 203,
    301, 302, 303,
    401, 402, 403,
    501, 502, 503,
    601, 602,
    701, 702,
  ],
  drl: Array.from({ length: 36 }, (_, index) => 30001 + index),
  concepts: Array.from({ length: 36 }, (_, index) => 40001 + index),
};
