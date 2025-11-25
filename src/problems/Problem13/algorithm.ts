import { VisualizationStep } from "@/types";

export function generateRemoveDuplicatesSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (nums.length === 0) {
    steps.push({
      id: stepId++,
      description: "数组为空，直接返回 0",
      data: { nums: [] },
      variables: { k: 0, finished: true },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `开始删除重复项：nums = [${nums.join(', ')}]`,
    data: { nums: [...nums] },
    variables: { k: 1, i: 1 },
  });

  let k = 1;
  const result = [...nums];

  for (let i = 1; i < nums.length; i++) {
    steps.push({
      id: stepId++,
      description: `检查 nums[${i}] = ${nums[i]}，与 nums[${k - 1}] = ${result[k - 1]} 比较`,
      data: { nums: [...result] },
      variables: { k, i, comparing: true },
    });

    if (nums[i] !== result[k - 1]) {
      result[k] = nums[i];
      steps.push({
        id: stepId++,
        description: `${nums[i]} ≠ ${result[k - 1]}，不重复！将 ${nums[i]} 放到位置 ${k}`,
        data: { nums: [...result] },
        variables: { k: k + 1, i, moved: true },
      });
      k++;
    } else {
      steps.push({
        id: stepId++,
        description: `${nums[i]} === ${result[k - 1]}，重复元素，跳过`,
        data: { nums: [...result] },
        variables: { k, i, skipped: true },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！前 ${k} 个元素为不重复元素：[${result.slice(0, k).join(', ')}]`,
    data: { nums: [...result] },
    variables: { k, uniqueArray: result.slice(0, k), finished: true },
  });

  return steps;
}
