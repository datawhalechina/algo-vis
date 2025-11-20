import { VisualizationStep } from '@/types';

export function generatePermutationsSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const result: number[][] = [];

  steps.push({
    id: stepId++,
    description: '初始化：生成数组的全排列',
    data: { nums },
    variables: { nums, result: [] },
    code: '1',
  });

  function backtrack(path: number[], used: boolean[]) {
    if (path.length === nums.length) {
      result.push([...path]);
      steps.push({
        id: stepId++,
        description: `找到一个排列：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums, result: result.map(r => [...r]), path: [...path], used: [...used] },
        code: '4',
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }

      path.push(nums[i]);
      used[i] = true;
      
      steps.push({
        id: stepId++,
        description: `选择 ${nums[i]}，当前路径：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums, result: result.map(r => [...r]), path: [...path], used: [...used], i },
        code: '8',
      });

      backtrack(path, used);

      path.pop();
      used[i] = false;
      
      steps.push({
        id: stepId++,
        description: `回溯，移除 ${nums[i]}，当前路径：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums, result: result.map(r => [...r]), path: [...path], used: [...used], i },
        code: '10',
      });
    }
  }

  backtrack([], new Array(nums.length).fill(false));

  steps.push({
    id: stepId++,
    description: `完成！共生成 ${result.length} 个排列`,
    data: { nums },
    variables: { nums, result: result.map(r => [...r]), finished: true },
    code: '12',
  });

  return steps;
}
