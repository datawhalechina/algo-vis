import { VisualizationStep } from "@/types";

export function generateWordSearchSteps(
  board: string[][],
  word: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const rows = board.length;
  const cols = board[0]?.length || 0;

  steps.push({
    id: stepId++,
    data: {},
    variables: {
      board,
      word,
      path: [],
      wordIndex: 0,
      found: false,
    },
    description: `开始在网格中搜索单词 "${word}"`,
  });

  function dfs(
    row: number,
    col: number,
    wordIndex: number,
    visited: boolean[][],
    path: [number, number][]
  ): boolean {
    // 找到了完整单词
    if (wordIndex === word.length) {
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          board,
          word,
          path: [...path],
          wordIndex,
          found: true,
          currentRow: row,
          currentCol: col,
        },
        description: `✓ 成功找到单词 "${word}"！`,
      });
      return true;
    }

    // 边界检查和有效性检查
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      visited[row][col] ||
      board[row][col] !== word[wordIndex]
    ) {
      return false;
    }

    // 记录当前访问
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        board,
        word,
        path: [...path, [row, col]],
        wordIndex,
        currentRow: row,
        currentCol: col,
        currentChar: board[row][col],
        targetChar: word[wordIndex],
        visited: visited.map(r => [...r]),
      },
      description: `访问 [${row}, ${col}]='${board[row][col]}'，匹配第 ${wordIndex} 个字符 '${word[wordIndex]}'`,
    });

    // 标记为已访问
    visited[row][col] = true;
    path.push([row, col]);

    // 四个方向搜索
    const directions: [number, number, string][] = [
      [-1, 0, '上'],
      [1, 0, '下'],
      [0, -1, '左'],
      [0, 1, '右'],
    ];

    for (const [dx, dy, dir] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      steps.push({
        id: stepId++,
        data: {},
        variables: {
          board,
          word,
          path: [...path],
          wordIndex: wordIndex + 1,
          currentRow: row,
          currentCol: col,
          nextRow: newRow,
          nextCol: newCol,
          direction: dir,
          visited: visited.map(r => [...r]),
        },
        description: `尝试向${dir}方向搜索 [${newRow}, ${newCol}]`,
      });

      if (dfs(newRow, newCol, wordIndex + 1, visited, path)) {
        return true;
      }
    }

    // 回溯
    path.pop();
    visited[row][col] = false;

    steps.push({
      id: stepId++,
      data: {},
      variables: {
        board,
        word,
        path: [...path],
        wordIndex,
        currentRow: row,
        currentCol: col,
        visited: visited.map(r => [...r]),
        backtrack: true,
      },
      description: `回溯，取消访问 [${row}, ${col}]`,
    });

    return false;
  }

  // 遍历所有起点
  let found = false;
  for (let i = 0; i < rows && !found; i++) {
    for (let j = 0; j < cols && !found; j++) {
      if (board[i][j] === word[0]) {
        steps.push({
          id: stepId++,
          data: {},
          variables: {
            board,
            word,
            path: [],
            wordIndex: 0,
            startRow: i,
            startCol: j,
          },
          description: `尝试从 [${i}, ${j}]='${board[i][j]}' 开始搜索`,
        });

        const visited = Array(rows)
          .fill(null)
          .map(() => Array(cols).fill(false));
        
        if (dfs(i, j, 0, visited, [])) {
          found = true;
        }
      }
    }
  }

  if (!found) {
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        board,
        word,
        path: [],
        wordIndex: 0,
        found: false,
      },
      description: `✗ 未找到单词 "${word}"`,
    });
  }

  return steps;
}
