import { BookOpen } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StringTemplate } from "@/components/visualizers/templates/StringTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateWordBreakSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";
import { HorizontalDragContainer } from "@/components/visualizers/HorizontalDragContainer";

interface WordBreakInput extends ProblemInput {
  s: string;
  wordDict: string[];
}

function WordBreakVisualizer() {
  return (
    <ConfigurableVisualizer<WordBreakInput, Record<string, never>>
      config={{
        defaultInput: { s: "leetcode", wordDict: ["leet", "code"] },
        algorithm: (input) => generateWordBreakSteps(input.s, input.wordDict),
        
        inputTypes: [],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: leetcode" },
          { type: "string", key: "wordDict", label: "字典（JSON格式）", placeholder: '输入JSON数组，如: ["leet","code"]' },
        ],
        testCases: [
          { label: "示例 1", value: { s: "leetcode", wordDict: ["leet", "code"] } },
          { label: "示例 2", value: { s: "applepenapple", wordDict: ["apple", "pen"] } },
          { label: "示例 3", value: { s: "catsandog", wordDict: ["cats", "dog", "sand", "and", "cat"] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as WordBreakInput;
          const s = input.s;
          const current = variables?.current as number | undefined;
          const checking = variables?.checking as number | undefined;
          const dp = variables?.dp as boolean[] | undefined;
          const substring = variables?.substring as string | undefined;
          const inDict = variables?.inDict as boolean | undefined;
          const matched = variables?.matched as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as boolean | undefined;
          const coreIdea = getProblemCoreIdea(111);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" />
                  单词拆分
                </h3>
                <p className="text-sm text-gray-600">
                  动态规划：dp[i]表示前i个字符是否可以拆分成字典中的单词。
                </p>
              </div>

              {/* DP状态 */}
              {dp && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">DP状态数组</h4>
                  <div className="flex gap-2 flex-wrap">
                    {dp.map((value, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-3 py-2 rounded-lg font-bold text-sm ${
                          idx === current
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110"
                            : value
                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                            : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
                        }`}
                      >
                        dp[{idx}] = {value ? 'T' : 'F'}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">字符串状态</h4>
                <HorizontalDragContainer>
                  <StringTemplate
                    data={s}
                    renderChar={(char, index) => {
                    const isCurrent = current !== undefined && index < current;
                    const isChecking = checking !== undefined && index >= checking && index < (current || 0);
                    const isMatched = matched && checking !== undefined && index >= checking && index < (current || 0);
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {/* 字符 */}
                        <motion.div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isMatched
                              ? "bg-gradient-to-br from-green-500 to-green-600 scale-110 shadow-lg"
                              : isChecking
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-105 shadow-md"
                              : isCurrent
                              ? "bg-gradient-to-br from-blue-400 to-blue-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isMatched ? 1.15 : isChecking ? 1.05 : 1,
                          }}
                        >
                          {char}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isChecking ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                    }}
                    getCharState={(index) => {
                      const isCurrent = current !== undefined && index < current;
                      const isChecking = checking !== undefined && index >= checking && index < (current || 0);
                      
                      return {
                        index,
                        isCurrent: isChecking,
                        isPassed: isCurrent,
                        isMatched: matched && isChecking,
                      };
                    }}
                    currentIndex={checking}
                    className="min-w-max"
                    layout={{ gap: "0.5rem", direction: "row", wrap: false, justify: "start" }}
                  />
                </HorizontalDragContainer>
              </div>

              {/* 当前检查的子串 */}
              {substring && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前检查</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">子串</div>
                      <div className="text-lg font-bold text-gray-800">"{substring}"</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">是否在字典中</div>
                      <div className={`text-lg font-bold ${inDict ? 'text-green-600' : 'text-red-600'}`}>
                        {inDict ? '✓ 是' : '✗ 否'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className={`text-center p-4 rounded-lg border-2 ${
                    result
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                      : "bg-gradient-to-r from-red-100 to-rose-100 border-red-300"
                  }`}>
                    <div className={`font-semibold text-lg ${
                      result ? "text-green-700" : "text-red-700"
                    }`}>
                      {result ? '✓ 可以拆分！' : '✗ 无法拆分'}
                    </div>
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

export default WordBreakVisualizer;

