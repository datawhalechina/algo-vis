import { VisualizationStep } from '@/types'
import { LinkedListNode } from '@/components/visualizers/templates/LinkedListTemplate'

export interface SwapPairsState {
  nodes: LinkedListNode[];
  prevIndex: number | null;
  firstIndex: number | null;
  secondIndex: number | null;
  swappedPairs?: number[];
}

export function generateSwapPairsSteps(values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  
  if (values.length === 0) {
    return [{
      id: 0,
      description: '空链表',
      data: { nodes: [], prevIndex: null, firstIndex: null, secondIndex: null },
      variables: {},
      code: '1',
    }]
  }

  // 初始化链表
  const nodes: LinkedListNode[] = values.map((val, idx) => ({
    val,
    next: idx < values.length - 1 ? idx + 1 : null
  }))

  steps.push({
    id: 0,
    description: `初始化链表: [${values.join(', ')}]`,
    data: {
      nodes: JSON.parse(JSON.stringify(nodes)),
      prevIndex: null,
      firstIndex: null,
      secondIndex: null,
      swappedPairs: [],
    } as SwapPairsState,
    variables: { length: values.length },
    code: '1-2',
  })

  const swappedPairs: number[] = []
  let i = 0
  
  while (i < nodes.length - 1) {
    const firstIdx = i
    const secondIdx = i + 1
    const pairNumber = Math.floor(i / 2)
    
    // 展示prev, first, second指针
    steps.push({
      id: steps.length,
      description: `第${pairNumber + 1}对: 定位 first=节点${firstIdx}, second=节点${secondIdx}`,
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        prevIndex: i > 0 ? i - 1 : null,
        firstIndex: firstIdx,
        secondIndex: secondIdx,
        swappedPairs: [...swappedPairs],
      } as SwapPairsState,
      variables: { first: firstIdx, second: secondIdx },
      code: '5-6',
    })
    
    // 交换节点
    const temp = nodes[secondIdx].next
    nodes[secondIdx].next = firstIdx
    nodes[firstIdx].next = temp
    
    // 如果有前驱节点，更新其next指针
    if (i > 0) {
      nodes[i - 1].next = secondIdx
    }
    
    swappedPairs.push(pairNumber)
    
    steps.push({
      id: steps.length,
      description: `交换完成: 节点${firstIdx}(值${values[firstIdx]}) ↔ 节点${secondIdx}(值${values[secondIdx]})`,
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        prevIndex: secondIdx,
        firstIndex: null,
        secondIndex: null,
        swappedPairs: [...swappedPairs],
      } as SwapPairsState,
      variables: { swappedPairs: pairNumber + 1 },
      code: '7-11',
    })
    
    i += 2
  }

  steps.push({
    id: steps.length,
    description: `完成！共交换 ${swappedPairs.length} 对节点`,
    data: {
      nodes: JSON.parse(JSON.stringify(nodes)),
      prevIndex: null,
      firstIndex: null,
      secondIndex: null,
      swappedPairs,
    } as SwapPairsState,
    variables: { totalSwaps: swappedPairs.length },
    code: '15',
  })

  return steps
}
