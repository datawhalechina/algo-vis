import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateLongestValidParenthesesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LongestValidParenthesesInput extends ProblemInput {
  s: string;
}

function LongestValidParenthesesVisualizer() {
  return (
    <ConfigurableVisualizer<LongestValidParenthesesInput, { s?: string }>
      config={{
        defaultInput: { s: "(()" },
        algorithm: (input) => generateLongestValidParenthesesSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入括号字符串，如: (()" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "(()" } },
          { label: "示例 2", value: { s: ")()())" } },
          { label: "示例 3", value: { s: "" } },
          { label: "示例 4", value: { s: "()(())" } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['s', 'stack', 'finished', 'validStart'].includes(key))
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
          const input = visualization.input as LongestValidParenthesesInput;
          const s = input.s;
          const i = variables?.i as number | undefined;
          const char = variables?.char as string | undefined;
          const stack = variables?.stack as number[] | undefined;
          const maxLen = variables?.maxLen as number | undefined;
          const len = variables?.len as number | undefined;
          const validStart = variables?.validStart as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          if (!s) return null;
          
          return (
            <>
              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">最长有效括号可视化</h3>
                
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-blue-700">核心思想：</span>
                    使用栈存储索引。遇到 '(' 压栈，遇到 ')' 弹栈。
                    栈为空时说明右括号多余，将其索引压栈作为新基准。
                    否则，当前索引减去栈顶索引即为有效长度。
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 min-h-[120px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100 overflow-x-auto">
                  {s.split('').map((ch, index) => {
                    const isCurrent = i === index;
                    const isInValid = validStart !== undefined && len !== undefined && index >= validStart && index < validStart + len;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isCurrent ? 1.2 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500 text-white"
                          >
                            当前
                          </motion.div>
                        )}

                        <motion.div
                          className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                            isCurrent ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-200" :
                            isInValid ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md shadow-green-200" :
                            ch === '(' ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white" :
                            "bg-gradient-to-br from-purple-400 to-purple-500 text-white"
                          }`}
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                        >
                          {ch}
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isCurrent ? "text-yellow-600" : isInValid ? "text-green-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 当前状态 */}
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-sm text-gray-600 mb-2">当前字符</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {char !== undefined ? char : '-'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">最大长度</div>
                    <div className="text-3xl font-bold text-green-600">
                      {maxLen ?? 0}
                    </div>
                  </div>
                </div>

                {finished && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold">
                      ✓ 完成！最长有效括号长度为 {maxLen}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 栈状态可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">栈状态（索引）</h3>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 min-h-[180px]">
                  {!stack || stack.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      栈为空
                    </div>
                  ) : (
                    <div className="flex flex-col-reverse gap-2">
                      {stack.map((val, idx) => (
                        <motion.div
                          key={`${idx}-${val}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`bg-white rounded-lg p-4 shadow-sm border-2 ${
                            idx === stack.length - 1 ? "border-purple-500" : "border-purple-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {idx === stack.length - 1 ? "栈顶 →" : `第 ${idx} 层 →`}
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {val === -1 ? "基准(-1)" : val}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">图例说明</h3>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded flex items-center justify-center text-white font-bold">(</div>
                    <span className="text-gray-700">左括号</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded flex items-center justify-center text-white font-bold">)</div>
                    <span className="text-gray-700">右括号</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded"></div>
                    <span className="text-gray-700">当前处理</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                    <span className="text-gray-700">有效括号序列</span>
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

export default LongestValidParenthesesVisualizer;
