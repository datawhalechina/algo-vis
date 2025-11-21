import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StringTemplate } from "@/components/visualizers/templates/StringTemplate";
import { generateMinWindowSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MinWindowInput extends ProblemInput {
  s: string;
  t: string;
}

interface MinWindowData {
  s?: string;
  t?: string;
  left?: number;
  right?: number;
  window?: Record<string, number>;
  need?: Record<string, number>;
  minWindow?: string;
  minLength?: number;
  highlightIndices?: number[];
  currentChar?: string;
  valid?: number;
}

function MinWindowVisualizer() {
  return (
    <ConfigurableVisualizer<MinWindowInput, MinWindowData>
      config={{
        defaultInput: { s: "ADOBECODEBANC", t: "ABC" },
        algorithm: (input) => generateMinWindowSteps(input.s, input.t),
        
        inputTypes: [
          { type: "string", key: "s", label: "字符串 s" },
          { type: "string", key: "t", label: "目标字符串 t" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串 s" },
          { type: "string", key: "t", label: "目标字符串 t", placeholder: "输入目标字符串 t" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "ADOBECODEBANC", t: "ABC" } },
          { label: "示例 2", value: { s: "a", t: "a" } },
          { label: "示例 3", value: { s: "a", t: "aa" } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as MinWindowInput;
          const currentS = data.s || input.s;
          const currentT = data.t || input.t;
          const left = data.left ?? 0;
          const right = data.right ?? 0;
          const highlightIndices = data.highlightIndices || [];
          const minWindow = data.minWindow || '';
          
          return (
            <>
              {/* 算法说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Search size={20} className="text-blue-600" />
                  滑动窗口 - 最小覆盖子串
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  右指针扩展窗口直到包含所有t中的字符，左指针收缩窗口寻找最小覆盖子串。
                </p>
              </div>

              {/* 字符串s可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">字符串 s</h4>
                <StringTemplate
                  data={currentS}
                  renderChar={(char, index) => {
                    const isInWindow = index >= left && index < right;
                    const isHighlight = highlightIndices.includes(index);
                    const isLeft = index === left;
                    const isRight = index === right - 1;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-mono font-bold transition-all ${
                          isHighlight
                            ? 'border-green-500 bg-green-100 text-green-700 scale-110 shadow-lg'
                            : isLeft
                            ? 'border-blue-500 bg-blue-100 text-blue-700'
                            : isRight
                            ? 'border-purple-500 bg-purple-100 text-purple-700'
                            : isInWindow
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        {char}
                      </motion.div>
                    );
                  }}
                  layout={{ gap: '0.5rem', direction: 'row', wrap: true }}
                />
              </div>

              {/* 目标字符串t */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">目标字符串 t</h4>
                <div className="flex gap-2">
                  {currentT.split('').map((char, idx) => (
                    <div key={idx} className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 bg-blue-100 rounded-lg font-mono font-bold text-blue-700">
                      {char}
                    </div>
                  ))}
                </div>
              </div>

              {/* 当前窗口信息 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">窗口信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Left: </span>
                    <span className="font-mono font-bold text-blue-600">{left}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Right: </span>
                    <span className="font-mono font-bold text-purple-600">{right}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">当前窗口: </span>
                    <span className="font-mono font-bold text-gray-800">{currentS.substring(left, right)}</span>
                  </div>
                  {minWindow && (
                    <div>
                      <span className="text-gray-600">最小覆盖: </span>
                      <span className="font-mono font-bold text-green-600">{minWindow}</span>
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

export default MinWindowVisualizer;
