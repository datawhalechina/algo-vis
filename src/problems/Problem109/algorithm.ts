import { VisualizationStep } from '@/types';

export function generateJumpIISteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let jumps = 0;
  let end = 0;
  let maxReach = 0;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：jumps=0（跳跃次数），end=0（当前跳跃边界），maxReach=0（下一步最远可达位置）',
    data: { nums: [...nums], jumps, end, maxReach, current: 0 },
    variables: { jumps, end, maxReach, current: 0 },
  });

  // 贪心算法
  for (let i = 0; i < nums.length - 1; i++) {
    steps.push({
      id: stepId++,
      description: `位置 ${i}，可以跳到最远位置 ${i + nums[i]}`,
      data: { nums: [...nums], jumps, end, maxReach, current: i },
      variables: { jumps, end, maxReach, current: i, canReach: i + nums[i] },
    });

    maxReach = Math.max(maxReach, i + nums[i]);

    steps.push({
      id: stepId++,
      description: `更新 maxReach = ${maxReach}`,
      data: { nums: [...nums], jumps, end, maxReach, current: i },
      variables: { jumps, end, maxReach, current: i, updated: true },
    });

    // 到达边界，必须跳跃
    if (i === end) {
      steps.push({
        id: stepId++,
        description: `到达边界 end=${end}，必须进行一次跳跃`,
        data: { nums: [...nums], jumps, end, maxReach, current: i },
        variables: { jumps, end, maxReach, current: i, atBoundary: true },
      });

      jumps++;
      end = maxReach;

      steps.push({
        id: stepId++,
        description: `跳跃次数 jumps=${jumps}，更新边界 end=${end}`,
        data: { nums: [...nums], jumps, end, maxReach, current: i },
        variables: { jumps, end, maxReach, current: i, jumped: true },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最少跳跃次数为 ${jumps}`,
    data: { nums: [...nums], jumps, end, maxReach, finished: true },
    variables: { jumps, end, maxReach, finished: true },
  });

  return steps;
}

