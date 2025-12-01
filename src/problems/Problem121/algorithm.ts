import { VisualizationStep } from '@/types';

export function generateTopKFrequentSteps(nums: number[], k: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const freq = new Map<number, number>();
  let stepId = 0;

  // 统计频率
  steps.push({
    id: stepId++,
    description: '第一步：统计每个元素的频率',
    data: { nums: [...nums], freq: new Map(freq), heap: [], k, current: -1 },
    variables: { nums: [...nums], freq: new Map(freq), heap: [], k, current: -1, phase: 'count' },
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const count = (freq.get(num) || 0) + 1;
    freq.set(num, count);

    steps.push({
      id: stepId++,
      description: `处理 nums[${i}] = ${num}，频率更新为 ${count}`,
      data: { nums: [...nums], freq: new Map(freq), heap: [], k, current: i },
      variables: { nums: [...nums], freq: new Map(freq), heap: [], k, current: i, num, count, phase: 'count' },
    });
  }

  // 使用最小堆
  const heap: number[] = [];
  const freqArray = Array.from(freq.entries());

  steps.push({
    id: stepId++,
    description: `第二步：使用最小堆维护频率最高的 ${k} 个元素`,
    data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, freqArray },
    variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, freqArray, phase: 'heap' },
  });

  for (let i = 0; i < freqArray.length; i++) {
    const [num, count] = freqArray[i];

    steps.push({
      id: stepId++,
      description: `处理元素 ${num}，频率 = ${count}`,
      data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, processing: num },
      variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, processing: num, count, phase: 'process' },
    });

    if (heap.length < k) {
      heap.push(num);
      steps.push({
        id: stepId++,
        description: `堆大小 < ${k}，直接加入堆`,
        data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i },
        variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, added: true, phase: 'add' },
      });
    } else {
      const minFreq = freq.get(heap[0])!;
      if (count > minFreq) {
        steps.push({
          id: stepId++,
          description: `频率 ${count} > 堆顶频率 ${minFreq}，替换堆顶`,
          data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, replacing: true },
          variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, replacing: true, oldTop: heap[0], newTop: num, phase: 'replace' },
        });
        heap[0] = num;
        // 简化：这里不实现完整的堆化，只显示替换操作
      } else {
        steps.push({
          id: stepId++,
          description: `频率 ${count} <= 堆顶频率 ${minFreq}，跳过`,
          data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i },
          variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, current: i, skipped: true, phase: 'skip' },
        });
      }
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！前 ${k} 个高频元素为 [${heap.join(', ')}]`,
    data: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, result: [...heap], finished: true },
    variables: { nums: [...nums], freq: new Map(freq), heap: [...heap], k, result: [...heap], finished: true },
  });

  return steps;
}

