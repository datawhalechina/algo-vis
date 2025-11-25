import { VisualizationStep } from "@/types";

export function generateSearchInsertSteps(nums: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始二分查找：在 [${nums.join(', ')}] 中查找 ${target} 的插入位置`,
    data: { nums: [...nums], target },
    variables: { left: 0, right: nums.length - 1, target },
  });

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      id: stepId++,
      description: `left = ${left}, right = ${right}, mid = ${mid}，检查 nums[${mid}] = ${nums[mid]}`,
      data: { nums: [...nums], target },
      variables: { left, right, mid, target, comparing: true },
    });

    if (nums[mid] === target) {
      steps.push({
        id: stepId++,
        description: `找到目标！nums[${mid}] === ${target}，返回索引 ${mid}`,
        data: { nums: [...nums], target },
        variables: { left, right, mid, target, found: true, result: mid, finished: true },
      });
      return steps;
    } else if (nums[mid] < target) {
      steps.push({
        id: stepId++,
        description: `nums[${mid}] = ${nums[mid]} < ${target}，在右半部分查找，更新 left = ${mid + 1}`,
        data: { nums: [...nums], target },
        variables: { left: mid + 1, right, mid, target, searchRight: true },
      });
      left = mid + 1;
    } else {
      steps.push({
        id: stepId++,
        description: `nums[${mid}] = ${nums[mid]} > ${target}，在左半部分查找，更新 right = ${mid - 1}`,
        data: { nums: [...nums], target },
        variables: { left, right: mid - 1, mid, target, searchLeft: true },
      });
      right = mid - 1;
    }
  }

  steps.push({
    id: stepId++,
    description: `未找到目标，应插入位置为 ${left}`,
    data: { nums: [...nums], target },
    variables: { left, right, target, found: false, result: left, finished: true },
  });

  return steps;
}
