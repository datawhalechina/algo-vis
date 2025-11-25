import { VisualizationStep } from '@/types';

export function generateCombinationSumSteps(candidates: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const result: number[][] = [];

  steps.push({
    id: stepId++,
    description: `初始化：在候选数组中找出总和为 ${target} 的所有组合`,
    data: { candidates, target },
    variables: { candidates, target, result: [] },
    code: '1',
  });

  function backtrack(start: number, path: number[], sum: number) {
    if (sum === target) {
      result.push([...path]);
      steps.push({
        id: stepId++,
        description: `找到一个组合：[${path.join(', ')}]，总和 = ${target}`,
        data: { candidates, target },
        variables: { candidates, target, result: result.map(r => [...r]), path: [...path], sum },
        highlightedIndices: [start],
        code: '4',
      });
      return;
    }

    if (sum > target) {
      steps.push({
        id: stepId++,
        description: `当前和 ${sum} > ${target}，剪枝返回`,
        data: { candidates, target },
        variables: { candidates, target, path: [...path], sum },
        code: '6',
      });
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      const num = candidates[i];
      path.push(num);
      steps.push({
        id: stepId++,
        description: `选择 ${num}，当前路径：[${path.join(', ')}]，和 = ${sum + num}`,
        data: { candidates, target },
        variables: { candidates, target, result: result.map(r => [...r]), path: [...path], sum: sum + num, i },
        highlightedIndices: [i],
        code: '8',
      });

      backtrack(i, path, sum + num);
      
      path.pop();
      steps.push({
        id: stepId++,
        description: `回溯，移除 ${num}，当前路径：[${path.join(', ')}]`,
        data: { candidates, target },
        variables: { candidates, target, result: result.map(r => [...r]), path: [...path], sum },
        code: '10',
      });
    }
  }

  backtrack(0, [], 0);

  steps.push({
    id: stepId++,
    description: `完成！找到 ${result.length} 个组合`,
    data: { candidates, target },
    variables: { candidates, target, result: result.map(r => [...r]), finished: true },
    code: '12',
  });

  return steps;
}
