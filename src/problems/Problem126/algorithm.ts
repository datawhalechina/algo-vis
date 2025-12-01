import { VisualizationStep } from "@/types";

export function generateProductExceptSelfSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `初始化：answer数组长度为 ${n}，初始值全为1`,
    data: { nums: [...nums], answer: [...answer], left: 1, right: 1, i: -1, phase: "init" },
    variables: { nums: [...nums], answer: [...answer], left: 1, right: 1, i: -1, phase: "init" },
  });

  // 计算左侧乘积
  let left = 1;
  steps.push({
    id: stepId++,
    description: "第一步：从左到右计算左侧所有元素的乘积",
    data: { nums: [...nums], answer: [...answer], left, right: 1, i: -1, phase: "left_start" },
    variables: { nums: [...nums], answer: [...answer], left, right: 1, i: -1, phase: "left_start" },
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      id: stepId++,
      description: `位置 ${i}：answer[${i}] = left = ${left}`,
      data: { nums: [...nums], answer: [...answer], left, right: 1, i },
      variables: { nums: [...nums], answer: [...answer], left, right: 1, i, phase: "left_assign" },
    });

    answer[i] = left;
    left *= nums[i];

    steps.push({
      id: stepId++,
      description: `更新 left = left × nums[${i}] = ${left / nums[i]} × ${nums[i]} = ${left}`,
      data: { nums: [...nums], answer: [...answer], left, right: 1, i },
      variables: { nums: [...nums], answer: [...answer], left, right: 1, i, phase: "left_update" },
    });
  }

  // 计算右侧乘积并相乘
  let right = 1;
  steps.push({
    id: stepId++,
    description: "第二步：从右到左计算右侧所有元素的乘积，并乘以answer",
    data: { nums: [...nums], answer: [...answer], left, right, i: n, phase: "right_start" },
    variables: { nums: [...nums], answer: [...answer], left, right, i: n, phase: "right_start" },
  });

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      id: stepId++,
      description: `位置 ${i}：answer[${i}] = answer[${i}] × right = ${answer[i]} × ${right} = ${answer[i] * right}`,
      data: { nums: [...nums], answer: [...answer], left, right, i },
      variables: { nums: [...nums], answer: [...answer], left, right, i, phase: "right_multiply" },
    });

    answer[i] *= right;
    right *= nums[i];

    steps.push({
      id: stepId++,
      description: `更新 right = right × nums[${i}] = ${right / nums[i]} × ${nums[i]} = ${right}`,
      data: { nums: [...nums], answer: [...answer], left, right, i },
      variables: { nums: [...nums], answer: [...answer], left, right, i, phase: "right_update" },
    });
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最终结果：[${answer.join(", ")}]`,
    data: { nums: [...nums], answer: [...answer], left, right, i: -1, finished: true },
    variables: { nums: [...nums], answer: [...answer], left, right, i: -1, finished: true },
  });

  return steps;
}

