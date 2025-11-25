import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generatePowerOfThreeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PowerOfThreeInput extends ProblemInput {
  n: number;
}

function PowerOfThreeVisualizer() {

  return (
    <ConfigurableVisualizer<PowerOfThreeInput, { n?: number }>
      config={{
        defaultInput: { n: 27 },
        algorithm: (input) => generatePowerOfThreeSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { type: "number", key: "n", label: "数字 n", placeholder: "请输入一个整数" },
        ],
        testCases: [
          { label: "示例 1 (3的幂)", value: { n: 27 } },
          { label: "示例 2 (不是)", value: { n: 0 } },
          { label: "示例 3 (不是)", value: { n: 45 } },
          { label: "示例 4 (3的幂)", value: { n: 243 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['divisions', 'finished'].includes(key))
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
          const input = visualization.input as PowerOfThreeInput;
          const current = variables?.current as number | undefined;
          const isPowerOfThree = variables?.isPowerOfThree as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const divisions = variables?.divisions as { value: number; divisible: boolean }[] | undefined;
          
          return (
            <>
              {/* 主显示区域 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">3的幂判断</h3>
                
                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-green-700">核心思想：</span>
                    不断将 n 除以 3，如果最终结果为 1，则 n 是 3 的幂；
                    如果在过程中不能被 3 整除，则不是 3 的幂。时间复杂度 O(log n)。
                  </p>
                </div>

                {/* 当前值显示 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {current !== undefined ? "当前值" : "输入值"}
                    </div>
                    <motion.div
                      key={current ?? input.n}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl font-bold text-indigo-600 mb-4"
                    >
                      {current ?? input.n}
                    </motion.div>
                    
                    {finished && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-lg font-bold ${
                          isPowerOfThree ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isPowerOfThree ? (
                          <>
                            <CheckCircle size={24} />
                            是3的幂！
                          </>
                        ) : (
                          <>
                            <XCircle size={24} />
                            不是3的幂
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 除法过程 */}
                {divisions && divisions.length > 0 && (
                  <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">除法过程</h4>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {divisions.map((div, idx) => {
                          const nextValue = Math.floor(div.value / 3);
                          
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`p-4 rounded-lg border-2 ${
                                div.divisible 
                                  ? "bg-green-50 border-green-300" 
                                  : "bg-red-50 border-red-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className={`text-2xl font-bold ${
                                    div.divisible ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {div.value}
                                  </span>
                                  <span className="text-gray-500">÷ 3 =</span>
                                  {div.divisible && (
                                    <span className="text-2xl font-bold text-green-600">
                                      {nextValue}
                                    </span>
                                  )}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  div.divisible 
                                    ? "bg-green-500 text-white" 
                                    : "bg-red-500 text-white"
                                }`}>
                                  {div.divisible ? "✓ 整除" : "✗ 不能整除"}
                                </div>
                              </div>
                              {div.divisible && (
                                <div className="mt-2 text-sm text-gray-600">
                                  {div.value} = 3 × {nextValue}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* 3的幂参考 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">3的幂参考表</h3>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((exp) => {
                      const power = Math.pow(3, exp);
                      const isMatch = input.n === power;
                      
                      return (
                        <motion.div
                          key={exp}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            scale: isMatch ? 1.1 : 1 
                          }}
                          transition={{ delay: exp * 0.03 }}
                          className={`p-3 rounded-lg text-center border-2 transition-all ${
                            isMatch
                              ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg"
                              : "bg-white border-purple-200"
                          }`}
                        >
                          <div className={`text-xs mb-1 ${
                            isMatch ? "text-purple-100" : "text-gray-600"
                          }`}>
                            3<sup>{exp}</sup>
                          </div>
                          <div className={`text-lg font-bold ${
                            isMatch ? "text-white" : "text-purple-600"
                          }`}>
                            {power.toLocaleString()}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center mt-4 pt-4 border-t border-purple-200">
                    在 32 位有符号整数范围内，最大的 3 的幂是 3<sup>19</sup> = 1,162,261,467
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

export default PowerOfThreeVisualizer;
