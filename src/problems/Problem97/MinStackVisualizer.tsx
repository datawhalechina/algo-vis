import { Layers } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StackTemplate } from "@/components/visualizers/templates/StackTemplate";
import { ProblemInput } from "@/types/visualization";
import { minStackSteps } from "./algorithm";

interface MinStackInput extends ProblemInput {
  operations: string;
}

function MinStackVisualizer() {
  return (
    <ConfigurableVisualizer<MinStackInput, Record<string, any>>
      config={{
        defaultInput: { operations: "push(-2),push(0),push(-3),getMin,pop,top,getMin" },
        algorithm: (input) => minStackSteps(input.operations),
        
        inputTypes: [
          { type: "string", key: "operations", label: "operations" },
        ],
        inputFields: [
          { type: "string", key: "operations", label: "操作序列", placeholder: "用逗号分隔的操作，如 push(5),push(1),getMin,pop" },
        ],
        testCases: [
          { label: "示例 1", value: { operations: "push(-2),push(0),push(-3),getMin,pop,top,getMin" } },
          { label: "示例 2", value: { operations: "push(5),push(1),push(3),getMin,pop,getMin" } },
        ],
        
        render: ({ variables }) => {
          const stack = variables?.stack as number[] | undefined;
          const minStack = variables?.minStack as number[] | undefined;
          const currentOp = variables?.currentOp as string | undefined;
          const result = variables?.result as number | undefined;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-teal-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">最小栈 - 辅助栈</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-teal-700">💡 核心思想：</span>
                  使用辅助栈同步记录当前栈中的最小值，每次push和pop时同步更新。
                </p>
              </div>

              {/* 当前操作 */}
              {currentOp && (
                <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">当前操作</div>
                    <div className="text-2xl font-bold text-blue-700">{currentOp}</div>
                    {result !== undefined && (
                      <div className="mt-2 text-lg text-blue-600">返回值: {result}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* 主栈 - 使用 StackTemplate */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">主栈 Stack</div>
                  <StackTemplate
                    data={stack || []}
                    renderItem={(value: number, _index, state) => (
                      <div 
                        className="w-20 h-16 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 border-2 border-blue-400 shadow-md transition-all"
                        style={{
                          transform: state.isTop ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: state.isTop ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                        }}
                      >
                        {value}
                      </div>
                    )}
                    layout={{
                      direction: 'vertical',
                      gap: '0.5rem',
                      maxWidth: '120px',
                      minHeight: '250px',
                    }}
                    animation={{
                      duration: 0.4,
                    }}
                    emptyMessage="栈为空"
                    showBottomMarker={true}
                    showSize={false}
                  />
                </div>

                {/* 辅助栈 - 使用 StackTemplate */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">辅助栈 MinStack</div>
                  <StackTemplate
                    data={minStack || []}
                    renderItem={(value: number, _index, state) => (
                      <div 
                        className="w-20 h-16 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br from-teal-100 to-teal-200 text-teal-900 border-2 border-teal-400 shadow-md transition-all"
                        style={{
                          transform: state.isTop ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: state.isTop ? '0 4px 12px rgba(20, 184, 166, 0.3)' : 'none',
                        }}
                      >
                        {value}
                      </div>
                    )}
                    layout={{
                      direction: 'vertical',
                      gap: '0.5rem',
                      maxWidth: '120px',
                      minHeight: '250px',
                    }}
                    animation={{
                      duration: 0.4,
                    }}
                    emptyMessage="栈为空"
                    showBottomMarker={true}
                    showSize={false}
                  />
                </div>
              </div>

              {/* 当前最小值 */}
              {minStack && minStack.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">当前最小值</div>
                    <div className="text-3xl font-bold text-green-700">{minStack[minStack.length - 1]}</div>
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default MinStackVisualizer;
