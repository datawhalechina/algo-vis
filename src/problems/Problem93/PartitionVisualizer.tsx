import { Split } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate } from "@/components/visualizers/templates/BacktrackingTemplate";
import { generatePartitionSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PartitionInput extends ProblemInput {
  s: string;
}

function PartitionVisualizer() {
  return (
    <ConfigurableVisualizer<PartitionInput, Record<string, any>>
      config={{
        defaultInput: { s: "aab" },
        algorithm: (input) => generatePartitionSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { 
            type: "string", 
            key: "s", 
            label: "字符串", 
            placeholder: "例如: aab" 
          },
        ],
        testCases: [
          { label: "示例 1", value: { s: "aab" } },
          { label: "示例 2", value: { s: "a" } },
          { label: "示例 3", value: { s: "aba" } },
          { label: "示例 4", value: { s: "abcba" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PartitionInput;
          const s = input.s;
          const path = variables?.path as string[] | undefined;
          const result = variables?.result as string[][] | undefined;
          const substring = variables?.substring as string | undefined;
          const isPalin = variables?.isPalindrome as boolean | undefined;
          const action = variables?.action as string | undefined;

          return (
            <BacktrackingTemplate
              title="分割回文串（回溯）"
              currentPath={path || []}
              solutions={result || []}
              isBacktracking={action === 'backtrack'}
              currentAction={substring ? `检查 "${substring}" ${isPalin ? '✓ 是回文' : '✗ 不是回文'}` : undefined}
              
              renderHeader={() => (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Split className="text-teal-600" size={18} />
                    <span className="font-bold text-teal-700">💡 核心思想</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    使用回溯法枚举所有可能的分割方式，检查每个子串是否为回文串。
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded">回溯</span>
                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">回文检查</span>
                  </div>
                </div>
              )}

              renderStats={() => (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    原始字符串：{s}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-600">字符串长度：</span>
                    <span className="font-bold text-blue-600">{s.length}</span>
                  </div>
                </div>
              )}

              pathConfig={{
                emptyMessage: "空",
                containerClassName: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
                itemClassName: "bg-purple-500",
              }}

              solutionsConfig={{
                title: "已找到的回文分割方案",
                gridCols: 1,
              }}

              theme={{
                primary: "teal",
                success: "green",
                warning: "yellow",
                danger: "red",
              }}

              renderPathItem={(item, index) => (
                <div key={index} className="flex items-center">
                  <div className="px-4 py-2 bg-purple-500 text-white rounded-lg font-mono font-bold text-lg shadow-md">
                    {item}
                  </div>
                  {index < (path?.length || 0) - 1 && (
                    <div className="mx-2 text-gray-400">|</div>
                  )}
                </div>
              )}

              renderSolution={(solution, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-green-300"
                >
                  <div className="flex gap-2 flex-wrap">
                    {solution.map((part, i) => (
                      <div key={i} className="flex items-center">
                        <span className="px-3 py-1 bg-green-500 text-white rounded font-mono font-bold">
                          {part}
                        </span>
                        {i < solution.length - 1 && (
                          <span className="mx-2 text-gray-400">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          );
        },
      }}
    />
  );
}

export default PartitionVisualizer;
