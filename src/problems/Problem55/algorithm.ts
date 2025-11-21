import { VisualizationStep } from '@/types'

export function generateSearchMatrix2Steps(
  matrix: number[][],
  target: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  if (!matrix.length || !matrix[0].length) return steps

  const m = matrix.length
  const n = matrix[0].length
  
  steps.push({
    id: 0,
    description: `初始化：在${m}×${n}矩阵中搜索目标值${target}，从右上角开始`,
    data: { matrix, target, m, n },
    variables: { m, n, target },
    code: '1',
  })

  // 从右上角开始搜索
  let row = 0
  let col = n - 1
  
  steps.push({
    id: steps.length,
    description: `从右上角matrix[0][${n-1}]=${matrix[0][n-1]}开始搜索`,
    data: { matrix, target, row, col, currentValue: matrix[0][n-1] },
    variables: { row, col },
    code: '3',
  })

  while (row < m && col >= 0) {
    const currentValue = matrix[row][col]
    
    steps.push({
      id: steps.length,
      description: `当前位置matrix[${row}][${col}]=${currentValue}`,
      data: { matrix, target, row, col, currentValue },
      variables: { row, col, currentValue },
      code: '5',
    })

    if (currentValue === target) {
      steps.push({
        id: steps.length,
        description: `找到目标值${target}！位置：[${row}, ${col}]`,
        data: { matrix, target, row, col, currentValue, found: true },
        variables: { found: true, row, col },
        code: '7',
      })
      return steps
    } else if (currentValue > target) {
      steps.push({
        id: steps.length,
        description: `${currentValue} > ${target}，向左移动`,
        data: { matrix, target, row, col, currentValue, direction: 'left' },
        variables: { direction: 'left' },
        code: '9',
      })
      col--
    } else {
      steps.push({
        id: steps.length,
        description: `${currentValue} < ${target}，向下移动`,
        data: { matrix, target, row, col, currentValue, direction: 'down' },
        variables: { direction: 'down' },
        code: '11',
      })
      row++
    }
  }

  steps.push({
    id: steps.length,
    description: `搜索完成，未找到目标值${target}`,
    data: { matrix, target, found: false },
    variables: { found: false },
    code: '14',
  })

  return steps
}
