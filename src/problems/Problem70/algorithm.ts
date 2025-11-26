import { VisualizationStep } from '@/types'

export function generateLongestConsecutiveSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  if (nums.length === 0) {
    steps.push({
      id: 0,
      description: '数组为空，返回 0',
      data: { nums },
      variables: { maxLength: 0 },
    })
    return steps
  }

  const numSet = new Set(nums)
  let maxLength = 0

  steps.push({
    id: 0,
    description: '将所有数字存入哈希集合',
    data: { nums },
    variables: {
      numSet: Array.from(numSet).sort((a, b) => a - b),
      maxLength: 0,
    },
  })

  for (const num of numSet) {
    // 只从序列起点开始
    if (!numSet.has(num - 1)) {
      steps.push({
        id: steps.length,
        description: `${num} 是序列起点（${num - 1} 不在集合中）`,
        data: { nums },
        variables: {
          num,
          isStart: true,
          numSet: Array.from(numSet).sort((a, b) => a - b),
          maxLength,
        },
        highlightedIndices: [num],
      })

      let currentNum = num
      let currentLength = 1

      // 向后查找连续数字
      while (numSet.has(currentNum + 1)) {
        currentNum++
        currentLength++

        steps.push({
          id: steps.length,
          description: `找到连续数字 ${currentNum}，当前序列长度 = ${currentLength}`,
          data: { nums },
          variables: {
            num,
            currentNum,
            currentLength,
            numSet: Array.from(numSet).sort((a, b) => a - b),
            maxLength,
          },
          highlightedIndices: Array.from({ length: currentLength }, (_, i) => num + i),
        })
      }

      maxLength = Math.max(maxLength, currentLength)

      steps.push({
        id: steps.length,
        description: `从 ${num} 开始的序列长度为 ${currentLength}，更新最大长度 = ${maxLength}`,
        data: { nums },
        variables: {
          num,
          currentLength,
          numSet: Array.from(numSet).sort((a, b) => a - b),
          maxLength,
        },
        highlightedIndices: Array.from({ length: currentLength }, (_, i) => num + i),
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `查找完成！最长连续序列长度为 ${maxLength}`,
    data: { nums },
    variables: {
      numSet: Array.from(numSet).sort((a, b) => a - b),
      maxLength,
      result: maxLength,
    },
  })

  return steps
}
