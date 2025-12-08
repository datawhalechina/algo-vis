import { Difficulty } from "./index";

export enum ConceptCategory {
  // 数据结构
  DATA_STRUCTURE = "data_structure",
  // 算法
  ALGORITHM = "algorithm",
  // 操作系统
  OPERATING_SYSTEM = "operating_system",
  // 计算机网络
  NETWORK = "network",
  // 数据库
  DATABASE = "database",
  // 编译原理
  COMPILER = "compiler",
  // 计算机组成
  COMPUTER_ARCHITECTURE = "computer_architecture",
  // 编程语言
  PROGRAMMING_LANGUAGE = "programming_language",
  // 软件工程
  SOFTWARE_ENGINEERING = "software_engineering",
  // 其他
  OTHER = "other",
}

export const conceptCategoryNames: Record<ConceptCategory, string> = {
  [ConceptCategory.DATA_STRUCTURE]: "数据结构",
  [ConceptCategory.ALGORITHM]: "算法",
  [ConceptCategory.OPERATING_SYSTEM]: "操作系统",
  [ConceptCategory.NETWORK]: "计算机网络",
  [ConceptCategory.DATABASE]: "数据库",
  [ConceptCategory.COMPILER]: "编译原理",
  [ConceptCategory.COMPUTER_ARCHITECTURE]: "计算机组成",
  [ConceptCategory.PROGRAMMING_LANGUAGE]: "编程语言",
  [ConceptCategory.SOFTWARE_ENGINEERING]: "软件工程",
  [ConceptCategory.OTHER]: "其他",
};

export interface ConceptExample {
  title: string;
  description: string;
  visualization?: string;
}

export interface Concept {
  id: number;
  slug: string;
  title: string;
  category: ConceptCategory;
  difficulty: Difficulty;
  description: string;
  keyPoints: string[];
  relatedConcepts: string[];
  tags: string[];
  examples: ConceptExample[];
  heroNote?: string;
  bookId: number; // 所属书籍ID
}

export interface Book {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  cover?: string; // 封面图片URL
  author?: string;
  category: ConceptCategory[];
  tags: string[];
  conceptCount: number; // 包含的概念数量
  order: number; // 排序顺序
}
