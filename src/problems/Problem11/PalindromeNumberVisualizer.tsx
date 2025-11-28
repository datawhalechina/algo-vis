import { generatePalindromeNumberSteps } from "./algorithm";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { Hash } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface PalindromeNumberInput extends ProblemInput {
  x: number;
}

interface PalindromeNumberData {
  x?: number;
}

function PalindromeNumberVisualizer() {
  return (
    <ConfigurableVisualizer<PalindromeNumberInput, PalindromeNumberData>
      config={{
        defaultInput: { x: 12321 },
        algorithm: (input) => generatePalindromeNumberSteps(input.x),
        
        inputTypes: [{ type: "number", key: "x", label: "输入数字" }],
        inputFields: [{ type: "number", key: "x", label: "数字 x", placeholder: "输入一个整数，如: 12321" }],
        testCases: [
          { label: "示例 1", value: { x: 12321 } },
          { label: "示例 2", value: { x: -121 } },
          { label: "示例 3", value: { x: 10 } },
          { label: "示例 4", value: { x: 12345 } },
        ],
        
        customStepVariables: (variables) => {
          const temp = variables?.temp as number | undefined;
          const reversed = variables?.reversed as number | undefined;
          const digit = variables?.digit as number | undefined;
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {temp !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">剩余部分</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{temp}</span>
                </div>
              )}
              {reversed !== undefined && (
                <div>
                  <span className="font-mono text-purple-600 font-semibold">反转部分</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{reversed}</span>
                </div>
              )}
              {digit !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">当前数字</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{digit}</span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ getNumberVariable, getBooleanVariable, getArrayVariable }) => {
          const original = getNumberVariable('original');
          const digits = getArrayVariable('digits') as number[] | undefined;
          const reversed = getNumberVariable('reversed');
          const temp = getNumberVariable('temp');
          const isPalindrome = getBooleanVariable('isPalindrome');
          const finished = getBooleanVariable('finished');

          const coreIdea = getProblemCoreIdea(11);

          return (
            <>
              {/* 数字展示 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">回文数判断</h3>
                </div>
                
                {coreIdea && <CoreIdeaBox {...coreIdea} />}
                
                {digits && digits.length > 0 ? (
                  <div className="flex justify-center items-center gap-2 mb-6">
                    {digits.map((digit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                      >
                        {digit}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-6xl font-bold text-gray-800 mb-6">
                    {original}
                  </div>
                )}

                {/* 比较部分 */}
                {!finished && temp !== undefined && reversed !== undefined && (
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300"
                    >
                      <div className="text-sm text-blue-600 font-semibold mb-2">剩余部分</div>
                      <div className="text-4xl font-bold text-blue-700">{temp}</div>
                    </motion.div>
                    
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1, delay: 0.25 }}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300"
                    >
                      <div className="text-sm text-purple-600 font-semibold mb-2">反转部分</div>
                      <div className="text-4xl font-bold text-purple-700">{reversed}</div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* 最终结果 */}
              {finished && isPalindrome !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`rounded-2xl p-8 shadow-2xl ${
                    isPalindrome
                      ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400'
                      : 'bg-gradient-to-r from-red-400 via-pink-400 to-rose-400'
                  }`}
                >
                  <div className="text-center text-white">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="flex justify-center mb-4"
                    >
                      {isPalindrome ? (
                        <CheckCircle size={64} strokeWidth={2.5} />
                      ) : (
                        <XCircle size={64} strokeWidth={2.5} />
                      )}
                    </motion.div>
                    <div className="text-3xl font-bold mb-4">
                      {isPalindrome ? `${original} 是回文数！` : `${original} 不是回文数`}
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg opacity-90"
                    >
                      {isPalindrome ? '从左往右和从右往左读都一样' : '从左往右和从右往左读不一样'}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default PalindromeNumberVisualizer;
