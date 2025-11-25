import { VisualizationStep } from '@/types';

export function generateTrappingRainWaterSteps(height: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const n = height.length;
  
  if (n === 0) {
    steps.push({
      id: stepId++,
      description: '数组为空，无法接雨水',
      data: { height },
      variables: { height, result: 0 },
      code: '1',
    });
    return steps;
  }

  let left = 0;
  let right = n - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;
  const water: number[] = new Array(n).fill(0);

  steps.push({
    id: stepId++,
    description: '初始化：使用双指针法计算接雨水量',
    data: { height },
    variables: { height, left, right, leftMax, rightMax, totalWater, water: [...water] },
    code: '1',
  });

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
        steps.push({
          id: stepId++,
          description: `位置 ${left} 是左边最高点，高度 = ${leftMax}，不能接水`,
          data: { height },
          variables: { height, left, right, leftMax, rightMax, totalWater, water: [...water] },
          highlightedIndices: [left],
          code: '5',
        });
      } else {
        const waterHeight = leftMax - height[left];
        water[left] = waterHeight;
        totalWater += waterHeight;
        steps.push({
          id: stepId++,
          description: `位置 ${left} 可以接 ${waterHeight} 单位的水（${leftMax} - ${height[left]}）`,
          data: { height },
          variables: { height, left, right, leftMax, rightMax, totalWater, water: [...water] },
          highlightedIndices: [left],
          code: '7',
        });
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
        steps.push({
          id: stepId++,
          description: `位置 ${right} 是右边最高点，高度 = ${rightMax}，不能接水`,
          data: { height },
          variables: { height, left, right, leftMax, rightMax, totalWater, water: [...water] },
          highlightedIndices: [right],
          code: '11',
        });
      } else {
        const waterHeight = rightMax - height[right];
        water[right] = waterHeight;
        totalWater += waterHeight;
        steps.push({
          id: stepId++,
          description: `位置 ${right} 可以接 ${waterHeight} 单位的水（${rightMax} - ${height[right]}）`,
          data: { height },
          variables: { height, left, right, leftMax, rightMax, totalWater, water: [...water] },
          highlightedIndices: [right],
          code: '13',
        });
      }
      right--;
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！总共可以接 ${totalWater} 单位的雨水`,
    data: { height },
    variables: { height, totalWater, water: [...water], finished: true },
    code: '17',
  });

  return steps;
}
