import { VisualizationStep } from '@/types'

export function generateFindAnagramsSteps(
  s: string,
  p: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[] = []

  if (s.length < p.length) {
    steps.push({
      id: 0,
      description: 's长度小于p长度，返回空数组',
      data: { s, p },
      variables: { result: [] },
      code: '3',
    })
    return steps
  }

  const pCount = new Array(26).fill(0)
  const sCount = new Array(26).fill(0)

  // 统计p的字符频次
  for (const char of p) {
    pCount[char.charCodeAt(0) - 97]++
  }

  steps.push({
    id: 0,
    description: `统计字符串p "${p}" 的字符频次`,
    data: { s, p },
    variables: {
      pCount: pCount.filter(c => c > 0),
      windowSize: p.length,
      left: 0,
      right: p.length - 1,
    },
    code: '9',
  })

  // 初始化窗口
  for (let i = 0; i < p.length; i++) {
    sCount[s.charCodeAt(i) - 97]++
  }

  steps.push({
    id: steps.length,
    description: `初始化窗口，统计s[0...${p.length - 1}]的字符频次`,
    data: { s, p },
    variables: {
      left: 0,
      right: p.length - 1,
      window: s.substring(0, p.length),
      sCount: sCount.filter(c => c > 0),
    },
    code: '14',
  })

  // 检查第一个窗口
  const isAnagram = () => pCount.every((count, i) => count === sCount[i])
  
  if (isAnagram()) {
    result.push(0)
    steps.push({
      id: steps.length,
      description: `窗口 "${s.substring(0, p.length)}" 是异位词，添加起始索引0`,
      data: { s, p },
      variables: {
        left: 0,
        right: p.length - 1,
        window: s.substring(0, p.length),
        result: [...result],
        isMatch: true,
      },
      code: '21',
    })
  } else {
    steps.push({
      id: steps.length,
      description: `窗口 "${s.substring(0, p.length)}" 不是异位词`,
      data: { s, p },
      variables: {
        left: 0,
        right: p.length - 1,
        window: s.substring(0, p.length),
        isMatch: false,
      },
      code: '21',
    })
  }

  // 滑动窗口
  for (let i = p.length; i < s.length; i++) {
    const left = i - p.length + 1
    
    // 添加右边字符
    sCount[s.charCodeAt(i) - 97]++
    // 移除左边字符
    sCount[s.charCodeAt(i - p.length) - 97]--

    const window = s.substring(left, i + 1)

    if (isAnagram()) {
      result.push(left)
      steps.push({
        id: steps.length,
        description: `窗口滑动到[${left}, ${i}]："${window}" ✓ 是异位词，添加索引${left}`,
        data: { s, p },
        variables: {
          left,
          right: i,
          window,
          result: [...result],
          isMatch: true,
        },
        code: '28',
      })
    } else {
      steps.push({
        id: steps.length,
        description: `窗口滑动到[${left}, ${i}]："${window}" ✗ 不是异位词`,
        data: { s, p },
        variables: {
          left,
          right: i,
          window,
          isMatch: false,
        },
        code: '28',
      })
    }
  }

  // 返回结果（保留最后窗口位置）
  const finalLeft = s.length - p.length
  const finalRight = s.length - 1
  steps.push({
    id: steps.length,
    description: `遍历完成，共找到 ${result.length} 个异位词起始索引`,
    data: { s, p },
    variables: {
      left: finalLeft,
      right: finalRight,
      result: [...result],
    },
    code: '33',
  })

  return steps
}
