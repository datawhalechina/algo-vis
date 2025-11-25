import { VisualizationStep } from '@/types'

export function generateRotateArraySteps(
  nums: number[],
  k: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const n = nums.length
  k = k % n // 处理k大于n的情况

  steps.push({
    id: 0,
    description: `初始化：数组长度=${n}，轮转次数k=${k}（原k % n）`,
    data: { nums: [...nums], k },
    variables: {
      n,
      k,
      originalNums: [...nums],
    },
    code: '3',
  })

  // 第一步：反转整个数组
  const step1 = [...nums]
  reverse(step1, 0, n - 1)
  
  steps.push({
    id: steps.length,
    description: `步骤1：反转整个数组 [0, ${n - 1}]`,
    data: { nums: [...step1], k },
    variables: {
      step: 1,
      nums: [...step1],
      reverseRange: [0, n - 1],
    },
    code: '6',
  })

  // 第二步：反转前k个
  const step2 = [...step1]
  reverse(step2, 0, k - 1)
  
  steps.push({
    id: steps.length,
    description: `步骤2：反转前k个元素 [0, ${k - 1}]`,
    data: { nums: [...step2], k },
    variables: {
      step: 2,
      nums: [...step2],
      reverseRange: [0, k - 1],
    },
    code: '8',
  })

  // 第三步：反转后n-k个
  const step3 = [...step2]
  reverse(step3, k, n - 1)
  
  steps.push({
    id: steps.length,
    description: `步骤3：反转后${n - k}个元素 [${k}, ${n - 1}]`,
    data: { nums: [...step3], k },
    variables: {
      step: 3,
      nums: [...step3],
      reverseRange: [k, n - 1],
    },
    code: '10',
  })

  // 完成
  steps.push({
    id: steps.length,
    description: `完成！数组向右轮转${k}个位置`,
    data: { nums: [...step3], k },
    variables: {
      result: [...step3],
      originalNums: [...nums],
    },
    code: '13',
  })

  return steps
}

function reverse(nums: number[], start: number, end: number): void {
  while (start < end) {
    [nums[start], nums[end]] = [nums[end], nums[start]]
    start++
    end--
  }
}
