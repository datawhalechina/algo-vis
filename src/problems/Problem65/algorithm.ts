import { VisualizationStep } from '@/types'

export function generateSortListSteps(list: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  steps.push({
    id: 0,
    description: `初始化：链表=[${list.join(',')}]，使用归并排序`,
    data: { list, sorted: [] },
    variables: { length: list.length },
    code: '1',
  })

  // 使用归并排序
  const result = mergeSort([...list], steps)

  steps.push({
    id: steps.length,
    description: `完成！排序结果=[${result.join(',')}]`,
    data: { list, sorted: result, completed: true },
    variables: { result },
    code: '15',
  })

  return steps
}

function mergeSort(arr: number[], steps: VisualizationStep[]): number[] {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = arr.slice(0, mid)
  const right = arr.slice(mid)

  steps.push({
    id: steps.length,
    description: `分解：[${arr.join(',')}] → [${left.join(',')}] 和 [${right.join(',')}]`,
    data: { arr, left, right, mid },
    variables: { mid, leftLen: left.length, rightLen: right.length },
    code: '3-5',
  })

  const sortedLeft = mergeSort(left, steps)
  const sortedRight = mergeSort(right, steps)
  const merged = merge(sortedLeft, sortedRight)

  steps.push({
    id: steps.length,
    description: `合并：[${sortedLeft.join(',')}] + [${sortedRight.join(',')}] → [${merged.join(',')}]`,
    data: { sortedLeft, sortedRight, merged },
    variables: { mergedLen: merged.length },
    code: '7-9',
  })

  return merged
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j))
}
