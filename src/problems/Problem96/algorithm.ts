import { VisualizationStep } from "@/types";

export function isValidParenthesesSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: "开始验证括号",
    data: { s, stack: [...stack], isValid: null },
    variables: { s, stack: [...stack] },
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char in map) {
      // 右括号
      const topElement = stack.length > 0 ? stack[stack.length - 1] : '#';
      
      steps.push({
        id: stepId++,
        description: `遇到右括号 '${char}'，检查栈顶是否匹配`,
        data: { s, currentIndex: i, char, stack: [...stack], topElement, isRight: true },
        variables: { s, currentIndex: i, char, stack: [...stack] },
      });

      if (stack.length === 0 || stack.pop() !== map[char]) {
        steps.push({
          id: stepId++,
          description: `括号不匹配！返回 false`,
          data: { s, currentIndex: i, stack: [...stack], isValid: false },
          variables: { s, currentIndex: i, stack: [...stack], isValid: false },
        });
        return steps;
      }

      steps.push({
        id: stepId++,
        description: `匹配成功，弹出栈顶元素`,
        data: { s, currentIndex: i, stack: [...stack], matched: true },
        variables: { s, currentIndex: i, stack: [...stack] },
      });
    } else {
      // 左括号
      stack.push(char);
      steps.push({
        id: stepId++,
        description: `遇到左括号 '${char}'，压入栈`,
        data: { s, currentIndex: i, char, stack: [...stack], isLeft: true },
        variables: { s, currentIndex: i, char, stack: [...stack] },
      });
    }
  }

  const isValid = stack.length === 0;
  steps.push({
    id: stepId++,
    description: isValid ? "栈为空，所有括号匹配！返回 true" : "栈不为空，有未匹配的括号！返回 false",
    data: { s, stack: [...stack], isValid },
    variables: { s, stack: [...stack], isValid },
  });

  return steps;
}
