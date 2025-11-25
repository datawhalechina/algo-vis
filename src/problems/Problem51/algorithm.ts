import { VisualizationStep } from '@/types'

export function generateProductExceptSelfSteps(
  nums: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const n = nums.length
  const answer = new Array(n).fill(1)

  steps.push({
    id: 0,
    description: `初始化：数组长度=${n}，创建结果数组并初始化为1`,
    data: { nums: [...nums], answer: [...answer], leftProducts: [], rightProducts: [] },
    variables: {
      n,
      answer: [...answer],
    },
    code: '1-2',
  })

  // 计算左侧乘积
  const leftProducts: number[] = []
  let left = 1
  
  steps.push({
    id: steps.length,
    description: `开始计算左侧乘积（不包含自身）`,
    data: { nums: [...nums], answer: [...answer], leftProducts: [], rightProducts: [], phase: 'left' },
    variables: {
      left,
      phase: 'left',
    },
    code: '4-5',
  })

  for (let i = 0; i < n; i++) {
    answer[i] = left
    leftProducts.push(left)
    
    steps.push({
      id: steps.length,
      description: `索引${i}：左侧乘积=${left}，answer[${i}]=${left}`,
      data: { 
        nums: [...nums], 
        answer: [...answer], 
        leftProducts: [...leftProducts],
        rightProducts: [],
        currentIndex: i,
        phase: 'left',
      },
      variables: {
        i,
        left,
        'answer[i]': answer[i],
      },
      code: '7-8',
    })
    
    left *= nums[i]
    
    steps.push({
      id: steps.length,
      description: `更新left：left *= nums[${i}] = ${left}`,
      data: { 
        nums: [...nums], 
        answer: [...answer], 
        leftProducts: [...leftProducts],
        rightProducts: [],
        currentIndex: i,
        phase: 'left',
      },
      variables: {
        i,
        left,
        'nums[i]': nums[i],
      },
      code: '9',
    })
  }

  // 计算右侧乘积
  const rightProducts: number[] = new Array(n)
  let right = 1
  
  steps.push({
    id: steps.length,
    description: `开始计算右侧乘积（不包含自身）并更新结果`,
    data: { 
      nums: [...nums], 
      answer: [...answer], 
      leftProducts: [...leftProducts],
      rightProducts: [],
      phase: 'right',
    },
    variables: {
      right,
      phase: 'right',
    },
    code: '12-13',
  })

  for (let i = n - 1; i >= 0; i--) {
    rightProducts[i] = right
    answer[i] *= right
    
    steps.push({
      id: steps.length,
      description: `索引${i}：右侧乘积=${right}，answer[${i}] = ${leftProducts[i]} × ${right} = ${answer[i]}`,
      data: { 
        nums: [...nums], 
        answer: [...answer], 
        leftProducts: [...leftProducts],
        rightProducts: [...rightProducts],
        currentIndex: i,
        phase: 'right',
      },
      variables: {
        i,
        right,
        'leftProducts[i]': leftProducts[i],
        'rightProducts[i]': right,
        'answer[i]': answer[i],
      },
      code: '15-16',
    })
    
    right *= nums[i]
    
    steps.push({
      id: steps.length,
      description: `更新right：right *= nums[${i}] = ${right}`,
      data: { 
        nums: [...nums], 
        answer: [...answer], 
        leftProducts: [...leftProducts],
        rightProducts: [...rightProducts],
        currentIndex: i,
        phase: 'right',
      },
      variables: {
        i,
        right,
        'nums[i]': nums[i],
      },
      code: '17',
    })
  }

  steps.push({
    id: steps.length,
    description: `完成！结果数组为：[${answer.join(', ')}]`,
    data: { 
      nums: [...nums], 
      answer: [...answer], 
      leftProducts: [...leftProducts],
      rightProducts: [...rightProducts],
      phase: 'complete',
    },
    variables: {
      result: [...answer],
    },
    code: '20',
  })

  return steps
}
