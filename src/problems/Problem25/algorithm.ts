import { VisualizationStep } from '@/types';

export function generateCountPrimesSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  if (n <= 2) {
    steps.push({
      id: 0,
      description: `n = ${n}，小于等于 2，质数个数为 0`,
      data: { n, count: 0 },
      variables: { count: 0, finished: true },
      code: '2',
    });
    return steps;
  }

  const isPrime = new Array(n).fill(true);
  isPrime[0] = isPrime[1] = false;
  let count = 0;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化：创建布尔数组，标记 0 和 1 为非质数`,
    data: { n, isPrime: [...isPrime], count },
    variables: { count, currentNumber: -1 },
    code: '2',
  });

  for (let i = 2; i < n; i++) {
    if (isPrime[i]) {
      steps.push({
        id: stepId++,
        description: `${i} 是质数，count++，准备标记其倍数`,
        data: { n, isPrime: [...isPrime], count },
        variables: { count, currentNumber: i, isPrimeNum: true },
        code: '4',
      });

      count++;

      // 标记倍数
      for (let j = i * i; j < n; j += i) {
        if (isPrime[j]) {
          isPrime[j] = false;
          steps.push({
            id: stepId++,
            description: `标记 ${j} 为非质数（${i} 的倍数）`,
            data: { n, isPrime: [...isPrime], count },
            variables: { count, currentNumber: i, markedNumber: j },
            code: '6',
          });
        }
      }

      steps.push({
        id: stepId++,
        description: `完成 ${i} 的倍数标记，当前质数计数: ${count}`,
        data: { n, isPrime: [...isPrime], count },
        variables: { count, currentNumber: i },
        code: '4',
      });
    } else {
      steps.push({
        id: stepId++,
        description: `${i} 已被标记为非质数，跳过`,
        data: { n, isPrime: [...isPrime], count },
        variables: { count, currentNumber: i, isPrimeNum: false },
        code: '4',
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！小于 ${n} 的质数个数为 ${count}`,
    data: { n, isPrime: [...isPrime], count },
    variables: { count, finished: true },
    code: '8',
  });

  return steps;
}
