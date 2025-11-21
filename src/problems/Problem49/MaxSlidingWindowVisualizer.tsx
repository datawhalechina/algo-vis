import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
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
          const window = (variables?.window || []) as number[];
          const currentIndex = variables?.currentIndex as number | undefined;
          const maxValue = variables?.maxValue as number | undefined;
          
          return (
            <>
              {/* 算法说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  单调队列
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  使用双端队列维护一个单调递减的队列，队首元素始终是当前窗口的最大值。
                  时间复杂度 O(n)，每个元素最多进出队列一次。
                </p>
              </div>

              {/* 原数组 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">原数组 (窗口大小 k={currentK})</h4>
                <div className="flex gap-2 justify-center flex-wrap">
                  {currentNums.map((num, idx) => {
                    const isInWindow = window && window.length > 0 && 
                      currentIndex !== undefined &&
                      idx >= currentIndex - currentK + 1 && 
                      idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`w-14 h-14 flex flex-col items-center justify-center border-2 rounded-lg transition-all ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-100 scale-110 shadow-lg'
                            : isInWindow
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-xs text-gray-400">{idx}</div>
                        <div className={`font-bold ${isCurrent ? 'text-blue-700' : 'text-gray-800'}`}>{num}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 单调队列 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">单调队列（存储索引）</h4>
                <div className="flex gap-2 justify-center flex-wrap min-h-[60px] items-center">
                  {deque.length > 0 ? (
                    deque.map((idx, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-14 flex flex-col items-center justify-center border-2 border-purple-500 bg-purple-100 rounded-lg"
                      >
                        <div className="text-xs text-purple-600 font-medium">idx: {idx}</div>
                        <div className="font-bold text-purple-800">{currentNums[idx]}</div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 py-4">空队列</div>
                  )}
                </div>
              </div>

              {/* 当前窗口 */}
              {window && window.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前窗口</h4>
                  <div className="flex gap-2 justify-center">
                    {window.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg ${
                          maxValue !== undefined && num === maxValue
                            ? 'border-red-500 bg-red-100 shadow-md'
                            : 'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className={`font-bold ${num === maxValue ? 'text-red-700' : 'text-green-700'}`}>
                          {num}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {maxValue !== undefined && (
                    <p className="text-center text-sm mt-3 text-red-600 font-semibold">
                      窗口最大值: {maxValue}
                    </p>
                  )}
                </div>
              )}

              {/* 结果数组 */}
              {result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">结果数组</h4>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {result.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-14 h-14 flex items-center justify-center border-2 border-orange-500 bg-orange-100 rounded-lg"
                      >
                        <div className="font-bold text-orange-700">{num}</div>
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
