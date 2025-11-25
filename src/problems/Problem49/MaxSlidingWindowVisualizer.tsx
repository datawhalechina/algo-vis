import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Info } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateMaxSlidingWindowSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxSlidingWindowInput extends ProblemInput {
  nums: number[];
  k: number;
}

interface MaxSlidingWindowData {
  nums?: number[];
  k?: number;
  deque?: number[];
  result?: number[];
  window?: number[];
  currentIndex?: number;
  maxValue?: number;
}

function MaxSlidingWindowVisualizer() {
  return (
    <ConfigurableVisualizer<MaxSlidingWindowInput, MaxSlidingWindowData>
      config={{
        defaultInput: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
        algorithm: (input) => generateMaxSlidingWindowSteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,3,-1,-3,5,3,6,7" },
          { type: "number", key: "k", label: "窗口大小 k", placeholder: "请输入窗口大小" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1,3,-1,-3,5,3,6,7], k: 3 } },
          { label: "示例 2", value: { nums: [1], k: 1 } },
          { label: "示例 3", value: { nums: [1,3,1,2,0,5], k: 3 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as MaxSlidingWindowInput;
          const currentNums = (variables?.nums || input.nums) as number[];
          const currentK = (variables?.k || input.k) as number;
          const deque = (variables?.deque || []) as number[];
          const result = (variables?.result || []) as number[];
          const currentIndex = variables?.currentIndex as number | undefined;
          const maxValue = variables?.maxValue as number | undefined;
          
          // 从描述中提取当前操作类型
          const description = visualization.currentStepData?.description || '';
          const isRemoving = description.includes('移除');
          const isAdding = description.includes('加入');
          const isRecording = description.includes('最大值');
          
          return (
            <>
              {/* 核心思路 + 当前操作提示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 算法说明 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-5">
                  <h3 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    单调队列核心思路
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>队首</strong>始终是当前窗口最大值</p>
                    <p>• 新元素入队前，移除所有比它小的元素</p>
                    <p>• 保持队列<strong>单调递减</strong>（大→小）</p>
                    <p className="text-xs text-gray-500 pt-1">⏱️ 时间复杂度 O(n)</p>
                  </div>
                </div>
                
                {/* 当前操作提示 */}
                <div className={`rounded-lg shadow-sm border-2 p-5 transition-all ${
                  isRemoving ? 'bg-red-50 border-red-300' :
                  isAdding ? 'bg-green-50 border-green-300' :
                  isRecording ? 'bg-purple-50 border-purple-300' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Info size={18} className={`${
                      isRemoving ? 'text-red-600' :
                      isAdding ? 'text-green-600' :
                      isRecording ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                    当前操作
                  </h3>
                  <p className={`text-sm font-medium ${
                    isRemoving ? 'text-red-700' :
                    isAdding ? 'text-green-700' :
                    isRecording ? 'text-purple-700' :
                    'text-gray-700'
                  }`}>
                    {description || '准备开始...'}
                  </p>
                </div>
              </div>

              {/* 原数组 + 滑动窗口 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>📊 原数组</span>
                  <span className="text-sm font-normal text-gray-500">(窗口大小 k={currentK})</span>
                </h4>
                
                <div className="relative">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {currentNums.map((num, idx) => {
                      const windowStart = currentIndex !== undefined ? Math.max(0, currentIndex - currentK + 1) : -1;
                      const windowEnd = currentIndex !== undefined ? currentIndex : -1;
                      const isInWindow = idx >= windowStart && idx <= windowEnd && windowStart >= 0;
                      const isCurrent = idx === currentIndex;
                      const isDequeHead = deque.length > 0 && deque[0] === idx;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ 
                            scale: isCurrent ? 1.15 : 1, 
                            opacity: 1,
                            y: isCurrent ? -4 : 0
                          }}
                          transition={{ delay: idx * 0.05 }}
                          className="relative"
                        >
                          <div
                            className={`w-16 h-16 flex flex-col items-center justify-center border-2 rounded-lg transition-all ${
                              isCurrent
                                ? 'border-blue-500 bg-blue-100 shadow-lg'
                                : isDequeHead
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : isInWindow
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            <div className="text-xs text-gray-400 mb-0.5">i={idx}</div>
                            <div className={`font-bold text-lg ${
                              isCurrent ? 'text-blue-700' :
                              isDequeHead ? 'text-purple-700' :
                              isInWindow ? 'text-green-700' :
                              'text-gray-800'
                            }`}>{num}</div>
                          </div>
                          {isCurrent && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 whitespace-nowrap"
                            >
                              👉 当前
                            </motion.div>
                          )}
                          {isDequeHead && !isCurrent && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 whitespace-nowrap"
                            >
                              👑 最大
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* 图例 */}
                  <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded"></div>
                      <span>当前处理</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-purple-50 border-2 border-purple-500 rounded"></div>
                      <span>窗口最大值</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-green-50 border-2 border-green-400 rounded"></div>
                      <span>窗口内</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded"></div>
                      <span>窗口外</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 单调队列 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span>🔄 单调队列</span>
                    <span className="text-xs font-normal text-gray-500">(存储索引，保持递减)</span>
                  </h4>
                  {deque.length > 0 && (
                    <span className="text-xs text-purple-600 font-medium bg-white px-2 py-1 rounded border border-purple-200">
                      队列长度: {deque.length}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3 justify-center items-center min-h-[100px]">
                  {deque.length > 0 ? (
                    <>
                      {/* 队首标记 */}
                      <div className="text-xs font-bold text-purple-700 flex flex-col items-center gap-1">
                        <div className="bg-purple-600 text-white px-2 py-1 rounded-full shadow">队首</div>
                        <div className="text-gray-500">最大值</div>
                      </div>
                      
                      {deque.map((idx, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative w-24 h-20 flex flex-col items-center justify-center border-3 rounded-lg shadow-md ${
                              i === 0 
                                ? 'border-purple-600 bg-gradient-to-br from-purple-100 to-purple-200' 
                                : 'border-purple-400 bg-purple-50'
                            }`}
                          >
                            {i === 0 && (
                              <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow">
                                👑
                              </div>
                            )}
                            <div className="text-xs text-purple-600 font-semibold mb-1">
                              索引 {idx}
                            </div>
                            <div className={`font-bold text-xl ${
                              i === 0 ? 'text-purple-800' : 'text-purple-700'
                            }`}>
                              {currentNums[idx]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              nums[{idx}]
                            </div>
                          </motion.div>
                          
                          {i < deque.length - 1 && (
                            <ArrowRight size={20} className="text-purple-400" />
                          )}
                        </div>
                      ))}
                      
                      {/* 队尾标记 */}
                      <div className="text-xs font-bold text-purple-600 flex flex-col items-center gap-1">
                        <div className="bg-purple-400 text-white px-2 py-1 rounded-full shadow">队尾</div>
                        <div className="text-gray-500">新元素</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">🈳</div>
                      <div className="text-sm text-gray-500">队列为空</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 窗口最大值提示 */}
              {maxValue !== undefined && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg shadow-md border-2 border-orange-400 p-5"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">当前窗口最大值</div>
                      <div className="text-4xl font-bold text-red-600">{maxValue}</div>
                    </div>
                    {deque.length > 0 && (
                      <div className="ml-4 text-xs text-gray-600">
                        <div>位置: 索引 {deque[0]}</div>
                        <div className="text-purple-600 font-medium">= 队首元素</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 结果数组 */}
              {result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span>✅ 结果数组</span>
                    <span className="text-sm font-normal text-gray-500">({result.length} 个窗口最大值)</span>
                  </h4>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {result.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: idx * 0.08,
                          type: "spring",
                          stiffness: 200
                        }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-16 h-16 flex items-center justify-center border-2 border-orange-500 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg shadow-md">
                          <div className="font-bold text-2xl text-orange-700">{num}</div>
                        </div>
                        <div className="text-xs text-gray-500">[{idx}]</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default MaxSlidingWindowVisualizer;
