import { VisualizationStep } from '@/types';

export function generateSolveNQueensSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const result: string[][] = [];
  const board: string[] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // 主对角线 row - col
  const diag2 = new Set<number>(); // 副对角线 row + col
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `初始化：${n}×${n} 棋盘，开始回溯`,
    data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row: 0, col: -1 },
    variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row: 0, col: -1, phase: 'init' },
  });

  const backtrack = (row: number) => {
    if (row === n) {
      result.push([...board]);
      steps.push({
        id: stepId++,
        description: `找到一个解！`,
        data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col: -1, found: true },
        variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col: -1, found: true, phase: 'found' },
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      steps.push({
        id: stepId++,
        description: `尝试在位置 (${row}, ${col}) 放置皇后`,
        data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col },
        variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, phase: 'try' },
      });

      const conflictCol = cols.has(col);
      const conflictDiag1 = diag1.has(row - col);
      const conflictDiag2 = diag2.has(row + col);

      if (conflictCol || conflictDiag1 || conflictDiag2) {
        steps.push({
          id: stepId++,
          description: `位置 (${row}, ${col}) 冲突：${conflictCol ? '列' : ''}${conflictDiag1 ? '主对角线' : ''}${conflictDiag2 ? '副对角线' : ''}，跳过`,
          data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, conflict: true },
          variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, conflict: true, phase: 'conflict' },
        });
        continue;
      }

      // 放置皇后
      const rowStr = '.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1);
      board.push(rowStr);
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      steps.push({
        id: stepId++,
        description: `在位置 (${row}, ${col}) 放置皇后`,
        data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, placed: true },
        variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, placed: true, phase: 'place' },
      });

      backtrack(row + 1);

      // 回溯
      board.pop();
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);

      steps.push({
        id: stepId++,
        description: `回溯：撤销位置 (${row}, ${col}) 的皇后`,
        data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, backtrack: true },
        variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), row, col, backtrack: true, phase: 'backtrack' },
      });
    }
  };

  backtrack(0);

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！共找到 ${result.length} 个解`,
    data: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), result: result.length, finished: true },
    variables: { n, board: [...board], cols: Array.from(cols), diag1: Array.from(diag1), diag2: Array.from(diag2), result: result.length, finished: true },
  });

  return steps;
}

