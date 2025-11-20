import { VisualizationStep } from "@/types";

export function generateValidParenthesesSteps(
  s: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const stack: string[] = [];
  const map: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    description: `开始检查字符串 "${s}"，使用栈来匹配括号`,
    data: { chars: s.split(""), stack: [] },
    variables: {
      currentIndex: -1,
      stack: [],
      isValid: true,
    },
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const isLeftBracket = char === "(" || char === "[" || char === "{";

    if (isLeftBracket) {
      // 左括号入栈
      steps.push({
        id: stepId++,
        description: `遇到左括号 '${char}'，将其入栈`,
        data: { chars: s.split(""), stack: [...stack] },
        variables: {
          currentIndex: i,
          currentChar: char,
          stack: [...stack],
          isValid: true,
          action: "push",
        },
      });

      stack.push(char);

      steps.push({
        id: stepId++,
        description: `'${char}' 已入栈，栈的大小: ${stack.length}`,
        data: { chars: s.split(""), stack: [...stack] },
        variables: {
          currentIndex: i,
          currentChar: char,
          stack: [...stack],
          isValid: true,
          action: "pushed",
        },
      });
    } else {
      // 右括号：检查栈顶
      const expectedLeft = map[char];

      steps.push({
        id: stepId++,
        description: `遇到右括号 '${char}'，需要匹配左括号 '${expectedLeft}'`,
        data: { chars: s.split(""), stack: [...stack] },
        variables: {
          currentIndex: i,
          currentChar: char,
          stack: [...stack],
          expectedLeft,
          isValid: true,
          action: "checking",
        },
      });

      if (stack.length === 0) {
        // 栈为空，无法匹配
        steps.push({
          id: stepId++,
          description: `栈为空！没有对应的左括号，字符串无效 ❌`,
          data: { chars: s.split(""), stack: [] },
          variables: {
            currentIndex: i,
            currentChar: char,
            stack: [],
            isValid: false,
            action: "invalid",
          },
        });
        break;
      }

      const top = stack[stack.length - 1];

      if (top !== expectedLeft) {
        // 不匹配
        steps.push({
          id: stepId++,
          description: `栈顶是 '${top}'，不匹配 '${expectedLeft}'，字符串无效 ❌`,
          data: { chars: s.split(""), stack: [...stack] },
          variables: {
            currentIndex: i,
            currentChar: char,
            stack: [...stack],
            top,
            expectedLeft,
            isValid: false,
            action: "mismatch",
          },
        });
        break;
      }

      // 匹配成功，弹出栈顶
      steps.push({
        id: stepId++,
        description: `栈顶 '${top}' 与 '${char}' 匹配 ✓，弹出栈顶`,
        data: { chars: s.split(""), stack: [...stack] },
        variables: {
          currentIndex: i,
          currentChar: char,
          stack: [...stack],
          top,
          isValid: true,
          action: "pop",
          matchedPair: `${top}${char}`,
        },
      });

      stack.pop();

      steps.push({
        id: stepId++,
        description: `已弹出 '${top}'，栈的大小: ${stack.length}`,
        data: { chars: s.split(""), stack: [...stack] },
        variables: {
          currentIndex: i,
          currentChar: char,
          stack: [...stack],
          isValid: true,
          action: "popped",
        },
      });
    }
  }

  // 最终检查
  const finalValid = stack.length === 0;
  if (finalValid && steps[steps.length - 1].variables?.isValid !== false) {
    steps.push({
      id: stepId++,
      description: `遍历完成！栈为空，所有括号都已正确匹配 ✓`,
      data: { chars: s.split(""), stack: [] },
      variables: {
        currentIndex: s.length,
        stack: [],
        isValid: true,
        action: "valid",
      },
    });
  } else if (!finalValid && steps[steps.length - 1].variables?.isValid !== false) {
    steps.push({
      id: stepId++,
      description: `遍历完成！但栈不为空，还有 ${stack.length} 个未匹配的左括号 ❌`,
      data: { chars: s.split(""), stack: [...stack] },
      variables: {
        currentIndex: s.length,
        stack: [...stack],
        isValid: false,
        action: "invalid",
      },
    });
  }

  return steps;
}

