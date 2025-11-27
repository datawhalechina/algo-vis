import { VisualizationStep } from "@/types";
import { TrieNodeState, TrieEdgeState } from "@/components/visualizers/templates/TrieTemplate";

/**
 * Trie（前缀树）实现
 * 
 * 时间复杂度：插入/搜索 O(m)，m为字符串长度
 * 空间复杂度：O(∑m)，所有字符串长度之和
 */

class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  id: string;

  constructor(id: string) {
    this.children = new Map();
    this.isEnd = false;
    this.id = id;
  }
}

function collectTrieNodes(root: TrieNode): { nodes: TrieNodeState[]; edges: TrieEdgeState[] } {
  const nodes: TrieNodeState[] = [];
  const edges: TrieEdgeState[] = [];
  
  function dfs(node: TrieNode, level: number) {
    const char = node.id === '' ? 'root' : node.id.split('/').pop() || '';
    
    nodes.push({
      id: node.id,
      char,
      level,
      isEnd: node.isEnd,
      children: Array.from(node.children.keys()).map(c => `${node.id}/${c}`),
    });

    node.children.forEach((childNode, c) => {
      edges.push({
        from: node.id,
        to: childNode.id,
        char: c,
      });
      dfs(childNode, level + 1);
    });
  }

  dfs(root, 0);
  return { nodes, edges };
}

export function generateTrieSteps(
  operations: string[],
  values: (string | null)[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const root = new TrieNode('');

  steps.push({
    id: steps.length,
    description: "初始化Trie树（创建根节点）",
    data: { root },
    variables: {
      operation: 'init',
      ...collectTrieNodes(root),
    },
  });

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const value = values[i];

    if (op === 'Trie') continue; // 构造函数

    if (op === 'insert' && value) {
      // 插入操作
      let node = root;
      let currentPath = '';

      steps.push({
        id: steps.length,
        description: `插入单词 "${value}"`,
        data: { word: value },
        variables: {
          operation: 'insert',
          word: value,
          ...collectTrieNodes(root),
        },
      });

      for (let j = 0; j < value.length; j++) {
        const char = value[j];
        currentPath += `/${char}`;

        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode(currentPath));

          steps.push({
            id: steps.length,
            description: `创建新节点 '${char}'`,
            data: { char, path: currentPath },
            variables: {
              operation: 'insert',
              word: value,
              currentChar: char,
              currentPath,
              ...collectTrieNodes(root),
              nodes: collectTrieNodes(root).nodes.map(n => ({
                ...n,
                isCurrent: n.id === currentPath,
                isInPath: value.substring(0, j + 1).split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
              })),
              edges: collectTrieNodes(root).edges.map(e => ({
                ...e,
                isInPath: value.substring(0, j + 1).includes(e.char),
              })),
            },
          });
        } else {
          steps.push({
            id: steps.length,
            description: `节点 '${char}' 已存在，继续`,
            data: { char, path: currentPath },
            variables: {
              operation: 'insert',
              word: value,
              currentChar: char,
              currentPath,
              ...collectTrieNodes(root),
              nodes: collectTrieNodes(root).nodes.map(n => ({
                ...n,
                isCurrent: n.id === currentPath,
                isInPath: value.substring(0, j + 1).split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
              })),
              edges: collectTrieNodes(root).edges.map(e => ({
                ...e,
                isInPath: value.substring(0, j + 1).includes(e.char),
              })),
            },
          });
        }

        node = node.children.get(char)!;
      }

      node.isEnd = true;

      steps.push({
        id: steps.length,
        description: `标记 "${value}" 为单词结尾`,
        data: { word: value },
        variables: {
          operation: 'insert',
          word: value,
          completed: true,
          ...collectTrieNodes(root),
          nodes: collectTrieNodes(root).nodes.map(n => ({
            ...n,
            isInPath: value.split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
            isMatched: n.id === currentPath,
          })),
        },
      });

    } else if (op === 'search' && value) {
      // 搜索操作
      let node: TrieNode | null = root;
      let currentPath = '';
      let found = true;

      steps.push({
        id: steps.length,
        description: `搜索单词 "${value}"`,
        data: { word: value },
        variables: {
          operation: 'search',
          word: value,
          ...collectTrieNodes(root),
        },
      });

      for (let j = 0; j < value.length; j++) {
        const char = value[j];
        currentPath += `/${char}`;

        if (!node || !node.children.has(char)) {
          found = false;

          steps.push({
            id: steps.length,
            description: `未找到字符 '${char}'，搜索失败`,
            data: { char, found: false },
            variables: {
              operation: 'search',
              word: value,
              currentChar: char,
              found: false,
              result: false,
              ...collectTrieNodes(root),
              nodes: collectTrieNodes(root).nodes.map(n => ({
                ...n,
                isInPath: value.substring(0, j).split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
              })),
            },
          });
          break;
        }

        node = node.children.get(char)!;

        steps.push({
          id: steps.length,
          description: `找到字符 '${char}'，继续`,
          data: { char, path: currentPath },
          variables: {
            operation: 'search',
            word: value,
            currentChar: char,
            currentPath,
            ...collectTrieNodes(root),
            nodes: collectTrieNodes(root).nodes.map(n => ({
              ...n,
              isCurrent: n.id === currentPath,
              isInPath: value.substring(0, j + 1).split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
            })),
            edges: collectTrieNodes(root).edges.map(e => ({
              ...e,
              isInPath: value.substring(0, j + 1).includes(e.char),
            })),
          },
        });
      }

      if (found && node) {
        const result = node.isEnd;

        steps.push({
          id: steps.length,
          description: result 
            ? `✓ 找到单词 "${value}"`
            : `✗ "${value}" 不是完整单词（只是前缀）`,
          data: { word: value, found: result },
          variables: {
            operation: 'search',
            word: value,
            result,
            completed: true,
            ...collectTrieNodes(root),
            nodes: collectTrieNodes(root).nodes.map(n => ({
              ...n,
              isInPath: value.split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
              isMatched: n.id === currentPath && result,
            })),
          },
        });
      }

    } else if (op === 'startsWith' && value) {
      // 前缀搜索操作
      let node: TrieNode | null = root;
      let currentPath = '';
      let found = true;

      steps.push({
        id: steps.length,
        description: `搜索前缀 "${value}"`,
        data: { prefix: value },
        variables: {
          operation: 'startsWith',
          prefix: value,
          ...collectTrieNodes(root),
        },
      });

      for (let j = 0; j < value.length; j++) {
        const char = value[j];
        currentPath += `/${char}`;

        if (!node || !node.children.has(char)) {
          found = false;

          steps.push({
            id: steps.length,
            description: `✗ 未找到字符 '${char}'，前缀不存在`,
            data: { char, found: false },
            variables: {
              operation: 'startsWith',
              prefix: value,
              currentChar: char,
              result: false,
              completed: true,
              ...collectTrieNodes(root),
            },
          });
          break;
        }

        node = node.children.get(char)!;

        steps.push({
          id: steps.length,
          description: `找到字符 '${char}'，继续`,
          data: { char, path: currentPath },
          variables: {
            operation: 'startsWith',
            prefix: value,
            currentChar: char,
            currentPath,
            ...collectTrieNodes(root),
            nodes: collectTrieNodes(root).nodes.map(n => ({
              ...n,
              isCurrent: n.id === currentPath,
              isInPath: value.substring(0, j + 1).split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
            })),
            edges: collectTrieNodes(root).edges.map(e => ({
              ...e,
              isInPath: value.substring(0, j + 1).includes(e.char),
            })),
          },
        });
      }

      if (found) {
        steps.push({
          id: steps.length,
          description: `✓ 找到前缀 "${value}"`,
          data: { prefix: value, found: true },
          variables: {
            operation: 'startsWith',
            prefix: value,
            result: true,
            completed: true,
            ...collectTrieNodes(root),
            nodes: collectTrieNodes(root).nodes.map(n => ({
              ...n,
              isInPath: value.split('').reduce((path, c) => path + '/' + c, '').startsWith(n.id.replace('', '')),
              isMatched: n.id === currentPath,
            })),
          },
        });
      }
    }
  }

  return steps;
}
