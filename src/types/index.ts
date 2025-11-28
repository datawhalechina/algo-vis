// 题目难度
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

// 题目分类（数据结构）
export enum Category {
  ARRAY = "array",
  STRING = "string",
  LINKED_LIST = "linked-list",
  TREE = "tree",
  GRAPH = "graph",
  HASH_TABLE = "hash-table",
  STACK = "stack",
  QUEUE = "queue",
  HEAP = "heap",
  MATH = "math",
  MATRIX = "matrix",
}

// 解决方式（算法思想）
export enum SolutionMethod {
  DYNAMIC_PROGRAMMING = "dp",
  GREEDY = "greedy",
  BACKTRACKING = "backtracking",
  BINARY_SEARCH = "binary-search",
  TWO_POINTERS = "two-pointers",
  SLIDING_WINDOW = "sliding-window",
  DIVIDE_CONQUER = "divide-conquer",
  SORTING = "sorting",
  BIT_MANIPULATION = "bit",
  DFS = "dfs",
  BFS = "bfs",
  RECURSION = "recursion",
  ITERATION = "iteration",
  STACK = "stack",
}

// 可视化步骤
export interface VisualizationStep {
  id: number;
  description: string;
  highlightedIndices?: number[];
  highlightedNodes?: string[];
  data: unknown;
  code?: string; // 可选：代码行标记（复杂题目才需要）
  highlightedLines?: number[]; // 可选：高亮的代码行号数组
  variables?: Record<string, unknown>;
}

// 算法方法对比
export interface MethodComparison {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  isRecommended: boolean;
  pros?: string[];
  cons?: string[];
}

// 题解配置
export interface SolutionConfig {
  methodName: string; // 方法名称，如 "哈希表"
  methodDescription: string; // 方法简介
  steps: string[]; // 算法步骤
  advantages: string[]; // 核心优势
  code?: string; // 代码实现
  language?: string; // 代码语言，默认 typescript
  keyLines?: number[]; // 关键代码行号（用于显示绿色箭头提示）
  timeComplexity: {
    value: string; // 如 "O(n)"
    description: string; // 说明
  };
  spaceComplexity: {
    value: string;
    description: string;
  };
  comparisons?: MethodComparison[]; // 方法对比
}

// 题目信息
export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: Category[]; // 题型分类（数据结构）
  methods: SolutionMethod[]; // 解决方式（算法思想）
  leetcodeNumber: number;
  description: string;
  examples: Example[];
  constraints?: string[];
  hints?: string[];
  solution?: SolutionConfig; // 题解配置
}

// 示例
export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

// 算法执行状态
export interface AlgorithmState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  steps: VisualizationStep[];
}
