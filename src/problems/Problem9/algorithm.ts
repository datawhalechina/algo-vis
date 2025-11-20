import { VisualizationStep } from "@/types";

/**
 * 生成最长公共前缀可视化步骤
 */
export function generateLongestCommonPrefixSteps(
  strs: string[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (strs.length === 0) {
    steps.push({
      id: stepId++,
      description: "输入数组为空，返回空字符串",
      data: { strs: [] },
      variables: { result: "", finished: true },
    });
    return steps;
  }

  // 初始状态
  steps.push({
    id: stepId++,
    description: `初始化：以第一个字符串 "${strs[0]}" 为基准，逐字符比较所有字符串`,
    data: { strs: [...strs] },
    variables: {
      first: strs[0],
      prefix: "",
      charIndex: -1,
    },
  });

  const first = strs[0];

  // 逐字符比较
  for (let i = 0; i < first.length; i++) {
    const char = first[i];

    steps.push({
      id: stepId++,
      description: `检查第 ${i + 1} 个字符 '${char}'，看是否所有字符串都匹配`,
      data: { strs: [...strs] },
      variables: {
        first,
        prefix: first.substring(0, i),
        charIndex: i,
        currentChar: char,
        checking: true,
      },
    });

    // 检查其他字符串
    for (let j = 1; j < strs.length; j++) {
      steps.push({
        id: stepId++,
        description: `检查字符串 "${strs[j]}" 的第 ${i + 1} 个字符`,
        data: { strs: [...strs] },
        variables: {
          first,
          prefix: first.substring(0, i),
          charIndex: i,
          currentChar: char,
          checkingString: j,
          checking: true,
        },
      });

      // 检查是否越界或不匹配
      if (i >= strs[j].length) {
        steps.push({
          id: stepId++,
          description: `字符串 "${strs[j]}" 长度不够（长度为 ${strs[j].length}），公共前缀为 "${first.substring(0, i)}"`,
          data: { strs: [...strs] },
          variables: {
            first,
            prefix: first.substring(0, i),
            result: first.substring(0, i),
            charIndex: i,
            checkingString: j,
            finished: true,
          },
        });
        return steps;
      }

      if (strs[j][i] !== char) {
        steps.push({
          id: stepId++,
          description: `字符不匹配：字符串 "${strs[j]}" 的第 ${i + 1} 个字符是 '${strs[j][i]}'，与 '${char}' 不同。公共前缀为 "${first.substring(0, i)}"`,
          data: { strs: [...strs] },
          variables: {
            first,
            prefix: first.substring(0, i),
            result: first.substring(0, i),
            charIndex: i,
            checkingString: j,
            mismatch: true,
            finished: true,
          },
        });
        return steps;
      }
    }

    // 所有字符串都匹配
    steps.push({
      id: stepId++,
      description: `✓ 所有字符串的第 ${i + 1} 个字符都是 '${char}'，加入公共前缀`,
      data: { strs: [...strs] },
      variables: {
        first,
        prefix: first.substring(0, i + 1),
        charIndex: i,
        currentChar: char,
        matched: true,
      },
    });
  }

  // 第一个字符串就是公共前缀
  steps.push({
    id: stepId++,
    description: `所有字符都匹配，公共前缀为 "${first}"`,
    data: { strs: [...strs] },
    variables: {
      first,
      prefix: first,
      result: first,
      charIndex: first.length - 1,
      finished: true,
    },
  });

  return steps;
}
