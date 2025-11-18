import { VisualizationStep } from "@/types";

/**
 * 生成最大子数组和可视化步骤（Kadane算法）
 */
export function generateMaxSubArraySteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    description: `初始化：maxSum = ${nums[0]}, currentSum = ${nums[0]}（都设为第一个元素）`,
    data: { nums: [...nums] },
    variables: {
      index: 0,
      maxSum: nums[0],
      currentSum: nums[0],
      subArrayStart: 0,
      subArrayEnd: 0,
    },
  });

  let maxSum = nums[0];
  let currentSum = nums[0];
  let subArrayStart = 0;
  let subArrayEnd = 0;
  let tempStart = 0;

  // 遍历数组
  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const sumWithPrevious = currentSum + num;

    // 展示选择过程
    steps.push({
      id: stepId++,
      description: `第 ${i + 1} 个元素：${num}。比较 currentSum + ${num} = ${sumWithPrevious} 和 ${num}`,
      data: { nums: [...nums] },
      variables: {
        index: i,
        maxSum,
        currentSum,
        num,
        sumWithPrevious,
        subArrayStart: tempStart,
        subArrayEnd: i - 1,
        comparing: true,
      },
    });

    // 决策：加入前面的子数组，还是重新开始
    if (sumWithPrevious > num) {
      currentSum = sumWithPrevious;
      steps.push({
        id: stepId++,
        description: `${sumWithPrevious} > ${num}，选择加入前面的子数组。currentSum = ${currentSum}`,
        data: { nums: [...nums] },
        variables: {
          index: i,
          maxSum,
          currentSum,
          num,
          sumWithPrevious,
          subArrayStart: tempStart,
          subArrayEnd: i,
          extend: true,
        },
      });
    } else {
      currentSum = num;
      tempStart = i;
      steps.push({
        id: stepId++,
        description: `${sumWithPrevious} <= ${num}，从当前元素重新开始。currentSum = ${currentSum}`,
        data: { nums: [...nums] },
        variables: {
          index: i,
          maxSum,
          currentSum,
          num,
          subArrayStart: i,
          subArrayEnd: i,
          restart: true,
        },
      });
    }

    // 更新最大和
    if (currentSum > maxSum) {
      maxSum = currentSum;
      subArrayStart = tempStart;
      subArrayEnd = i;
      
      steps.push({
        id: stepId++,
        description: `✓ 找到更大的和！更新 maxSum = ${maxSum}（子数组：[${subArrayStart}, ${subArrayEnd}]）`,
        data: { nums: [...nums] },
        variables: {
          index: i,
          maxSum,
          currentSum,
          subArrayStart,
          subArrayEnd,
          isNewMax: true,
        },
      });
    } else {
      steps.push({
        id: stepId++,
        description: `currentSum = ${currentSum} 不大于 maxSum = ${maxSum}，保持不变`,
        data: { nums: [...nums] },
        variables: {
          index: i,
          maxSum,
          currentSum,
          subArrayStart: tempStart,
          subArrayEnd: i,
        },
      });
    }
  }

  // 最终结果
  const subArray = nums.slice(subArrayStart, subArrayEnd + 1);
  steps.push({
    id: stepId++,
    description: `算法完成！最大子数组和为 ${maxSum}，子数组为 [${subArray.join(', ')}]（索引 ${subArrayStart} 到 ${subArrayEnd}）`,
    data: { nums: [...nums] },
    variables: {
      maxSum,
      currentSum,
      subArrayStart,
      subArrayEnd,
      subArray,
      finished: true,
    },
  });

  return steps;
}
