import { VisualizationStep } from '@/types'

export interface RandomListNode {
  val: number
  random: number | null
}

export function generateCopyRandomListSteps(
  nodes: RandomListNode[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []

  steps.push({
    id: 0,
    description: `初始化：链表有${nodes.length}个节点，准备创建哈希映射`,
    data: { nodes, map: {}, newNodes: [] },
    variables: { nodeCount: nodes.length },
    code: '1',
  })

  // 第一次遍历：创建所有新节点
  const newNodes: number[] = []
  nodes.forEach((node, idx) => {
    newNodes.push(node.val)
    steps.push({
      id: steps.length,
      description: `创建新节点${idx}，值=${node.val}`,
      data: { nodes, newNodes: [...newNodes], currentIdx: idx },
      variables: { idx, val: node.val },
      code: '3-5',
    })
  })

  // 第二次遍历：复制指针关系
  nodes.forEach((node, idx) => {
    steps.push({
      id: steps.length,
      description: `节点${idx}: 设置random指针指向${node.random === null ? 'null' : '节点' + node.random}`,
      data: { nodes, newNodes, currentIdx: idx, random: node.random },
      variables: { idx, random: node.random },
      code: '7-9',
    })
  })

  steps.push({
    id: steps.length,
    description: `完成！成功复制带随机指针的链表`,
    data: { nodes, newNodes, completed: true },
    variables: { newNodes },
    code: '11',
  })

  return steps
}
