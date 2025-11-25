import { VisualizationStep } from '@/types';

export function generateFirstMissingPositiveSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const arr = [...nums];
  const n = arr.length;

  steps.push({
    id: stepId++,
    description: '初始化：查找缺失的第一个正数',
    data: { nums: arr },
    variables: { nums: arr, n },
    code: '1',
  });

  // 将每个正数放到正确的位置
  for (let i = 0; i < n; i++) {
    while (arr[i] > 0 && arr[i] <= n && arr[arr[i] - 1] !== arr[i]) {
      const targetIdx = arr[i] - 1;
      steps.push({
        id: stepId++,
        description: `位置 ${i}: nums[${i}]=${arr[i]}，应该放在位置 ${targetIdx}`,
        data: { nums: arr },
        variables: { nums: arr, i, targetIdx },
        highlightedIndices: [i, targetIdx],
        code: '4',
      });

      // 交换
      [arr[i], arr[targetIdx]] = [arr[targetIdx], arr[i]];
      
      steps.push({
        id: stepId++,
        description: `交换 nums[${i}] 和 nums[${targetIdx}]`,
        data: { nums: arr },
        variables: { nums: arr, i, targetIdx },
        highlightedIndices: [i, targetIdx],
        code: '6',
      });
    }
  }

  steps.push({
    id: stepId++,
    description: '调整完成，开始查找第一个不在正确位置的数',
    data: { nums: arr },
    variables: { nums: arr },
    code: '8',
  });

  // 查找第一个不在正确位置的数
  for (let i = 0; i < n; i++) {
    if (arr[i] !== i + 1) {
      steps.push({
        id: stepId++,
        description: `找到！位置 ${i} 上的值应该是 ${i + 1}，但实际是 ${arr[i]}`,
        data: { nums: arr },
        variables: { nums: arr, i, result: i + 1 },
        highlightedIndices: [i],
        code: '10',
      });
      return steps;
    }
  }

  steps.push({
    id: stepId++,
    description: `所有位置都正确，缺失的第一个正数是 ${n + 1}`,
    data: { nums: arr },
    variables: { nums: arr, result: n + 1 },
    code: '12',
  });

  return steps;
}
