import { VisualizationStep } from '@/types';

export function generateWordBreakSteps(s: string, wordDict: string[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const wordSet = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  let stepId = 0;

  // 初始步骤
  steps.push({
    id: stepId++,
    description: '初始化：dp[0] = true（空字符串可以拆分）',
    data: { s, wordDict, dp: [...dp], current: 0 },
    variables: { dp: [...dp], current: 0, phase: 'init' },
  });

  // DP过程
  for (let i = 1; i <= s.length; i++) {
    steps.push({
      id: stepId++,
      description: `检查位置 ${i}，判断前 ${i} 个字符是否可以拆分`,
      data: { s, wordDict, dp: [...dp], current: i },
      variables: { dp: [...dp], current: i, phase: 'check', checking: i },
    });

    for (let j = 0; j < i; j++) {
      const substring = s.substring(j, i);
      const inDict = wordSet.has(substring);

      steps.push({
        id: stepId++,
        description: `检查 s[${j}...${i}] = "${substring}"，${inDict ? '在字典中' : '不在字典中'}`,
        data: { s, wordDict, dp: [...dp], current: i, checking: j },
        variables: { dp: [...dp], current: i, checking: j, substring, inDict, dpJ: dp[j] },
      });

      if (dp[j] && inDict) {
        dp[i] = true;

        steps.push({
          id: stepId++,
          description: `dp[${j}] = true 且 "${substring}" 在字典中，设置 dp[${i}] = true`,
          data: { s, wordDict, dp: [...dp], current: i, checking: j },
          variables: { dp: [...dp], current: i, checking: j, substring, matched: true, dpI: true },
        });

        break;
      }
    }

    if (!dp[i]) {
      steps.push({
        id: stepId++,
        description: `无法拆分前 ${i} 个字符，dp[${i}] = false`,
        data: { s, wordDict, dp: [...dp], current: i },
        variables: { dp: [...dp], current: i, dpI: false },
      });
    }
  }

  // 完成步骤
  steps.push({
    id: stepId++,
    description: `完成！dp[${s.length}] = ${dp[s.length]}，${dp[s.length] ? '可以拆分' : '无法拆分'}`,
    data: { s, wordDict, dp: [...dp], finished: true },
    variables: { dp: [...dp], finished: true, result: dp[s.length] },
  });

  return steps;
}

