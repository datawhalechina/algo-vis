import { VisualizationStep } from '@/types';

export function generateLongestValidParenthesesSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const stack: number[] = [-1];
  let maxLen = 0;

  steps.push({
    id: stepId++,
    description: '初始化：创建栈，栈底存入 -1 作为基准索引',
    data: { s },
    variables: { s, stack: [...stack], maxLen, i: -1 },
    code: '1',
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    
    if (char === '(') {
      stack.push(i);
      steps.push({
        id: stepId++,
        description: `遇到左括号 '(' 在位置 ${i}，将索引压入栈`,
        data: { s },
        variables: { s, stack: [...stack], maxLen, i, char },
        highlightedIndices: [i],
        code: '3',
      });
    } else {
      stack.pop();
      steps.push({
        id: stepId++,
        description: `遇到右括号 ')' 在位置 ${i}，弹出栈顶元素`,
        data: { s },
        variables: { s, stack: [...stack], maxLen, i, char },
        highlightedIndices: [i],
        code: '5',
      });

      if (stack.length === 0) {
        stack.push(i);
        steps.push({
          id: stepId++,
          description: `栈为空，说明右括号多余，将当前索引 ${i} 作为新的基准压入栈`,
          data: { s },
          variables: { s, stack: [...stack], maxLen, i },
          highlightedIndices: [i],
          code: '7',
        });
      } else {
        const len = i - stack[stack.length - 1];
        if (len > maxLen) {
          maxLen = len;
          steps.push({
            id: stepId++,
            description: `找到有效括号序列，长度为 ${len}，更新最大长度为 ${maxLen}`,
            data: { s },
            variables: { s, stack: [...stack], maxLen, i, len, validStart: stack[stack.length - 1] + 1 },
            highlightedIndices: Array.from({ length: len }, (_, idx) => stack[stack.length - 1] + 1 + idx),
            code: '9',
          });
        } else {
          steps.push({
            id: stepId++,
            description: `当前有效括号序列长度为 ${len}，不大于最大长度 ${maxLen}`,
            data: { s },
            variables: { s, stack: [...stack], maxLen, i, len },
            code: '10',
          });
        }
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `遍历完成！最长有效括号长度为 ${maxLen}`,
    data: { s },
    variables: { s, stack: [...stack], maxLen, finished: true },
    code: '12',
  });

  return steps;
}
