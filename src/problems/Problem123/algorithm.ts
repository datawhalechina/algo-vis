import { VisualizationStep } from '@/types';

export function generateSearchMatrixSteps(matrix: number[][], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;
  let left = 0;
  let right = m * n - 1;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `初始化：将 ${m}×${n} 矩阵视为一维数组，left=0, right=${right}`,
    data: { matrix: matrix.map(r => [...r]), target, left, right, mid: -1, row: -1, col: -1 },
    variables: { matrix: matrix.map(r => [...r]), target, left, right, mid: -1, row: -1, col: -1, phase: 'init' },
  });

  // 二分查找
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const value = matrix[row][col];

    steps.push({
      id: stepId++,
      description: `计算 mid = ${mid}，对应矩阵位置 (${row}, ${col})，值为 ${value}`,
      data: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value },
      variables: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value, phase: 'compare' },
    });

    if (value === target) {
      steps.push({
        id: stepId++,
        description: `找到目标值！位置 (${row}, ${col})`,
        data: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value, found: true },
        variables: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value, found: true, phase: 'found' },
      });
      return steps;
    } else if (value < target) {
      left = mid + 1;
      steps.push({
        id: stepId++,
        description: `${value} < ${target}，在右半部分继续查找，left = ${left}`,
        data: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value },
        variables: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value, goRight: true, phase: 'go_right' },
      });
    } else {
      right = mid - 1;
      steps.push({
        id: stepId++,
        description: `${value} > ${target}，在左半部分继续查找，right = ${right}`,
        data: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value },
        variables: { matrix: matrix.map(r => [...r]), target, left, right, mid, row, col, value, goLeft: true, phase: 'go_left' },
      });
    }
  }

  // 未找到
  steps.push({
    id: stepId++,
    description: `未找到目标值 ${target}`,
    data: { matrix: matrix.map(r => [...r]), target, left, right, found: false, finished: true },
    variables: { matrix: matrix.map(r => [...r]), target, left, right, found: false, finished: true },
  });

  return steps;
}

