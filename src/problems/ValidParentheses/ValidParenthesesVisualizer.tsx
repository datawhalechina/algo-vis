import { generateValidParenthesesSteps } from "./algorithm";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, CheckCircle } from "lucide-react";
import { useVisualization } from "@/hooks/useVisualization";
import { VisualizationLayout } from "@/components/visualizers/VisualizationLayout";
import { getNumberVariable, getBooleanVariable } from "@/types/visualization";

interface ValidParenthesesInput {
  str: string;
}

function ValidParenthesesVisualizer() {
  const visualization = useVisualization<ValidParenthesesInput>(
    (input) => generateValidParenthesesSteps(input.str),
    { str: "()[]{}" }
  );

  const chars = (visualization.currentStepData?.data as { chars: string[] })?.chars || [];
  const variables = visualization.currentStepData?.variables;
  const stack = (variables?.stack as string[]) || [];
  const currentIndex = getNumberVariable(variables, 'currentIndex');
  const action = variables?.action as string | undefined;
  const isValid = getBooleanVariable(variables, 'isValid');

  // 括号颜色映射
  const getBracketColor = (char: string) => {
    switch (char) {
      case "(":
      case ")":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "[":
      case "]":
        return "text-purple-600 bg-purple-100 border-purple-300";
      case "{":
      case "}":
        return "text-green-600 bg-green-100 border-green-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  return (
    <VisualizationLayout
      visualization={visualization}
      inputTypes={[{ type: "string", key: "str", label: "括号字符串" }]}
      inputFields={[{ 
        type: "string", 
        key: "str", 
        label: "括号字符串 (只能包含 ()[]{})", 
        placeholder: "输入括号字符串，如: ()[]{}" 
      }]}
      testCases={[
        { label: "示例 1", value: { str: "()[]{}" } },
        { label: "示例 2", value: { str: "()" } },
        { label: "示例 3", value: { str: "(]" } },
        { label: "示例 4", value: { str: "{[()]}" } },
        { label: "空串", value: { str: "" } },
      ]}
      customStepVariables={(variables) => {
        const matchedPair = variables?.matchedPair as string | undefined;
        return matchedPair ? (
          <div className="mt-3 bg-white rounded-lg p-4 border border-green-200 inline-flex items-center gap-3">
            <span className="text-2xl font-bold text-green-600">
              {matchedPair}
            </span>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        ) : null;
      }}
    >

        {/* 主要可视化区域 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 左侧：字符串遍历 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>字符串遍历</span>
              {currentIndex !== undefined && currentIndex >= 0 && (
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                  位置: {currentIndex}
                </span>
              )}
            </h3>

            <div className="flex flex-wrap justify-center gap-3 min-h-[120px] bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-100">
              {chars.map((char, index) => {
                const isCurrent = currentIndex === index;
                const isPassed = currentIndex !== undefined && index < currentIndex;
                const isMatched = isPassed && isValid !== false;

                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <ArrowDown className="text-amber-500" size={24} />
                      </motion.div>
                    )}

                    <motion.div
                      className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center text-3xl font-bold transition-all ${
                        isCurrent
                          ? `${getBracketColor(char)} shadow-lg scale-110`
                          : isMatched
                          ? "text-green-600 bg-green-50 border-green-300 opacity-60"
                          : isPassed
                          ? "text-gray-400 bg-gray-50 border-gray-200 opacity-40"
                          : getBracketColor(char)
                      }`}
                      animate={{
                        y: isCurrent ? -5 : 0,
                      }}
                    >
                      {char}
                    </motion.div>

                    <div
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-amber-600" : "text-gray-500"
                      }`}
                    >
                      [{index}]
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 右侧：栈可视化 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>栈（Stack）</span>
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  大小: {stack.length}
                </span>
              </h3>
              {action === "push" && (
                <ArrowDown className="text-blue-500 animate-bounce" size={24} />
              )}
              {action === "pop" && (
                <ArrowUp className="text-red-500 animate-bounce" size={24} />
              )}
            </div>

            <div className="relative min-h-[350px] bg-gradient-to-b from-purple-50 to-white p-6 rounded-lg border border-purple-100 flex flex-col-reverse items-center">
              {stack.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-2">📭</div>
                    <p className="text-sm">栈为空</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col-reverse gap-2 w-full max-w-[200px]">
                  <AnimatePresence>
                    {stack.map((char, index) => {
                      const isTop = index === stack.length - 1;
                      return (
                        <motion.div
                          key={`${char}-${index}-${visualization.currentStep}`}
                          initial={{ opacity: 0, y: -20, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: isTop ? 1.05 : 1,
                          }}
                          exit={{ opacity: 0, x: 100, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          className={`relative ${
                            isTop ? "z-10" : ""
                          }`}
                        >
                          <div
                            className={`w-full h-20 rounded-xl border-4 flex items-center justify-center text-4xl font-bold shadow-lg ${
                              isTop
                                ? `${getBracketColor(char)} shadow-xl`
                                : `${getBracketColor(char)} opacity-70`
                            }`}
                            style={{
                              transform: `perspective(1000px) rotateX(${
                                isTop ? 0 : 5
                              }deg)`,
                            }}
                          >
                            {char}
                          </div>
                          {isTop && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap"
                            >
                              栈顶
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* 栈底标记 */}
              {stack.length > 0 && (
                <div className="mt-4 w-full max-w-[200px] border-t-4 border-dashed border-gray-300 pt-2 text-center">
                  <span className="text-xs font-semibold text-gray-500">
                    栈底
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* 算法核心思想 */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-5 border border-cyan-200">
        <h3 className="text-lg font-semibold text-cyan-900 mb-3">
          💡 栈的应用原理
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 font-bold mt-1">•</span>
            <span>
              <strong className="text-cyan-800">先进后出（LIFO）：</strong>
              栈的特性完美匹配括号的嵌套规则
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 font-bold mt-1">•</span>
            <span>
              <strong className="text-cyan-800">左括号入栈：</strong>
              遇到 ( [ {'{'} 时, 将其压入栈中等待匹配
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 font-bold mt-1">•</span>
            <span>
              <strong className="text-cyan-800">右括号匹配：</strong>
              遇到 ) ] {'}'} 时, 检查栈顶元素是否为对应的左括号
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-600 font-bold mt-1">•</span>
            <span>
              <strong className="text-cyan-800">最终检查：</strong>
              遍历结束后, 栈必须为空(所有左括号都已匹配)
            </span>
          </li>
        </ul>
      </div>

      {/* 括号配对图例 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          括号配对规则
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center justify-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <span className="text-3xl font-bold text-blue-600">(</span>
            <span className="text-gray-400">↔</span>
            <span className="text-3xl font-bold text-blue-600">)</span>
          </div>
          <div className="flex items-center justify-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <span className="text-3xl font-bold text-purple-600">[</span>
            <span className="text-gray-400">↔</span>
            <span className="text-3xl font-bold text-purple-600">]</span>
          </div>
          <div className="flex items-center justify-center gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
            <span className="text-3xl font-bold text-green-600">{'{'}</span>
            <span className="text-gray-400">↔</span>
            <span className="text-3xl font-bold text-green-600">{'}'}</span>
          </div>
        </div>
      </div>
    </VisualizationLayout>
  );
}

export default ValidParenthesesVisualizer;

