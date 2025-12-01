import { VisualizationStep } from '@/types';

export function generateLongestCommonSubsequenceSteps(text1: string, text2: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：dp[i][j]表示text1[0...i-1]和text2[0...j-1]的最长公共子序列长度，初始化为0',
    data: { text1, text2, dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1 },
    variables: { text1, text2, dp: dp.map(r => [...r]), currentRow: -1, currentCol: -1, phase: 'init' },
  });

  // DP过程
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      steps.push({
        id: stepId++,
        description: `计算 dp[${i}][${j}]：比较 text1[${i-1}] = '${text1[i-1]}' 和 text2[${j-1}] = '${text2[j-1]}'`,
        data: { text1, text2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
        variables: { 
          text1, 
          text2, 
          dp: dp.map(r => [...r]), 
          currentRow: i, 
          currentCol: j, 
          char1: text1[i-1],
          char2: text2[j-1],
          phase: 'compare' 
        },
      });

      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        steps.push({
          id: stepId++,
          description: `字符相同，dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
          data: { text1, text2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
          variables: { 
            text1, 
            text2, 
            dp: dp.map(r => [...r]), 
            currentRow: i, 
            currentCol: j,
            char1: text1[i-1],
            char2: text2[j-1],
            match: true,
            fromDiag: dp[i-1][j-1],
            phase: 'match' 
          },
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

        steps.push({
          id: stepId++,
          description: `字符不同，dp[${i}][${j}] = max(dp[${i-1}][${j}], dp[${i}][${j-1}]) = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
          data: { text1, text2, dp: dp.map(r => [...r]), currentRow: i, currentCol: j },
          variables: { 
            text1, 
            text2, 
            dp: dp.map(r => [...r]), 
            currentRow: i, 
            currentCol: j,
            char1: text1[i-1],
            char2: text2[j-1],
            match: false,
            fromTop: dp[i-1][j],
            fromLeft: dp[i][j-1],
            phase: 'no_match' 
          },
        });
      }
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最长公共子序列长度为 ${dp[m][n]}`,
    data: { text1, text2, dp: dp.map(r => [...r]), result: dp[m][n], finished: true },
    variables: { text1, text2, dp: dp.map(r => [...r]), result: dp[m][n], finished: true },
  });

  return steps;
}

