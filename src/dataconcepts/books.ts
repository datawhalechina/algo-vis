import { Book, ConceptCategory } from "@/types/concepts";

/**
 * 书籍数据
 * 每本书包含多个相关概念
 */
export const books: Book[] = [
  {
    id: 1,
    slug: "data-structures-algorithms",
    title: "数据结构与算法",
    subtitle: "经典数据结构与算法详解",
    description:
      "系统学习数据结构与算法的核心概念，包括数组、链表、树、图等基础数据结构，以及排序、搜索、动态规划等经典算法。",
    category: [ConceptCategory.DATA_STRUCTURE, ConceptCategory.ALGORITHM],
    tags: ["数据结构", "算法", "基础"],
    conceptCount: 0, // 后续会根据实际概念数量更新
    order: 1,
  },
  {
    id: 2,
    slug: "operating-systems",
    title: "操作系统原理",
    subtitle: "深入理解操作系统核心机制",
    description:
      "探索操作系统的核心概念，包括进程管理、内存管理、文件系统、设备管理等关键机制。",
    category: [ConceptCategory.OPERATING_SYSTEM],
    tags: ["操作系统", "进程", "内存"],
    conceptCount: 0,
    order: 2,
  },
  {
    id: 3,
    slug: "computer-networks",
    title: "计算机网络",
    subtitle: "从协议到应用的全面解析",
    description:
      "理解计算机网络的层次结构、协议原理和通信机制，掌握TCP/IP、HTTP、DNS等核心协议。",
    category: [ConceptCategory.NETWORK],
    tags: ["网络", "协议", "TCP/IP"],
    conceptCount: 0,
    order: 3,
  },
  {
    id: 4,
    slug: "database-systems",
    title: "数据库系统",
    subtitle: "数据库设计与优化",
    description:
      "学习数据库系统的设计原理、查询优化、事务处理、索引机制等核心概念。",
    category: [ConceptCategory.DATABASE],
    tags: ["数据库", "SQL", "索引"],
    conceptCount: 0,
    order: 4,
  },
  {
    id: 5,
    slug: "compiler-principles",
    title: "编译原理",
    subtitle: "从源代码到可执行程序",
    description:
      "了解编译器的工作原理，包括词法分析、语法分析、语义分析、代码生成等编译过程。",
    category: [ConceptCategory.COMPILER],
    tags: ["编译器", "词法分析", "语法分析"],
    conceptCount: 0,
    order: 5,
  },
  {
    id: 6,
    slug: "computer-architecture",
    title: "计算机组成原理",
    subtitle: "硬件与指令系统",
    description:
      "深入理解计算机硬件组成、指令系统、CPU设计、存储器层次结构等核心概念。",
    category: [ConceptCategory.COMPUTER_ARCHITECTURE],
    tags: ["硬件", "CPU", "存储器"],
    conceptCount: 0,
    order: 6,
  },
].sort((a, b) => a.order - b.order);

/**
 * 根据ID获取书籍
 */
export function getBookById(id: number): Book | undefined {
  return books.find((b) => b.id === id);
}

/**
 * 根据slug获取书籍
 */
export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

/**
 * 根据分类获取书籍
 */
export function getBooksByCategory(category: ConceptCategory): Book[] {
  return books.filter((b) => b.category.includes(category));
}
