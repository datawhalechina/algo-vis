import { motion } from "framer-motion";
import { Move } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateLengthOfLongestSubstringSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LengthOfLongestSubstringInput extends ProblemInput {
  s: string;
}

interface LengthOfLongestSubstringData {
  s?: string;
}

function LengthOfLongestSubstringVisualizer() {
  return (
    <ConfigurableVisualizer<LengthOfLongestSubstringInput, LengthOfLongestSubstringData>
      config={{
        defaultInput: { s: "abcabcbb" },
        algorithm: (input) => generateLengthOfLongestSubstringSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "字符串" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: abcabcbb" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "abcabcbb" } },
          { label: "示例 2", value: { s: "bbbbb" } },
          { label: "示例 3", value: { s: "pwwkew" } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const maxLength = getNumberVariable('maxLength');
          const substring = variables?.substring as string | undefined;
          const input = visualization.input as LengthOfLongestSubstringInput;
          const chars = input.s.split('');
          
          return (
            <>
              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Move size={20} className="text-blue-600" />
                  滑动窗口可视化
                </h3>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    使用滑动窗口和哈希表，记录字符最后出现位置。
                    遇到重复字符时移动left指针，动态维护无重复窗口。
                  </p>
                </div>
                
                {substring && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="text-center">
                      <span className="font-semibold text-gray-700">当前窗口：</span>
                      <span className="ml-2 font-mono text-green-700 font-bold text-lg">"{substring}"</span>
                      <span className="ml-2 text-gray-600">长度: {substring.length}</span>
                    </div>
                  </div>
                )}
                
                <div className="relative flex flex-col items-center gap-6 p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                  {/* 指针标记层 */}
                  <div className="relative h-6 w-full">
                    {left !== undefined && (
                      <motion.div
                        className="absolute text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white shadow-md"
                        animate={{
                          left: `calc(50% + ${left - chars.length / 2} * 52px + 20px)`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        L
                      </motion.div>
                    )}
                    {right !== undefined && (
                      <motion.div
                        className="absolute text-xs font-bold px-2 py-1 rounded-full bg-green-500 text-white shadow-md"
                        animate={{
                          left: `calc(50% + ${right - chars.length / 2} * 52px + 20px)`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        R
                      </motion.div>
                    )}
                  </div>
                  
                  {/* 字符+窗口框层（精确对齐） */}
                  <div className="relative">
                    {/* 字符层 */}
                    <div className="flex items-center gap-1">
                      {chars.map((char: string, index: number) => {
                        const inWindow = left !== undefined && right !== undefined && index >= left && index <= right;

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                          >
                            {/* 字符 */}
                            <div
                              className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2 transition-colors duration-100 ${
                                inWindow
                                  ? "bg-blue-100 text-blue-900 border-blue-500"
                                  : "bg-white text-gray-600 border-gray-200"
                              }`}
                            >
                              {char}
                            </div>

                            {/* 索引 */}
                            <div className={`text-xs font-semibold transition-colors duration-100 ${
                              inWindow ? "text-blue-600" : "text-gray-500"
                            }`}>
                              [{index}]
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 窗口框：精确覆盖在字符上 */}
                    {left !== undefined && right !== undefined && (
                      <motion.div
                        className="absolute pointer-events-none"
                        style={{
                          top: '0px',
                          height: '48px',
                          border: '3px solid rgb(59, 130, 246)',
                          borderRadius: '0.5rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                        }}
                        animate={{
                          left: `${left * 52}px`,
                          width: `${(right - left + 1) * 52 - 4}px`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                    <span className="text-gray-700">窗口内</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
                    <span className="text-gray-700">窗口外</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 border-2 border-blue-500 rounded bg-blue-50"></div>
                    <span className="text-gray-700">窗口框</span>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">算法状态</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Left指针</div>
                    <div className="text-3xl font-bold text-blue-600">{left !== undefined ? left : '-'}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Right指针</div>
                    <div className="text-3xl font-bold text-green-600">{right !== undefined ? right : '-'}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">最大长度</div>
                    <div className="text-3xl font-bold text-purple-600">{maxLength !== undefined ? maxLength : 0}</div>
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

export default LengthOfLongestSubstringVisualizer;
