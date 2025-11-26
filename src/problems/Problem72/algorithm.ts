import { VisualizationStep } from '@/types'

interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

// 从数组创建二叉树
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

// 将树转为数组表示
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

  // 移除末尾的 null
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop()
  }

  return result
}


export function generateInvertTreeSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const root = buildTree(arr)

  steps.push({
    id: 0,
    description: '原始二叉树',
    data: { tree: treeToArray(root) },
    variables: {
      tree: treeToArray(root),
    },
  })

  // 递归翻转并记录步骤
  function invertWithSteps(node: TreeNode | null, path: string = 'root'): TreeNode | null {
    if (!node) return null

    steps.push({
      id: steps.length,
      description: `访问节点 ${path} (值: ${node.val})`,
      data: { tree: treeToArray(root) },
      variables: {
        currentNode: path,
        currentValue: node.val,
        tree: treeToArray(root),
      },
    })

    // 递归翻转左右子树
    const left = invertWithSteps(node.left, `${path}.left`)
    const right = invertWithSteps(node.right, `${path}.right`)

    // 交换左右子节点
    node.left = right
    node.right = left

    steps.push({
      id: steps.length,
      description: `翻转节点 ${path} (值: ${node.val}) 的左右子树`,
      data: { tree: treeToArray(root) },
      variables: {
        currentNode: path,
        currentValue: node.val,
        tree: treeToArray(root),
        swapped: true,
      },
    })

    return node
  }

  invertWithSteps(root)

  steps.push({
    id: steps.length,
    description: '翻转完成！',
    data: { tree: treeToArray(root) },
    variables: {
      tree: treeToArray(root),
      result: treeToArray(root),
    },
  })

  return steps
}
