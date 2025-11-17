import { VisualizationStep } from '@/types';

export function generateClimbingStairsSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 基础情况
  if (n <= 2) {
    steps.push({
      id: stepId++,
      description: `n = ${n}，直接返回结果 ${n}`,
      data: { n, result: n },
      variables: { n, result: n },
    });
    return steps;
  }

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `开始计算爬 ${n} 阶楼梯的方法数`,
    data: { n },
    variables: { n },
  });

  let prev2 = 1; // f(1)
  let prev1 = 2; // f(2)

  steps.push({
    id: stepId++,
    description: '初始化：f(1) = 1（爬1阶有1种方法），f(2) = 2（爬2阶有2种方法）',
    data: { n, dp: [0, 1, 2] },
    variables: {
      prev2,
      prev1,
      step: 2,
    },
  });

  const dpArray = [0, 1, 2]; // dp[0]不使用，dp[1]=1, dp[2]=2

  // 从第3阶开始计算
  for (let i = 3; i <= n; i++) {
    steps.push({
      id: stepId++,
      description: `计算 f(${i})：当前在第 ${i} 阶`,
      data: { n, dp: [...dpArray], currentStep: i },
      variables: {
        prev2,
        prev1,
        step: i,
        computing: true,
      },
    });

    const current = prev1 + prev2;
    dpArray.push(current);

    steps.push({
      id: stepId++,
      description: `f(${i}) = f(${i-1}) + f(${i-2}) = ${prev1} + ${prev2} = ${current}`,
      data: { n, dp: [...dpArray], currentStep: i },
      variables: {
        prev2,
        prev1,
        current,
        step: i,
        formula: `f(${i}) = f(${i-1}) + f(${i-2})`,
      },
    });

    // 更新指针
    steps.push({
      id: stepId++,
      description: `更新：prev2 = ${prev1}, prev1 = ${current}`,
      data: { n, dp: [...dpArray], currentStep: i },
      variables: {
        prev2: prev1,
        prev1: current,
        step: i,
        updated: true,
      },
    });

    prev2 = prev1;
    prev1 = current;
  }

  // 最终结果
  steps.push({
    id: stepId++,
    description: `计算完成！爬 ${n} 阶楼梯共有 ${prev1} 种方法`,
    data: { n, dp: dpArray, result: prev1 },
    variables: {
      n,
      result: prev1,
      finished: true,
    },
  });

  return steps;
}
