import { VisualizationStep } from "@/types";

export function decodeStringSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const numStack: number[] = [];
  const strStack: string[] = [];
  let num = 0;
  let result = "";
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始解码字符串: ${s}`,
    data: { s, numStack: [...numStack], strStack: [...strStack], result, currentIndex: -1 },
    variables: { s, numStack: [...numStack], strStack: [...strStack], result },
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char >= '0' && char <= '9') {
      // 数字
      num = num * 10 + parseInt(char);
      steps.push({
        id: stepId++,
        description: `读取数字: ${char}，当前累计数字为 ${num}`,
        data: { s, currentIndex: i, char, num, numStack: [...numStack], strStack: [...strStack], result },
        variables: { currentIndex: i, char, num, numStack: [...numStack], strStack: [...strStack], result },
      });
    } else if (char === '[') {
      // 左括号：将当前数字和字符串压栈
      numStack.push(num);
      strStack.push(result);
      
      steps.push({
        id: stepId++,
        description: `遇到 '[', 将数字 ${num} 和当前字符串 "${result}" 压入栈`,
        data: { 
          s, 
          currentIndex: i, 
          char, 
          numStack: [...numStack], 
          strStack: [...strStack], 
          result,
          pushNum: num,
          pushStr: result
        },
        variables: { currentIndex: i, char, numStack: [...numStack], strStack: [...strStack], result },
      });
      
      // 重置
      num = 0;
      result = "";
    } else if (char === ']') {
      // 右括号：弹出栈顶，重复当前字符串
      const repeatTimes = numStack.pop() || 1;
      const prevStr = strStack.pop() || "";
      const repeated = result.repeat(repeatTimes);
      
      steps.push({
        id: stepId++,
        description: `遇到 ']', 弹出重复次数 ${repeatTimes}，将 "${result}" 重复 ${repeatTimes} 次`,
        data: { 
          s, 
          currentIndex: i, 
          char, 
          numStack: [...numStack], 
          strStack: [...strStack], 
          result,
          repeatTimes,
          prevStr,
          repeated
        },
        variables: { currentIndex: i, char, numStack: [...numStack], strStack: [...strStack], result, repeatTimes, repeated },
      });
      
      result = prevStr + repeated;
      
      steps.push({
        id: stepId++,
        description: `拼接结果: "${prevStr}" + "${repeated}" = "${result}"`,
        data: { 
          s, 
          currentIndex: i, 
          numStack: [...numStack], 
          strStack: [...strStack], 
          result 
        },
        variables: { currentIndex: i, numStack: [...numStack], strStack: [...strStack], result },
      });
    } else {
      // 普通字符
      result += char;
      steps.push({
        id: stepId++,
        description: `添加字符 '${char}' 到结果，当前结果为 "${result}"`,
        data: { s, currentIndex: i, char, numStack: [...numStack], strStack: [...strStack], result },
        variables: { currentIndex: i, char, numStack: [...numStack], strStack: [...strStack], result },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `解码完成！最终结果: "${result}"`,
    data: { s, numStack: [...numStack], strStack: [...strStack], result, completed: true },
    variables: { numStack: [...numStack], strStack: [...strStack], result },
  });

  return steps;
}
