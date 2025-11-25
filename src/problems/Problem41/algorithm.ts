import { VisualizationStep } from '@/types'

export function generateGroupAnagramsSteps(
  strs: string[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const map = new Map<string, string[]>()

  // 初始步骤
  steps.push({
    id: 0,
    description: '开始执行字母异位词分组算法，创建空的哈希表',
    data: { strs },
    variables: {
      map: {},
      i: -1,
    },
    code: '2',
  })

  // 遍历字符串数组
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i]
    const key = str.split('').sort().join('')

    steps.push({
      id: steps.length,
      description: `遍历到索引 ${i}，字符串 "${str}"，排序后的key为 "${key}"`,
      data: { strs },
      variables: {
        i,
        str,
        key,
        map: Object.fromEntries(
          Array.from(map.entries()).map(([k, v]) => [k, [...v]])
        ),
      },
      code: '5',
    })

    // 检查key是否存在
    if (!map.has(key)) {
      map.set(key, [])
      steps.push({
        id: steps.length,
        description: `key "${key}" 不存在，创建新的分组`,
        data: { strs },
        variables: {
          i,
          key,
          map: Object.fromEntries(
            Array.from(map.entries()).map(([k, v]) => [k, [...v]])
          ),
        },
        code: '8',
      })
    }

    // 添加到分组
    map.get(key)!.push(str)
    steps.push({
      id: steps.length,
      description: `将 "${str}" 添加到 key "${key}" 的分组中`,
      data: { strs },
      variables: {
        i,
        key,
        map: Object.fromEntries(
          Array.from(map.entries()).map(([k, v]) => [k, [...v]])
        ),
      },
      code: '10',
    })
  }

  // 返回结果
  const result = Array.from(map.values())
  steps.push({
    id: steps.length,
    description: `遍历完成，共分成 ${result.length} 组`,
    data: { strs },
    variables: {
      map: Object.fromEntries(
        Array.from(map.entries()).map(([k, v]) => [k, [...v]])
      ),
      result,
    },
    code: '13',
  })

  return steps
}
