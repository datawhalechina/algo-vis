import {
  Concept,
  ConceptCategory,
  conceptCategoryNames,
} from "@/types/concepts";
import {
  concepts as allConcepts,
  getConceptById as getConceptByIdFromData,
  getConceptsByCategory as getConceptsByCategoryFromData,
  getConceptsByBookId as getConceptsByBookIdFromData,
} from ".";
import {
  books,
  getBookById as getBookByIdFromData,
  getBookBySlug as getBookBySlugFromData,
  getBooksByCategory as getBooksByCategoryFromData,
} from "./books";

/**
 * 导出所有概念数据
 * 数据已按分类存放在 dataconcepts 目录中
 */
export const concepts: Concept[] = allConcepts;

/**
 * 导出所有书籍数据
 */
export { books };

/**
 * 导出分类名称映射
 */
export { conceptCategoryNames };

/**
 * 工具函数
 */
export function getConceptById(id: number): Concept | undefined {
  return getConceptByIdFromData(id);
}

export function getConceptsByCategory(category: ConceptCategory): Concept[] {
  return getConceptsByCategoryFromData(category);
}

export function getConceptsByBookId(bookId: number): Concept[] {
  return getConceptsByBookIdFromData(bookId);
}

export function getBookById(id: number) {
  return getBookByIdFromData(id);
}

export function getBookBySlug(slug: string) {
  return getBookBySlugFromData(slug);
}

export function getBooksByCategory(category: ConceptCategory) {
  return getBooksByCategoryFromData(category);
}
