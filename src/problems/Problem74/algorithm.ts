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

export function generateIsSymmetricSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const root = buildTree(arr)

  steps.push({
    id: 0,
    description: '原始二叉树',
    data: { tree: treeToArray(root) },
    variables: { tree: treeToArray(root) },
  })

  if (!root) {
    steps.push({
      id: 1,
      description: '空树是对称的',
      data: { tree: [] },
      variables: { result: true },
    })
    return steps
  }

  let stepId = 1

  function isMirror(left: TreeNode | null, right: TreeNode | null, path: string): boolean {
    steps.push({
      id: stepId++,
      description: `比较 ${path}`,
      data: { tree: treeToArray(root) },
      variables: {
        leftVal: left?.val ?? null,
        rightVal: right?.val ?? null,
        comparing: path,
      },
    })

    if (!left && !right) {
      steps.push({
        id: stepId++,
        description: '两个节点都为空，镜像对称 ✓',
        data: { tree: treeToArray(root) },
        variables: { result: true },
      })
      return true
    }

    if (!left || !right) {
      steps.push({
        id: stepId++,
        description: '只有一个节点为空，不对称 ✗',
        data: { tree: treeToArray(root) },
        variables: { result: false },
      })
      return false
    }

    if (left.val !== right.val) {
      steps.push({
        id: stepId++,
        description: `节点值不同 (${left.val} ≠ ${right.val})，不对称 ✗`,
        data: { tree: treeToArray(root) },
        variables: { result: false },
      })
      return false
    }

    steps.push({
      id: stepId++,
      description: `节点值相同 (${left.val} = ${right.val})，继续检查子树 ✓`,
      data: { tree: treeToArray(root) },
      variables: { matching: true },
    })

    const leftMirror = isMirror(left.left, right.right, `${path} -> (左.左 vs 右.右)`)
    if (!leftMirror) return false

    const rightMirror = isMirror(left.right, right.left, `${path} -> (左.右 vs 右.左)`)
    return rightMirror
  }

  const result = isMirror(root.left, root.right, '根的左右子树')

  steps.push({
    id: stepId++,
    description: result ? '二叉树是对称的 ✓' : '二叉树不对称 ✗',
    data: { tree: treeToArray(root) },
    variables: { finalResult: result },
  })

  return steps
}
