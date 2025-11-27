import { VisualizationStep } from "@/types";

export function searchRotatedArraySteps(nums: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = nums.length - 1;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始在旋转排序数组中查找 ${target}`,
    data: { nums, target, left, right },
    variables: { nums, target, left, right },
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      steps.push({
        id: stepId++,
        description: `找到目标值！位置 = ${mid}`,
        data: { nums, target, left, right, mid, found: true, result: mid },
        variables: { nums, target, left, right, mid, result: mid },
      });
      return steps;
    }

    // 判断左半部分是否有序
    if (nums[left] <= nums[mid]) {
      steps.push({
        id: stepId++,
        description: `左半部分有序 [${left}:${mid}]`,
        data: { nums, target, left, right, mid, sortedSide: "left" },
        variables: { nums, target, left, right, mid },
      });

      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      steps.push({
        id: stepId++,
        description: `右半部分有序 [${mid}:${right}]`,
        data: { nums, target, left, right, mid, sortedSide: "right" },
        variables: { nums, target, left, right, mid },
      });

      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  steps.push({
    id: stepId++,
    description: "未找到目标值",
    data: { nums, target, found: false, result: -1 },
    variables: { nums, target, result: -1 },
  });

  return steps;
}
