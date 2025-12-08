import { Concept, ConceptCategory } from "@/types/concepts";

/**
 * 合并所有概念数据
 * 按分类管理，便于扩展
 */
export const concepts: Concept[] = [
  // 暂时为空数组，后续可以添加具体概念
];

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
