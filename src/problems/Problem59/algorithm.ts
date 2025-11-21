import { VisualizationStep } from '@/types'

export function generateDetectCycleSteps(
  list: number[],
  pos: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表长度=${list.length}，环入口位置=${pos >= 0 ? pos : '无环'}`,
    data: { list, pos },
    variables: { n: list.length, pos },
    code: '1',
  })

  if (pos < 0) {
    steps.push({
      id: 1,
      description: `无环，返回null`,
      data: { list, result: null },
      variables: { result: null },
      code: '2',
    })
    return steps
  }

  // 阶段1：快慢指针相遇
  let slow = 0, fast = 0
  let meetPos = -1

  for (let i = 0; i < list.length * 2; i++) {
    slow = (slow + 1) % list.length
    if (slow >= pos && slow < list.length) {
      slow = pos + (slow - pos) % (list.length - pos)
    }

    fast = (fast + 2) % list.length
    if (fast >= pos) {
      fast = pos + (fast - pos) % (list.length - pos)
    }

    steps.push({
      id: steps.length,
      description: `阶段1：slow在${slow}，fast在${fast}`,
      data: { list, pos, slow, fast, phase: 'phase1' },
      variables: { slow, fast },
      code: '4-8',
    })

    if (slow === fast) {
      meetPos = slow
      steps.push({
        id: steps.length,
        description: `快慢指针相遇！位置=${meetPos}`,
        data: { list, pos, meetPos, phase: 'meet' },
        variables: { meetPos },
        code: '10',
      })
      break
    }
  }

  // 阶段2：寻找环入口
  steps.push({
    id: steps.length,
    description: `阶段2：一个指针从头开始，一个从相遇点开始，同时前进`,
    data: { list, pos, meetPos, phase: 'phase2' },
    variables: {},
    code: '12',
  })

  let ptr1 = 0
  let ptr2 = meetPos

  while (ptr1 !== ptr2) {
    ptr1 = (ptr1 + 1) % list.length
    ptr2 = (ptr2 + 1) % list.length
    if (ptr2 >= pos) {
      ptr2 = pos + (ptr2 - pos) % (list.length - pos)
    }

    steps.push({
      id: steps.length,
      description: `ptr1在${ptr1}，ptr2在${ptr2}`,
      data: { list, pos, ptr1, ptr2, phase: 'phase2' },
      variables: { ptr1, ptr2 },
      code: '14-16',
    })

    if (ptr1 === pos && ptr2 === pos) break
  }

  steps.push({
    id: steps.length,
    description: `找到环入口！位置=${pos}`,
    data: { list, pos, entrance: pos, phase: 'complete' },
    variables: { entrance: pos },
    code: '18',
  })

  return steps
}
