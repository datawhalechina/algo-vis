import { VisualizationStep } from "@/types";

export function generateSubsetsSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const result: number[][] = [];
  let stepId = 0;

  function backtrack(startIndex: number, path: number[]) {
    // 记录当前子集
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        nums,
        path: [...path],
        startIndex,
        result: result.map(r => [...r]),
      },
      description: `当前子集：[${path.join(', ')}]，起始索引：${startIndex}`,
    });

    // 将当前路径加入结果
    result.push([...path]);

    // 递归选择后续元素
    for (let i = startIndex; i < nums.length; i++) {
      path.push(nums[i]);
      
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          nums,
          path: [...path],
          startIndex: i + 1,
          result: result.map(r => [...r]),
        },
        description: `选择 ${nums[i]}，递归处理`,
      });

      backtrack(i + 1, path);
      
      const removed = path.pop();
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          nums,
          path: [...path],
          startIndex: i + 1,
          result: result.map(r => [...r]),
        },
        description: `回溯，移除 ${removed}`,
      });
    }
  }

  steps.push({
    id: stepId++,
    data: {},
    variables: {
      nums,
      path: [],
      startIndex: 0,
      result: [],
    },
    description: "开始生成所有子集",
  });

  backtrack(0, []);

  steps.push({
    id: stepId++,
    data: {},
    variables: {
      nums,
      path: [],
      startIndex: nums.length,
      result: result.map(r => [...r]),
    },
    description: `完成！共生成 ${result.length} 个子集`,
  });

  return steps;
}
