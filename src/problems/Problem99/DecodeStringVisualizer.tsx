import { Code } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { decodeStringSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { StackTemplate } from "@/components/visualizers/templates/StackTemplate";

interface DecodeStringInput extends ProblemInput {
  s: string;
}

function DecodeStringVisualizer() {
  return (
    <ConfigurableVisualizer<DecodeStringInput, Record<string, never>>
      config={{
        defaultInput: { s: "3[a]2[bc]" },
        algorithm: (input) => decodeStringSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入编码字符串，如 3[a]2[bc]"},
        ],
        testCases: [
          { label: "示例 1", value: { s: "3[a]2[bc]" } },
          { label: "示例 2", value: { s: "3[a2[c]]" } },
          { label: "示例 3", value: { s: "2[abc]3[cd]ef" } },
          { label: "示例 4", value: { s: "abc3[cd]xyz" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as DecodeStringInput;
          const s = input.s.split('');
          const currentIndex = variables?.currentIndex as number | undefined;
          const char = variables?.char as string | undefined;
          const num = variables?.num as number | undefined;
          const numStack = variables?.numStack as number[] | undefined || [];
          const strStack = variables?.strStack as string[] | undefined || [];
          const result = variables?.result as string | undefined || "";
          const completed = variables?.completed as boolean | undefined;
          const repeatTimes = variables?.repeatTimes as number | undefined;
          const repeated = variables?.repeated as string | undefined;

          const coreIdea = getProblemCoreIdea(99);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">字符串解码 - 双栈法</h3>
                </div>

                {/* 输入字符串 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">输入字符串</div>
                  <div className="flex gap-1 flex-wrap justify-center p-4 bg-gray-50 rounded-lg">
                    {s.map((c, idx) => (
                      <motion.div
                        key={idx}
                        animate={{
                          scale: currentIndex === idx ? 1.2 : 1,
                          backgroundColor: currentIndex === idx ? '#818cf8' : '#f3f4f6',
                          color: currentIndex === idx ? '#ffffff' : '#374151',
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-lg"
                        style={{
                          borderColor: currentIndex === idx ? '#6366f1' : '#d1d5db',
                        }}
                      >
                        {c}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 当前处理信息 */}
                {char && (
                  <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="text-sm space-y-1">
                      <span className="font-semibold text-gray-700">当前字符: </span>
                      <span className="px-2 py-1 bg-indigo-500 text-white rounded font-bold font-mono">{char}</span>
                      {num !== undefined && num > 0 && (
                        <span className="ml-2 text-gray-600">累计数字: {num}</span>
                      )}
                      {repeatTimes !== undefined && (
                        <div className="mt-1">
                          <span className="font-semibold text-gray-700">重复 {repeatTimes} 次: </span>
                          <span className="text-purple-700 font-mono">{repeated}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 栈可视化 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">数字栈</h4>
                  <StackTemplate
                    data={numStack}
                    renderItem={(item: number) => (
                      <div className="text-center p-2">
                        <div className="font-bold text-xl text-blue-700">{item}</div>
                      </div>
                    )}
                    getItemState={(index: number) => ({
                      isTop: index === numStack.length - 1
                    })}
                    layout={{ direction: "vertical" }}
                    emptyMessage="栈为空"
                  />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">字符串栈</h4>
                  <StackTemplate
                    data={strStack}
                    renderItem={(item: string) => (
                      <div className="text-center p-2">
                        <div className="font-mono text-sm text-purple-700">"{item}"</div>
                      </div>
                    )}
                    getItemState={(index: number) => ({
                      isTop: index === strStack.length - 1
                    })}
                    layout={{ direction: "vertical" }}
                    emptyMessage="栈为空"
                  />
                </div>
              </div>

              {/* 当前结果 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">当前结果</h4>
                <div className={`p-4 rounded-lg border-2 ${
                  completed ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="font-mono text-lg text-center">
                    {completed && <span className="text-green-600 mr-2">✓</span>}
                    <span className={completed ? 'text-green-700 font-bold' : 'text-gray-700'}>
                      {result || '(空)'}
                    </span>
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

export default DecodeStringVisualizer;
