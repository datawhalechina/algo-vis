import { motion } from "framer-motion";
import { Database, ArrowRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateLRUCacheSteps, LRUOperation } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface LRUCacheInput extends ProblemInput {
  capacity: number;
  operations: LRUOperation[];
}

interface LRUCacheData {
  capacity?: number;
  operation?: string;
  key?: number;
  value?: number;
  result?: number;
  cache?: Record<number, number>;
  order?: number[];
  evicted?: number;
  completed?: boolean;
}

function LRUCacheVisualizer() {
  return (
    <ConfigurableVisualizer<LRUCacheInput, LRUCacheData>
      config={{
        defaultInput: {
          capacity: 2,
          operations: [
            { op: 'put', key: 1, value: 1 },
            { op: 'put', key: 2, value: 2 },
            { op: 'get', key: 1 },
            { op: 'put', key: 3, value: 3 },
            { op: 'get', key: 2 },
            { op: 'put', key: 4, value: 4 },
            { op: 'get', key: 1 },
            { op: 'get', key: 3 },
            { op: 'get', key: 4 },
          ],
        },
        algorithm: (input) => generateLRUCacheSteps(input.capacity, input.operations),
        
        inputTypes: [],
        inputFields: [],
        testCases: [
          { 
            label: "示例1 (capacity=2)", 
            value: { 
              capacity: 2,
              operations: [
                { op: 'put', key: 1, value: 1 },
                { op: 'put', key: 2, value: 2 },
                { op: 'get', key: 1 },
                { op: 'put', key: 3, value: 3 },
                { op: 'get', key: 2 },
                { op: 'put', key: 4, value: 4 },
                { op: 'get', key: 1 },
                { op: 'get', key: 3 },
                { op: 'get', key: 4 },
              ]
            } 
          },
          { 
            label: "示例2 (capacity=3)", 
            value: { 
              capacity: 3,
              operations: [
                { op: 'put', key: 1, value: 10 },
                { op: 'put', key: 2, value: 20 },
                { op: 'put', key: 3, value: 30 },
                { op: 'get', key: 1 },
                { op: 'put', key: 4, value: 40 },
                { op: 'get', key: 2 },
              ]
            } 
          },
          { 
            label: "简单示例", 
            value: { 
              capacity: 1,
              operations: [
                { op: 'put', key: 1, value: 1 },
                { op: 'get', key: 1 },
                { op: 'put', key: 2, value: 2 },
                { op: 'get', key: 1 },
              ]
            } 
          },
        ],
        
        render: ({ data }) => {
          const state = data as LRUCacheData;
          
          if (!state || state.capacity === undefined) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { capacity, operation, key, value, result, cache = {}, order = [], evicted, completed } = state;

          return (
            <div className="space-y-6">
              {/* 标题说明 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <Database size={20} className="text-purple-600" />
                  LRU 缓存机制
                </h3>
                <p className="text-sm text-gray-600">
                  Least Recently Used - 最近最少使用缓存，容量={capacity}
                </p>
              </div>

              {/* 当前操作 */}
              {operation && !completed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    operation === 'get' 
                      ? 'bg-blue-50 border-blue-300'
                      : operation === 'put'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-bold ${
                      operation === 'get' 
                        ? 'text-blue-700'
                        : operation === 'put'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {operation === 'get' && `get(${key})`}
                      {operation === 'put' && `put(${key}, ${value})`}
                      {operation === 'evict' && `淘汰 key=${evicted}`}
                    </div>
                    {operation === 'get' && result !== undefined && (
                      <div className={`text-sm font-medium ${
                        result === -1 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        → {result === -1 ? '未找到 (-1)' : `返回 ${result}`}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 淘汰提示 */}
              {operation === 'evict' && evicted !== undefined && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="text-red-700 font-medium text-center">
                    ⚠️ 容量已满，淘汰最久未使用的 key={evicted}
                  </div>
                </motion.div>
              )}

              {/* 缓存状态可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    缓存状态 ({order.length}/{capacity})
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-400 rounded"></div>
                      <span>最新</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-400 rounded"></div>
                      <span>最旧</span>
                    </div>
                  </div>
                </div>

                {order.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    缓存为空
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-xs font-medium text-gray-600">最新</div>
                    {order.map((k, idx) => (
                      <motion.div
                        key={k}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`relative px-4 py-3 rounded-xl border-2 transition-all ${
                            idx === 0
                              ? 'border-green-500 bg-green-100 ring-2 ring-green-300'
                              : idx === order.length - 1
                              ? 'border-red-400 bg-red-50'
                              : 'border-blue-400 bg-blue-50'
                          }`}
                        >
                          <div className="text-xs text-gray-600 mb-1">key={k}</div>
                          <div className={`text-xl font-bold ${
                            idx === 0
                              ? 'text-green-700'
                              : idx === order.length - 1
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}>
                            {cache[k]}
                          </div>
                          
                          {/* 位置标签 */}
                          {idx === 0 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                              ✓
                            </div>
                          )}
                          {idx === order.length - 1 && order.length === capacity && (
                            <div className="absolute -bottom-2 -right-2 text-red-500 text-xs">
                              ⚠️
                            </div>
                          )}
                        </div>
                        {idx < order.length - 1 && (
                          <ArrowRight size={20} className="text-gray-400" />
                        )}
                      </motion.div>
                    ))}
                    <div className="text-xs font-medium text-gray-600">最旧</div>
                  </div>
                )}
              </div>

              {/* 完成提示 */}
              {completed && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center"
                >
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    ✓ 所有操作完成！
                  </div>
                  <div className="text-sm text-green-600">
                    最终缓存大小: {order.length}
                  </div>
                </motion.div>
              )}

              {/* 算法说明 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2">💡 LRU 实现原理</div>
                  <div className="space-y-1">
                    <div>🔹 数据结构：哈希表 + 双向链表</div>
                    <div>🔹 get操作：查找并移到链表头部（最新位置）</div>
                    <div>🔹 put操作：添加/更新并移到头部，容量满时删除尾部</div>
                    <div className="mt-2 text-xs">⏱️ get/put 都是 O(1) 时间复杂度</div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default LRUCacheVisualizer;
