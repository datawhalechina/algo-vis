import { VisualizationStep } from '@/types'

export function generateMergeIntervalsSteps(
  intervals: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  if (intervals.length <= 1) {
    steps.push({
      id: 0,
      description: '区间数量<=1，直接返回',
      data: { intervals },
      variables: { result: intervals },
      code: '2',
    })
    return steps
  }

  // 排序
  intervals.sort((a, b) => a[0] - b[0])
  steps.push({
    id: 0,
    description: '按区间起始位置排序',
    data: { intervals: [...intervals] },
    variables: {
      sortedIntervals: intervals.map(i => [...i]),
    },
    code: '5',
  })

  const result: number[][] = [intervals[0]]
  
  steps.push({
    id: steps.length,
    description: `将第一个区间[${intervals[0][0]}, ${intervals[0][1]}]加入结果`,
    data: { intervals: [...intervals] },
    variables: {
      result: result.map(r => [...r]),
      i: 0,
    },
    code: '7',
  })

  // 遍历区间
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i]
    const last = result[result.length - 1]

    steps.push({
      id: steps.length,
      description: `检查当前区间[${current[0]}, ${current[1]}]与最后一个区间[${last[0]}, ${last[1]}]`,
      data: { intervals: [...intervals] },
      variables: {
        i,
        current: [...current],
        last: [...last],
        result: result.map(r => [...r]),
      },
      code: '11',
    })

    // 判断是否重叠
    if (current[0] <= last[1]) {
      const oldEnd = last[1]
      last[1] = Math.max(last[1], current[1])
      
      steps.push({
        id: steps.length,
        description: `区间重叠！合并：[${last[0]}, ${oldEnd}] + [${current[0]}, ${current[1]}] = [${last[0]}, ${last[1]}]`,
        data: { intervals: [...intervals] },
        variables: {
          i,
          current: [...current],
          last: [...last],
          overlap: true,
          oldEnd,
          result: result.map(r => [...r]),
        },
        code: '15',
      })
    } else {
      result.push([...current])
      
      steps.push({
        id: steps.length,
        description: `区间不重叠，将[${current[0]}, ${current[1]}]加入结果`,
        data: { intervals: [...intervals] },
        variables: {
          i,
          current: [...current],
          overlap: false,
          result: result.map(r => [...r]),
        },
        code: '18',
      })
    }
  }

  // 返回结果
  steps.push({
    id: steps.length,
    description: `遍历完成，合并后有 ${result.length} 个区间`,
    data: { intervals: [...intervals] },
    variables: {
      result: result.map(r => [...r]),
    },
    code: '23',
  })

  return steps
}
