import { VisualizationStep } from '@/types';

export function generateMinPathSumSteps(grid: number[][]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = grid.length;
  const n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：创建dp数组，dp[i][j]表示到达(i,j)的最小路径和',
    data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1 },
    variables: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1, phase: 'init' },
  });

  // 初始化第一行和第一列
  dp[0][0] = grid[0][0];
  steps.push({
    id: stepId++,
    description: `初始化起点：dp[0][0] = grid[0][0] = ${grid[0][0]}`,
    data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: 0, currentCol: 0 },
    variables: { dp: dp.map(r => [...r]), currentRow: 0, currentCol: 0, phase: 'init' },
  });

  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
    steps.push({
      id: stepId++,
      description: `初始化第一列：dp[${i}][0] = dp[${i - 1}][0] + grid[${i}][0] = ${dp[i][0]}`,
      data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: i, currentCol: 0 },
      variables: { dp: dp.map(r => [...r]), currentRow: i, currentCol: 0, phase: 'init_col' },
    });
  }

  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
    steps.push({
      id: stepId++,
      description: `初始化第一行：dp[0][${j}] = dp[0][${j - 1}] + grid[0][${j}] = ${dp[0][j]}`,
      data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: 0, currentCol: j },
      variables: { dp: dp.map(r => [...r]), currentRow: 0, currentCol: j, phase: 'init_row' },
    });
  }

  // 填充dp数组
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp[i - 1][j];
      const fromLeft = dp[i][j - 1];
      const min = Math.min(fromTop, fromLeft);
      dp[i][j] = grid[i][j] + min;

      steps.push({
        id: stepId++,
        description: `计算dp[${i}][${j}]：从上方来=${fromTop}，从左方来=${fromLeft}，取最小值${min}，dp[${i}][${j}] = ${grid[i][j]} + ${min} = ${dp[i][j]}`,
        data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
        variables: { dp: dp.map(r => [...r]), currentRow: i, currentCol: j, fromTop, fromLeft, min, phase: 'dp' },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最小路径和为 ${dp[m - 1][n - 1]}`,
    data: { grid: grid.map(r => [...r]), dp: dp.map(r => [...r]), result: dp[m - 1][n - 1], finished: true },
    variables: { dp: dp.map(r => [...r]), result: dp[m - 1][n - 1], finished: true },
  });

  return steps;
}

