import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateSingleNumberSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SingleNumberInput extends ProblemInput {
  nums: number[];
}

function SingleNumberVisualizer() {

  return (
    <ConfigurableVisualizer<SingleNumberInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [4, 1, 2, 1, 2] },
        algorithm: (input) => generateSingleNumberSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 4,1,2,1,2" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [4, 1, 2, 1, 2] } },
          { label: "示例 2", value: { nums: [2, 2, 1] } },
          { label: "示例 3", value: { nums: [1] } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => key !== 'binary' && key !== 'finished')
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
          const currentIndex = getNumberVariable('i');
          const result = getNumberVariable('result');
          const input = visualization.input as SingleNumberInput;
          const binary = variables?.binary as { prev: string; current: string; result: string } | undefined;
          
          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">数组可视化 - 异或运算解法</h3>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    异或运算有三个重要性质：1) a ^ a = 0  2) a ^ 0 = a  3) 满足交换律和结合律。
                    因此，将所有数字异或在一起，出现两次的数字会相互抵消为0，最后剩下的就是只出现一次的数字。
                  </p>
                </div>
                
                <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {input.nums.map((value: number, index: number) => {
                    const isCurrentIndex = currentIndex === index;
                    const isPassed = currentIndex !== undefined && currentIndex > index;
                    const count = input.nums.filter(n => n === value).length;
                    const isDuplicate = count > 1;
                    const isSingle = count === 1;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isCurrentIndex ? 1.05 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
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

                        <motion.div
                          className={`text-sm font-bold ${
                            isCurrentIndex
                              ? "text-yellow-600"
                              : isSingle
                              ? "text-green-600"
                              : isDuplicate
                              ? "text-purple-600"
                              : "text-gray-600"
                          }`}
                          animate={{
                            scale: isCurrentIndex ? 1.2 : 1,
                          }}
                        >
                          {value}
                        </motion.div>

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            isCurrentIndex
                              ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200"
                              : isPassed
                              ? "bg-gradient-to-t from-gray-400 to-gray-300"
                              : isSingle
                              ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md shadow-green-200"
                              : isDuplicate
                              ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-md shadow-purple-200"
                              : "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 8)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isCurrentIndex ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
                    <span className="text-gray-700">当前遍历</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
                    <span className="text-gray-700">只出现一次</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
                    <span className="text-gray-700">出现多次</span>
                  </div>
                </div>
              </div>

              {/* 异或运算可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">异或运算过程</h3>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-2">当前结果</div>
                    <div className="text-4xl font-bold text-indigo-600">{result ?? 0}</div>
                  </div>
                  
                  {binary && (
                    <div className="space-y-3 mt-6">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">上一次结果（二进制）</div>
                        <div className="font-mono text-lg text-gray-800">{binary.prev}</div>
                      </div>
                      <div className="text-center text-2xl font-bold text-blue-600">XOR (^)</div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">当前值（二进制）</div>
                        <div className="font-mono text-lg text-gray-800">{binary.current}</div>
                      </div>
                      <div className="text-center text-2xl font-bold text-blue-600">=</div>
                      <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-lg border-2 border-indigo-400">
                        <div className="text-xs text-indigo-700 mb-1 font-semibold">新结果（二进制）</div>
                        <div className="font-mono text-lg text-indigo-800 font-bold">{binary.result}</div>
                      </div>
                    </div>
                  )}
                  
                  {!binary && (
                    <div className="text-center text-gray-500 py-8">
                      等待开始异或运算...
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

export default SingleNumberVisualizer;
