import { VisualizationStep } from '@/types'

export function generateSpiralMatrixSteps(
  matrix: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  if (!matrix.length || !matrix[0].length) return steps

  const m = matrix.length
  const n = matrix[0].length
  const result: number[] = []
  let top = 0, bottom = m - 1, left = 0, right = n - 1

  steps.push({
    id: 0,
    description: `初始化：${m}×${n}矩阵，按螺旋顺序遍历`,
    data: { matrix, result: [], top, bottom, left, right, visited: [] },
    variables: { m, n, top, bottom, left, right },
    code: '1',
  })

  const visited: boolean[][] = Array(m).fill(0).map(() => Array(n).fill(false))

  while (top <= bottom && left <= right) {
    // 从左到右
    for (let j = left; j <= right; j++) {
      result.push(matrix[top][j])
      visited[top][j] = true
      steps.push({
        id: steps.length,
        description: `向右遍历：访问matrix[${top}][${j}]=${matrix[top][j]}`,
        data: { 
          matrix, 
          result: [...result], 
          top, bottom, left, right,
          currentRow: top,
          currentCol: j,
          direction: 'right',
          visited: visited.map(row => [...row])
        },
        variables: { result: [...result] },
        code: '4',
      })
    }
    top++

    // 从上到下
    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right])
      visited[i][right] = true
      steps.push({
        id: steps.length,
        description: `向下遍历：访问matrix[${i}][${right}]=${matrix[i][right]}`,
        data: { 
          matrix, 
          result: [...result], 
          top, bottom, left, right,
          currentRow: i,
          currentCol: right,
          direction: 'down',
          visited: visited.map(row => [...row])
        },
        variables: { result: [...result] },
        code: '7',
      })
    }
    right--

    // 从右到左
    if (top <= bottom) {
      for (let j = right; j >= left; j--) {
        result.push(matrix[bottom][j])
        visited[bottom][j] = true
        steps.push({
          id: steps.length,
          description: `向左遍历：访问matrix[${bottom}][${j}]=${matrix[bottom][j]}`,
          data: { 
            matrix, 
            result: [...result], 
            top, bottom, left, right,
            currentRow: bottom,
            currentCol: j,
            direction: 'left',
            visited: visited.map(row => [...row])
          },
          variables: { result: [...result] },
          code: '11',
        })
      }
      bottom--
    }

    // 从下到上
    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        result.push(matrix[i][left])
        visited[i][left] = true
        steps.push({
          id: steps.length,
          description: `向上遍历：访问matrix[${i}][${left}]=${matrix[i][left]}`,
          data: { 
            matrix, 
            result: [...result], 
            top, bottom, left, right,
            currentRow: i,
            currentCol: left,
            direction: 'up',
            visited: visited.map(row => [...row])
          },
          variables: { result: [...result] },
          code: '15',
        })
      }
      left++
    }
  }

  steps.push({
    id: steps.length,
    description: `完成！螺旋遍历结果：[${result.join(', ')}]`,
    data: { 
      matrix, 
      result, 
      visited: visited.map(row => [...row]),
      completed: true 
    },
    variables: { result },
    code: '19',
  })

  return steps
}
