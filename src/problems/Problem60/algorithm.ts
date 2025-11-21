import { VisualizationStep } from '@/types'

export function generateAddTwoNumbersSteps(
  l1: number[],
  l2: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表1=[${l1.join(',')}]，链表2=[${l2.join(',')}]`,
    data: { l1, l2, result: [], carry: 0 },
    variables: { len1: l1.length, len2: l2.length },
    code: '1',
  })

  const result: number[] = []
  let carry = 0
  let i = 0

  while (i < l1.length || i < l2.length || carry > 0) {
    const val1 = i < l1.length ? l1[i] : 0
    const val2 = i < l2.length ? l2[i] : 0
    const sum = val1 + val2 + carry

    const digit = sum % 10
    carry = Math.floor(sum / 10)
    result.push(digit)

    steps.push({
      id: steps.length,
      description: `第${i}位：${val1} + ${val2} + ${carry > 0 ? `进位${carry}` : '0'} = ${sum}，结果=${digit}${carry > 0 ? `，进位=${carry}` : ''}`,
      data: { l1, l2, result: [...result], carry, i, val1, val2, sum, digit },
      variables: { i, val1, val2, sum, digit, carry },
      code: '4-7',
    })

    i++
  }

  steps.push({
    id: steps.length,
    description: `完成！结果=[${result.join(',')}]`,
    data: { l1, l2, result, carry: 0, completed: true },
    variables: { result },
    code: '9',
  })

  return steps
}
