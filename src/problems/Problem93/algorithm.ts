import { VisualizationStep } from "@/types";

export function generatePartitionSteps(s: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const result: string[][] = [];
  let stepId = 0;

  // 判断是否为回文串
  function isPalindrome(str: string, left: number, right: number): boolean {
    while (left < right) {
      if (str[left] !== str[right]) {
        return false;
      }
      left++;
      right--;
    }
    return true;
  }

  function backtrack(start: number, path: string[]) {
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        s,
        start,
        path: [...path],
        result: result.map(r => [...r]),
        remaining: s.substring(start),
      },
      description: `当前分割：[${path.join(', ')}]，剩余：${s.substring(start) || '无'}`,
    });

    // 如果已经处理完整个字符串
    if (start === s.length) {
      result.push([...path]);
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          s,
          start,
          path: [...path],
          result: result.map(r => [...r]),
          isComplete: true,
        },
        description: `找到一个有效分割：[${path.join(', ')}]`,
      });
      return;
    }

    // 尝试所有可能的分割点
    for (let end = start; end < s.length; end++) {
      const substring = s.substring(start, end + 1);
      const isPalin = isPalindrome(s, start, end);

      steps.push({
        id: stepId++,
        data: {},
        variables: {
          s,
          start,
          end,
          path: [...path],
          result: result.map(r => [...r]),
          substring,
          isPalindrome: isPalin,
          checkStart: start,
          checkEnd: end,
        },
        description: `检查 "${substring}" (索引 ${start}-${end})：${
          isPalin ? '✓ 是回文' : '✗ 不是回文'
        }`,
      });

      // 如果是回文，继续递归
      if (isPalin) {
        path.push(substring);
        
        steps.push({
          id: stepId++,
          data: {},
          variables: {
            s,
            start: end + 1,
            end,
            path: [...path],
            result: result.map(r => [...r]),
            substring,
            action: 'recurse',
          },
          description: `添加 "${substring}" 到路径，递归处理剩余部分`,
        });

        backtrack(end + 1, path);
        
        const removed = path.pop();
        steps.push({
          id: stepId++,
          data: {},
          variables: {
            s,
            start,
            end,
            path: [...path],
            result: result.map(r => [...r]),
            action: 'backtrack',
          },
          description: `回溯，移除 "${removed}"`,
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    data: {},
    variables: { s, start: 0, path: [], result: [] },
    description: `开始分割字符串 "${s}"，寻找所有回文分割方案`,
  });

  backtrack(0, []);

  steps.push({
    id: stepId++,
    data: {},
    variables: { s, start: s.length, path: [], result: result.map(r => [...r]) },
    description: `完成！共找到 ${result.length} 种回文分割方案`,
  });

  return steps;
}
