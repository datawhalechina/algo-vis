import { VisualizationStep } from '@/types'

export function generateReverseKGroupSteps(
  list: number[],
  k: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result = [...list]

  steps.push({
    id: 0,
    description: `初始化：链表=[${list.join(',')}], k=${k}`,
    data: { list, result, k, groupCount: 0 },
    variables: { length: list.length, k },
    code: '1',
  })

  let i = 0
  let groupCount = 0

  while (i + k <= result.length) {
    // 翻转从i到i+k-1的元素
    const group = result.slice(i, i + k)
    group.reverse()
    
    for (let j = 0; j < k; j++) {
      result[i + j] = group[j]
    }
    
    groupCount++

    steps.push({
      id: steps.length,
      description: `翻转第${groupCount}组 [${i}..${i + k - 1}]：[${list.slice(i, i + k).join(',')}] → [${group.join(',')}]`,
      data: { list, result: [...result], k, groupCount, i },
      variables: { i, groupCount },
      code: '5-10',
    })

    i += k
  }

  steps.push({
    id: steps.length,
    description: `完成！共翻转${groupCount}组，结果=[${result.join(',')}]`,
    data: { list, result, k, groupCount, completed: true },
    variables: { result, groupCount },
    code: '15',
  })

  return steps
}
