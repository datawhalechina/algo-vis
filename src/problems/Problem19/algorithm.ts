import { VisualizationStep } from "@/types";

export function generateMajorityElementSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始查找多数元素：数组 [${nums.join(', ')}]，使用摩尔投票算法`,
    data: { nums: [...nums] },
    variables: { candidate: null, count: 0, index: 0 },
  });

  let candidate: number | null = null;
  let count = 0;

  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];

    if (count === 0) {
      candidate = current;
      count = 1;
      steps.push({
        id: stepId++,
        description: `索引 ${i}：count = 0，选择 ${current} 作为候选人，count = 1`,
        data: { nums: [...nums] },
        variables: { candidate, count, index: i, selectCandidate: true },
      });
    } else if (current === candidate) {
      count++;
      steps.push({
        id: stepId++,
        description: `索引 ${i}：${current} === 候选人 ${candidate}，count++，count = ${count}`,
        data: { nums: [...nums] },
        variables: { candidate, count, index: i, voteFor: true },
      });
    } else {
      count--;
      steps.push({
        id: stepId++,
        description: `索引 ${i}：${current} !== 候选人 ${candidate}，count--，count = ${count}`,
        data: { nums: [...nums] },
        variables: { candidate, count, index: i, voteAgainst: true },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `算法完成！多数元素是 ${candidate}`,
    data: { nums: [...nums] },
    variables: { candidate, count, finished: true, result: candidate },
  });

  return steps;
}
