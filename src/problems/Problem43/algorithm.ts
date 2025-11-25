import { VisualizationStep } from '@/types'

export function generateThreeSumSteps(
  nums: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[][] = []
  
  // 排序
  nums.sort((a, b) => a - b)
  steps.push({
    id: 0,
    description: '对数组进行排序',
    data: { nums: [...nums] },
    variables: {
      sortedNums: [...nums],
    },
    code: '2',
  })

  // 遍历数组
  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复元素
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        id: steps.length,
        description: `跳过重复元素 ${nums[i]}（索引 ${i}）`,
        data: { nums: [...nums] },
        variables: {
          i,
          skipReason: '重复元素',
        },
        code: '6',
      })
      continue
    }

    steps.push({
      id: steps.length,
      description: `固定第一个数 nums[${i}] = ${nums[i]}，使用双指针寻找另外两个数`,
      data: { nums: [...nums] },
      variables: {
        i,
        target: -nums[i],
        left: i + 1,
        right: nums.length - 1,
      },
      code: '9',
    })

    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      steps.push({
        id: steps.length,
        description: `计算和：nums[${i}](${nums[i]}) + nums[${left}](${nums[left]}) + nums[${right}](${nums[right]}) = ${sum}`,
        data: { nums: [...nums] },
        variables: {
          i,
          left,
          right,
          sum,
          target: 0,
        },
        code: '13',
      })

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        steps.push({
          id: steps.length,
          description: `找到一组解：[${nums[i]}, ${nums[left]}, ${nums[right]}]`,
          data: { nums: [...nums] },
          variables: {
            i,
            left,
            right,
            sum,
            result: result.map(r => [...r]),
          },
          code: '16',
        })

        // 跳过重复元素
        while (left < right && nums[left] === nums[left + 1]) {
          left++
          steps.push({
            id: steps.length,
            description: `跳过左侧重复元素，left移至${left + 1}`,
            data: { nums: [...nums] },
            variables: { i, left, right },
            code: '19',
          })
        }
        while (left < right && nums[right] === nums[right - 1]) {
          right--
          steps.push({
            id: steps.length,
            description: `跳过右侧重复元素，right移至${right - 1}`,
            data: { nums: [...nums] },
            variables: { i, left, right },
            code: '20',
          })
        }

        left++
        right--
      } else if (sum < 0) {
        left++
        steps.push({
          id: steps.length,
          description: `和(${sum}) < 0，left指针右移至${left}`,
          data: { nums: [...nums] },
          variables: { i, left, right, sum },
          code: '24',
        })
      } else {
        right--
        steps.push({
          id: steps.length,
          description: `和(${sum}) > 0，right指针左移至${right}`,
          data: { nums: [...nums] },
          variables: { i, left, right, sum },
          code: '26',
        })
      }
    }
  }

  // 返回结果
  steps.push({
    id: steps.length,
    description: `遍历完成，共找到 ${result.length} 组解`,
    data: { nums: [...nums] },
    variables: {
      result: result.map(r => [...r]),
    },
    code: '31',
  })

  return steps
}
