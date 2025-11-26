import { VisualizationStep } from '@/types'

export function generateMaxSlidingWindowSteps(nums: number[], k: number): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[] = []
  const deque: number[] = []

  steps.push({
    id: 0,
    description: `初始化单调队列，窗口大小 k = ${k}`,
    data: { nums, k },
    variables: { deque: [], result: [], i: -1 },
  })

  for (let i = 0; i < nums.length; i++) {
    // 移除不在窗口内的元素
    if (deque.length > 0 && deque[0] < i - k + 1) {
      const removed = deque.shift()!
      steps.push({
        id: steps.length,
        description: `移除不在窗口内的元素索引 ${removed}`,
        data: { nums, k },
        variables: {
          i,
          deque: [...deque],
          result: [...result],
          windowStart: i - k + 1,
        },
        highlightedIndices: deque,
      })
    }

    // 移除所有小于当前元素的索引
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      const removed = deque.pop()!
      steps.push({
        id: steps.length,
        description: `移除较小元素：nums[${removed}]=${nums[removed]} < nums[${i}]=${nums[i]}`,
        data: { nums, k },
        variables: {
          i,
          deque: [...deque],
          result: [...result],
        },
        highlightedIndices: [...deque, i],
      })
    }

    // 将当前索引加入队尾
    deque.push(i)
    steps.push({
      id: steps.length,
      description: `将索引 ${i} 加入队列`,
      data: { nums, k },
      variables: {
        i,
        deque: [...deque],
        result: [...result],
      },
      highlightedIndices: deque,
    })

    // 窗口形成后，记录最大值
    if (i >= k - 1) {
      const maxVal = nums[deque[0]]
      result.push(maxVal)
      steps.push({
        id: steps.length,
        description: `窗口 [${i - k + 1}, ${i}] 的最大值是 ${maxVal}`,
        data: { nums, k },
        variables: {
          i,
          deque: [...deque],
          result: [...result],
          windowStart: i - k + 1,
          windowEnd: i,
          maxVal,
        },
        highlightedIndices: Array.from({ length: k }, (_, idx) => i - k + 1 + idx),
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `计算完成！结果：[${result.join(', ')}]`,
    data: { nums, k },
    variables: {
      result: [...result],
      finalResult: result,
    },
  })

  return steps
}
