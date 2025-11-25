import { VisualizationStep } from '@/types'

export function generateSetMatrixZeroesSteps(
  matrix: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const m = matrix.length
  const n = matrix[0]?.length || 0
  
  if (m === 0 || n === 0) return steps

  // 复制矩阵用于演示
  const originalMatrix = matrix.map(row => [...row])
  let workingMatrix = matrix.map(row => [...row])

  steps.push({
    id: 0,
    description: `初始化：${m}×${n}矩阵，需要将包含0的行和列全部置零`,
    data: { 
      matrix: workingMatrix.map(row => [...row]),
      originalMatrix: originalMatrix.map(row => [...row]),
      m, 
      n,
    },
    variables: { m, n },
    code: '1',
  })

  // 第一步：标记第一行和第一列是否需要置零
  let firstRowHasZero = false
  let firstColHasZero = false

  for (let j = 0; j < n; j++) {
    if (matrix[0][j] === 0) {
      firstRowHasZero = true
      break
    }
  }

  for (let i = 0; i < m; i++) {
    if (matrix[i][0] === 0) {
      firstColHasZero = true
      break
    }
  }

  steps.push({
    id: steps.length,
    description: `检查第一行和第一列：第一行${firstRowHasZero ? '有' : '没有'}0，第一列${firstColHasZero ? '有' : '没有'}0`,
    data: { 
      matrix: workingMatrix.map(row => [...row]),
      originalMatrix: originalMatrix.map(row => [...row]),
      firstRowHasZero,
      firstColHasZero,
      highlightFirstRow: true,
      highlightFirstCol: true,
    },
    variables: { firstRowHasZero, firstColHasZero },
    code: '2-3',
  })

  // 第二步：使用第一行和第一列作为标记
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        workingMatrix[i][0] = 0
        workingMatrix[0][j] = 0
        
        steps.push({
          id: steps.length,
          description: `发现matrix[${i}][${j}]=0，标记第${i}行和第${j}列`,
          data: { 
            matrix: workingMatrix.map(row => [...row]),
            originalMatrix: originalMatrix.map(row => [...row]),
            currentRow: i,
            currentCol: j,
            markedRow: i,
            markedCol: j,
          },
          variables: { i, j, 'matrix[i][j]': 0 },
          code: '5-8',
        })
      }
    }
  }

  // 第三步：根据标记置零（除了第一行和第一列）
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (workingMatrix[i][0] === 0 || workingMatrix[0][j] === 0) {
        workingMatrix[i][j] = 0
        
        steps.push({
          id: steps.length,
          description: `根据标记，将matrix[${i}][${j}]置为0`,
          data: { 
            matrix: workingMatrix.map(row => [...row]),
            originalMatrix: originalMatrix.map(row => [...row]),
            currentRow: i,
            currentCol: j,
          },
          variables: { i, j },
          code: '10-13',
        })
      }
    }
  }

  // 第四步：处理第一行
  if (firstRowHasZero) {
    for (let j = 0; j < n; j++) {
      workingMatrix[0][j] = 0
    }
    
    steps.push({
      id: steps.length,
      description: `第一行需要置零，将第一行全部置为0`,
      data: { 
        matrix: workingMatrix.map(row => [...row]),
        originalMatrix: originalMatrix.map(row => [...row]),
        highlightFirstRow: true,
      },
      variables: { firstRowHasZero },
      code: '15-17',
    })
  }

  // 第五步：处理第一列
  if (firstColHasZero) {
    for (let i = 0; i < m; i++) {
      workingMatrix[i][0] = 0
    }
    
    steps.push({
      id: steps.length,
      description: `第一列需要置零，将第一列全部置为0`,
      data: { 
        matrix: workingMatrix.map(row => [...row]),
        originalMatrix: originalMatrix.map(row => [...row]),
        highlightFirstCol: true,
      },
      variables: { firstColHasZero },
      code: '19-21',
    })
  }

  steps.push({
    id: steps.length,
    description: `完成！所有包含0的行和列都已置零`,
    data: { 
      matrix: workingMatrix.map(row => [...row]),
      originalMatrix: originalMatrix.map(row => [...row]),
      completed: true,
    },
    variables: { result: workingMatrix },
    code: '23',
  })

  return steps
}
