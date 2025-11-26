import { VisualizationStep } from '@/types'

export function generateThreeSumSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[][] = []
  
  nums.sort((a, b) => a - b)

  steps.push({
    id: 0,
    description: '对数组进行排序',
    data: { nums },
    variables: {
      sortedNums: [...nums],
      result: [],
    },
  })

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue

    steps.push({
      id: steps.length,
      description: `固定第一个数 nums[${i}] = ${nums[i]}`,
      data: { nums },
      variables: {
        i,
        fixedNum: nums[i],
        result: [...result],
      },
      highlightedIndices: [i],
    })

    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      steps.push({
        id: steps.length,
        description: `双指针：left=${left}, right=${right}, sum=${nums[i]}+${nums[left]}+${nums[right]}=${sum}`,
        data: { nums },
        variables: {
          i,
          left,
          right,
          sum,
          result: [...result],
        },
        highlightedIndices: [i, left, right],
      })

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        
        steps.push({
          id: steps.length,
          description: `找到答案：[${nums[i]}, ${nums[left]}, ${nums[right]}]`,
          data: { nums },
          variables: {
            i,
            left,
            right,
            sum,
            result: [...result],
          },
          highlightedIndices: [i, left, right],
        })

        while (left < right && nums[left] === nums[left + 1]) left++
        while (left < right && nums[right] === nums[right - 1]) right--
        left++
        right--
      } else if (sum < 0) {
        left++
      } else {
        right--
      }
    }
  }

  steps.push({
    id: steps.length,
    description: `查找完成！找到 ${result.length} 个三元组`,
    data: { nums },
    variables: {
      result: [...result],
      finalResult: result,
    },
  })

  return steps
}
