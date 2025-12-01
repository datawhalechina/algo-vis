import { VisualizationStep } from "@/types";

export function isPalindromeSteps(list: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `检查链表是否为回文: [${list.join(' -> ')}]`,
    data: { list },
    variables: { list, firstHalf: list, secondHalf: [] },
  });

  if (list.length <= 1) {
    steps.push({
      id: stepId++,
      description: `链表长度≤1，是回文`,
      data: { list, isPalindrome: true },
      variables: { isPalindrome: true, firstHalf: list, secondHalf: [] },
    });
    return steps;
  }

  // 步骤1: 使用快慢指针找中点
  let slow = 0;
  let fast = 0;
  
  steps.push({
    id: stepId++,
    description: `初始化快慢指针: slow=${slow}, fast=${fast}`,
    data: { list, slow, fast, phase: 'findMiddle' },
    variables: { slow, fast, phase: 'findMiddle', firstHalf: list, secondHalf: [] },
  });

  while (fast < list.length - 1 && fast < list.length - 2) {
    slow++;
    fast += 2;
    
    steps.push({
      id: stepId++,
      description: `移动指针: slow前进1步到${slow}, fast前进2步到${fast}`,
      data: { list, slow, fast, phase: 'findMiddle' },
      variables: { slow, fast, phase: 'findMiddle', firstHalf: list, secondHalf: [] },
    });
  }

  const mid = slow;
  steps.push({
    id: stepId++,
    description: `找到中点位置: ${mid}`,
    data: { list, mid, slow, fast, phase: 'foundMiddle' },
    variables: { mid, slow, fast, phase: 'foundMiddle', firstHalf: list, secondHalf: [] },
  });

  // 步骤2: 分割链表为前后两部分
  const firstHalf = list.slice(0, mid + 1);
  const secondHalf = list.slice(mid + 1);
  
  steps.push({
    id: stepId++,
    description: `分割链表 - 前半部分: [${firstHalf.join(', ')}], 后半部分: [${secondHalf.join(', ')}]`,
    data: { list, firstHalf, secondHalf, phase: 'split' },
    variables: { firstHalf, secondHalf, phase: 'split' },
  });

  // 步骤3: 反转后半部分
  const reversedSecond = [...secondHalf].reverse();
  
  steps.push({
    id: stepId++,
    description: `反转后半部分: [${reversedSecond.join(', ')}]`,
    data: { list, firstHalf, secondHalf: reversedSecond, phase: 'reversed' },
    variables: { firstHalf, secondHalf: reversedSecond, phase: 'reversed' },
  });

  // 步骤4: 比较前半部分和反转后的后半部分
  const compareLength = Math.min(firstHalf.length, reversedSecond.length);
  
  for (let i = 0; i < compareLength; i++) {
    const match = firstHalf[i] === reversedSecond[i];
    
    steps.push({
      id: stepId++,
      description: `比较位置${i}: ${firstHalf[i]} ${match ? '==' : '!='} ${reversedSecond[i]}`,
      data: { list, firstHalf, secondHalf: reversedSecond, compareIndex: i, match, phase: 'comparing' },
      variables: { firstHalf, secondHalf: reversedSecond, compareIndex: i, match, phase: 'comparing' },
    });

    if (!match) {
      steps.push({
        id: stepId++,
        description: `发现不匹配，不是回文`,
        data: { list, firstHalf, secondHalf: reversedSecond, isPalindrome: false, phase: 'result' },
        variables: { firstHalf, secondHalf: reversedSecond, isPalindrome: false, phase: 'result' },
      });
      return steps;
    }
  }

  steps.push({
    id: stepId++,
    description: `所有元素匹配，是回文！`,
    data: { list, firstHalf, secondHalf: reversedSecond, isPalindrome: true, completed: true, phase: 'result' },
    variables: { firstHalf, secondHalf: reversedSecond, isPalindrome: true, phase: 'result' },
  });

  return steps;
}
