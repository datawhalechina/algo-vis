import { generateLongestCommonPrefixSteps } from "./algorithm";
import { motion } from "framer-motion";
import { Text } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface LongestCommonPrefixInput extends ProblemInput {
  strs: string[];
}

interface LongestCommonPrefixData {
  strs?: string[];
}

function LongestCommonPrefixVisualizer() {
  return (
    <ConfigurableVisualizer<LongestCommonPrefixInput, LongestCommonPrefixData>
      config={{
        defaultInput: { strs: ["flower", "flow", "flight"] },
        algorithm: (input) => generateLongestCommonPrefixSteps(input.strs),
        
        inputTypes: [{ type: "array", key: "strs", label: "字符串数组" }],
        inputFields: [
          { type: "array", key: "strs", label: "字符串数组 strs (用逗号分隔)", placeholder: "输入字符串，用逗号分隔，如: flower,flow,flight" }
        ],
        testCases: [
          { label: "示例 1", value: { strs: ["flower", "flow", "flight"] } },
          { label: "示例 2", value: { strs: ["dog", "racecar", "car"] } },
          { label: "示例 3", value: { strs: ["abc", "abcd", "ab"] } },
        ],
        
        customStepVariables: (variables) => {
          const prefix = variables?.prefix as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          return prefix !== undefined && !finished ? (
            <div className="mt-3 bg-white rounded-lg p-4 border">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">当前公共前缀：</span>
                <span className="font-mono text-lg text-blue-700 font-bold ml-2">
                  "{prefix}"
                </span>
              </div>
            </div>
          ) : null;
        },
        
        render: ({ getNumberVariable, getBooleanVariable, variables, visualization }) => {
          const charIndex = getNumberVariable('charIndex');
          const checkingString = getNumberVariable('checkingString');
          const matched = getBooleanVariable('matched');
          const mismatch = getBooleanVariable('mismatch');
          const finished = getBooleanVariable('finished');
          const result = variables?.result as string | undefined;
          
          const input = visualization.input as LongestCommonPrefixInput;
          const coreIdea = getProblemCoreIdea(9);

          return (
            <>
              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Text className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">最长公共前缀 - 横向扫描</h3>
                </div>
                
                {coreIdea && <CoreIdeaBox {...coreIdea} />}
                <div className="space-y-3">
                  {input.strs.map((str: string, strIndex: number) => {
                    const isChecking = checkingString === strIndex;
                    const isFirst = strIndex === 0;

                    return (
                      <motion.div
                        key={strIndex}
                        className={`p-4 rounded-lg border-2 ${
                          isFirst
                            ? 'bg-blue-50 border-blue-300'
                            : isChecking
                            ? 'bg-amber-50 border-amber-400'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                        animate={{
                          scale: isChecking ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-semibold ${
                            isFirst ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {isFirst ? '基准字符串' : `字符串 ${strIndex}`}
                          </span>
                          {isChecking && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full"
                            >
                              检查中
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="flex gap-1 font-mono text-lg">
                          {str.split('').map((char: string, charIdx: number) => {
                            const isCurrentChar = charIndex === charIdx;
                            const isInPrefix = charIndex !== undefined && charIdx < charIndex;
                            const isMatched = matched && charIndex === charIdx;
                            const isMismatch = mismatch && charIndex === charIdx && isChecking;

                            return (
                              <motion.div
                                key={charIdx}
                                className={`w-10 h-10 flex items-center justify-center rounded border-2 font-bold ${
                                  isMismatch
                                    ? 'bg-red-100 border-red-500 text-red-700'
                                    : isMatched
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : isCurrentChar && isChecking
                                    ? 'bg-amber-100 border-amber-500 text-amber-700'
                                    : isCurrentChar
                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                    : isInPrefix
                                    ? 'bg-green-50 border-green-300 text-green-600'
                                    : 'bg-white border-gray-300 text-gray-700'
                                }`}
                                animate={{
                                  scale: isCurrentChar ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {char}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 最终结果 */}
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-8 shadow-2xl ${
                    result && result.length > 0
                      ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400'
                      : 'bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500'
                  }`}
                >
                  <div className="text-center text-white">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-6xl mb-4"
                    >
                      {result && result.length > 0 ? '✅' : '❌'}
                    </motion.div>
                    <div className="text-3xl font-bold mb-4">
                      {result && result.length > 0 ? '找到公共前缀！' : '无公共前缀'}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
                    >
                      <span className={`font-mono font-bold text-4xl ${
                        result && result.length > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        "{result || ''}"
                      </span>
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

export default LongestCommonPrefixVisualizer;
