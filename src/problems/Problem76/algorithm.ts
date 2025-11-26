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

export function generateLevelOrderSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const root = buildTree(arr)
  let stepId = 0

  if (!root) {
    steps.push({
      id: stepId++,
      description: '空树，返回空数组',
      data: { tree: [] },
      variables: { result: [] },
    })
    return steps
  }

  steps.push({
    id: stepId++,
    description: '初始化队列，将根节点入队',
    data: { tree: treeToArray(root) },
    variables: {
      tree: treeToArray(root),
      queue: [root.val],
      result: [],
      currentLevel: 0,
    },
  })

  const result: number[][] = []
  const queue: TreeNode[] = [root]
  let level = 0

  while (queue.length > 0) {
    const levelSize = queue.length
    const currentLevel: number[] = []

    steps.push({
      id: stepId++,
      description: `处理第 ${level + 1} 层，共 ${levelSize} 个节点`,
      data: { tree: treeToArray(root) },
      variables: {
        currentLevel: level + 1,
        levelSize,
        queue: queue.map(n => n.val),
        result: [...result],
      },
    })

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!
      currentLevel.push(node.val)

      steps.push({
        id: stepId++,
        description: `访问节点 ${node.val}，加入当前层结果`,
        data: { tree: treeToArray(root) },
        variables: {
          currentNode: node.val,
          currentLevel: level + 1,
          currentLevelNodes: [...currentLevel],
          queue: queue.map(n => n.val),
        },
      })

      if (node.left) {
        queue.push(node.left)
        steps.push({
          id: stepId++,
          description: `将左子节点 ${node.left.val} 加入队列`,
          data: { tree: treeToArray(root) },
          variables: {
            addedNode: node.left.val,
            queue: queue.map(n => n.val),
          },
        })
      }

      if (node.right) {
        queue.push(node.right)
        steps.push({
          id: stepId++,
          description: `将右子节点 ${node.right.val} 加入队列`,
          data: { tree: treeToArray(root) },
          variables: {
            addedNode: node.right.val,
            queue: queue.map(n => n.val),
          },
        })
      }
    }

    result.push(currentLevel)

    steps.push({
      id: stepId++,
      description: `第 ${level + 1} 层遍历完成: [${currentLevel.join(', ')}]`,
      data: { tree: treeToArray(root) },
      variables: {
        completedLevel: level + 1,
        levelResult: currentLevel,
        result: [...result],
        queue: queue.map(n => n.val),
      },
    })

    level++
  }

  steps.push({
    id: stepId++,
    description: '层序遍历完成',
    data: { tree: treeToArray(root) },
    variables: { finalResult: result },
  })

  return steps
}
