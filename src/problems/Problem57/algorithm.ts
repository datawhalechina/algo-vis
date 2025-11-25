import { VisualizationStep } from '@/types'

export function generatePalindromeListSteps(
  list: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表长度=${list.length}，检查是否为回文`,
    data: { list, n: list.length },
    variables: { n: list.length },
    code: '1',
  })

  // 快慢指针找中点
  let slow = 0, fast = 0

  while (fast < list.length && fast + 1 < list.length) {
    slow++
    fast += 2
    steps.push({
      id: steps.length,
      description: `快慢指针：slow在${slow}，fast在${fast}`,
      data: { list, slow, fast, phase: 'find-mid' },
      variables: { slow, fast },
      code: '3-5',
    })
  }

  steps.push({
    id: steps.length,
    description: `找到中点：索引${slow}`,
    data: { list, mid: slow, phase: 'mid-found' },
    variables: { mid: slow },
    code: '7',
  })

  // 反转后半部分
  const reversed = [...list.slice(slow)].reverse()
  
  steps.push({
    id: steps.length,
    description: `反转后半部分：[${reversed.join(',')}]`,
    data: { list, mid: slow, reversed, phase: 'reversed' },
    variables: { reversed },
    code: '9-11',
  })

  // 比较前后两部分
  let isPalindrome = true
  for (let i = 0; i < reversed.length && i < slow; i++) {
    const match = list[i] === reversed[i]
    
    steps.push({
      id: steps.length,
      description: `比较：list[${i}]=${list[i]} ${match ? '==' : '!='} reversed[${i}]=${reversed[i]}`,
      data: { list, reversed, compareIdx: i, match, phase: 'compare' },
      variables: { i, match },
      code: '13-15',
    })

    if (!match) {
      isPalindrome = false
      break
    }
  }

  steps.push({
    id: steps.length,
    description: isPalindrome ? `是回文链表！` : `不是回文链表`,
    data: { list, isPalindrome, phase: 'complete' },
    variables: { isPalindrome },
    code: '17',
  })

  return steps
}
