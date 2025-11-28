import { VisualizationStep } from "@/types";

export function numSquaresSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // dp[i] 表示和为i的完全平方数的最少数量
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  steps.push({
    id: stepId++,
    description: `寻找和为 ${n} 的完全平方数的最少数量`,
    data: { n, dp: [...dp] },
    variables: { n, dp: [...dp] },
  });

  // 生成完全平方数列表
  const squares: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    squares.push(i * i);
  }

  steps.push({
    id: stepId++,
    description: `生成完全平方数列表: [${squares.join(', ')}]`,
    data: { n, squares, dp: [...dp] },
    variables: { n, squares, dp: [...dp] },
  });

  steps.push({
    id: stepId++,
    description: `初始化 dp[0] = 0`,
    data: { n, dp: [...dp], squares },
    variables: { dp: [...dp], squares },
  });

  for (let i = 1; i <= n; i++) {
    for (const square of squares) {
      if (i < square) break;
      
      const prev = dp[i - square];
      const newVal = prev + 1;
      
      if (newVal < dp[i]) {
        dp[i] = newVal;
        
        steps.push({
          id: stepId++,
          description: `dp[${i}]: 使用平方数 ${square}, dp[${i-square}] + 1 = ${prev} + 1 = ${newVal}`,
          data: { n, dp: [...dp], currentIndex: i, square, prev, newVal, squares },
          variables: { currentIndex: i, square, prev, newVal, dp: [...dp], squares },
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！和为 ${n} 的完全平方数最少数量为 ${dp[n]}`,
    data: { n, dp: [...dp], result: dp[n], completed: true, squares },
    variables: { dp: [...dp], result: dp[n], squares },
  });

  return steps;
}
