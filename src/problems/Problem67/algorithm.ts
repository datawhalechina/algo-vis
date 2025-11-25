import { VisualizationStep } from '@/types'

export interface LRUOperation {
  op: 'get' | 'put'
  key: number
  value?: number
  result?: number
}

export function generateLRUCacheSteps(
  capacity: number,
  operations: LRUOperation[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = []
  const cache = new Map<number, number>()
  const order: number[] = [] // 记录访问顺序，最新的在前面

  steps.push({
    id: 0,
    description: `初始化LRU缓存，容量=${capacity}`,
    data: { capacity, cache: {}, order: [] },
    variables: { capacity },
    code: '1',
  })

  operations.forEach((operation) => {
    if (operation.op === 'get') {
      const value = cache.get(operation.key)
      
      if (value !== undefined) {
        // 移到最前面
        const index = order.indexOf(operation.key)
        order.splice(index, 1)
        order.unshift(operation.key)
      }

      steps.push({
        id: steps.length,
        description: `get(${operation.key}) → ${value !== undefined ? value : -1}`,
        data: {
          capacity,
          operation: 'get',
          key: operation.key,
          result: value !== undefined ? value : -1,
          cache: Object.fromEntries(cache),
          order: [...order],
        },
        variables: { key: operation.key, result: value !== undefined ? value : -1 },
        code: '5-8',
      })
    } else {
      // put操作
      if (cache.has(operation.key)) {
        // 更新值并移到最前面
        cache.set(operation.key, operation.value!)
        const index = order.indexOf(operation.key)
        order.splice(index, 1)
        order.unshift(operation.key)
      } else {
        // 新增
        if (cache.size >= capacity) {
          // 淘汰最久未使用的
          const evicted = order.pop()!
          cache.delete(evicted)
          
          steps.push({
            id: steps.length,
            description: `容量已满，淘汰key=${evicted}`,
            data: {
              capacity,
              operation: 'evict',
              evicted,
              cache: Object.fromEntries(cache),
              order: [...order],
            },
            variables: { evicted },
            code: '12-14',
          })
        }
        
        cache.set(operation.key, operation.value!)
        order.unshift(operation.key)
      }

      steps.push({
        id: steps.length,
        description: `put(${operation.key}, ${operation.value})`,
        data: {
          capacity,
          operation: 'put',
          key: operation.key,
          value: operation.value,
          cache: Object.fromEntries(cache),
          order: [...order],
        },
        variables: { key: operation.key, value: operation.value },
        code: '10-16',
      })
    }
  })

  steps.push({
    id: steps.length,
    description: `完成所有操作`,
    data: { capacity, cache: Object.fromEntries(cache), order, completed: true },
    variables: { finalSize: cache.size },
    code: '20',
  })

  return steps
}
