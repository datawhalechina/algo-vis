import { VisualizationStep } from '@/types';

export function generateCanPartitionSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const sum = nums.reduce((a, b) => a + b, 0);
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `计算数组总和：sum = ${sum}`,
    data: { nums: [...nums], sum, current: -1 },
    variables: { nums: [...nums], sum, current: -1, phase: 'init' },
  });

  if (sum % 2 !== 0) {
    steps.push({
      id: stepId++,
      description: `总和为奇数，无法分割成两个相等的子集，返回false`,
      data: { nums: [...nums], sum, result: false, finished: true },
      variables: { sum, result: false, finished: true },
    });
    return steps;
  }

  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  steps.push({
    id: stepId++,
    description: `总和为偶数，目标和 target = ${target}，初始化dp数组，dp[0] = true`,
    data: { nums: [...nums], sum, target, dp: [...dp], current: -1 },
    variables: { sum, target, dp: [...dp], current: -1, phase: 'dp' },
  });

  // DP过程
  for (let numIdx = 0; numIdx < nums.length; numIdx++) {
    const num = nums[numIdx];

    steps.push({
      id: stepId++,
      description: `处理数字 nums[${numIdx}] = ${num}`,
      data: { nums: [...nums], sum, target, dp: [...dp], current: numIdx },
      variables: { nums: [...nums], sum, target, dp: [...dp], current: numIdx, num, phase: 'process' },
    });

    for (let i = target; i >= num; i--) {
      const canForm = dp[i] || dp[i - num];

      steps.push({
        id: stepId++,
        description: `检查能否组成和 ${i}：dp[${i}] = dp[${i}] || dp[${i - num}] = ${dp[i]} || ${dp[i - num]} = ${canForm}`,
        data: { nums: [...nums], sum, target, dp: [...dp], current: numIdx, checking: i },
        variables: { dp: [...dp], current: numIdx, checking: i, num, canForm, dpI: dp[i], dpIMinusNum: dp[i - num] },
      });

      dp[i] = canForm;

      if (canForm) {
        steps.push({
          id: stepId++,
          description: `更新 dp[${i}] = true`,
          data: { nums: [...nums], sum, target, dp: [...dp], current: numIdx, checking: i },
          variables: { dp: [...dp], current: numIdx, checking: i, updated: true },
        });
      }
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！dp[${target}] = ${dp[target]}，${dp[target] ? '可以分割' : '无法分割'}`,
    data: { nums: [...nums], sum, target, dp: [...dp], result: dp[target], finished: true },
    variables: { dp: [...dp], result: dp[target], finished: true },
  });

  return steps;
}

