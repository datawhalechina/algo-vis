import { VisualizationStep } from '@/types'

export function generateHasCycleSteps(
  list: number[],
  pos: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表长度=${list.length}，环入口位置=${pos >= 0 ? pos : '无环'}`,
    data: { list, pos, hasCycle: pos >= 0 },
    variables: { n: list.length, pos },
    code: '1',
  })

  if (pos < 0) {
    steps.push({
      id: 1,
      description: `无环，直接返回false`,
      data: { list, hasCycle: false },
      variables: { hasCycle: false },
      code: '3',
    })
    return steps
  }

  // 快慢指针
  let slow = 0, fast = 0
  let step = 0

  while (step <= list.length) {
    step++
    
    // 慢指针走1步
    slow = slow + 1 < list.length ? slow + 1 : pos
    
    // 快指针走2步
    fast = fast + 1 < list.length ? fast + 1 : pos
    if (fast !== slow) {
      fast = fast + 1 < list.length ? fast + 1 : pos
    }

    steps.push({
      id: steps.length,
      description: `第${step}步：slow在${slow}(${list[slow]})，fast在${fast}(${list[fast]})`,
      data: { list, pos, slow, fast, step },
      variables: { slow, fast, step },
      code: '5-10',
    })

    if (slow === fast) {
      steps.push({
        id: steps.length,
        description: `快慢指针相遇！链表有环`,
        data: { list, pos, slow, fast, hasCycle: true },
        variables: { hasCycle: true },
        code: '12',
      })
      break
    }

    if (step > list.length) break
  }

  return steps
}
