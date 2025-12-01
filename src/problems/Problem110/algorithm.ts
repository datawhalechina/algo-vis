import { VisualizationStep } from '@/types';

export function generatePartitionLabelsSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const lastIndex = new Map<string, number>();
  let stepId = 0;

  // 记录每个字符最后出现的位置
  steps.push({
    id: stepId++,
    description: '第一步：记录每个字符最后出现的位置',
    data: { s, lastIndex: new Map(), current: 0 },
    variables: { phase: 'record', current: 0 },
  });

  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
    steps.push({
      id: stepId++,
      description: `字符 '${s[i]}' 最后出现在位置 ${i}`,
      data: { s, lastIndex: new Map(lastIndex), current: i },
      variables: { phase: 'record', current: i, char: s[i], lastPos: i },
    });
  }

  // 划分片段
  const result: number[] = [];
  let start = 0;
  let end = 0;

  steps.push({
    id: stepId++,
    description: '第二步：划分片段，start=0, end=0',
    data: { s, lastIndex: new Map(lastIndex), result: [], start, end, current: 0 },
    variables: { phase: 'partition', start, end, current: 0, result: [] },
  });

  for (let i = 0; i < s.length; i++) {
    const charLastIndex = lastIndex.get(s[i])!;
    end = Math.max(end, charLastIndex);

    steps.push({
      id: stepId++,
      description: `位置 ${i}，字符 '${s[i]}' 最后出现在 ${charLastIndex}，更新 end = ${end}`,
      data: { s, lastIndex: new Map(lastIndex), result: [...result], start, end, current: i },
      variables: { phase: 'partition', start, end, current: i, char: s[i], charLastIndex, updated: true },
    });

    // 到达右边界，完成一个片段
    if (i === end) {
      const length = end - start + 1;
      result.push(length);

      steps.push({
        id: stepId++,
        description: `到达边界 end=${end}，完成片段 [${start}, ${end}]，长度为 ${length}`,
        data: { s, lastIndex: new Map(lastIndex), result: [...result], start, end, current: i },
        variables: { phase: 'partition', start, end, current: i, segmentComplete: true, segmentLength: length },
      });

      start = end + 1;

      steps.push({
        id: stepId++,
        description: `更新 start = ${start}，开始下一个片段`,
        data: { s, lastIndex: new Map(lastIndex), result: [...result], start, end, current: i },
        variables: { phase: 'partition', start, end, current: i, newStart: true },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！划分结果：${result.join(', ')}`,
    data: { s, lastIndex: new Map(lastIndex), result: [...result], start, end, finished: true },
    variables: { phase: 'complete', result: [...result], finished: true },
  });

  return steps;
}

