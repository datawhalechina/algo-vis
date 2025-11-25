import { VisualizationStep } from "@/types";

export function generatePlusOneSteps(digits: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const result = [...digits];
  const originalNumber = digits.join('');

  steps.push({
    id: stepId++,
    description: `开始加一：数字 ${originalNumber} + 1`,
    data: { digits: [...result] },
    variables: { carry: 1, index: digits.length - 1 },
  });

  let carry = 1;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    if (carry === 0) break;

    const currentDigit = result[i];
    const sum = currentDigit + carry;

    steps.push({
      id: stepId++,
      description: `位置 ${i}：${currentDigit} + ${carry} = ${sum}`,
      data: { digits: [...result] },
      variables: { carry, index: i, currentDigit, sum, processing: true },
    });

    if (sum === 10) {
      result[i] = 0;
      carry = 1;
      steps.push({
        id: stepId++,
        description: `产生进位！位置 ${i} 变为 0，进位 carry = 1`,
        data: { digits: [...result] },
        variables: { carry: 1, index: i, hasCarry: true },
      });
    } else {
      result[i] = sum;
      carry = 0;
      steps.push({
        id: stepId++,
        description: `位置 ${i} 更新为 ${sum}，无需进位`,
        data: { digits: [...result] },
        variables: { carry: 0, index: i, noCarry: true },
      });
    }
  }

  if (carry === 1) {
    result.unshift(1);
    steps.push({
      id: stepId++,
      description: `最高位产生进位，在数组开头插入 1`,
      data: { digits: [...result] },
      variables: { carry: 0, overflow: true },
    });
  }

  const resultNumber = result.join('');
  steps.push({
    id: stepId++,
    description: `完成！结果：${resultNumber}`,
    data: { digits: [...result] },
    variables: { carry: 0, finished: true, result: [...result] },
  });

  return steps;
}
