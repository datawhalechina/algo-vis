import { VisualizationStep } from '@/types';

export function generateLargestRectangleAreaSteps(heights: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const stack: number[] = [];
  let maxArea = 0;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：使用单调递增栈，maxArea = 0',
    data: { heights: [...heights], stack: [...stack], maxArea, current: -1 },
    variables: { heights: [...heights], stack: [...stack], maxArea, current: -1, phase: 'init' },
  });

  // 遍历柱子（包括虚拟的末尾0）
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];

    steps.push({
      id: stepId++,
      description: `检查位置 ${i}，高度 = ${h}${i === heights.length ? ' (虚拟末尾)' : ''}`,
      data: { heights: [...heights], stack: [...stack], maxArea, current: i },
      variables: { heights: [...heights], stack: [...stack], maxArea, current: i, height: h, phase: 'check' },
    });

    // 弹出栈顶并计算面积
    while (stack.length > 0 && heights[stack[stack.length - 1]] > h) {
      const topIdx = stack[stack.length - 1];
      const height = heights[topIdx];
      const width = stack.length === 1 ? i : i - stack[stack.length - 2] - 1;
      const area = height * width;

      steps.push({
        id: stepId++,
        description: `弹出栈顶索引 ${topIdx}，高度 = ${height}，宽度 = ${width}，面积 = ${area}`,
        data: { heights: [...heights], stack: [...stack], maxArea, current: i, popping: topIdx },
        variables: { 
          heights: [...heights], 
          stack: [...stack], 
          maxArea, 
          current: i, 
          popping: topIdx,
          height,
          width,
          area,
          phase: 'pop' 
        },
      });

      stack.pop();
      maxArea = Math.max(maxArea, area);

      steps.push({
        id: stepId++,
        description: `更新最大面积：maxArea = max(${maxArea - area}, ${area}) = ${maxArea}`,
        data: { heights: [...heights], stack: [...stack], maxArea, current: i },
        variables: { 
          heights: [...heights], 
          stack: [...stack], 
          maxArea, 
          current: i,
          updated: true,
          phase: 'update' 
        },
      });
    }

    // 当前索引入栈
    if (i < heights.length) {
      stack.push(i);
      steps.push({
        id: stepId++,
        description: `索引 ${i} 入栈`,
        data: { heights: [...heights], stack: [...stack], maxArea, current: i },
        variables: { heights: [...heights], stack: [...stack], maxArea, current: i, pushing: i, phase: 'push' },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！最大矩形面积为 ${maxArea}`,
    data: { heights: [...heights], stack: [...stack], maxArea, finished: true },
    variables: { heights: [...heights], stack: [...stack], maxArea, finished: true },
  });

  return steps;
}

