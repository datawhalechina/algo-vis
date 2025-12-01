import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateTwoSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface TwoSumInput extends ProblemInput {
  nums: number[];
  target: number;
}

interface TwoSumData {
  nums?: number[];
  target?: number;
}

function TwoSumVisualizer() {

  return (
    <ConfigurableVisualizer<TwoSumInput, TwoSumData>
      config={{
        defaultInput: { nums: [2, 7, 11, 15], target: 9 },
        algorithm: (input) => generateTwoSumSteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "target", arrayLabel: "nums", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 2,7,11,15" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [2, 7, 11, 15], target: 9 } },
          { label: "示例 2", value: { nums: [3, 2, 4], target: 6 } },
          { label: "示例 3", value: { nums: [3, 3], target: 6 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => key !== 'map')
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600 font-semibold">{key}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="font-mono text-gray-800 font-semibold">
                        {JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const getCurrentHashMap = () => {
            const map = new Map<number, number>();
            if (variables?.map) {
              const mapData = variables.map as Record<number, number>;
              Object.entries(mapData).forEach(([key, value]) => {
                map.set(parseInt(key), value as number);
              });
            }
            return map;
          };

          const currentHashMap = getCurrentHashMap();
          const currentIndex = getNumberVariable('i');
          const complement = getNumberVariable('complement');
          const result = variables?.result as [number, number] | undefined;
          const input = visualization.input as TwoSumInput;
          const coreIdea = getProblemCoreIdea(1);
          
          return (
            <>
        {coreIdea && <CoreIdeaBox {...coreIdea} />}

        {/* 数组可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化 - 哈希表解法</h3>
          
          {/* 当前操作提示 */}
          {complement !== undefined && (
            <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="font-semibold text-gray-700">当前操作：</span>
                <span className="font-mono text-blue-700 font-bold">
                  target({input.target}) - nums[{currentIndex}]({input.nums[currentIndex!]}) = {complement}
                </span>
                <span className="text-gray-600">
                  {currentHashMap.has(complement) 
                    ? `✓ 在Hash表中找到 ${complement}！` 
                    : `✗ Hash表中没有 ${complement}，继续遍历`
                  }
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
            {input.nums.map((value: number, index: number) => {
              const isCurrentIndex = currentIndex === index;
              const isResultIndex = result && (result[0] === index || result[1] === index);
              const isInHashMap = Array.from(currentHashMap.values()).includes(index);
              const isComplement = currentHashMap.get(complement!) === index;

              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isCurrentIndex || isResultIndex || isComplement ? 1.05 : 1
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* 标签 */}
                  {(isCurrentIndex || isComplement) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isComplement ? "bg-purple-500 text-white" : "bg-yellow-500 text-white"
                      }`}
                    >
                      {isComplement ? "补数" : "当前"}
                    </motion.div>
                  )}

                  {/* 值显示 */}
                  <motion.div
                    className={`text-sm font-bold ${
                      isResultIndex
                        ? "text-green-600"
                        : isComplement
                        ? "text-purple-600"
                        : isCurrentIndex
                        ? "text-yellow-600"
                        : isInHashMap
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                    animate={{
                      scale: isCurrentIndex || isResultIndex || isComplement ? 1.2 : 1,
                    }}
                  >
                    {value}
                  </motion.div>

                  {/* 柱状图 */}
                  <motion.div
                    className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                      isResultIndex
                        ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200"
                        : isComplement
                        ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200"
                        : isCurrentIndex
                        ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200"
                        : isInHashMap
                        ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-md shadow-blue-200"
                        : "bg-gradient-to-t from-gray-400 to-gray-300"
                    }`}
                    style={{ height: `${Math.max(60, Math.abs(value) * 4)}px` }}
                    animate={{
                      scale: isCurrentIndex || isResultIndex || isComplement ? 1.05 : 1,
                    }}
                  >
                    <span className="text-white text-sm font-bold">{value}</span>
                  </motion.div>

                  {/* 索引 */}
                  <div className={`text-xs font-semibold ${
                    isResultIndex
                      ? "text-green-600"
                      : isComplement
                      ? "text-purple-600"
                      : isCurrentIndex
                      ? "text-yellow-600"
                      : isInHashMap
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}>
                    [{index}]
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
              <span className="text-gray-700">当前遍历</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
              <span className="text-gray-700">找到补数</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
              <span className="text-gray-700">已存入Hash表</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
              <span className="text-gray-700">找到答案</span>
            </div>
          </div>
        </div>

        {/* Hash表可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="text-primary-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Hash表状态（Map 存储）</h3>
          </div>
          
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 min-h-[140px]">
            {currentHashMap.size === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-500">
                <div className="text-center">
                  <Hash className="mx-auto mb-2 text-gray-400" size={32} />
                  <p>Hash表为空，开始遍历...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {Array.from(currentHashMap.entries()).map(([key, value], idx) => {
                      const isComplement = complement === key;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                          animate={{ 
                            opacity: 1, 
                            scale: isComplement ? 1.05 : 1, 
                            rotateY: 0 
                          }}
                          exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                            isComplement 
                              ? "border-2 border-purple-500 shadow-lg shadow-purple-200" 
                              : "border-2 border-purple-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 mb-1">Key (数值)</div>
                              <div className={`text-2xl font-bold ${
                                isComplement ? "text-purple-600" : "text-purple-500"
                              }`}>
                                {key}
                              </div>
                            </div>
                            <div className="text-gray-400 text-2xl mx-2">→</div>
                            <div className="flex-1 text-right">
                              <div className="text-xs text-gray-600 mb-1">Value (索引)</div>
                              <div className={`text-2xl font-bold ${
                                isComplement ? "text-purple-600" : "text-gray-700"
                              }`}>
                                [{value}]
                              </div>
                            </div>
                          </div>
                          {isComplement && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 text-xs text-center text-purple-600 font-bold bg-purple-100 py-1 rounded"
                            >
                              ✓ 这是补数！
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                
                {/* Hash表大小 */}
                <div className="text-sm text-gray-600 text-center pt-2 border-t border-purple-200">
                  <span className="font-semibold">Hash表大小：</span>
                  <span className="ml-2 font-mono text-purple-600 font-bold">{currentHashMap.size}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 补数计算说明 */}
          <div className="mt-3 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="font-semibold text-amber-800">补数计算：</span>
            {complement !== undefined ? (
              <span className="ml-2 font-mono text-amber-700 font-semibold">
                complement = {input.target} - {input.nums[currentIndex!]} = {complement}
                {currentHashMap.has(complement) 
                  ? ` ✓ 存在于Hash表` 
                  : ` ✗ 不存在，将 ${input.nums[currentIndex!]} 存入Hash表`
                }
              </span>
            ) : (
              <span className="ml-2 text-gray-500">等待开始遍历...</span>
            )}
          </div>
        </div>
            </>
          );
        },
      }}
    />
  );
}

export default TwoSumVisualizer;
