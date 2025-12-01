import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateFindAnagramsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface FindAnagramsInput extends ProblemInput {
  s: string;
  p: string;
}

interface FindAnagramsData {
  s?: string;
  p?: string;
}

function FindAnagramsVisualizer() {
  return (
    <ConfigurableVisualizer<FindAnagramsInput, FindAnagramsData>
      config={{
        defaultInput: { s: "cbaebabacd", p: "abc" },
        algorithm: (input) => generateFindAnagramsSteps(input.s, input.p),
        
        inputTypes: [
          { type: "string", key: "s", label: "字符串s" },
          { type: "string", key: "p", label: "模式p" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: cbaebabacd" },
          { type: "string", key: "p", label: "模式 p", placeholder: "输入模式，如: abc" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "cbaebabacd", p: "abc" } },
          { label: "示例 2", value: { s: "abab", p: "ab" } },
          { label: "示例 3", value: { s: "baa", p: "aa" } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as FindAnagramsInput;
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const window = variables?.window as string | undefined;
          const isMatch = variables?.isMatch as boolean | undefined;
          const result = variables?.result as number[] | undefined;
          const chars = input.s.split('');
          const coreIdea = getProblemCoreIdea(45);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-blue-600" />
                  固定长度滑动窗口 (长度={input.p.length})
                </h3>
                
                {/* 模式p显示 */}
                <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <span className="font-semibold text-gray-700">模式p：</span>
                    <span className="ml-2 font-mono text-purple-700 font-bold text-lg">"{input.p}"</span>
                  </div>
                </div>
                
                {window && (
                  <div className={`mb-4 p-3 rounded-lg border-2 ${
                    isMatch 
                      ? "bg-green-50 border-green-500" 
                      : "bg-gray-50 border-gray-300"
                  }`}>
                    <div className="text-center">
                      <span className="font-semibold text-gray-700">当前窗口：</span>
                      <span className={`ml-2 font-mono font-bold text-lg ${
                        isMatch ? "text-green-700" : "text-gray-700"
                      }`}>
                        "{window}"
                      </span>
                      {isMatch && <span className="ml-2 text-green-600">✓ 是异位词！</span>}
                    </div>
                  </div>
                )}
                
                <div className="relative flex flex-col items-center gap-2 p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                  {/* 字符+窗口框层（精确对齐） */}
                  <div className="relative">
                    {/* 窗口标记：跟随窗口位置 */}
                    {left !== undefined && right !== undefined && (
                      <motion.div
                        className="absolute text-xs font-bold px-2 py-1 rounded-full shadow-md -top-8"
                        style={{ 
                          backgroundColor: isMatch ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
                          color: 'white'
                        }}
                        animate={{
                          left: `${left * 44 + (right - left + 1) * 22 - 20}px`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        {isMatch ? '✓ 匹配' : '窗口'}
                      </motion.div>
                    )}
                    
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
                              className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold border-2 transition-colors duration-100 ${
                                inWindow
                                  ? isMatch
                                    ? "bg-green-100 text-green-900 border-green-500"
                                    : "bg-blue-100 text-blue-900 border-blue-500"
                                  : "bg-white text-gray-600 border-gray-200"
                              }`}
                            >
                              {char}
                            </div>

                            {/* 索引 */}
                            <div className={`text-xs font-semibold transition-colors duration-100 ${
                              inWindow 
                                ? isMatch ? "text-green-600" : "text-blue-600" 
                                : "text-gray-500"
                            }`}>
                              {index}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 窗口框：精确覆盖在字符上，匹配时变绿色 */}
                    {left !== undefined && right !== undefined && (
                      <motion.div
                        className="absolute pointer-events-none"
                        style={{
                          top: '0px',
                          height: '40px',
                          borderRadius: '0.5rem',
                        }}
                        animate={{
                          left: `${left * 44}px`,
                          width: `${(right - left + 1) * 44 - 4}px`,
                          border: isMatch ? '3px solid rgb(34, 197, 94)' : '3px solid rgb(59, 130, 246)',
                          backgroundColor: isMatch ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          boxShadow: isMatch 
                            ? '0 0 0 2px rgba(34, 197, 94, 0.3), 0 4px 6px -1px rgba(34, 197, 94, 0.2)' 
                            : '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(59, 130, 246, 0.2)',
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
              </div>

              {/* 结果显示 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">找到的异位词起始索引</h3>
                {result && result.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {result.map((idx, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-mono text-lg font-bold shadow-lg"
                      >
                        {idx}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">还未找到异位词...</div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default FindAnagramsVisualizer;
