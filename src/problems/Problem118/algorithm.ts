import { VisualizationStep } from '@/types';

export function generateEditDistanceSteps(word1: string, word2: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：dp[i][0] = i（删除i个字符），dp[0][j] = j（插入j个字符）',
    data: { word1, word2, dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1 },
    variables: { word1, word2, dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1, phase: 'init' },
  });

  // 初始化第一行和第一列
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    if (i > 0) {
      steps.push({
        id: stepId++,
        description: `初始化：dp[${i}][0] = ${i}（删除${i}个字符）`,
        data: { word1, word2, dp: dp.map(r => [...r]), currentRow: i, currentCol: 0 },
        variables: { word1, word2, dp: dp.map(r => [...r]), currentRow: i, currentCol: 0, phase: 'init_col' },
      });
    }
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
    if (j > 0) {
      steps.push({
        id: stepId++,
        description: `初始化：dp[0][${j}] = ${j}（插入${j}个字符）`,
        data: { word1, word2, dp: dp.map(r => [...r]), currentRow: 0, currentCol: j },
        variables: { word1, word2, dp: dp.map(r => [...r]), currentRow: 0, currentCol: j, phase: 'init_row' },
      });
    }
  }

  // DP过程
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      steps.push({
        id: stepId++,
        description: `计算 dp[${i}][${j}]：比较 word1[${i-1}] = '${word1[i-1]}' 和 word2[${j-1}] = '${word2[j-1]}'`,
        data: { word1, word2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
        variables: { 
          word1, 
          word2, 
          dp: dp.map(r => [...r]), 
          currentRow: i, 
          currentCol: j, 
          char1: word1[i-1],
          char2: word2[j-1],
          phase: 'compare' 
        },
      });

      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];

        steps.push({
          id: stepId++,
          description: `字符相同，无需操作，dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]}`,
          data: { word1, word2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
          variables: { 
            word1, 
            word2, 
            dp: dp.map(r => [...r]), 
            currentRow: i, 
            currentCol: j,
            char1: word1[i-1],
            char2: word2[j-1],
            match: true,
            fromDiag: dp[i-1][j-1],
            phase: 'match' 
          },
        });
      } else {
        const deleteOp = dp[i - 1][j];
        const insertOp = dp[i][j - 1];
        const replaceOp = dp[i - 1][j - 1];
        dp[i][j] = 1 + Math.min(deleteOp, insertOp, replaceOp);

        steps.push({
          id: stepId++,
          description: `字符不同，三种操作：删除=${deleteOp+1}，插入=${insertOp+1}，替换=${replaceOp+1}，取最小值 ${dp[i][j]}`,
          data: { word1, word2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
          variables: { 
            word1, 
            word2, 
            dp: dp.map(r => [...r]), 
            currentRow: i, 
            currentCol: j,
            char1: word1[i-1],
            char2: word2[j-1],
            match: false,
            deleteOp,
            insertOp,
            replaceOp,
            phase: 'no_match' 
          },
        });
      }
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！编辑距离为 ${dp[m][n]}`,
    data: { word1, word2, dp: dp.map(r => [...r]), result: dp[m][n], finished: true },
    variables: { word1, word2, dp: dp.map(r => [...r]), result: dp[m][n], finished: true },
  });

  return steps;
}

