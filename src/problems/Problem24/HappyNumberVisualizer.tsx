import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateHappyNumberSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface HappyNumberInput extends ProblemInput {
  n: number;
}

function HappyNumberVisualizer() {

  return (
    <ConfigurableVisualizer<HappyNumberInput, { n?: number }>
      config={{
        defaultInput: { n: 19 },
        algorithm: (input) => generateHappyNumberSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { type: "number", key: "n", label: "数字 n", placeholder: "请输入一个正整数" },
        ],
        testCases: [
          { label: "示例 1 (快乐数)", value: { n: 19 } },
          { label: "示例 2 (非快乐数)", value: { n: 2 } },
          { label: "示例 3", value: { n: 7 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['digits', 'seen', 'finished', 'calculation'].includes(key))
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
          const input = visualization.input as HappyNumberInput;
          const current = variables?.current as number | undefined;
          const digits = variables?.digits as number[] | undefined;
          const calculation = variables?.calculation as string | undefined;
          const next = variables?.next as number | undefined;
          const seen = variables?.seen as number[] | undefined;
          const isHappy = variables?.isHappy as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          return (
            <>
              {/* 当前状态 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">快乐数判断</h3>
                
                <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-amber-700">核心思想：</span>
                    反复计算各位数字的平方和。如果最终得到 1，则是快乐数；如果进入循环，则不是快乐数。
                    使用哈希集合记录已出现的数字来检测循环。
                  </p>
                </div>

                {/* 当前数字显示 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">当前数字</div>
                    <motion.div
                      key={current}
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
                          isHappy ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isHappy ? (
                          <>
                            <Smile size={24} />
                            是快乐数！
                          </>
                        ) : (
                          <>
                            <Frown size={24} />
                            不是快乐数
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 数字分解和计算 */}
                {digits && calculation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-6 border-2 border-purple-200 mb-6"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">计算过程</h4>
                    
                    {/* 数字分解 */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {digits.map((digit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                        >
                          {digit}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* 计算公式 */}
                    <div className="text-center">
                      <div className="text-lg font-mono text-gray-700 mb-2">
                        {calculation}
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        = {next}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 已访问的数字集合 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">已访问的数字（检测循环）</h3>
                
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 min-h-[120px]">
                  {!seen || seen.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <p>集合为空，开始计算...</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <AnimatePresence>
                        {seen.map((num, idx) => (
                          <motion.div
                            key={num}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`px-6 py-3 rounded-lg font-bold text-xl shadow-md ${
                              num === current 
                                ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white scale-110"
                                : "bg-white border-2 border-cyan-300 text-cyan-700"
                            }`}
                          >
                            {num}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {seen && seen.length > 0 && (
                    <div className="text-sm text-gray-600 text-center mt-4 pt-4 border-t border-cyan-200">
                      <span className="font-semibold">集合大小：</span>
                      <span className="ml-2 font-mono text-cyan-600 font-bold">{seen.length}</span>
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

export default HappyNumberVisualizer;
