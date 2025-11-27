import { Brackets } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StackTemplate } from "@/components/visualizers/templates/StackTemplate";
import { isValidParenthesesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ValidParenthesesInput extends ProblemInput {
  s: string;
}

function ValidParenthesesVisualizer() {
  return (
    <ConfigurableVisualizer<ValidParenthesesInput, Record<string, any>>
      config={{
        defaultInput: { s: "()[]{}" },
        algorithm: (input) => isValidParenthesesSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入括号字符串，如 ()[]{}"},
        ],
        testCases: [
          { label: "示例 1", value: { s: "()" } },
          { label: "示例 2", value: { s: "()[]{}" } },
          { label: "示例 3", value: { s: "(]" } },
          { label: "示例 4", value: { s: "([)]" } },
          { label: "示例 5", value: { s: "{[]}" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as ValidParenthesesInput;
          const s = input.s;
          const currentIndex = variables?.currentIndex as number | undefined;
          const char = variables?.char as string | undefined;
          const stack = (variables?.stack as string[] | undefined) || [];
          const isValid = variables?.isValid as boolean | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brackets className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">有效的括号（栈）</h3>
                </div>
                
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-purple-700">💡 核心思想：</span>
                    使用栈匹配括号，左括号入栈，右括号与栈顶匹配。
                  </p>
                  {isValid !== null && isValid !== undefined && (
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded font-bold ${
                        isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isValid ? '✓ 有效' : '✗ 无效'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 输入字符串 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">输入字符串</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {s.split('').map((c, idx) => (
                      <motion.div
                        key={idx}
                        animate={{
                          scale: currentIndex === idx ? 1.2 : 1,
                          backgroundColor: currentIndex === idx ? '#8b5cf6' : '#f3f4f6',
                        }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl border-2 ${
                          currentIndex === idx
                            ? 'border-purple-500 text-white'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {c}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 栈可视化 */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">栈状态</div>
                  <StackTemplate
                    data={stack}
                    renderItem={(item: string, _index: number) => (
                      <div className="w-full px-4 py-3 bg-purple-100 border-2 border-purple-300 rounded-lg text-center">
                        <span className="text-lg font-bold text-purple-700">{item}</span>
                      </div>
                    )}
                    layout={{
                      direction: "vertical",
                    }}
                  />
                </div>

                {/* 当前字符信息 */}
                {char && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm">
                      <span className="font-semibold">当前字符:</span>{' '}
                      <span className="px-2 py-1 bg-blue-500 text-white rounded font-bold">{char}</span>
                      <span className="ml-2 text-gray-600">
                        {char in {'(': '', '{': '', '[': ''} ? '(左括号 → 入栈)' : '(右括号 → 匹配出栈)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default ValidParenthesesVisualizer;
