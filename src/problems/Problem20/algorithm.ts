import { VisualizationStep } from "@/types";

export function generateReverseStringSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const chars = s.split('');
  
  steps.push({
    id: stepId++,
    description: `开始反转字符串："${s}"`,
    data: { chars: [...chars] },
    variables: { left: 0, right: chars.length - 1 },
  });

  let left = 0;
  let right = chars.length - 1;

  while (left < right) {
    steps.push({
      id: stepId++,
      description: `left = ${left}, right = ${right}，准备交换 '${chars[left]}' 和 '${chars[right]}'`,
      data: { chars: [...chars] },
      variables: { left, right, comparing: true },
    });

    // 交换
    [chars[left], chars[right]] = [chars[right], chars[left]];

    steps.push({
      id: stepId++,
      description: `交换完成：'${chars[right]}' ↔ '${chars[left]}'`,
      data: { chars: [...chars] },
      variables: { left: left + 1, right: right - 1, swapped: true },
    });

    left++;
    right--;
  }

  steps.push({
    id: stepId++,
    description: `反转完成！结果："${chars.join('')}"`,
    data: { chars: [...chars] },
    variables: { left, right, finished: true, result: chars.join('') },
  });

  return steps;
}
