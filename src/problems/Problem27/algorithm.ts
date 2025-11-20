import { VisualizationStep } from '@/types';

export function generateContainsDuplicateSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const seen = new Set<number>();
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: '初始化空的哈希集合，用于记录已出现的数字',
    data: { nums },
    variables: { i: -1, hasDuplicate: false },
    code: '2',
  });

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      id: stepId++,
      description: `检查索引 ${i}，当前值为 ${nums[i]}`,
      data: { nums },
      variables: {
        i,
        currentValue: nums[i],
        seen: Array.from(seen),
      },
      code: '4',
    });

    if (seen.has(nums[i])) {
      steps.push({
        id: stepId++,
        description: `发现重复！${nums[i]} 已经在集合中`,
        data: { nums },
        variables: {
          i,
          currentValue: nums[i],
          hasDuplicate: true,
          seen: Array.from(seen),
          finished: true,
        },
        code: '6',
      });
      return steps;
    }

    seen.add(nums[i]);
    steps.push({
      id: stepId++,
      description: `将 ${nums[i]} 加入集合`,
      data: { nums },
      variables: {
        i,
        currentValue: nums[i],
        seen: Array.from(seen),
      },
      code: '9',
    });
  }

  steps.push({
    id: stepId++,
    description: '遍历完成，没有发现重复元素',
    data: { nums },
    variables: {
      hasDuplicate: false,
      finished: true,
      seen: Array.from(seen),
    },
    code: '12',
  });

  return steps;
}
