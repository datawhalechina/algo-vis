import { VisualizationStep } from '@/types';

export function generatePowerOfThreeSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (n <= 0) {
    steps.push({
      id: stepId++,
      description: `n = ${n} ≤ 0，不是3的幂`,
      data: { n },
      variables: { isPowerOfThree: false, finished: true },
      code: '2',
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `开始检查 n = ${n} 是否是3的幂`,
    data: { n },
    variables: { current: n },
    code: '2',
  });

  let current = n;
  const divisions: { value: number; divisible: boolean }[] = [];

  while (current > 1) {
    steps.push({
      id: stepId++,
      description: `当前值 ${current}，检查是否能被3整除`,
      data: { n },
      variables: { current, divisions: [...divisions] },
      code: '4',
    });

    if (current % 3 !== 0) {
      divisions.push({ value: current, divisible: false });
      steps.push({
        id: stepId++,
        description: `${current} 不能被3整除，不是3的幂`,
        data: { n },
        variables: { current, isPowerOfThree: false, finished: true, divisions: [...divisions] },
        code: '6',
      });
      return steps;
    }

    divisions.push({ value: current, divisible: true });
    steps.push({
      id: stepId++,
      description: `${current} 能被3整除，继续除以3`,
      data: { n },
      variables: { current, divisions: [...divisions] },
      code: '9',
    });

    current = Math.floor(current / 3);
  }

  steps.push({
    id: stepId++,
    description: current === 1 
      ? `最终结果为1，${n} 是3的幂！` 
      : `最终结果为${current}，${n} 不是3的幂`,
    data: { n },
    variables: { 
      current, 
      isPowerOfThree: current === 1, 
      finished: true,
      divisions: [...divisions]
    },
    code: '12',
  });

  return steps;
}
