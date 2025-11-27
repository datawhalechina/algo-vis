import { VisualizationStep } from "@/types";

export function generateParenthesesSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const result: string[] = [];
  let stepId = 0;

  function backtrack(path: string, open: number, close: number) {
    steps.push({
      id: stepId++,
      data: {},
      variables: {
        n,
        path,
        open,
        close,
        result: [...result],
        canAddOpen: open < n,
        canAddClose: close < open,
      },
      description: `当前路径：${path || '空'}，左括号：${open}，右括号：${close}`,
    });

    // 如果路径长度达到 2*n，找到一个有效组合
    if (path.length === 2 * n) {
      result.push(path);
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          n,
          path,
          open,
          close,
          result: [...result],
          isComplete: true,
        },
        description: `找到一个有效组合：${path}`,
      });
      return;
    }

    // 如果左括号数量小于 n，可以添加左括号
    if (open < n) {
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          n,
          path: path + '(',
          open: open + 1,
          close,
          result: [...result],
          action: 'add_open',
        },
        description: `添加左括号 '('`,
      });
      backtrack(path + '(', open + 1, close);
      
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          n,
          path,
          open,
          close,
          result: [...result],
          action: 'backtrack',
        },
        description: `回溯到：${path}`,
      });
    }

    // 如果右括号数量小于左括号数量，可以添加右括号
    if (close < open) {
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          n,
          path: path + ')',
          open,
          close: close + 1,
          result: [...result],
          action: 'add_close',
        },
        description: `添加右括号 ')'`,
      });
      backtrack(path + ')', open, close + 1);
      
      steps.push({
        id: stepId++,
        data: {},
        variables: {
          n,
          path,
          open,
          close,
          result: [...result],
          action: 'backtrack',
        },
        description: `回溯到：${path}`,
      });
    }
  }

  steps.push({
    id: stepId++,
    data: {},
    variables: { n, path: '', open: 0, close: 0, result: [] },
    description: `开始生成 ${n} 对括号的所有有效组合`,
  });

  backtrack('', 0, 0);

  steps.push({
    id: stepId++,
    data: {},
    variables: { n, path: '', open: n, close: n, result: [...result] },
    description: `完成！共生成 ${result.length} 个有效组合`,
  });

  return steps;
}
