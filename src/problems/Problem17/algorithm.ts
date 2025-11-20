import { VisualizationStep } from "@/types";

export function generatePascalTriangleSteps(numRows: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始生成杨辉三角，共 ${numRows} 行`,
    data: { triangle: [] },
    variables: { numRows, currentRow: 0 },
  });

  const triangle: number[][] = [];

  for (let i = 0; i < numRows; i++) {
    const row: number[] = [];
    
    steps.push({
      id: stepId++,
      description: `生成第 ${i + 1} 行`,
      data: { triangle: triangle.map(r => [...r]) },
      variables: { numRows, currentRow: i, generatingRow: true },
    });

    for (let j = 0; j <= i; j++) {
      if (j === 0 || j === i) {
        row.push(1);
        steps.push({
          id: stepId++,
          description: `第 ${i + 1} 行，位置 ${j}：边界位置，值为 1`,
          data: { triangle: triangle.map(r => [...r]), currentRow: [...row] },
          variables: { numRows, currentRow: i, col: j, value: 1, isBorder: true },
        });
      } else {
        const value = triangle[i - 1][j - 1] + triangle[i - 1][j];
        row.push(value);
        steps.push({
          id: stepId++,
          description: `第 ${i + 1} 行，位置 ${j}：${triangle[i - 1][j - 1]} + ${triangle[i - 1][j]} = ${value}`,
          data: { triangle: triangle.map(r => [...r]), currentRow: [...row] },
          variables: { 
            numRows, 
            currentRow: i, 
            col: j, 
            value, 
            leftParent: triangle[i - 1][j - 1],
            rightParent: triangle[i - 1][j],
          },
        });
      }
    }

    triangle.push(row);
    steps.push({
      id: stepId++,
      description: `第 ${i + 1} 行完成：[${row.join(', ')}]`,
      data: { triangle: triangle.map(r => [...r]) },
      variables: { numRows, currentRow: i, rowComplete: true },
    });
  }

  steps.push({
    id: stepId++,
    description: `杨辉三角生成完成！`,
    data: { triangle: triangle.map(r => [...r]) },
    variables: { numRows, finished: true },
  });

  return steps;
}
