import { VisualizationStep } from '@/types'

export function generateSubarraySumSteps(
  nums: number[],
  k: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const map = new Map<number, number>()
  map.set(0, 1) // 前缀和为0出现1次

  steps.push({
    id: 0,
    description: '初始化：前缀和为0的次数设为1（处理从头开始的子数组）',
    data: { nums, k },
    variables: {
      preSum: 0,
      count: 0,
      map: Object.fromEntries(map),
    },
    code: '2',
  })

  let preSum = 0
  let count = 0

  for (let i = 0; i < nums.length; i++) {
    preSum += nums[i]

    steps.push({
      id: steps.length,
      description: `累加到索引${i}，preSum = ${preSum}（${nums[i]}）`,
      data: { nums, k },
      variables: {
        i,
        'nums[i]': nums[i],
        preSum,
        count,
        map: Object.fromEntries(map),
      },
      code: '9',
    })

    // 查找 preSum - k
    const target = preSum - k
    if (map.has(target)) {
      const times = map.get(target)!
      count += times
      
      steps.push({
        id: steps.length,
        description: `preSum(${preSum}) - k(${k}) = ${target} 在map中出现${times}次，找到${times}个子数组`,
        data: { nums, k },
        variables: {
          i,
          preSum,
          target,
          'map[target]': times,
          count,
          foundSubarrays: times,
        },
        code: '12',
      })
    } else {
      steps.push({
        id: steps.length,
        description: `preSum(${preSum}) - k(${k}) = ${target} 不在map中`,
        data: { nums, k },
        variables: {
          i,
          preSum,
          target,
          count,
        },
        code: '12',
      })
    }

    // 记录当前前缀和
    map.set(preSum, (map.get(preSum) || 0) + 1)
    
    steps.push({
      id: steps.length,
      description: `将前缀和${preSum}存入map，出现次数+1`,
      data: { nums, k },
      variables: {
        i,
        preSum,
        count,
        map: Object.fromEntries(map),
      },
      code: '17',
    })
  }

  // 返回结果
  steps.push({
    id: steps.length,
    description: `遍历完成，共找到 ${count} 个和为${k}的子数组`,
    data: { nums, k },
    variables: {
      count,
      result: count,
    },
    code: '20',
  })

  return steps
}
