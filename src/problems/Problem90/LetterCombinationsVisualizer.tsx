import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateLetterCombinationsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LetterCombinationsInput extends ProblemInput {
  digits: string;
}

const digitMap: Record<string, string> = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz'
};

function LetterCombinationsVisualizer() {
  return (
    <ConfigurableVisualizer<LetterCombinationsInput, Record<string, any>>
      config={{
        defaultInput: { digits: "23" },
        algorithm: (input) => generateLetterCombinationsSteps(input.digits),
        
        inputTypes: [
          { type: "string", key: "digits", label: "digits" },
        ],
        inputFields: [
          { 
            type: "string", 
            key: "digits", 
            label: "电话号码", 
            placeholder: "例如: 23 或 234" 
          },
        ],
        testCases: [
          { label: "示例 1", value: { digits: "23" } },
          { label: "示例 2", value: { digits: "2" } },
          { label: "示例 3", value: { digits: "234" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as LetterCombinationsInput;
          const digits = input.digits;
          const path = variables?.path as string | undefined;
          const result = variables?.result as string[] | undefined;
          const digitIndex = variables?.digitIndex as number | undefined;
          const currentDigit = variables?.currentDigit as string | undefined;
          const currentLetters = variables?.currentLetters as string | undefined;
          const selectedLetter = variables?.selectedLetter as string | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">电话号码的字母组合</h3>
                </div>
                
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-blue-700">💡 核心思想：</span>
                    使用回溯法，逐个选择每个数字对应的字母，生成所有可能的组合。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">回溯</span>
                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">O(4^n)</span>
                  </div>
                </div>

                {/* 数字键盘映射 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">数字键盘映射</div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(digitMap).map(([digit, letters]) => {
                      const isActive = digit === currentDigit;
                      return (
                        <motion.div
                          key={digit}
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            borderColor: isActive ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
                          }}
                          className={`p-3 rounded-lg border-2 text-center ${
                            isActive
                              ? "bg-blue-100 shadow-lg"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="text-xl font-bold text-gray-800">{digit}</div>
                          <div className="text-sm text-gray-600 mt-1">{letters}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 输入的数字序列 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">输入数字</div>
                  <div className="flex gap-2 justify-center">
                    {digits.split('').map((digit, idx) => {
                      const isProcessing = digitIndex === idx;
                      const isPassed = digitIndex !== undefined && digitIndex > idx;
                      return (
                        <motion.div
                          key={idx}
                          animate={{
                            scale: isProcessing ? 1.2 : 1,
                            opacity: isPassed ? 0.5 : 1,
                          }}
                          className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl ${
                            isProcessing
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                              : isPassed
                              ? "bg-gray-300 text-gray-500"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {digit}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 当前字母选择 */}
                {currentLetters && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      数字 {currentDigit} 的可选字母
                    </div>
                    <div className="flex gap-2 justify-center">
                      {currentLetters.split('').map((letter, idx) => {
                        const isSelected = letter === selectedLetter;
                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              scale: isSelected ? 1.2 : 1,
                            }}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                              isSelected
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {letter}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 当前路径 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">当前组合</div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 min-h-[60px] flex items-center justify-center">
                    {path && path.length > 0 ? (
                      <div className="flex gap-1">
                        {path.split('').map((char, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-xl"
                          >
                            {char}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">空</div>
                    )}
                  </div>
                </div>

                {/* 已生成的组合 */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    已生成的组合 {result ? `(${result.length})` : '(0)'}
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 max-h-64 overflow-y-auto">
                    {result && result.length > 0 ? (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {result.map((combination, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg p-2 border border-green-300 text-center font-mono font-bold text-green-700"
                          >
                            {combination}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-gray-500">
                        暂无组合
                      </div>
                    )}
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

export default LetterCombinationsVisualizer;
