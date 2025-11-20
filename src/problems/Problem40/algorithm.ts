import { VisualizationStep } from '@/types';

export function generatePermutationsIISteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const result: number[][] = [];
  
  // 排序以便处理重复
  nums.sort((a, b) => a - b);

  steps.push({
    id: stepId++,
    description: '初始化：对数组排序，方便去重处理',
    data: { nums },
    variables: { nums: [...nums], result: [] },
    code: '1',
  });

  function backtrack(path: number[], used: boolean[]) {
    if (path.length === nums.length) {
      result.push([...path]);
      steps.push({
        id: stepId++,
        description: `找到一个排列：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums: [...nums], result: result.map(r => [...r]), path: [...path], used: [...used] },
        code: '4',
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }

      // 去重：如果当前数字与前一个相同，且前一个未被使用，跳过
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        steps.push({
          id: stepId++,
          description: `跳过重复元素 ${nums[i]}（前一个相同元素未使用）`,
          data: { nums },
          variables: { nums: [...nums], result: result.map(r => [...r]), path: [...path], used: [...used], i },
          code: '9',
        });
        continue;
      }

      path.push(nums[i]);
      used[i] = true;
      
      steps.push({
        id: stepId++,
        description: `选择 ${nums[i]}，当前路径：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums: [...nums], result: result.map(r => [...r]), path: [...path], used: [...used], i },
        code: '11',
      });

      backtrack(path, used);

      path.pop();
      used[i] = false;
      
      steps.push({
        id: stepId++,
        description: `回溯，移除 ${nums[i]}，当前路径：[${path.join(', ')}]`,
        data: { nums },
        variables: { nums: [...nums], result: result.map(r => [...r]), path: [...path], used: [...used], i },
        code: '13',
      });
    }
  }

  backtrack([], new Array(nums.length).fill(false));

  steps.push({
    id: stepId++,
    description: `完成！共生成 ${result.length} 个不重复的排列`,
    data: { nums },
    variables: { nums: [...nums], result: result.map(r => [...r]), finished: true },
    code: '15',
  });

  return steps;
}
