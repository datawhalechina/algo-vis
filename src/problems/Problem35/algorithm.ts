import { VisualizationStep } from '@/types';

export function generateValidSudokuSteps(board: string[][]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: '初始化：检查数独是否有效',
    data: { board },
    variables: { board },
    code: '1',
  });

  // 检查行
  for (let i = 0; i < 9; i++) {
    const seen = new Set<string>();
    for (let j = 0; j < 9; j++) {
      const char = board[i][j];
      if (char !== '.') {
        if (seen.has(char)) {
          steps.push({
            id: stepId++,
            description: `第 ${i} 行发现重复数字 ${char}`,
            data: { board },
            variables: { board, row: i, col: j, char, valid: false },
            code: '5',
          });
          return steps;
        }
        seen.add(char);
      }
    }
    steps.push({
      id: stepId++,
      description: `第 ${i} 行检查通过`,
      data: { board },
      variables: { board, row: i },
      code: '3',
    });
  }

  // 检查列
  for (let j = 0; j < 9; j++) {
    const seen = new Set<string>();
    for (let i = 0; i < 9; i++) {
      const char = board[i][j];
      if (char !== '.') {
        if (seen.has(char)) {
          steps.push({
            id: stepId++,
            description: `第 ${j} 列发现重复数字 ${char}`,
            data: { board },
            variables: { board, row: i, col: j, char, valid: false },
            code: '10',
          });
          return steps;
        }
        seen.add(char);
      }
    }
    steps.push({
      id: stepId++,
      description: `第 ${j} 列检查通过`,
      data: { board },
      variables: { board, col: j },
      code: '8',
    });
  }

  // 检查九宫格
  for (let block = 0; block < 9; block++) {
    const seen = new Set<string>();
    const startRow = Math.floor(block / 3) * 3;
    const startCol = (block % 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const row = startRow + i;
        const col = startCol + j;
        const char = board[row][col];
        if (char !== '.') {
          if (seen.has(char)) {
            steps.push({
              id: stepId++,
              description: `第 ${block} 个九宫格发现重复数字 ${char}`,
              data: { board },
              variables: { board, row, col, block, char, valid: false },
              code: '15',
            });
            return steps;
          }
          seen.add(char);
        }
      }
    }
    steps.push({
      id: stepId++,
      description: `第 ${block} 个九宫格检查通过`,
      data: { board },
      variables: { board, block },
      code: '13',
    });
  }

  steps.push({
    id: stepId++,
    description: '数独有效！所有检查都通过',
    data: { board },
    variables: { board, valid: true },
    code: '17',
  });

  return steps;
}
