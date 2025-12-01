import { RotateCcw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StringTemplate } from "@/components/visualizers/templates/StringTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateLongestPalindromeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface LongestPalindromeInput extends ProblemInput {
  s: string;
}

function LongestPalindromeVisualizer() {
  return (
    <ConfigurableVisualizer<LongestPalindromeInput, Record<string, never>>
      config={{
        defaultInput: { s: "babad" },
        algorithm: (input) => generateLongestPalindromeSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: babad" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "babad" } },
          { label: "示例 2", value: { s: "cbbd" } },
          { label: "示例 3", value: { s: "a" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as LongestPalindromeInput;
          const s = input.s;
          const center = variables?.center as number | undefined;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const start = variables?.start as number | undefined;
          const maxLen = variables?.maxLen as number | undefined;
          const phase = variables?.phase as string | undefined;
          const expanding = variables?.expanding as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as string | undefined;
          const coreIdea = getProblemCoreIdea(114);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <RotateCcw size={20} className="text-blue-600" />
                  最长回文子串（中心扩展法）
                </h3>
                <p className="text-sm text-gray-600">
                  对于每个可能的中心位置，向两边扩展寻找最长的回文子串。考虑奇数和偶数长度。
                </p>
              </div>

              {/* 状态信息 */}
              {(start !== undefined || maxLen !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {start !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">起始位置</div>
                        <div className="text-2xl font-bold text-blue-600">{start}</div>
                      </div>
                    )}
                    {maxLen !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">最大长度</div>
                        <div className="text-2xl font-bold text-green-600">{maxLen}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">字符串状态</h4>
                <StringTemplate
                  data={s}
                  renderChar={(char, index, state) => {
                    const isCenter = center === index;
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isInPalindrome = start !== undefined && maxLen !== undefined && 
                      index >= start && index < start + maxLen;
                    const isExpanding = expanding && left !== undefined && right !== undefined &&
                      index >= left && index <= right;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {/* 标签 */}
                        <div className="flex gap-1">
                          {isCenter && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white"
                            >
                              中心
                            </motion.div>
                          )}
                          {(isLeft || isRight) && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                            >
                              {isLeft ? "L" : "R"}
                            </motion.div>
                          )}
                        </div>

                        {/* 字符 */}
                        <motion.div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isExpanding
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 scale-110 shadow-lg"
                              : isInPalindrome
                              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-md"
                              : isCenter
                              ? "bg-gradient-to-br from-purple-400 to-purple-500 scale-105"
                              : isLeft || isRight
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isExpanding ? 1.15 : isCenter ? 1.05 : 1,
                          }}
                        >
                          {char}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isCenter || isLeft || isRight ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getCharState={(index) => {
                    const isCenter = center === index;
                    const isExpanding = expanding && left !== undefined && right !== undefined &&
                      index >= left && index <= right;
                    const isInPalindrome = start !== undefined && maxLen !== undefined && 
                      index >= start && index < start + maxLen;
                    
                    return {
                      index,
                      isCurrent: isCenter || isExpanding,
                      isPassed: false,
                      isMatched: isInPalindrome,
                    };
                  }}
                  currentIndex={center}
                  layout={{ gap: "0.5rem", direction: "row", wrap: false }}
                />
              </div>

              {/* 当前回文 */}
              {result && finished && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">最长回文子串</h4>
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-2xl font-bold text-green-700">"{result}"</div>
                    <div className="text-sm text-green-600 mt-2">长度: {maxLen}</div>
                  </div>
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！最长回文子串为 "{result}"
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">中心位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">扩展指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">回文子串</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">正在扩展</span>
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

export default LongestPalindromeVisualizer;

