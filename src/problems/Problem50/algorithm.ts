import { VisualizationStep } from '@/types'

export function generateMinWindowSteps(
  s: string,
  t: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const need = new Map<string, number>()
  const window = new Map<string, number>()
  
  // 统计t中字符频次
  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1)
  }

  steps.push({
    id: 0,
    description: `初始化：需要匹配字符串t="${t}"，统计字符频次`,
    data: { s, t, need: Object.fromEntries(need), window: {}, left: 0, right: 0 },
    variables: {
      need: Object.fromEntries(need),
      needSize: need.size,
    },
    code: '1-5',
  })

  let left = 0, right = 0
  let valid = 0
  let start = 0, len = Infinity
  let minWindow = ''

  while (right < s.length) {
    const c = s[right]
    right++
    
    // 扩展窗口
    steps.push({
      id: steps.length,
      description: `右指针移动：加入字符'${c}'到窗口，right=${right}`,
      data: { 
        s, 
        t, 
        window: Object.fromEntries(window), 
        left, 
        right,
        currentChar: c,
        highlightIndices: [right - 1],
      },
      variables: {
        right,
        currentChar: c,
        left,
      },
      code: '8-9',
    })

    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1)
      if (window.get(c) === need.get(c)) {
        valid++
        
        steps.push({
          id: steps.length,
          description: `字符'${c}'的数量已满足要求，valid=${valid}/${need.size}`,
          data: { 
            s, 
            t, 
            window: Object.fromEntries(window), 
            left, 
            right,
            valid,
          },
          variables: {
            valid,
            needSize: need.size,
          },
          code: '11-15',
        })
      }
    }

    // 收缩窗口
    while (valid === need.size) {
      // 更新最小窗口
      if (right - left < len) {
        start = left
        len = right - left
        minWindow = s.substring(start, start + len)
        
        steps.push({
          id: steps.length,
          description: `找到更小的覆盖子串："${minWindow}"，长度=${len}`,
          data: { 
            s, 
            t, 
            window: Object.fromEntries(window), 
            left, 
            right,
            minWindow,
            minLength: len,
            highlightIndices: Array.from({ length: len }, (_, i) => start + i),
          },
          variables: {
            start,
            len,
            minWindow,
          },
          code: '18-21',
        })
      }

      const d = s[left]
      left++
      
      steps.push({
        id: steps.length,
        description: `左指针移动：移除字符'${d}'，left=${left}`,
        data: { 
          s, 
          t, 
          window: Object.fromEntries(window), 
          left, 
          right,
          removedChar: d,
        },
        variables: {
          left,
          removedChar: d,
        },
        code: '23-24',
      })

      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--
          
          steps.push({
            id: steps.length,
            description: `字符'${d}'数量不足，valid=${valid}，继续扩展右指针`,
            data: { 
              s, 
              t, 
              window: Object.fromEntries(window), 
              left, 
              right,
              valid,
            },
            variables: {
              valid,
            },
            code: '26-28',
          })
        }
        window.set(d, window.get(d)! - 1)
      }
    }
  }

  steps.push({
    id: steps.length,
    description: len === Infinity 
      ? `完成！未找到覆盖子串` 
      : `完成！最小覆盖子串为："${minWindow}"，长度=${len}`,
    data: { 
      s, 
      t, 
      minWindow: len === Infinity ? '' : minWindow,
      minLength: len === Infinity ? 0 : len,
      highlightIndices: len === Infinity ? [] : Array.from({ length: len }, (_, i) => start + i),
    },
    variables: {
      result: len === Infinity ? '' : minWindow,
      length: len === Infinity ? 0 : len,
    },
    code: '33',
  })

  return steps
}
