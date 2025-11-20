import { VisualizationStep } from "@/types";

export function generateTwoSumIISteps(numbers: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始双指针查找：在有序数组 [${numbers.join(', ')}] 中找和为 ${target} 的两个数`,
    data: { numbers: [...numbers], target },
    variables: { left: 0, right: numbers.length - 1, target },
  });

  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    steps.push({
      id: stepId++,
      description: `left = ${left}, right = ${right}，计算 numbers[${left}] + numbers[${right}] = ${numbers[left]} + ${numbers[right]} = ${sum}`,
      data: { numbers: [...numbers], target },
      variables: { left, right, sum, comparing: true },
    });

    if (sum === target) {
      steps.push({
        id: stepId++,
        description: `找到答案！${numbers[left]} + ${numbers[right]} = ${target}，返回 [${left + 1}, ${right + 1}]`,
        data: { numbers: [...numbers], target },
        variables: { left, right, sum, result: [left + 1, right + 1], finished: true },
      });
      return steps;
    } else if (sum < target) {
      steps.push({
        id: stepId++,
        description: `${sum} < ${target}，和太小，左指针右移 left = ${left + 1}`,
        data: { numbers: [...numbers], target },
        variables: { left: left + 1, right, moveLeft: true },
      });
      left++;
    } else {
      steps.push({
        id: stepId++,
        description: `${sum} > ${target}，和太大，右指针左移 right = ${right - 1}`,
        data: { numbers: [...numbers], target },
        variables: { left, right: right - 1, moveRight: true },
      });
      right--;
    }
  }

  steps.push({
    id: stepId++,
    description: "未找到答案",
    data: { numbers: [...numbers], target },
    variables: { finished: true, notFound: true },
  });

  return steps;
}
