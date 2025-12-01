import { VisualizationStep } from '@/types';

export function generateMedianFinderSteps(operations: Array<{ type: 'addNum' | 'findMedian'; value?: number }>): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const maxHeap: number[] = []; // 较小的一半（最大堆）
  const minHeap: number[] = []; // 较大的一半（最小堆）
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：创建最大堆（较小的一半）和最小堆（较大的一半）',
    data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: null },
    variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], phase: 'init' },
  });

  for (const op of operations) {
    if (op.type === 'addNum') {
      const num = op.value!;

      steps.push({
        id: stepId++,
        description: `添加数字 ${num}`,
        data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, adding: num },
        variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, adding: num, phase: 'add' },
      });

      // 决定放入哪个堆
      if (maxHeap.length === 0 || num <= (maxHeap.length > 0 ? maxHeap[0] : Infinity)) {
        maxHeap.push(num);
        maxHeap.sort((a, b) => b - a); // 简化：使用排序模拟最大堆

        steps.push({
          id: stepId++,
          description: `数字 ${num} 放入最大堆（较小的一半）`,
          data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op },
          variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, addedToMax: true, phase: 'add_max' },
        });
      } else {
        minHeap.push(num);
        minHeap.sort((a, b) => a - b); // 简化：使用排序模拟最小堆

        steps.push({
          id: stepId++,
          description: `数字 ${num} 放入最小堆（较大的一半）`,
          data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op },
          variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, addedToMin: true, phase: 'add_min' },
        });
      }

      // 平衡两个堆
      if (maxHeap.length > minHeap.length + 1) {
        const val = maxHeap.shift()!;
        minHeap.push(val);
        minHeap.sort((a, b) => a - b);

        steps.push({
          id: stepId++,
          description: `平衡堆：从最大堆移动 ${val} 到最小堆`,
          data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op },
          variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, balanced: true, moved: val, phase: 'balance' },
        });
      } else if (minHeap.length > maxHeap.length + 1) {
        const val = minHeap.shift()!;
        maxHeap.push(val);
        maxHeap.sort((a, b) => b - a);

        steps.push({
          id: stepId++,
          description: `平衡堆：从最小堆移动 ${val} 到最大堆`,
          data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op },
          variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, balanced: true, moved: val, phase: 'balance' },
        });
      }
    } else if (op.type === 'findMedian') {
      let median: number;
      if (maxHeap.length === minHeap.length) {
        median = (maxHeap[0] + minHeap[0]) / 2;
      } else {
        median = maxHeap.length > minHeap.length ? maxHeap[0] : minHeap[0];
      }

      steps.push({
        id: stepId++,
        description: `查找中位数：${median}`,
        data: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, median },
        variables: { maxHeap: [...maxHeap], minHeap: [...minHeap], operation: op, median, phase: 'find' },
      });
    }
  }

  return steps;
}

