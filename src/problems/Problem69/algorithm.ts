import { VisualizationStep } from '@/types'

export function generateGroupAnagramsSteps(strs: string[]): VisualizationStep[] {
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
  })

  // 遍历字符串数组
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i]
    const key = str.split('').sort().join('')

    steps.push({
      id: steps.length,
      description: `处理字符串 "${str}"，排序后得到 key = "${key}"`,
      data: { strs },
      variables: {
        i,
        str,
        key,
        map: Object.fromEntries(
          Array.from(map.entries()).map(([k, v]) => [k, [...v]])
        ),
      },
      highlightedIndices: [i],
    })

    // 添加到对应分组
    if (!map.has(key)) {
      map.set(key, [])
    }
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
      highlightedIndices: [i],
    })
  }

  // 完成
  const result = Array.from(map.values())
  steps.push({
    id: steps.length,
    description: `分组完成！共 ${result.length} 个分组`,
    data: { strs },
    variables: {
      map: Object.fromEntries(
        Array.from(map.entries()).map(([k, v]) => [k, [...v]])
      ),
      result,
    },
  })

  return steps
}
