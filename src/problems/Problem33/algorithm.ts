import { VisualizationStep } from '@/types';

export function generateSearchRotatedArraySteps(nums: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  let left = 0;
  let right = nums.length - 1;

  steps.push({
    id: stepId++,
    description: `初始化：在旋转排序数组中搜索目标值 ${target}`,
    data: { nums, target },
    variables: { nums, target, left, right },
    code: '1',
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      id: stepId++,
      description: `计算中间位置 mid = ${mid}，nums[${mid}] = ${nums[mid]}`,
      data: { nums, target },
      variables: { nums, target, left, right, mid },
      highlightedIndices: [left, mid, right],
      code: '3',
    });

    if (nums[mid] === target) {
      steps.push({
        id: stepId++,
        description: `找到目标值！nums[${mid}] = ${target}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, result: mid },
        highlightedIndices: [mid],
        code: '5',
      });
      return steps;
    }

    // 判断哪一边是有序的
    if (nums[left] <= nums[mid]) {
      steps.push({
        id: stepId++,
        description: `左半部分 [${left}, ${mid}] 是有序的，nums[${left}]=${nums[left]} <= nums[${mid}]=${nums[mid]}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid },
        highlightedIndices: Array.from({ length: mid - left + 1 }, (_, i) => left + i),
        code: '7',
      });

      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
        steps.push({
          id: stepId++,
          description: `目标值在左半部分，移动 right = ${mid - 1}`,
          data: { nums, target },
          variables: { nums, target, left, right, mid },
          code: '9',
        });
      } else {
        left = mid + 1;
        steps.push({
          id: stepId++,
          description: `目标值在右半部分，移动 left = ${mid + 1}`,
          data: { nums, target },
          variables: { nums, target, left, right, mid },
          code: '11',
        });
      }
    } else {
      steps.push({
        id: stepId++,
        description: `右半部分 [${mid}, ${right}] 是有序的，nums[${mid}]=${nums[mid]} < nums[${right}]=${nums[right]}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid },
        highlightedIndices: Array.from({ length: right - mid + 1 }, (_, i) => mid + i),
        code: '13',
      });

      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
        steps.push({
          id: stepId++,
          description: `目标值在右半部分，移动 left = ${mid + 1}`,
          data: { nums, target },
          variables: { nums, target, left, right, mid },
          code: '15',
        });
      } else {
        right = mid - 1;
        steps.push({
          id: stepId++,
          description: `目标值在左半部分，移动 right = ${mid - 1}`,
          data: { nums, target },
          variables: { nums, target, left, right, mid },
          code: '17',
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `未找到目标值 ${target}`,
    data: { nums, target },
    variables: { nums, target, result: -1 },
    code: '19',
  });

  return steps;
}
