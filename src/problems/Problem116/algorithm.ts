import { VisualizationStep } from '@/types';

export function generateFindMinSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = nums.length - 1;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：left=0, right=' + right,
    data: { nums: [...nums], left, right, mid: -1 },
    variables: { nums: [...nums], left, right, mid: -1 },
  });

  // 二分查找
  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      id: stepId++,
      description: `计算 mid = (left + right) / 2 = (${left} + ${right}) / 2 = ${mid}`,
      data: { nums: [...nums], left, right, mid },
      variables: { nums: [...nums], left, right, mid },
    });

    steps.push({
      id: stepId++,
      description: `比较 nums[${mid}] = ${nums[mid]} 和 nums[${right}] = ${nums[right]}`,
      data: { nums: [...nums], left, right, mid },
      variables: { nums: [...nums], left, right, mid, comparing: true, midValue: nums[mid], rightValue: nums[right] },
    });

    if (nums[mid] > nums[right]) {
      // 最小值在右半部分
      left = mid + 1;

      steps.push({
        id: stepId++,
        description: `nums[${mid}] > nums[${right}]，最小值在右半部分，left = ${left}`,
        data: { nums: [...nums], left, right, mid },
        variables: { nums: [...nums], left, right, mid, goRight: true },
      });
    } else {
      // 最小值在左半部分（包括mid）
      right = mid;

      steps.push({
        id: stepId++,
        description: `nums[${mid}] <= nums[${right}]，最小值在左半部分，right = ${right}`,
        data: { nums: [...nums], left, right, mid },
        variables: { nums: [...nums], left, right, mid, goLeft: true },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最小值为 nums[${left}] = ${nums[left]}`,
    data: { nums: [...nums], left, right, result: nums[left], finished: true },
    variables: { nums: [...nums], left, right, result: nums[left], finished: true },
  });

  return steps;
}

