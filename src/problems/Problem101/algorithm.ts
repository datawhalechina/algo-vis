import { VisualizationStep } from "@/types";

export function robSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = nums.length;
  let stepId = 0;

  if (n === 0) return steps;

  steps.push({
    id: stepId++,
    description: `开始打家劫舍，房屋金额: [${nums.join(', ')}]`,
    data: { nums, n },
    variables: { nums, n },
  });

  if (n === 1) {
    steps.push({
      id: stepId++,
      description: `只有一间房屋，直接偷取金额 ${nums[0]}`,
      data: { nums, result: nums[0] },
      variables: { result: nums[0] },
    });
    return steps;
  }

  // dp[i] 表示偷到第i间房屋时的最大金额
  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  steps.push({
    id: stepId++,
    description: `初始化: dp[0] = ${dp[0]} (偷第0间), dp[1] = ${dp[1]} (偷第0或第1间的较大值)`,
    data: { nums, dp: [...dp], currentIndex: 1 },
    variables: { nums, dp: [...dp], currentIndex: 1 },
  });

  for (let i = 2; i < n; i++) {
    const notRob = dp[i - 1];  // 不偷当前房屋
    const rob = dp[i - 2] + nums[i];  // 偷当前房屋
    
    steps.push({
      id: stepId++,
      description: `考虑房屋 ${i} (金额=${nums[i]}):
- 不偷: dp[${i-1}] = ${notRob}
- 偷: dp[${i-2}] + ${nums[i]} = ${rob}`,
      data: { 
        nums, 
        dp: [...dp], 
        currentIndex: i, 
        notRob, 
        rob,
        comparing: true
      },
      variables: { nums, dp: [...dp], currentIndex: i, notRob, rob },
    });

    dp[i] = Math.max(notRob, rob);

    steps.push({
      id: stepId++,
      description: `dp[${i}] = max(${notRob}, ${rob}) = ${dp[i]}`,
      data: { nums, dp: [...dp], currentIndex: i },
      variables: { nums, dp: [...dp], currentIndex: i },
    });
  }

  steps.push({
    id: stepId++,
    description: `完成！最大偷窃金额为 ${dp[n - 1]}`,
    data: { nums, dp: [...dp], result: dp[n - 1], completed: true },
    variables: { nums, dp: [...dp], result: dp[n - 1] },
  });

  return steps;
}
