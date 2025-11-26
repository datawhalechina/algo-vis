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

export function generateIsValidBSTSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const root = buildTree(arr)
  let stepId = 0

  steps.push({
    id: stepId++,
    description: '验证二叉搜索树',
    data: { tree: treeToArray(root) },
    variables: { tree: treeToArray(root) },
  })

  function validate(
    node: TreeNode | null,
    min: number | null,
    max: number | null,
    path: string
  ): boolean {
    if (!node) {
      steps.push({
        id: stepId++,
        description: `${path} 为空，返回 true`,
        data: { tree: treeToArray(root) },
        variables: { path, result: true },
      })
      return true
    }

    steps.push({
      id: stepId++,
      description: `检查节点 ${path} (值: ${node.val})`,
      data: { tree: treeToArray(root) },
      variables: {
        currentNode: node.val,
        path,
        min: min ?? '-∞',
        max: max ?? '+∞',
      },
    })

    // 检查范围
    if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) {
      const reason =
        min !== null && node.val <= min
          ? `${node.val} <= ${min}（违反下界）`
          : `${node.val} >= ${max}（违反上界）`

      steps.push({
        id: stepId++,
        description: `节点 ${node.val} 不在合法范围内：${reason}`,
        data: { tree: treeToArray(root) },
        variables: {
          currentNode: node.val,
          violation: true,
          reason,
          result: false,
        },
      })
      return false
    }

    steps.push({
      id: stepId++,
      description: `节点 ${node.val} 在合法范围 (${min ?? '-∞'}, ${max ?? '+∞'}) 内 ✓`,
      data: { tree: treeToArray(root) },
      variables: {
        currentNode: node.val,
        valid: true,
      },
    })

    // 验证左子树
    const leftValid = validate(node.left, min, node.val, `${path}.left`)
    if (!leftValid) return false

    // 验证右子树
    const rightValid = validate(node.right, node.val, max, `${path}.right`)
    return rightValid
  }

  const result = validate(root, null, null, 'root')

  steps.push({
    id: stepId++,
    description: result ? '是有效的二叉搜索树 ✓' : '不是有效的二叉搜索树 ✗',
    data: { tree: treeToArray(root) },
    variables: { finalResult: result },
  })

  return steps
}
