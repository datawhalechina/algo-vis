import { VisualizationStep } from "@/types";

export function maxProductSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let maxDP = nums[0];
  let minDP = nums[0];
  let result = nums[0];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `乘积最大子数组：数组 [${nums.join(', ')}]`,
    data: { nums, maxDP, minDP, result },
    variables: { nums, maxDP, minDP, result },
  });

  steps.push({
    id: stepId++,
    description: `初始化：maxDP = ${maxDP}, minDP = ${minDP}, result = ${result}`,
    data: { nums, maxDP, minDP, result, currentIndex: 0 },
    variables: { nums, maxDP, minDP, result, currentIndex: 0 },
  });

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const tempMax = maxDP;
    const tempMin = minDP;
    
    steps.push({
      id: stepId++,
      description: `检查位置 ${i}（值 = ${num}）`,
      data: { 
        nums, 
        maxDP, 
        minDP, 
        result,
        currentIndex: i,
        currentValue: num,
        checking: true
      },
      variables: { 
        nums, 
        maxDP, 
        minDP, 
        result,
        currentIndex: i,
        currentValue: num
      },
    });

    // 计算三个候选值
    const candidate1 = num;
    const candidate2 = tempMax * num;
    const candidate3 = tempMin * num;
    
    maxDP = Math.max(candidate1, candidate2, candidate3);
    minDP = Math.min(candidate1, candidate2, candidate3);
    
    steps.push({
      id: stepId++,
      description: `更新 maxDP 和 minDP：
候选值：${num}, ${tempMax} × ${num} = ${candidate2}, ${tempMin} × ${num} = ${candidate3}
maxDP = max(${candidate1}, ${candidate2}, ${candidate3}) = ${maxDP}
minDP = min(${candidate1}, ${candidate2}, ${candidate3}) = ${minDP}`,
      data: { 
        nums, 
        maxDP, 
        minDP, 
        result,
        currentIndex: i,
        currentValue: num,
        candidate1,
        candidate2,
        candidate3,
        oldMax: tempMax,
        oldMin: tempMin
      },
      variables: { 
        nums, 
        maxDP, 
        minDP, 
        result,
        currentIndex: i,
        candidate1,
        candidate2,
        candidate3
      },
    });

    const oldResult = result;
    result = Math.max(result, maxDP);
    
    if (result !== oldResult) {
      steps.push({
        id: stepId++,
        description: `更新全局最大值：result = max(${oldResult}, ${maxDP}) = ${result}`,
        data: { 
          nums, 
          maxDP, 
          minDP, 
          result,
          currentIndex: i,
          updated: true
        },
        variables: { 
          nums, 
          maxDP, 
          minDP, 
          result,
          currentIndex: i,
          updated: true
        },
      });
    } else {
      steps.push({
        id: stepId++,
        description: `全局最大值保持不变：result = ${result}`,
        data: { 
          nums, 
          maxDP, 
          minDP, 
          result,
          currentIndex: i,
          updated: false
        },
        variables: { 
          nums, 
          maxDP, 
          minDP, 
          result,
          currentIndex: i,
          updated: false
        },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！乘积最大子数组的乘积为 ${result}`,
    data: { 
      nums, 
      maxDP, 
      minDP, 
      result,
      completed: true
    },
    variables: { 
      nums, 
      maxDP, 
      minDP, 
      result,
      completed: true
    },
  });

  return steps;
}
