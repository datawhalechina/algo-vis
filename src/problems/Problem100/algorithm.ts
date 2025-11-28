import { VisualizationStep } from "@/types";

export function canJumpSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = nums.length;
  let maxReach = 0;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始跳跃游戏，目标是到达最后一个位置 (索引${n - 1})`,
    data: { nums, maxReach, currentIndex: -1, targetIndex: n - 1 },
    variables: { nums, maxReach, n, targetIndex: n - 1 },
  });

  for (let i = 0; i < n; i++) {
    // 如果当前位置无法到达
    if (i > maxReach) {
      steps.push({
        id: stepId++,
        description: `位置 ${i} 超出了最远可达距离 ${maxReach}，无法到达终点！`,
        data: { nums, currentIndex: i, maxReach, canReach: false },
        variables: { currentIndex: i, maxReach, canReach: false },
      });
      return steps;
    }

    // 更新最远可达位置
    const newMaxReach = Math.max(maxReach, i + nums[i]);
    
    steps.push({
      id: stepId++,
      description: `位置 ${i} (值=${nums[i]})，可以跳到 ${i + nums[i]}，更新最远可达: ${maxReach} → ${newMaxReach}`,
      data: { 
        nums, 
        currentIndex: i, 
        maxReach, 
        newMaxReach,
        jumpRange: i + nums[i],
        updated: newMaxReach > maxReach
      },
      variables: { currentIndex: i, maxReach, newMaxReach, jumpRange: i + nums[i] },
    });
    
    maxReach = newMaxReach;

    // 如果已经可以到达或超过最后一个位置
    if (maxReach >= n - 1) {
      steps.push({
        id: stepId++,
        description: `最远可达距离 ${maxReach} ≥ 目标位置 ${n - 1}，可以到达终点！`,
        data: { nums, currentIndex: i, maxReach, canReach: true, targetIndex: n - 1 },
        variables: { currentIndex: i, maxReach, canReach: true },
      });
      return steps;
    }
  }

  // 遍历完成但未达到终点
  const canReach = maxReach >= n - 1;
  steps.push({
    id: stepId++,
    description: canReach ? `可以到达终点！` : `无法到达终点，最远只能到 ${maxReach}`,
    data: { nums, maxReach, canReach, targetIndex: n - 1 },
    variables: { maxReach, canReach },
  });

  return steps;
}
