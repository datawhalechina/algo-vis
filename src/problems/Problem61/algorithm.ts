import { VisualizationStep } from '@/types'

export function generateRemoveNthFromEndSteps(
  list: number[],
  n: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表=[${list.join(',')}]，删除倒数第${n}个节点`,
    data: { list, n },
    variables: { len: list.length, n },
    code: '1',
  })

  // 快指针先走n步
  let fast = 0
  for (let i = 0; i < n; i++) {
    fast++
    steps.push({
      id: steps.length,
      description: `快指针先走${i + 1}步，到达位置${fast}`,
      data: { list, n, fast, phase: 'fast-advance' },
      variables: { fast, i: i + 1 },
      code: '3-5',
    })
  }

  // 双指针同步前进
  let slow = 0
  while (fast < list.length) {
    slow++
    fast++
    steps.push({
      id: steps.length,
      description: `双指针同步前进：slow=${slow}，fast=${fast}`,
      data: { list, n, slow, fast, phase: 'sync-advance' },
      variables: { slow, fast },
      code: '7-9',
    })
  }

  // 删除节点
  const targetIdx = slow
  const result = [...list.slice(0, targetIdx), ...list.slice(targetIdx + 1)]

  steps.push({
    id: steps.length,
    description: `删除位置${targetIdx}的节点（值=${list[targetIdx]}）`,
    data: { list, n, targetIdx, deletedValue: list[targetIdx], result, phase: 'delete' },
    variables: { targetIdx, deletedValue: list[targetIdx] },
    code: '11',
  })

  steps.push({
    id: steps.length,
    description: `完成！结果=[${result.join(',')}]`,
    data: { list, result, completed: true },
    variables: { result },
    code: '13',
  })

  return steps
}
