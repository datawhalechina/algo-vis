import { VisualizationStep } from '@/types';

function getNext(n: number): number {
  let sum = 0;
  while (n > 0) {
    const digit = n % 10;
    sum += digit * digit;
    n = Math.floor(n / 10);
  }
  return sum;
}

export function generateHappyNumberSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const seen = new Set<number>();
  let current = n;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化：n = ${n}，使用哈希集合检测循环`,
    data: { n, current },
    variables: { current, isHappy: false },
    code: '2',
  });

  while (current !== 1 && !seen.has(current)) {
    const digits: number[] = [];
    let temp = current;
    while (temp > 0) {
      digits.unshift(temp % 10);
      temp = Math.floor(temp / 10);
    }

    steps.push({
      id: stepId++,
      description: `当前数字 ${current}，分解为各位数字：${digits.join(', ')}`,
      data: { n, current },
      variables: { current, digits, seen: Array.from(seen) },
      code: '4',
    });

    const calculation = digits.map(d => `${d}²`).join(' + ');
    const next = getNext(current);

    steps.push({
      id: stepId++,
      description: `计算各位平方和：${calculation} = ${next}`,
      data: { n, current },
      variables: { 
        current, 
        digits,
        calculation,
        next,
        seen: Array.from(seen)
      },
      code: '5',
    });

    seen.add(current);
    current = next;

    steps.push({
      id: stepId++,
      description: `添加到已访问集合，下一个数字是 ${current}`,
      data: { n, current },
      variables: { current, seen: Array.from(seen) },
      code: '7',
    });
  }

  const isHappy = current === 1;
  
  steps.push({
    id: stepId++,
    description: isHappy 
      ? `达到 1！${n} 是快乐数 ✓` 
      : `检测到循环！${n} 不是快乐数 ✗`,
    data: { n, current },
    variables: { current, isHappy, seen: Array.from(seen), finished: true },
    code: '10',
  });

  return steps;
}
