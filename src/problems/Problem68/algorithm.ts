import { VisualizationStep } from '@/types'

interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

export function generateInorderTraversalSteps(
  tree: (number | null)[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const result: number[] = []

  steps.push({
    id: 0,
    description: `初始化：树=[${tree.join(',')}]，准备中序遍历`,
    data: { tree, result: [] },
    variables: { nodeCount: tree.filter(n => n !== null).length },
    code: '1',
  })

  // 从数组构建树（简化处理）
  const root = buildTree(tree)
  
  // 中序遍历
  function inorder(node: TreeNode | null, depth: number = 0): void {
    if (!node) return

    // 遍历左子树
    if (node.left) {
      steps.push({
        id: steps.length,
        description: `递归左子树：当前节点=${node.val}，进入左子树`,
        data: { tree, result: [...result], currentNode: node.val, depth },
        variables: { currentNode: node.val, depth },
        code: '5',
      })
      inorder(node.left, depth + 1)
    }

    // 访问根节点
    result.push(node.val)
    steps.push({
      id: steps.length,
      description: `访问节点${node.val}，加入结果 → [${result.join(',')}]`,
      data: { tree, result: [...result], currentNode: node.val, depth },
      variables: { currentNode: node.val, depth },
      code: '6',
    })

    // 遍历右子树
    if (node.right) {
      steps.push({
        id: steps.length,
        description: `递归右子树：当前节点=${node.val}，进入右子树`,
        data: { tree, result: [...result], currentNode: node.val, depth },
        variables: { currentNode: node.val, depth },
        code: '7',
      })
      inorder(node.right, depth + 1)
    }
  }

  if (root) {
    inorder(root)
  }

  steps.push({
    id: steps.length,
    description: `完成！中序遍历结果=[${result.join(',')}]`,
    data: { tree, result, completed: true },
    variables: { result },
    code: '11',
  })

  return steps
}

// 从数组构建二叉树（层序）
function buildTree(arr: (number | null)[]): TreeNode | null {
  if (!arr.length || arr[0] === null) return null

  const root: TreeNode = { val: arr[0], left: null, right: null }
  const queue: TreeNode[] = [root]
  let i = 1

  while (queue.length && i < arr.length) {
    const node = queue.shift()!
    
    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null }
      queue.push(node.left)
    }
    i++

    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null }
      queue.push(node.right)
    }
    i++
  }

  return root
}
