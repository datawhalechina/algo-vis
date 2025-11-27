import { Filter } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate } from "@/components/visualizers/templates/BacktrackingTemplate";
import { generatePermutationsIISteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PermutationsIIInput extends ProblemInput {
  nums: number[];
}

function PermutationsIIVisualizer() {
  return (
    <ConfigurableVisualizer<PermutationsIIInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [1, 1, 2] },
        algorithm: (input) => generatePermutationsIISteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 1, 2] } },
          { label: "示例 2", value: { nums: [1, 2, 3] } },
        ],
        
        render: ({ variables }) => {
          const path = variables?.path as number[] | undefined;
          const result = variables?.result as number[][] | undefined;

          return (
            <BacktrackingTemplate
              title="全排列 II（去重）"
              currentPath={path || []}
              solutions={result || []}
              
              renderHeader={() => (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="text-orange-600" size={18} />
                    <span className="font-bold text-orange-700">💡 核心思想</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    先排序，回溯时跳过重复元素（当前元素与前一个相同且前一个未使用时跳过）。
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">回溯</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">去重</span>
                  </div>
                </div>
              )}

              pathConfig={{
                emptyMessage: "空路径",
                containerClassName: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
                itemClassName: "bg-blue-500",
              }}

              solutionsConfig={{
                title: "已生成的排列（无重复）",
                gridCols: 3,
              }}

              theme={{
                primary: "orange",
                success: "green",
                warning: "yellow",
                danger: "red",
              }}

              renderSolution={(solution, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-green-300"
                >
                  <div className="flex gap-1 justify-center">
                    {solution.map((num, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold text-sm"
                      >
                        {num}
                      </span>
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

export default PermutationsIIVisualizer;
