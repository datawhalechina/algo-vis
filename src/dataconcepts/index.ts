import { Concept, ConceptCategory } from "@/types/concepts";
import { Difficulty } from "@/types";
import { conceptLessonBlueprints } from "@/config/conceptLessonBlueprints";

/**
 * 合并所有概念数据
 * 按分类管理，便于扩展
 */
export const concepts: Concept[] = conceptLessonBlueprints.map((lesson) => ({
  id: lesson.id,
  slug: lesson.slug,
  title: lesson.title,
  category: lesson.category as ConceptCategory,
  difficulty: lesson.difficulty as Difficulty,
  description: lesson.description,
  keyPoints: lesson.keyPoints,
  relatedConcepts: lesson.relatedConcepts,
  tags: lesson.tags,
  examples: [
    {
      title: "完整推演",
      description: lesson.intuition,
      visualization: lesson.flow.map((joint) => joint.label).join(" -> "),
    },
  ],
  heroNote: lesson.heroNote,
  bookId: lesson.bookId,
}));

/**
 * 根据书籍ID获取概念列表
 */
export function getConceptsByBookId(bookId: number): Concept[] {
  return concepts.filter((c) => c.bookId === bookId);
}

/**
 * 按分类导出
 */
export function getConceptsByCategory(category: ConceptCategory): Concept[] {
  return concepts.filter((c) => c.category === category);
}

/**
 * 根据ID获取概念
 */
export function getConceptById(id: number): Concept | undefined {
  return concepts.find((c) => c.id === id);
}

/**
 * 根据slug获取概念
 */
export function getConceptBySlug(slug: string): Concept | undefined {
  return concepts.find((c) => c.slug === slug);
}
