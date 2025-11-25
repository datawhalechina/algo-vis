import { VisualizationStep } from '@/types'

export function generateRotateImageSteps(
  matrix: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const n = matrix.length
  
  if (n === 0) return steps

  // 复制原始矩阵
  const originalMatrix = matrix.map(row => [...row])
  const workingMatrix = matrix.map(row => [...row])

  steps.push({
    id: 0,
    description: `初始化：${n}×${n}矩阵，顺时针旋转90度`,
    data: { matrix: workingMatrix.map(row => [...row]), originalMatrix, n },
    variables: { n },
    code: '1',
  })

  // 转置矩阵
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const temp = workingMatrix[i][j]
      workingMatrix[i][j] = workingMatrix[j][i]
      workingMatrix[j][i] = temp
      
      steps.push({
        id: steps.length,
        description: `转置：交换matrix[${i}][${j}]和matrix[${j}][${i}]`,
        data: { 
          matrix: workingMatrix.map(row => [...row]),
          originalMatrix,
          phase: 'transpose',
          swapPos1: [i, j],
          swapPos2: [j, i]
        },
        variables: { i, j },
        code: '3-5',
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `转置完成，现在翻转每一行`,
    data: { 
      matrix: workingMatrix.map(row => [...row]),
      originalMatrix,
      phase: 'transpose-done'
    },
    variables: {},
    code: '7',
  })

  // 翻转每一行
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < Math.floor(n / 2); j++) {
      const temp = workingMatrix[i][j]
      workingMatrix[i][j] = workingMatrix[i][n - 1 - j]
      workingMatrix[i][n - 1 - j] = temp
      
      steps.push({
        id: steps.length,
        description: `翻转第${i}行：交换matrix[${i}][${j}]和matrix[${i}][${n-1-j}]`,
        data: { 
          matrix: workingMatrix.map(row => [...row]),
          originalMatrix,
          phase: 'reverse',
          currentRow: i,
          swapPos1: [i, j],
          swapPos2: [i, n - 1 - j]
        },
        variables: { i, j },
        code: '9-11',
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `完成！矩阵已顺时针旋转90度`,
    data: { 
      matrix: workingMatrix.map(row => [...row]),
      originalMatrix,
      phase: 'complete'
    },
    variables: { result: workingMatrix },
    code: '13',
  })

  return steps
}
