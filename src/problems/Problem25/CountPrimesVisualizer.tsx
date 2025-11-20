import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateCountPrimesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface CountPrimesInput extends ProblemInput {
  n: number;
}

function CountPrimesVisualizer() {

  return (
    <ConfigurableVisualizer<CountPrimesInput, { n?: number }>
      config={{
        defaultInput: { n: 20 },
        algorithm: (input) => generateCountPrimesSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { type: "number", key: "n", label: "数字 n", placeholder: "请输入一个正整数" },
        ],
        testCases: [
          { label: "示例 1", value: { n: 10 } },
          { label: "示例 2", value: { n: 20 } },
          { label: "示例 3", value: { n: 30 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['finished', 'isPrimeNum'].includes(key))
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
          const input = visualization.input as CountPrimesInput;
          const count = variables?.count as number | undefined;
          const currentNumber = variables?.currentNumber as number | undefined;
          const markedNumber = variables?.markedNumber as number | undefined;
          const isPrimeNum = variables?.isPrimeNum as boolean | undefined;
          const stepData = visualization.currentStepData?.data as { isPrime?: boolean[] } | undefined;
          const isPrimeArray = stepData?.isPrime;
          
          // 限制显示数量
          const maxDisplay = 100;
          const shouldLimit = input.n > maxDisplay;
          const displayN = shouldLimit ? maxDisplay : input.n;
          
          return (
            <>
              {/* 标题和说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">埃拉托斯特尼筛法（Sieve of Eratosthenes）</h3>
                
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-purple-700">核心思想：</span>
                    从 2 开始，将每个质数的倍数标记为合数。遍历完成后，未被标记的数即为质数。
                    时间复杂度 O(n log log n)，空间复杂度 O(n)。
                  </p>
                </div>

                {shouldLimit && (
                  <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      数字较大，仅显示前 {maxDisplay} 个数字的可视化
                    </p>
                  </div>
                )}

                {/* 质数计数 */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">质数个数</div>
                    <motion.div
                      key={count}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold text-indigo-600"
                    >
                      {count ?? 0}
                    </motion.div>
                    <div className="text-sm text-gray-500 mt-2">
                      (小于 {input.n} 的质数)
                    </div>
                  </div>
                </div>

                {/* 数字网格 */}
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: displayN }, (_, i) => {
                    const isPrime = isPrimeArray?.[i] ?? true;
                    const isCurrent = currentNumber === i;
                    const isMarked = markedNumber === i;
                    
                    let bgClass = "bg-gray-100 text-gray-400";
                    if (i === 0 || i === 1) {
                      bgClass = "bg-gray-200 text-gray-500";
                    } else if (isMarked) {
                      bgClass = "bg-red-400 text-white";
                    } else if (isCurrent && isPrimeNum) {
                      bgClass = "bg-green-500 text-white shadow-lg";
                    } else if (isCurrent && !isPrimeNum) {
                      bgClass = "bg-gray-400 text-white";
                    } else if (isPrime && currentNumber !== undefined && i <= currentNumber) {
                      bgClass = "bg-green-400 text-white";
                    } else if (!isPrime && currentNumber !== undefined && i <= currentNumber) {
                      bgClass = "bg-red-300 text-white";
                    }

                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: isCurrent || isMarked ? 1.1 : 1, 
                          opacity: 1 
                        }}
                        transition={{ delay: i * 0.01 }}
                        className={`h-12 rounded-lg flex items-center justify-center font-bold text-sm ${bgClass} transition-all`}
                      >
                        {i}
                      </motion.div>
                    );
                  })}
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-gray-700">质数</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-300 rounded"></div>
                    <span className="text-gray-700">合数</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">当前质数</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span className="text-gray-700">正在标记</span>
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

export default CountPrimesVisualizer;
