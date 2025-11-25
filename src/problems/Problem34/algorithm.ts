import { VisualizationStep } from '@/types';

export function generateSearchRangeSteps(nums: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化：在排序数组中查找目标值 ${target} 的起始和结束位置`,
    data: { nums, target },
    variables: { nums, target },
    code: '1',
  });

  // 查找左边界
  let left = 0;
  let right = nums.length - 1;
  let leftBound = -1;

  steps.push({
    id: stepId++,
    description: '第一步：查找左边界（第一个等于target的位置）',
    data: { nums, target },
    variables: { nums, target, left, right, phase: 'left' },
    code: '2',
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      id: stepId++,
      description: `查找左边界：mid = ${mid}, nums[${mid}] = ${nums[mid]}`,
      data: { nums, target },
      variables: { nums, target, left, right, mid, phase: 'left' },
      highlightedIndices: [left, mid, right],
      code: '4',
    });

    if (nums[mid] < target) {
      left = mid + 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] < ${target}，移动 left = ${mid + 1}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, phase: 'left' },
        code: '6',
      });
    } else if (nums[mid] > target) {
      right = mid - 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] > ${target}，移动 right = ${mid - 1}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, phase: 'left' },
        code: '8',
      });
    } else {
      leftBound = mid;
      right = mid - 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] == ${target}，记录左边界 = ${mid}，继续向左查找`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, leftBound, phase: 'left' },
        highlightedIndices: [mid],
        code: '10',
      });
    }
  }

  if (leftBound === -1) {
    steps.push({
      id: stepId++,
      description: `未找到目标值 ${target}`,
      data: { nums, target },
      variables: { nums, target, result: [-1, -1] },
      code: '12',
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `找到左边界：${leftBound}`,
    data: { nums, target },
    variables: { nums, target, leftBound },
    highlightedIndices: [leftBound],
    code: '13',
  });

  // 查找右边界
  left = 0;
  right = nums.length - 1;
  let rightBound = -1;

  steps.push({
    id: stepId++,
    description: '第二步：查找右边界（最后一个等于target的位置）',
    data: { nums, target },
    variables: { nums, target, left, right, leftBound, phase: 'right' },
    code: '14',
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      id: stepId++,
      description: `查找右边界：mid = ${mid}, nums[${mid}] = ${nums[mid]}`,
      data: { nums, target },
      variables: { nums, target, left, right, mid, leftBound, phase: 'right' },
      highlightedIndices: [leftBound, mid],
      code: '16',
    });

    if (nums[mid] < target) {
      left = mid + 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] < ${target}，移动 left = ${mid + 1}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, leftBound, phase: 'right' },
        code: '18',
      });
    } else if (nums[mid] > target) {
      right = mid - 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] > ${target}，移动 right = ${mid - 1}`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, leftBound, phase: 'right' },
        code: '20',
      });
    } else {
      rightBound = mid;
      left = mid + 1;
      steps.push({
        id: stepId++,
        description: `nums[${mid}] == ${target}，记录右边界 = ${mid}，继续向右查找`,
        data: { nums, target },
        variables: { nums, target, left, right, mid, leftBound, rightBound, phase: 'right' },
        highlightedIndices: [leftBound, mid],
        code: '22',
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！找到范围 [${leftBound}, ${rightBound}]`,
    data: { nums, target },
    variables: { nums, target, leftBound, rightBound, result: [leftBound, rightBound] },
    highlightedIndices: Array.from({ length: rightBound - leftBound + 1 }, (_, i) => leftBound + i),
    code: '24',
  });

  return steps;
}
