import { VisualizationStep } from "@/types";

/**
 * 生成回文数判断可视化步骤
 */
export function generatePalindromeNumberSteps(x: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    description: `开始判断：数字 ${x} 是否为回文数`,
    data: { x },
    variables: {
      original: x,
      reversed: 0,
      temp: x,
    },
  });

  // 负数不是回文数
  if (x < 0) {
    steps.push({
      id: stepId++,
      description: `${x} 是负数，负数不是回文数`,
      data: { x },
      variables: {
        original: x,
        isPalindrome: false,
        finished: true,
      },
    });
    return steps;
  }

  // 0是回文数
  if (x === 0) {
    steps.push({
      id: stepId++,
      description: `${x} 是回文数`,
      data: { x },
      variables: {
        original: x,
        isPalindrome: true,
        finished: true,
      },
    });
    return steps;
  }

  // 末尾为0的非零数不是回文数
  if (x % 10 === 0) {
    steps.push({
      id: stepId++,
      description: `${x} 末尾是0但不等于0，不是回文数`,
      data: { x },
      variables: {
        original: x,
        isPalindrome: false,
        finished: true,
      },
    });
    return steps;
  }

  // 反转数字的后半部分
  let temp = x;
  let reversed = 0;
  const digits = x.toString().split('').map(Number);

  steps.push({
    id: stepId++,
    description: `将数字拆分为：[${digits.join(', ')}]`,
    data: { x },
    variables: {
      original: x,
      digits,
      reversed: 0,
      temp: x,
    },
  });

  let iteration = 0;
  while (temp > reversed) {
    const digit = temp % 10;
    const oldReversed = reversed;
    reversed = reversed * 10 + digit;
    temp = Math.floor(temp / 10);

    steps.push({
      id: stepId++,
      description: `第 ${++iteration} 次：取出末位数字 ${digit}，反转部分 = ${oldReversed} × 10 + ${digit} = ${reversed}，剩余部分 = ${temp}`,
      data: { x },
      variables: {
        original: x,
        digits,
        reversed,
        temp,
        digit,
        iteration,
      },
    });

    if (temp <= reversed) {
      break;
    }
  }

  // 判断是否是回文
  const isPalindrome = temp === reversed || temp === Math.floor(reversed / 10);

  steps.push({
    id: stepId++,
    description: isPalindrome
      ? `剩余部分 ${temp} ${temp === reversed ? '===' : '==='} 反转部分 ${temp === reversed ? reversed : Math.floor(reversed / 10)}，是回文数！`
      : `剩余部分 ${temp} !== 反转部分 ${reversed}，不是回文数`,
    data: { x },
    variables: {
      original: x,
      digits,
      reversed,
      temp,
      isPalindrome,
      finished: true,
    },
  });

  return steps;
}
