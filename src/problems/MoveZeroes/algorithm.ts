import { VisualizationStep } from '@/types';

export function generateMoveZeroesSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...nums]; // 复制数组用于演示
  let slow = 0;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：slow = 0 (指向下一个非零元素应该放置的位置), fast 从 0 开始遍历',
    data: { nums: [...arr], slow, fast: 0 },
    variables: { slow, fast: 0 },
  });

  // 遍历数组
  for (let fast = 0; fast < arr.length; fast++) {
    steps.push({
      id: stepId++,
      description: `fast = ${fast}, 检查 nums[${fast}] = ${arr[fast]}`,
      data: { nums: [...arr], slow, fast },
      variables: { slow, fast, currentValue: arr[fast], isZero: arr[fast] === 0 },
    });

    if (arr[fast] !== 0) {
      // 需要交换
      steps.push({
        id: stepId++,
        description: `nums[${fast}] = ${arr[fast]} 不为0，交换 nums[${slow}] 和 nums[${fast}]`,
        data: { nums: [...arr], slow, fast },
        variables: {
          slow,
          fast,
          beforeSwap: true,
          swapFrom: slow,
          swapTo: fast,
        },
      });

      // 执行交换
      [arr[slow], arr[fast]] = [arr[fast], arr[slow]];

      steps.push({
        id: stepId++,
        description: `交换完成，slow++`,
        data: { nums: [...arr], slow, fast },
        variables: {
          slow,
          fast,
          afterSwap: true,
        },
      });

      slow++;

      steps.push({
        id: stepId++,
        description: `slow = ${slow}，继续遍历`,
        data: { nums: [...arr], slow, fast },
        variables: { slow, fast },
      });
    } else {
      steps.push({
        id: stepId++,
        description: `nums[${fast}] = 0，跳过，继续遍历`,
        data: { nums: [...arr], slow, fast },
        variables: { slow, fast, skipped: true },
      });
    }
  }

  // 最终结果
  steps.push({
    id: stepId++,
    description: `完成！所有非零元素已移到前面，零在后面`,
    data: { nums: [...arr], slow, fast: arr.length },
    variables: { slow, fast: arr.length, finished: true },
  });

  return steps;
}
