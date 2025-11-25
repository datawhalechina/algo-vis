import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateSubarraySumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SubarraySumInput extends ProblemInput {
  nums: number[];
  k: number;
}

interface SubarraySumData {
  nums?: number[];
  k?: number;
}

function SubarraySumVisualizer() {
  return (
    <ConfigurableVisualizer<SubarraySumInput, SubarraySumData>
      config={{
        defaultInput: { nums: [1, 1, 1], k: 2 },
        algorithm: (input) => generateSubarraySumSteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,1,1" },
          { type: "number", key: "k", label: "目标值 k", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 1, 1], k: 2 } },
          { label: "示例 2", value: { nums: [1, 2, 3], k: 3 } },
          { label: "示例 3", value: { nums: [1, -1, 1, 1, 1], k: 2 } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const getCurrentHashMap = () => {
            const map = new Map<number, number>();
            if (variables?.map && typeof variables.map === 'object' && !Array.isArray(variables.map)) {
              const mapData = variables.map as Record<number, number>;
              Object.entries(mapData).forEach(([key, value]) => {
                map.set(parseInt(key), value as number);
              });
            }
            return map;
          };

          const currentHashMap = getCurrentHashMap();
          const input = visualization.input as SubarraySumInput;
          const currentIndex = getNumberVariable('i');
          const preSum = getNumberVariable('preSum');
          const count = getNumberVariable('count');
          const target = getNumberVariable('target');
          const foundSubarrays = getNumberVariable('foundSubarrays');
          
          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化</h3>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    使用前缀和+哈希表。如果 preSum[j] - preSum[i-1] = k，
                    则说明子数组[i...j]的和为k。转换为查找 preSum - k 是否存在。
                  </p>
                </div>
                
                {target !== undefined && (
                  <div className={`mb-4 p-3 rounded-lg border-2 ${
                    foundSubarrays 
                      ? "bg-green-50 border-green-500" 
                      : "bg-gray-50 border-gray-300"
                  }`}>
                    <div className="text-center font-mono text-sm">
                      <span className="font-semibold">查找：</span>
                      <span className="ml-2 text-blue-700 font-bold">
                        preSum({preSum}) - k({input.k}) = {target}
                      </span>
                      {foundSubarrays ? (
                        <span className="ml-2 text-green-600">✓ 找到{foundSubarrays}个子数组！</span>
                      ) : (
                        <span className="ml-2 text-gray-600">✗ 不存在</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {input.nums.map((value: number, index: number) => {
                    const isCurrentIndex = currentIndex === index;
                    const isPassed = currentIndex !== undefined && index <= currentIndex;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        animate={{ 
                          scale: isCurrentIndex ? 1.05 : 1
                        }}
                      >
                        {isCurrentIndex && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500 text-white"
                          >
                            当前
                          </motion.div>
                        )}

                        <div className={`text-sm font-bold ${
                          isCurrentIndex ? "text-yellow-600" : 
                          isPassed ? "text-blue-600" : "text-gray-600"
                        }`}>
                          {value}
                        </div>

                        <motion.div
                          className={`w-16 rounded-lg flex items-end justify-center pb-2 ${
                            isCurrentIndex
                              ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg"
                              : isPassed
                              ? "bg-gradient-to-t from-blue-500 to-blue-400"
                              : "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 20 + 40)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isPassed ? "text-blue-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Hash表可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">前缀和Map（前缀和 → 出现次数）</h3>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 min-h-[140px]">
                  {currentHashMap.size === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <div className="text-center">
                        <Hash className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>初始化Map...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from(currentHashMap.entries())
                        .sort(([a], [b]) => a - b)
                        .map(([key, value]) => {
                          const isTarget = target === key;
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: 1, 
                                scale: isTarget ? 1.05 : 1
                              }}
                              className={`bg-white rounded-lg p-3 ${
                                isTarget 
                                  ? "border-2 border-green-500 shadow-lg" 
                                  : "border-2 border-purple-200"
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-xs text-gray-600">前缀和</div>
                                <div className={`text-xl font-bold ${
                                  isTarget ? "text-green-600" : "text-purple-600"
                                }`}>
                                  {key}
                                </div>
                                <div className="text-gray-400 my-1">→</div>
                                <div className="text-xs text-gray-600">次数</div>
                                <div className={`text-lg font-bold ${
                                  isTarget ? "text-green-600" : "text-gray-700"
                                }`}>
                                  {value}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">算法状态</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">当前前缀和</div>
                    <div className="text-3xl font-bold text-blue-600">{preSum !== undefined ? preSum : 0}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">找到子数组数量</div>
                    <div className="text-3xl font-bold text-green-600">{count !== undefined ? count : 0}</div>
                  </div>
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SubarraySumVisualizer;
