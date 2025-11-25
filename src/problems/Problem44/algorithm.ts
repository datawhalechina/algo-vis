import { VisualizationStep } from '@/types'

export function generateLengthOfLongestSubstringSteps(
  s: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const map = new Map<string, number>()
  let left = 0
  let maxLength = 0

  steps.push({
    id: 0,
    description: '初始化滑动窗口，left = 0, maxLength = 0',
    data: { s },
    variables: {
      left,
      maxLength,
      map: {},
    },
    code: '2',
  })

  for (let right = 0; right < s.length; right++) {
    const char = s[right]

    steps.push({
      id: steps.length,
      description: `right指针移动到索引${right}，当前字符为'${char}'`,
      data: { s },
      variables: {
        left,
        right,
        char,
        maxLength,
        map: Object.fromEntries(map),
      },
      code: '6',
    })

    // 检查字符是否重复
    if (map.has(char) && map.get(char)! >= left) {
      const oldLeft = left
      left = map.get(char)! + 1
      
      steps.push({
        id: steps.length,
        description: `字符'${char}'重复（上次出现在索引${map.get(char)}），left指针移动：${oldLeft} → ${left}`,
        data: { s },
        variables: {
          left,
          right,
          char,
          oldLeft,
          maxLength,
          map: Object.fromEntries(map),
        },
        code: '10',
      })
    }

    // 更新字符位置
    map.set(char, right)
    const currentLength = right - left + 1

    steps.push({
      id: steps.length,
      description: `更新'${char}'的位置为${right}，当前窗口长度为${currentLength}`,
      data: { s },
      variables: {
        left,
        right,
        char,
        currentLength,
        maxLength,
        substring: s.substring(left, right + 1),
        map: Object.fromEntries(map),
      },
      code: '14',
    })

    // 更新最大长度
    if (currentLength > maxLength) {
      maxLength = currentLength
      steps.push({
        id: steps.length,
        description: `更新最大长度：${currentLength}，当前最长子串为"${s.substring(left, right + 1)}"`,
        data: { s },
        variables: {
          left,
          right,
          maxLength,
          substring: s.substring(left, right + 1),
          map: Object.fromEntries(map),
        },
        code: '15',
      })
    }
  }

  // 返回结果
  steps.push({
    id: steps.length,
    description: `遍历完成，最长无重复字符子串长度为${maxLength}`,
    data: { s },
    variables: {
      maxLength,
      result: maxLength,
    },
    code: '18',
  })

  return steps
}
