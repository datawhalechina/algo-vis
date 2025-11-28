import { VisualizationStep } from "@/types";

export function lengthOfLISSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = nums.length;
  const dp = new Array(n).fill(1);
  let maxLen = 1;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始计算最长递增子序列，数组长度 ${n}`,
    data: { nums, dp: [...dp], n },
    variables: { nums, dp: [...dp], n },
  });

  steps.push({
    id: stepId++,
    description: `初始化 dp 数组，每个元素初始值为 1（单个元素本身）`,
    data: { nums, dp: [...dp] },
    variables: { nums, dp: [...dp] },
  });

  for (let i = 1; i < n; i++) {
    steps.push({
      id: stepId++,
      description: `检查位置 ${i}（值 = ${nums[i]}），寻找可以接在后面的子序列`,
      data: { 
        nums, 
        dp: [...dp],
        currentIndex: i,
        currentValue: nums[i],
        checking: true
      },
      variables: { 
        nums, 
        dp: [...dp],
        currentIndex: i,
        currentValue: nums[i]
      },
    });

    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        const oldDP = dp[i];
        dp[i] = Math.max(dp[i], dp[j] + 1);
        
        if (dp[i] !== oldDP) {
          steps.push({
            id: stepId++,
            description: `nums[${j}] = ${nums[j]} < nums[${i}] = ${nums[i]}，可以接在后面\ndp[${i}] = max(${oldDP}, dp[${j}] + 1) = max(${oldDP}, ${dp[j]} + 1) = ${dp[i]}`,
            data: { 
              nums, 
              dp: [...dp],
              currentIndex: i,
              compareIndex: j,
              updated: true,
              oldValue: oldDP,
              newValue: dp[i]
            },
            variables: { 
              nums, 
              dp: [...dp],
              currentIndex: i,
              compareIndex: j,
              updated: true
            },
          });
        } else {
          steps.push({
            id: stepId++,
            description: `nums[${j}] = ${nums[j]} < nums[${i}] = ${nums[i]}，但 dp[${j}] + 1 = ${dp[j] + 1} 不大于当前 dp[${i}] = ${dp[i]}`,
            data: { 
              nums, 
              dp: [...dp],
              currentIndex: i,
              compareIndex: j,
              updated: false
            },
            variables: { 
              nums, 
              dp: [...dp],
              currentIndex: i,
              compareIndex: j,
              updated: false
            },
          });
        }
      }
    }

    maxLen = Math.max(maxLen, dp[i]);
    
    steps.push({
      id: stepId++,
      description: `位置 ${i} 处理完成，dp[${i}] = ${dp[i]}，当前最大长度 = ${maxLen}`,
      data: { 
        nums, 
        dp: [...dp],
        currentIndex: i,
        maxLen
      },
      variables: { 
        nums, 
        dp: [...dp],
        currentIndex: i,
        maxLen
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `完成！最长递增子序列长度为 ${maxLen}`,
    data: { 
      nums, 
      dp: [...dp],
      maxLen,
      result: maxLen,
      completed: true
    },
    variables: { 
      nums, 
      dp: [...dp],
      maxLen,
      result: maxLen,
      completed: true
    },
  });

  return steps;
}
