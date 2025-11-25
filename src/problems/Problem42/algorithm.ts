import { VisualizationStep } from '@/types'

export function generateLongestConsecutiveSteps(
  nums: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  if (nums.length === 0) {
    steps.push({
      id: 0,
      description: '数组为空，返回0',
      data: { nums },
      variables: { result: 0 },
      code: '2',
    })
    return steps
  }

  const numSet = new Set(nums)

  // 初始步骤
  steps.push({
    id: 0,
    description: `将数组转换为Set，去重后有 ${numSet.size} 个不同的数字`,
    data: { nums },
    variables: {
      numSet: Array.from(numSet),
      maxLength: 0,
    },
    code: '3',
  })

  let maxLength = 0
  const processedNums: number[] = []

  // 遍历Set
  for (const num of numSet) {
    // 检查是否是序列起点
    if (!numSet.has(num - 1)) {
      processedNums.push(num)
      
      steps.push({
        id: steps.length,
        description: `检查 ${num}：${num - 1} 不在Set中，这是一个序列起点`,
        data: { nums },
        variables: {
          num,
          'num - 1': num - 1,
          currentNum: num,
          currentLength: 1,
          maxLength,
          processedNums: [...processedNums],
        },
        code: '8',
      })

      let currentNum = num
      let currentLength = 1
      const sequence = [num]

      // 计算序列长度
      while (numSet.has(currentNum + 1)) {
        currentNum++
        currentLength++
        sequence.push(currentNum)

        steps.push({
          id: steps.length,
          description: `找到 ${currentNum}，序列继续扩展`,
          data: { nums },
          variables: {
            num,
            currentNum,
            currentLength,
            sequence: [...sequence],
            maxLength,
          },
          code: '13',
        })
      }

      // 更新最大长度
      if (currentLength > maxLength) {
        maxLength = currentLength
        steps.push({
          id: steps.length,
          description: `序列 [${sequence.join(', ')}] 长度为 ${currentLength}，更新最大长度`,
          data: { nums },
          variables: {
            sequence: [...sequence],
            currentLength,
            maxLength,
          },
          code: '17',
        })
      } else {
        steps.push({
          id: steps.length,
          description: `序列 [${sequence.join(', ')}] 长度为 ${currentLength}，不更新最大长度`,
          data: { nums },
          variables: {
            sequence: [...sequence],
            currentLength,
            maxLength,
          },
          code: '17',
        })
      }
    } else {
      processedNums.push(num)
      steps.push({
        id: steps.length,
        description: `${num} 不是序列起点（${num - 1} 存在），跳过`,
        data: { nums },
        variables: {
          num,
          'num - 1': num - 1,
          maxLength,
          processedNums: [...processedNums],
        },
        code: '8',
      })
    }
  }

  // 返回结果
  steps.push({
    id: steps.length,
    description: `遍历完成，最长连续序列长度为 ${maxLength}`,
    data: { nums },
    variables: {
      maxLength,
      result: maxLength,
    },
    code: '21',
  })

  return steps
}
