import { VisualizationStep } from '@/types';

export function generateContainsDuplicateIISteps(nums: number[], k: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const map = new Map<number, number>();
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化哈希表，k = ${k}，用于记录数字及其索引`,
    data: { nums, k },
    variables: { i: -1, k, hasDuplicate: false },
    code: '2',
  });

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      id: stepId++,
      description: `检查索引 ${i}，当前值为 ${nums[i]}`,
      data: { nums, k },
      variables: {
        i,
        currentValue: nums[i],
        map: Object.fromEntries(map),
      },
      code: '4',
    });

    if (map.has(nums[i])) {
      const prevIndex = map.get(nums[i])!;
      const distance = i - prevIndex;
      
      steps.push({
        id: stepId++,
        description: `找到重复值 ${nums[i]}，上次出现在索引 ${prevIndex}，距离为 ${distance}`,
        data: { nums, k },
        variables: {
          i,
          currentValue: nums[i],
          prevIndex,
          distance,
          map: Object.fromEntries(map),
        },
        code: '6',
      });

      if (distance <= k) {
        steps.push({
          id: stepId++,
          description: `距离 ${distance} <= k (${k})，找到符合条件的重复元素！`,
          data: { nums, k },
          variables: {
            i,
            currentValue: nums[i],
            prevIndex,
            distance,
            hasDuplicate: true,
            finished: true,
            map: Object.fromEntries(map),
          },
          code: '8',
        });
        return steps;
      } else {
        steps.push({
          id: stepId++,
          description: `距离 ${distance} > k (${k})，不符合条件，更新索引`,
          data: { nums, k },
          variables: {
            i,
            currentValue: nums[i],
            prevIndex,
            distance,
            map: Object.fromEntries(map),
          },
          code: '11',
        });
      }
    }

    map.set(nums[i], i);
    steps.push({
      id: stepId++,
      description: `更新 ${nums[i]} 的索引为 ${i}`,
      data: { nums, k },
      variables: {
        i,
        currentValue: nums[i],
        map: Object.fromEntries(map),
      },
      code: '13',
    });
  }

  steps.push({
    id: stepId++,
    description: '遍历完成，没有找到符合条件的重复元素',
    data: { nums, k },
    variables: {
      hasDuplicate: false,
      finished: true,
      map: Object.fromEntries(map),
    },
    code: '16',
  });

  return steps;
}
