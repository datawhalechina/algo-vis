import { VisualizationStep } from '@/types';

export function generateFindDuplicateSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let slow = nums[0];
  let fast = nums[0];
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：slow = nums[0] = ' + nums[0] + ', fast = nums[0] = ' + nums[0],
    data: { nums: [...nums], slow, fast, phase: 'init' },
    variables: { nums: [...nums], slow, fast, phase: 'init' },
  });

  // 第一阶段：找到相遇点
  steps.push({
    id: stepId++,
    description: '第一阶段：使用快慢指针找到环的相遇点',
    data: { nums: [...nums], slow, fast, phase: 'find_meeting' },
    variables: { nums: [...nums], slow, fast, phase: 'find_meeting' },
  });

  do {
    slow = nums[slow];
    fast = nums[nums[fast]];

    steps.push({
      id: stepId++,
      description: `移动指针：slow = nums[${slow}] = ${slow}, fast = nums[nums[${fast}]] = ${fast}`,
      data: { nums: [...nums], slow, fast, phase: 'find_meeting' },
      variables: { nums: [...nums], slow, fast, phase: 'find_meeting', moving: true },
    });
  } while (slow !== fast);

  steps.push({
    id: stepId++,
    description: `找到相遇点：slow = fast = ${slow}`,
    data: { nums: [...nums], slow, fast, phase: 'found_meeting' },
    variables: { nums: [...nums], slow, fast, phase: 'found_meeting', meetingPoint: slow },
  });

  // 第二阶段：找到环的入口
  const meetingPoint = slow;
  slow = nums[0];

  steps.push({
    id: stepId++,
    description: '第二阶段：将slow重置到起点，找到环的入口',
    data: { nums: [...nums], slow, fast: meetingPoint, phase: 'find_entry' },
    variables: { nums: [...nums], slow, fast: meetingPoint, phase: 'find_entry' },
  });

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];

    steps.push({
      id: stepId++,
      description: `移动指针：slow = nums[${slow}] = ${slow}, fast = nums[${fast}] = ${fast}`,
      data: { nums: [...nums], slow, fast, phase: 'find_entry' },
      variables: { nums: [...nums], slow, fast, phase: 'find_entry', moving: true },
    });
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！找到重复数字：${slow}`,
    data: { nums: [...nums], slow, fast, result: slow, finished: true },
    variables: { nums: [...nums], slow, fast, result: slow, finished: true },
  });

  return steps;
}

