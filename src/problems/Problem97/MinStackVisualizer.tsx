import { Layers } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";

interface MinStackInput extends ProblemInput {
  operations: string;
}

function MinStackVisualizer() {
  return (
    <ConfigurableVisualizer<MinStackInput, Record<string, any>>
      config={{
        defaultInput: { operations: "push(-2),push(0),push(-3),getMin,pop,top,getMin" },
        algorithm: () => [],
        
        inputTypes: [
          { type: "string", key: "operations", label: "operations" },
        ],
        inputFields: [
          { type: "string", key: "operations", label: "操作序列", placeholder: "用逗号分隔的操作，如 push(5),push(1),getMin,pop" },
        ],
        testCases: [
          { label: "示例 1", value: { operations: "push(-2),push(0),push(-3),getMin,pop,top,getMin" } },
        ],
        
        render: () => {
          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-teal-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">最小栈</h3>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-teal-700">💡 核心思想：</span>
                  使用辅助栈同步记录当前栈中的最小值。
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  注：本题目可视化较复杂，建议查看题解代码理解实现。
                </p>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default MinStackVisualizer;
