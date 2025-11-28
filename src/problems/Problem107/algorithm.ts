import { VisualizationStep } from "@/types";

export function uniquePathsSteps(m: number, n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `不同路径：网格大小 ${m} × ${n}，从左上角到右下角`,
    data: { m, n, dp: dp.map(row => [...row]) },
    variables: { m, n, dp: dp.map(row => [...row]) },
  });

  steps.push({
    id: stepId++,
    description: `初始化：第一行和第一列都只有 1 种路径`,
    data: { m, n, dp: dp.map(row => [...row]) },
    variables: { m, n, dp: dp.map(row => [...row]) },
  });

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      steps.push({
        id: stepId++,
        description: `计算位置 (${i}, ${j})`,
        data: { 
          m, 
          n, 
          dp: dp.map(row => [...row]),
          currentRow: i,
          currentCol: j,
          checking: true
        },
        variables: { 
          m, 
          n, 
          dp: dp.map(row => [...row]),
          currentRow: i,
          currentCol: j
        },
      });

      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      
      steps.push({
        id: stepId++,
        description: `dp[${i}][${j}] = dp[${i-1}][${j}] + dp[${i}][${j-1}] = ${dp[i-1][j]} + ${dp[i][j-1]} = ${dp[i][j]}`,
        data: { 
          m, 
          n, 
          dp: dp.map(row => [...row]),
          currentRow: i,
          currentCol: j,
          fromTop: dp[i-1][j],
          fromLeft: dp[i][j-1],
          updated: true
        },
        variables: { 
          m, 
          n, 
          dp: dp.map(row => [...row]),
          currentRow: i,
          currentCol: j,
          fromTop: dp[i-1][j],
          fromLeft: dp[i][j-1]
        },
      });
    }
  }

  const result = dp[m - 1][n - 1];
  
  steps.push({
    id: stepId++,
    description: `完成！从 (0,0) 到 (${m-1},${n-1}) 共有 ${result} 条不同路径`,
    data: { 
      m, 
      n, 
      dp: dp.map(row => [...row]),
      result,
      completed: true
    },
    variables: { 
      m, 
      n, 
      dp: dp.map(row => [...row]),
      result,
      completed: true
    },
  });

  return steps;
}
