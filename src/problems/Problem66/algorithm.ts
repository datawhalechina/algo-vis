import { VisualizationStep } from '@/types'

export function generateMergeKListsSteps(
  lists: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：共${lists.length}个链表，使用分治法合并`,
    data: { lists, k: lists.length },
    variables: { k: lists.length },
    code: '1',
  })

  if (lists.length === 0) {
    steps.push({
      id: 1,
      description: `链表数组为空，返回null`,
      data: { lists, result: [] },
      variables: {},
      code: '2',
    })
    return steps
  }

  const result = mergeDivideConquer(lists, 0, lists.length - 1, steps)

  steps.push({
    id: steps.length,
    description: `完成！合并结果=[${result.join(',')}]`,
    data: { lists, result, completed: true },
    variables: { result },
    code: '15',
  })

  return steps
}

function mergeDivideConquer(
  lists: number[][],
  left: number,
  right: number,
  steps: VisualizationStep[]
): number[] {
  if (left === right) {
    return lists[left]
  }

  const mid = Math.floor((left + right) / 2)

  steps.push({
    id: steps.length,
    description: `分治：处理链表[${left}..${right}]，mid=${mid}`,
    data: { left, right, mid },
    variables: { left, right, mid },
    code: '5-7',
  })

  const leftMerged = mergeDivideConquer(lists, left, mid, steps)
  const rightMerged = mergeDivideConquer(lists, mid + 1, right, steps)
  const merged = mergeTwoLists(leftMerged, rightMerged)

  steps.push({
    id: steps.length,
    description: `合并：[${leftMerged.join(',')}] + [${rightMerged.join(',')}] → [${merged.join(',')}]`,
    data: { leftMerged, rightMerged, merged },
    variables: {},
    code: '9-11',
  })

  return merged
}

function mergeTwoLists(l1: number[], l2: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0

  while (i < l1.length && j < l2.length) {
    if (l1[i] <= l2[j]) {
      result.push(l1[i++])
    } else {
      result.push(l2[j++])
    }
  }

  return result.concat(l1.slice(i)).concat(l2.slice(j))
}
