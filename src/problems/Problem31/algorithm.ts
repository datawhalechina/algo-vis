import { VisualizationStep } from '@/types';

export function generateNextPermutationSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...nums];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: '初始化：开始寻找下一个排列',
    data: { nums: arr },
    variables: { nums: arr },
    code: '1',
  });

  // Step 1: 从后向前找到第一个升序对
  let i = arr.length - 2;
  steps.push({
    id: stepId++,
    description: '从后向前查找第一个 nums[i] < nums[i+1] 的位置',
    data: { nums: arr },
    variables: { nums: arr, i: arr.length - 2 },
    code: '2',
  });

  while (i >= 0 && arr[i] >= arr[i + 1]) {
    steps.push({
      id: stepId++,
      description: `检查位置 ${i}: nums[${i}]=${arr[i]} >= nums[${i+1}]=${arr[i+1]}，继续向前`,
      data: { nums: arr },
      variables: { nums: arr, i },
      highlightedIndices: [i, i + 1],
      code: '3',
    });
    i--;
  }

  if (i >= 0) {
    steps.push({
      id: stepId++,
      description: `找到位置 ${i}: nums[${i}]=${arr[i]} < nums[${i+1}]=${arr[i+1]}`,
      data: { nums: arr },
      variables: { nums: arr, i },
      highlightedIndices: [i, i + 1],
      code: '4',
    });

    // Step 2: 从后向前找到第一个大于 arr[i] 的元素
    let j = arr.length - 1;
    steps.push({
      id: stepId++,
      description: `从后向前找第一个大于 nums[${i}]=${arr[i]} 的元素`,
      data: { nums: arr },
      variables: { nums: arr, i, j },
      code: '5',
    });

    while (j >= 0 && arr[j] <= arr[i]) {
      steps.push({
        id: stepId++,
        description: `检查位置 ${j}: nums[${j}]=${arr[j]} <= nums[${i}]=${arr[i]}，继续向前`,
        data: { nums: arr },
        variables: { nums: arr, i, j },
        highlightedIndices: [i, j],
        code: '6',
      });
      j--;
    }

    steps.push({
      id: stepId++,
      description: `找到位置 ${j}: nums[${j}]=${arr[j]} > nums[${i}]=${arr[i]}`,
      data: { nums: arr },
      variables: { nums: arr, i, j },
      highlightedIndices: [i, j],
      code: '7',
    });

    // Step 3: 交换 arr[i] 和 arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
    steps.push({
      id: stepId++,
      description: `交换 nums[${i}] 和 nums[${j}]`,
      data: { nums: arr },
      variables: { nums: arr, i, j },
      highlightedIndices: [i, j],
      code: '8',
    });
  } else {
    steps.push({
      id: stepId++,
      description: '未找到升序对，说明当前是最大排列，准备翻转整个数组',
      data: { nums: arr },
      variables: { nums: arr, i: -1 },
      code: '9',
    });
  }

  // Step 4: 反转 i+1 到末尾的部分
  const reverseStart = i + 1;
  steps.push({
    id: stepId++,
    description: `反转从位置 ${reverseStart} 到末尾的元素`,
    data: { nums: arr },
    variables: { nums: arr, reverseStart },
    code: '10',
  });

  let left = reverseStart;
  let right = arr.length - 1;
  while (left < right) {
    steps.push({
      id: stepId++,
      description: `交换 nums[${left}]=${arr[left]} 和 nums[${right}]=${arr[right]}`,
      data: { nums: arr },
      variables: { nums: arr, left, right },
      highlightedIndices: [left, right],
      code: '11',
    });

    [arr[left], arr[right]] = [arr[right], arr[left]];
    
    steps.push({
      id: stepId++,
      description: `交换完成，继续向中间靠拢`,
      data: { nums: arr },
      variables: { nums: arr, left, right },
      highlightedIndices: [left, right],
      code: '12',
    });
    
    left++;
    right--;
  }

  steps.push({
    id: stepId++,
    description: `完成！得到下一个排列: [${arr.join(', ')}]`,
    data: { nums: arr },
    variables: { nums: arr, finished: true },
    code: '13',
  });

  return steps;
}
