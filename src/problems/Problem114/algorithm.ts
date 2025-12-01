import { VisualizationStep } from '@/types';

export function generateLongestPalindromeSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let start = 0;
  let maxLen = 1;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：start=0, maxLen=1',
    data: { s, start, maxLen, center: -1, left: -1, right: -1 },
    variables: { start, maxLen, center: -1, left: -1, right: -1, phase: 'init' },
  });

  // 中心扩展
  for (let i = 0; i < s.length; i++) {
    // 奇数长度回文
    steps.push({
      id: stepId++,
      description: `检查中心位置 ${i}（奇数长度回文）`,
      data: { s, start, maxLen, center: i, left: i, right: i },
      variables: { start, maxLen, center: i, left: i, right: i, phase: 'expand_odd' },
    });

    let left = i;
    let right = i;

    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const len = right - left + 1;
      
      steps.push({
        id: stepId++,
        description: `扩展：s[${left}] = s[${right}] = '${s[left]}'，当前长度 ${len}`,
        data: { s, start, maxLen, center: i, left, right },
        variables: { start, maxLen, center: i, left, right, len, phase: 'expand_odd', expanding: true },
      });

      if (len > maxLen) {
        maxLen = len;
        start = left;
        
        steps.push({
          id: stepId++,
          description: `更新最长回文：长度=${maxLen}，起始位置=${start}`,
          data: { s, start, maxLen, center: i, left, right },
          variables: { start, maxLen, center: i, left, right, updated: true },
        });
      }

      left--;
      right++;
    }

    // 偶数长度回文
    steps.push({
      id: stepId++,
      description: `检查中心位置 ${i} 和 ${i+1}（偶数长度回文）`,
      data: { s, start, maxLen, center: i, left: i, right: i + 1 },
      variables: { start, maxLen, center: i, left: i, right: i + 1, phase: 'expand_even' },
    });

    left = i;
    right = i + 1;

    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const len = right - left + 1;
      
      steps.push({
        id: stepId++,
        description: `扩展：s[${left}] = s[${right}] = '${s[left]}'，当前长度 ${len}`,
        data: { s, start, maxLen, center: i, left, right },
        variables: { start, maxLen, center: i, left, right, len, phase: 'expand_even', expanding: true },
      });

      if (len > maxLen) {
        maxLen = len;
        start = left;
        
        steps.push({
          id: stepId++,
          description: `更新最长回文：长度=${maxLen}，起始位置=${start}`,
          data: { s, start, maxLen, center: i, left, right },
          variables: { start, maxLen, center: i, left, right, updated: true },
        });
      }

      left--;
      right++;
    }
  }

  // 完成步骤
  const result = s.substring(start, start + maxLen);
  steps.push({
    id: stepId++,
    description: `完成！最长回文子串为 "${result}"，长度为 ${maxLen}`,
    data: { s, start, maxLen, result, finished: true },
    variables: { start, maxLen, result, finished: true },
  });

  return steps;
}

