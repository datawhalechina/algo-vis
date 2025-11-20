import { VisualizationStep } from '@/types'

export function generateTwoSumSteps(
  nums: number[],
  target: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const map = new Map<number, number>()

  // 初始步骤
  steps.push({
    id: 0,
    description: '开始执行两数之和算法，创建空的哈希表',
    data: { nums, target },
    variables: {
      map: {},
      i: -1,
    },
    code: '2',
  })

  // 遍历数组
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]

    // 计算补数
    steps.push({
      id: steps.length,
      description: `遍历到索引 ${i}，当前值为 ${nums[i]}，计算补数 complement = ${target} - ${nums[i]} = ${complement}`,
      data: { nums, target },
      variables: {
        i,
        complement,
        'nums[i]': nums[i],
        map: Object.fromEntries(map),
      },
      highlightedIndices: Array.from(map.values()),
      code: '5',
    })

    // 检查哈希表
    if (map.has(complement)) {
      const prevIndex = map.get(complement)!
      steps.push({
        id: steps.length,
        description: `在哈希表中找到了 ${complement}（索引 ${prevIndex}），找到答案！`,
        data: { nums, target },
        variables: {
          i,
          complement,
          result: [prevIndex, i],
          map: Object.fromEntries(map),
        },
        highlightedIndices: [prevIndex, i],
        code: '8',
      })
      return steps
    }

    // 添加到哈希表
    map.set(nums[i], i)
    steps.push({
      id: steps.length,
      description: `哈希表中没有找到 ${complement}，将 ${nums[i]} 和索引 ${i} 存入哈希表`,
      data: { nums, target },
      variables: {
        i,
        map: Object.fromEntries(map),
      },
      highlightedIndices: Array.from(map.values()),
      code: '11',
    })
  }

  // 未找到
  steps.push({
    id: steps.length,
    description: '遍历完成，未找到符合条件的两个数',
    data: { nums, target },
    variables: {
      map: Object.fromEntries(map),
      result: [],
    },
    code: '14',
  })

  return steps
}

