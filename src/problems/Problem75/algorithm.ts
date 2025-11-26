import { VisualizationStep } from '@/types'

interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null

  const root: TreeNode = { val: arr[0], left: null, right: null }
  const queue: TreeNode[] = [root]
  let i = 1

  while (queue.length > 0 && i < arr.length) {
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

function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return []

  const result: (number | null)[] = []
  const queue: (TreeNode | null)[] = [root]

  while (queue.length > 0) {
    const node = queue.shift()
    if (node === null || node === undefined) {
      result.push(null)
    } else {
      result.push(node.val)
      queue.push(node.left)
      queue.push(node.right)
    }
  }

  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop()
  }

  return result
}

export function generateDiameterSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const root = buildTree(arr)
  let maxDiameter = 0
  let stepId = 0

  steps.push({
    id: stepId++,
    description: '计算二叉树的直径',
    data: { tree: treeToArray(root) },
    variables: { tree: treeToArray(root), maxDiameter: 0 },
  })

  function depth(node: TreeNode | null, path: string): number {
    if (!node) {
      steps.push({
        id: stepId++,
        description: `${path} 为空，深度为 0`,
        data: { tree: treeToArray(root) },
        variables: { currentPath: path, depth: 0, maxDiameter },
      })
      return 0
    }

    steps.push({
      id: stepId++,
      description: `访问节点 ${path} (值: ${node.val})`,
      data: { tree: treeToArray(root) },
      variables: { currentNode: node.val, currentPath: path, maxDiameter },
    })

    const leftDepth = depth(node.left, `${path}.left`)
    const rightDepth = depth(node.right, `${path}.right`)

    const currentDiameter = leftDepth + rightDepth
    maxDiameter = Math.max(maxDiameter, currentDiameter)

    steps.push({
      id: stepId++,
      description: `节点 ${node.val}: 左深度=${leftDepth}, 右深度=${rightDepth}, 通过该节点的直径=${currentDiameter}`,
      data: { tree: treeToArray(root) },
      variables: {
        currentNode: node.val,
        leftDepth,
        rightDepth,
        currentDiameter,
        maxDiameter,
      },
    })

    return Math.max(leftDepth, rightDepth) + 1
  }

  depth(root, 'root')

  steps.push({
    id: stepId++,
    description: `二叉树的直径为 ${maxDiameter}`,
    data: { tree: treeToArray(root) },
    variables: { result: maxDiameter, maxDiameter },
  })

  return steps
}
