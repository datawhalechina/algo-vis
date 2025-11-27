import { VisualizationStep } from "@/types";

const digitMap: Record<string, string> = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz'
};

export function generateLetterCombinationsSteps(digits: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const result: string[] = [];
  let stepId = 0;

  if (!digits) {
    steps.push({
      id: stepId++,
      data: {},
      variables: { digits, path: '', result: [], digitIndex: 0 },
      description: "输入为空，返回空数组",
    });
    return steps;
  }

  function backtrack(index: number, path: string) {
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        digits,
        path,
        result: [...result],
        digitIndex: index,
        currentDigit: index < digits.length ? digits[index] : '',
        currentLetters: index < digits.length ? digitMap[digits[index]] : '',
      },
      description: index < digits.length 
        ? `当前组合：${path || '空'}，处理数字 ${digits[index]}`
        : `找到一个完整组合：${path}`,
    });

    // 如果路径长度等于digits长度，找到一个组合
    if (index === digits.length) {
      result.push(path);
      return;
    }

    // 获取当前数字对应的字母
    const letters = digitMap[digits[index]];
    
    // 尝试每个字母
    for (const letter of letters) {
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          digits,
          path: path + letter,
          result: [...result],
          digitIndex: index,
          currentDigit: digits[index],
          currentLetters: letters,
          selectedLetter: letter,
        },
        description: `选择字母 '${letter}'，递归处理下一个数字`,
      });
      
      backtrack(index + 1, path + letter);
      
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          digits,
          path,
          result: [...result],
          digitIndex: index,
          currentDigit: digits[index],
          currentLetters: letters,
        },
        description: `回溯到 '${path}'`,
      });
    }
  }

  steps.push({
    id: stepId++,
    data: {},
    variables: { digits, path: '', result: [], digitIndex: 0 },
    description: `开始生成电话号码 "${digits}" 的字母组合`,
  });

  backtrack(0, '');

  steps.push({
    id: stepId++,
    data: {},
    variables: { digits, path: '', result: [...result], digitIndex: digits.length },
    description: `完成！共生成 ${result.length} 个字母组合`,
  });

  return steps;
}
