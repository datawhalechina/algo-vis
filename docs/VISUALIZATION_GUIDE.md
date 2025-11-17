# 算法可视化改进指南

## 已安装的可视化和动画库

### 可视化库

- **D3.js** (`d3` + `@types/d3`) - 最强大的数据可视化库
  - 适用场景：树形结构、图结构、复杂数据关系、自定义 SVG 动画
  - 示例：二叉树遍历、图的 DFS/BFS
- **Cytoscape.js** (`cytoscape` + `@types/cytoscape`) - 图论算法可视化

  - 适用场景：图、网络、拓扑结构
  - 示例：最短路径、最小生成树、拓扑排序

- **Vis.js Network** (`vis-network` + `vis-data`) - 网络图可视化
  - 适用场景：图结构、网络关系
  - 示例：社交网络、依赖关系图

### 动画库

- **GSAP** (`gsap`) - 专业级动画库
  - 适用场景：复杂动画序列、高性能动画
  - 优势：性能最好、功能强大
- **Anime.js** (`anime`) - 轻量级动画库

  - 适用场景：简单动画、数值动画
  - 优势：体积小、API 简洁

- **Framer Motion** (已有) - React 动画库
  - 适用场景：组件动画、手势动画
  - 优势：与 React 深度集成

## 当前问题

### 问题 1：代码高亮遮挡内容

**现状**：反转链表的代码区域整个都被遮住了（见图二箭头标注）
**原因**：代码高亮的背景色太深，代码内容不可见

**解决方案**：

1. 减轻高亮背景色的不透明度
2. 只在代码行号左侧添加高亮指示条
3. 使用语法高亮让代码更清晰可读

### 问题 2：代码高亮逻辑不统一

**现状**：

- Two Sum 使用行号字符串 (`code: '5'`)
- Reverse Linked List 使用代码片段 (`code: "const next = curr.next;"`)

**建议统一方案**：

```typescript
// 在 VisualizationStep 中使用行号数组
export interface VisualizationStep {
  id: number;
  description: string;
  highlightedIndices?: number[];
  highlightedNodes?: string[];
  data: unknown;
  highlightedLines?: number[]; // 新增：高亮的代码行号数组
  variables?: Record<string, unknown>;
}
```

## 不同题目的可视化建议

### 数组相关题目（如 Two Sum）

- **核心可视化**：柱状图 + 索引标记
- **辅助可视化**：哈希表状态（如果用到）
- **动画**：使用 Framer Motion 的简单过渡即可
- **是否需要代码区域**：是，但应该简洁，只高亮关键行

### 链表相关题目（如 Reverse Linked List）

- **核心可视化**：节点 + 箭头（指针方向）
- **可选方案**：
  - 方案 1：SVG 箭头（当前使用）
  - 方案 2：使用 Cytoscape.js 绘制有向图
  - 方案 3：使用 D3.js 自定义力导向图
- **动画**：指针移动应该平滑（GSAP 或 Framer Motion）
- **是否需要代码区域**：是，高亮当前执行的关键行

### 树相关题目

- **核心可视化**：使用 D3.js 树形布局
- **动画**：节点高亮、遍历路径动画
- **代码区域**：递归调用可以用调用栈可视化

### 图相关题目

- **核心可视化**：Cytoscape.js 或 Vis.js
- **动画**：边和节点的访问顺序
- **代码区域**：BFS/DFS 的队列/栈状态可视化

## 代码区域改进方案

### 方案 A：轻量高亮（推荐）

```typescript
// 只在行号旁边加一个细的高亮条，代码保持可读
<div
  className={`${
    isHighlighted ? "border-l-4 border-yellow-400 bg-yellow-50/10" : ""
  }`}
>
  <span className="line-number">{lineNumber}</span>
  <code className="text-gray-100">{line}</code>
</div>
```

### 方案 B：语法高亮 + 当前行标记

使用 `prismjs` 或 `highlight.js` 进行语法高亮，当前行用箭头或图标标记

### 方案 C：动态代码片段

只显示当前相关的几行代码，而不是整个函数

## 建议的统一规范

1. **每个题目的可视化应该不同**

   - 根据数据结构选择合适的可视化方式
   - 根据算法特点设计动画效果

2. **代码区域可选**

   - 简单题目（如数组操作）：可以省略代码区域，专注于可视化
   - 复杂题目（如递归、回溯）：需要代码区域辅助理解

3. **代码高亮应该精确**
   - 使用行号数组标记多行
   - 高亮样式不应遮挡代码内容
   - 可以添加"当前行"指示器（箭头或图标）

## 接下来的步骤

请告诉我：

1. 你更喜欢哪种代码高亮方案？（A/B/C 或其他想法）
2. 是否所有题目都需要代码区域？还是根据复杂度决定？
3. Two Sum 的可视化是否满意？需要调整吗？
4. Reverse Linked List 你希望用什么方式可视化？（当前 SVG / Cytoscape / D3）
