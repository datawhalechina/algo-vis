import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateContainsDuplicateIISteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ContainsDuplicateIIInput extends ProblemInput {
  nums: number[];
  k: number;
}

function ContainsDuplicateIIVisualizer() {

  return (
    <ConfigurableVisualizer<ContainsDuplicateIIInput, { nums?: number[]; k?: number }>
      config={{
        defaultInput: { nums: [1, 2, 3, 1], k: 3 },
        algorithm: (input) => generateContainsDuplicateIISteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,2,3,1" },
          { type: "number", key: "k", label: "距离 k", placeholder: "请输入距离 k" },
        ],
        testCases: [
          { label: "示例 1 (符合)", value: { nums: [1, 2, 3, 1], k: 3 } },
          { label: "示例 2 (符合)", value: { nums: [1, 0, 1, 1], k: 1 } },
          { label: "示例 3 (不符合)", value: { nums: [1, 2, 3, 1, 2, 3], k: 2 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['map', 'finished'].includes(key))
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
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as ContainsDuplicateIIInput;
          const i = variables?.i as number | undefined;
          const currentValue = variables?.currentValue as number | undefined;
          const prevIndex = variables?.prevIndex as number | undefined;
          const distance = variables?.distance as number | undefined;
          const map = variables?.map as Record<number, number> | undefined;
          const coreIdea = getProblemCoreIdea(28);
          const hasDuplicate = variables?.hasDuplicate as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">数组可视化 - 距离限制 k = {input.k}</h3>

                {/* 距离检查提示 */}
                {distance !== undefined && prevIndex !== undefined && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    hasDuplicate 
                      ? "bg-green-50 border-green-300" 
                      : "bg-red-50 border-red-300"
                  }`}>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">距离检查：</span>
                      <span className="font-mono font-bold">
                        |{i} - {prevIndex}| = {distance}
                      </span>
                      <span className={`font-bold ${
                        hasDuplicate ? "text-green-600" : "text-red-600"
                      }`}>
                        {distance} {distance! <= input.k ? "≤" : ">"} {input.k} (k)
                        {distance! <= input.k ? " ✓ 符合条件" : " ✗ 不符合"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100 flex-wrap">
                  {input.nums.map((value: number, index: number) => {
                    const isCurrent = i === index;
                    const isPrevious = prevIndex === index;
                    const isPassed = i !== undefined && i > index;
                    const inWindow = prevIndex !== undefined && i !== undefined && 
                                     index >= prevIndex && index <= i;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isCurrent || isPrevious ? 1.05 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {(isCurrent || isPrevious) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isCurrent 
                                ? "bg-blue-500 text-white" 
                                : "bg-purple-500 text-white"
                            }`}
                          >
                            {isCurrent ? "当前" : "上次"}
                          </motion.div>
                        )}

                        <motion.div
                          className={`text-sm font-bold ${
                            hasDuplicate && (isCurrent || isPrevious)
                              ? "text-green-600"
                              : isCurrent
                              ? "text-blue-600"
                              : isPrevious
                              ? "text-purple-600"
                              : inWindow
                              ? "text-orange-500"
                              : isPassed
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                          animate={{
                            scale: isCurrent || isPrevious ? 1.2 : 1,
                          }}
                        >
                          {value}
                        </motion.div>

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            hasDuplicate && (isCurrent || isPrevious)
                              ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200"
                              : isCurrent
                              ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200"
                              : isPrevious
                              ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200"
                              : inWindow
                              ? "bg-gradient-to-t from-orange-400 to-orange-300 shadow-md shadow-orange-200"
                              : isPassed
                              ? "bg-gradient-to-t from-gray-300 to-gray-200"
                              : "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 8)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isCurrent || isPrevious ? "text-blue-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                    <span className="text-gray-700">当前索引</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
                    <span className="text-gray-700">上次索引</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-orange-400 to-orange-300 rounded"></div>
                    <span className="text-gray-700">距离窗口</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
                    <span className="text-gray-700">符合条件</span>
                  </div>
                </div>

                {/* 结果显示 */}
                {finished && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg text-white text-xl font-bold ${
                      hasDuplicate ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {hasDuplicate ? (
                        <>
                          <CheckCircle size={28} />
                          找到距离 ≤ k 的重复元素！
                        </>
                      ) : (
                        <>
                          <XCircle size={28} />
                          没有符合条件的重复元素
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 哈希表可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">哈希表（数值 → 最后索引）</h3>
                
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200 min-h-[120px]">
                  {!map || Object.keys(map).length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <p>哈希表为空，开始遍历...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {Object.entries(map).map(([key, value], idx) => {
                          const numKey = parseInt(key);
                          const isHighlight = currentValue === numKey;
                          
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: 1, 
                                scale: isHighlight ? 1.05 : 1 
                              }}
                              transition={{ delay: idx * 0.05 }}
                              className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all ${
                                isHighlight
                                  ? "border-purple-500 shadow-lg shadow-purple-200"
                                  : "border-indigo-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-xs text-gray-600 mb-1">数值</div>
                                  <div className={`text-2xl font-bold ${
                                    isHighlight ? "text-purple-600" : "text-indigo-500"
                                  }`}>
                                    {key}
                                  </div>
                                </div>
                                <div className="text-gray-400 text-2xl mx-2">→</div>
                                <div className="flex-1 text-right">
                                  <div className="text-xs text-gray-600 mb-1">索引</div>
                                  <div className={`text-2xl font-bold ${
                                    isHighlight ? "text-purple-600" : "text-gray-700"
                                  }`}>
                                    [{value}]
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {map && Object.keys(map).length > 0 && (
                    <div className="text-sm text-gray-600 text-center mt-4 pt-4 border-t border-indigo-200">
                      <span className="font-semibold">哈希表大小：</span>
                      <span className="ml-2 font-mono text-indigo-600 font-bold">{Object.keys(map).length}</span>
                    </div>
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

export default ContainsDuplicateIIVisualizer;
