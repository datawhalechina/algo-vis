import { VisualizationStep } from '@/types';

export function generateFindKthLargestSteps(nums: number[], k: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...nums];
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: `初始化：数组 = [${arr.join(', ')}]，寻找第 ${k} 大的元素`,
    data: { nums: [...arr], k, left: 0, right: arr.length - 1, pivotIndex: -1 },
    variables: { nums: [...arr], k, left: 0, right: arr.length - 1, pivotIndex: -1, phase: 'init' },
  });

  // 快速选择递归函数
  const quickSelect = (left: number, right: number, targetK: number): number => {
    if (left === right) {
      steps.push({
        id: stepId++,
        description: `left === right，找到第 ${targetK} 大的元素：${arr[left]}`,
        data: { nums: [...arr], k, left, right, pivotIndex: left, result: arr[left] },
        variables: { nums: [...arr], k, left, right, pivotIndex: left, result: arr[left], phase: 'found' },
      });
      return arr[left];
    }

    // 分区
    const pivotIndex = partition(left, right);

    steps.push({
      id: stepId++,
      description: `分区完成，pivot位置 = ${pivotIndex}，值为 ${arr[pivotIndex]}，是第 ${pivotIndex + 1} 大的元素`,
      data: { nums: [...arr], k, left, right, pivotIndex },
      variables: { nums: [...arr], k, left, right, pivotIndex, phase: 'partitioned' },
    });

    if (pivotIndex === targetK - 1) {
      steps.push({
        id: stepId++,
        description: `pivot位置 ${pivotIndex} === ${targetK - 1}，找到第 ${targetK} 大的元素：${arr[pivotIndex]}`,
        data: { nums: [...arr], k, left, right, pivotIndex, result: arr[pivotIndex] },
        variables: { nums: [...arr], k, left, right, pivotIndex, result: arr[pivotIndex], phase: 'found' },
      });
      return arr[pivotIndex];
    } else if (pivotIndex < targetK - 1) {
      steps.push({
        id: stepId++,
        description: `pivot位置 ${pivotIndex} < ${targetK - 1}，在右半部分继续查找`,
        data: { nums: [...arr], k, left: pivotIndex + 1, right, pivotIndex },
        variables: { nums: [...arr], k, left: pivotIndex + 1, right, pivotIndex, phase: 'go_right' },
      });
      return quickSelect(pivotIndex + 1, right, targetK);
    } else {
      steps.push({
        id: stepId++,
        description: `pivot位置 ${pivotIndex} > ${targetK - 1}，在左半部分继续查找`,
        data: { nums: [...arr], k, left, right: pivotIndex - 1, pivotIndex },
        variables: { nums: [...arr], k, left, right: pivotIndex - 1, pivotIndex, phase: 'go_left' },
      });
      return quickSelect(left, pivotIndex - 1, targetK);
    }
  };

  // 分区函数
  const partition = (left: number, right: number): number => {
    const pivot = arr[right];
    let i = left;

    steps.push({
      id: stepId++,
      description: `开始分区：[${left}, ${right}]，pivot = ${pivot}，i = ${i}`,
      data: { nums: [...arr], k, left, right, pivot, i, j: left, phase: 'partition_start' },
      variables: { nums: [...arr], k, left, right, pivot, i, j: left, phase: 'partition_start' },
    });

    for (let j = left; j < right; j++) {
      steps.push({
        id: stepId++,
        description: `检查 nums[${j}] = ${arr[j]}，${arr[j] >= pivot ? '≥' : '<'} pivot`,
        data: { nums: [...arr], k, left, right, pivot, i, j, phase: 'compare' },
        variables: { nums: [...arr], k, left, right, pivot, i, j, currentValue: arr[j], phase: 'compare' },
      });

      if (arr[j] >= pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];

        steps.push({
          id: stepId++,
          description: `交换 nums[${i}] 和 nums[${j}]，i++`,
          data: { nums: [...arr], k, left, right, pivot, i, j, swapped: true, phase: 'swap' },
          variables: { nums: [...arr], k, left, right, pivot, i, j, swapped: true, phase: 'swap' },
        });

        i++;
      }
    }

    [arr[i], arr[right]] = [arr[right], arr[i]];

    steps.push({
      id: stepId++,
      description: `将pivot放到正确位置，交换 nums[${i}] 和 nums[${right}]`,
      data: { nums: [...arr], k, left, right, pivot, i, pivotSwap: true, phase: 'pivot_swap' },
      variables: { nums: [...arr], k, left, right, pivot, i, pivotSwap: true, phase: 'pivot_swap' },
    });

    return i;
  };

  const result = quickSelect(0, arr.length - 1, k);

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！第 ${k} 大的元素为 ${result}`,
    data: { nums: [...arr], k, result, finished: true },
    variables: { nums: [...arr], k, result, finished: true },
  });

  return steps;
}

