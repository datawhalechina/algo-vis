import { VisualizationStep } from "@/types";

export function searchInsertSteps(nums: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = nums.length - 1;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始二分查找，目标值 = ${target}`,
    data: { nums, target, left, right, mid: null, found: false },
    variables: { nums, target, left, right },
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      id: stepId++,
      description: `检查中间位置 mid = ${mid}, nums[${mid}] = ${nums[mid]}`,
      data: { nums, target, left, right, mid, value: nums[mid], found: false },
      variables: { nums, target, left, right, mid },
    });

    if (nums[mid] === target) {
      steps.push({
        id: stepId++,
        description: `找到目标值！位置 = ${mid}`,
        data: { nums, target, left, right, mid, found: true, result: mid },
        variables: { nums, target, left, right, mid, result: mid },
      });
      return steps;
    } else if (nums[mid] < target) {
      steps.push({
        id: stepId++,
        description: `nums[${mid}] = ${nums[mid]} < ${target}，搜索右半部分`,
        data: { nums, target, left, right, mid, direction: "right", found: false },
        variables: { nums, target, left, right, mid },
      });
      left = mid + 1;
    } else {
      steps.push({
        id: stepId++,
        description: `nums[${mid}] = ${nums[mid]} > ${target}，搜索左半部分`,
        data: { nums, target, left, right, mid, direction: "left", found: false },
        variables: { nums, target, left, right, mid },
      });
      right = mid - 1;
    }
  }

  steps.push({
    id: stepId++,
    description: `未找到目标值，插入位置 = ${left}`,
    data: { nums, target, left, right: right, mid: null, found: false, result: left },
    variables: { nums, target, left, right, result: left },
  });

  return steps;
}
