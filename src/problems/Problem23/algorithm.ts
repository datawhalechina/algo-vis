import { VisualizationStep } from '@/types';

export function generateSingleNumberSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let result = 0;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：result = 0，使用异或运算找出只出现一次的数字',
    data: { nums, result },
    variables: { result, i: -1 },
    code: '2',
  });

  // 遍历数组
  for (let i = 0; i < nums.length; i++) {
    const prevResult = result;
    
    steps.push({
      id: stepId++,
      description: `遍历到索引 ${i}，当前值为 ${nums[i]}`,
      data: { nums, result: prevResult },
      variables: { result: prevResult, i, currentValue: nums[i] },
      highlightedIndices: [i],
      code: '4',
    });

    result ^= nums[i];

    steps.push({
      id: stepId++,
      description: `执行异或运算：${prevResult} ^ ${nums[i]} = ${result}`,
      data: { nums, result },
      variables: { 
        result, 
        i, 
        prevResult,
        currentValue: nums[i],
        binary: {
          prev: prevResult.toString(2).padStart(8, '0'),
          current: nums[i].toString(2).padStart(8, '0'),
          result: result.toString(2).padStart(8, '0'),
        }
      },
      highlightedIndices: [i],
      code: '5',
    });
  }

  // 最终结果
  steps.push({
    id: stepId++,
    description: `完成！只出现一次的数字是：${result}`,
    data: { nums, result },
    variables: { result, finished: true },
    code: '8',
  });

  return steps;
}
