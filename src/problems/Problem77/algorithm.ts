import { VisualizationStep } from '@/types'

interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
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

export function generateSortedArrayToBSTSteps(nums: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  let stepId = 0
  let root: TreeNode | null = null

  if (nums.length === 0) {
    steps.push({
      id: stepId++,
      description: '空数组，返回空树',
      data: { tree: [] },
      variables: { nums: [], result: null },
    })
    return steps
  }

  steps.push({
    id: stepId++,
    description: '开始将有序数组转换为平衡二叉搜索树',
    data: { tree: [] },
    variables: { nums, inputArray: nums },
  })

  function build(left: number, right: number, path: string): TreeNode | null {
    if (left > right) {
      steps.push({
        id: stepId++,
        description: `${path}: left > right，返回 null`,
        data: { tree: root ? treeToArray(root) : [] },
        variables: { left, right, path },
      })
      return null
    }

    const mid = Math.floor((left + right) / 2)
    const node: TreeNode = { val: nums[mid], left: null, right: null }

    if (!root) root = node

    steps.push({
      id: stepId++,
      description: `${path}: 选择中间元素 nums[${mid}] = ${nums[mid]} 作为根节点`,
      data: { tree: root ? treeToArray(root) : [] },
      variables: {
        left,
        right,
        mid,
        currentValue: nums[mid],
        path,
        subarray: nums.slice(left, right + 1),
      },
    })

    node.left = build(left, mid - 1, `${path}.left`)
    node.right = build(mid + 1, right, `${path}.right`)

    steps.push({
      id: stepId++,
      description: `${path}: 节点 ${nums[mid]} 构建完成`,
      data: { tree: root ? treeToArray(root) : [] },
      variables: {
        completedNode: nums[mid],
        path,
      },
    })

    return node
  }

  build(0, nums.length - 1, 'root')

  steps.push({
    id: stepId++,
    description: '平衡二叉搜索树构建完成',
    data: { tree: root ? treeToArray(root) : [] },
    variables: { finalResult: root ? treeToArray(root) : [] },
  })

  return steps
}
