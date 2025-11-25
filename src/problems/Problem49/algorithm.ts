import { VisualizationStep } from '@/types'

export function generateMaxSlidingWindowSteps(
  nums: number[],
  k: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[] = []
  const deque: number[] = [] // 存储下标

  steps.push({
    id: 0,
    description: `初始化：数组长度=${nums.length}，窗口大小k=${k}，使用单调递减队列`,
    data: { nums: [...nums], k, deque: [], result: [], window: [] },
    variables: {
      n: nums.length,
      k,
      deque: [],
      result: [],
    },
    code: '1-2',
  })

  for (let i = 0; i < nums.length; i++) {
    // 移除队列中超出窗口范围的元素
    if (deque.length > 0 && deque[0] <= i - k) {
      const removed = deque.shift()!
      steps.push({
        id: steps.length,
        description: `索引${i}：移除队头索引${removed}（超出窗口范围）`,
        data: {
          nums: [...nums],
          k,
          deque: [...deque],
          result: [...result],
          window: nums.slice(Math.max(0, i - k + 1), i + 1),
          currentIndex: i,
        },
        variables: {
          i,
          removed,
          deque: [...deque],
        },
        code: '5-7',
      })
    }

    // 移除队列中小于当前元素的所有元素
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      const removed = deque.pop()!
      steps.push({
        id: steps.length,
        description: `索引${i}：移除队尾索引${removed}（值${nums[removed]} < 当前值${nums[i]}）`,
        data: {
          nums: [...nums],
          k,
          deque: [...deque],
          result: [...result],
          window: nums.slice(Math.max(0, i - k + 1), i + 1),
          currentIndex: i,
        },
        variables: {
          i,
          removed,
          currentValue: nums[i],
          deque: [...deque],
        },
        code: '9-11',
      })
    }

    // 将当前索引加入队列
    deque.push(i)
    steps.push({
      id: steps.length,
      description: `索引${i}：将索引${i}（值${nums[i]}）加入队尾`,
      data: {
        nums: [...nums],
        k,
        deque: [...deque],
        result: [...result],
        window: nums.slice(Math.max(0, i - k + 1), i + 1),
        currentIndex: i,
      },
      variables: {
        i,
        deque: [...deque],
      },
      code: '13',
    })

    // 窗口形成后，记录最大值
    if (i >= k - 1) {
      const max = nums[deque[0]]
      result.push(max)
      steps.push({
        id: steps.length,
        description: `索引${i}：窗口 [${i - k + 1}, ${i}] 形成，最大值为 ${max}（索引${deque[0]}）`,
        data: {
          nums: [...nums],
          k,
          deque: [...deque],
          result: [...result],
          window: nums.slice(i - k + 1, i + 1),
          currentIndex: i,
          maxValue: max,
        },
        variables: {
          i,
          windowStart: i - k + 1,
          windowEnd: i,
          maxValue: max,
          maxIndex: deque[0],
          result: [...result],
        },
        code: '16-17',
      })
    }
  }

  steps.push({
    id: steps.length,
    description: `完成！所有窗口的最大值：[${result.join(', ')}]`,
    data: {
      nums: [...nums],
      k,
      deque: [],
      result: [...result],
      window: [],
    },
    variables: {
      finalResult: [...result],
    },
    code: '21',
  })

  return steps
}
