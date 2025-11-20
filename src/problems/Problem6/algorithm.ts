import { VisualizationStep } from '@/types';

export function generateContainerSteps(height: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化双指针：left = 0 指向最左边，right = ' + (height.length - 1) + ' 指向最右边',
    data: { height, left, right, maxArea },
    variables: {
      left,
      right,
      maxArea,
      width: right - left,
      leftHeight: height[left],
      rightHeight: height[right],
    },
  });

  // 双指针遍历
  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;

    // 计算面积步骤
    steps.push({
      id: stepId++,
      description: `计算当前容器面积：宽度 = ${width}, 高度 = min(${height[left]}, ${height[right]}) = ${currentHeight}, 面积 = ${area}`,
      data: { height, left, right, maxArea, currentArea: area },
      variables: {
        left,
        right,
        maxArea,
        width,
        leftHeight: height[left],
        rightHeight: height[right],
        currentHeight,
        currentArea: area,
        isNewMax: area > maxArea,
      },
    });

    // 更新最大面积
    if (area > maxArea) {
      maxArea = area;
      steps.push({
        id: stepId++,
        description: `✓ 发现更大的容器！更新 maxArea = ${maxArea}`,
        data: { height, left, right, maxArea, currentArea: area },
        variables: {
          left,
          right,
          maxArea,
          width,
          leftHeight: height[left],
          rightHeight: height[right],
          currentHeight,
          currentArea: area,
          isNewMax: true,
        },
      });
    }

    // 决定移动哪个指针
    const moveLeft = height[left] < height[right];
    const movingSide = moveLeft ? 'left' : 'right';
    const reason = moveLeft
      ? `height[left] = ${height[left]} < height[right] = ${height[right]}`
      : `height[left] = ${height[left]} >= height[right] = ${height[right]}`;

    steps.push({
      id: stepId++,
      description: `移动 ${movingSide} 指针，因为 ${reason}`,
      data: { height, left, right, maxArea },
      variables: {
        left,
        right,
        maxArea,
        movingSide,
        beforeMove: true,
      },
    });

    // 移动指针
    if (moveLeft) {
      left++;
    } else {
      right--;
    }

    // 移动后的状态
    if (left < right) {
      steps.push({
        id: stepId++,
        description: `指针已移动：left = ${left}, right = ${right}`,
        data: { height, left, right, maxArea },
        variables: {
          left,
          right,
          maxArea,
          width: right - left,
          leftHeight: height[left],
          rightHeight: height[right],
        },
      });
    }
  }

  // 最终结果
  steps.push({
    id: stepId++,
    description: `算法结束！最大容器面积 = ${maxArea}`,
    data: { height, left, right, maxArea },
    variables: {
      left,
      right,
      maxArea,
      finished: true,
    },
  });

  return steps;
}
