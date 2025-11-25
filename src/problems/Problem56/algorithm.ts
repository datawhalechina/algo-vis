import { VisualizationStep } from '@/types'

export function generateIntersectionSteps(
  listA: number[],
  listB: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表A长度=${listA.length}，链表B长度=${listB.length}`,
    data: { listA, listB },
    variables: { lenA: listA.length, lenB: listB.length },
    code: '1',
  })

  // 双指针法
  let pA = 0, pB = 0
  let switchA = false, switchB = false

  while (pA < listA.length || pB < listB.length) {
    const valA = pA < listA.length ? listA[pA] : null
    const valB = pB < listB.length ? listB[pB] : null

    steps.push({
      id: steps.length,
      description: `指针A在${pA}(${valA})，指针B在${pB}(${valB})`,
      data: { listA, listB, pA, pB, valA, valB, switchA, switchB },
      variables: { pA, pB },
      code: '3-10',
    })

    if (valA === valB && valA !== null) {
      steps.push({
        id: steps.length,
        description: `找到相交点！值=${valA}`,
        data: { listA, listB, pA, pB, intersection: valA, found: true },
        variables: { intersection: valA },
        code: '12',
      })
      return steps
    }

    if (pA < listA.length) pA++
    else if (!switchA) {
      switchA = true
      pA = 0
      steps.push({
        id: steps.length,
        description: `指针A到达末尾，切换到链表B起点`,
        data: { listA, listB, pA, pB, switchA: true },
        variables: { switchA: true },
        code: '14',
      })
    }

    if (pB < listB.length) pB++
    else if (!switchB) {
      switchB = true
      pB = 0
      steps.push({
        id: steps.length,
        description: `指针B到达末尾，切换到链表A起点`,
        data: { listA, listB, pA, pB, switchB: true },
        variables: { switchB: true },
        code: '16',
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `未找到相交点`,
    data: { listA, listB, found: false },
    variables: { intersection: null },
    code: '18',
  })

  return steps
}
