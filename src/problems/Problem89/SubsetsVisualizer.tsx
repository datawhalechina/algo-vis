import { Layers } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate, ChoiceState } from "@/components/visualizers/templates/BacktrackingTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSubsetsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SubsetsInput extends ProblemInput {
  nums: number[];
}

function SubsetsVisualizer() {
  return (
    <ConfigurableVisualizer<SubsetsInput, Record<string, any>>
      config={{
        defaultInput: { nums: [1, 2, 3] },
        algorithm: (input) => generateSubsetsSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3] } },
          { label: "示例 2", value: { nums: [0] } },
          { label: "示例 3", value: { nums: [1, 2, 3, 4] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SubsetsInput;
          const nums = input.nums;
          const path = variables?.path as number[] | undefined;
          const result = variables?.result as number[][] | undefined;
          const startIndex = variables?.startIndex as number | undefined;
          const coreIdea = getProblemCoreIdea(89);

          // 构建选择项状态
          const choices: ChoiceState[] = nums.map((num, idx) => ({
            value: num,
            label: String(num),
            isSelected: path?.includes(num),
            isAvailable: startIndex !== undefined ? idx >= startIndex : true,
          }));

          return (
            <div>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <BacktrackingTemplate
                title="子集（回溯）"
                currentPath={path || []}
                solutions={result || []}
                choices={choices}
                
                renderHeader={() => (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="text-purple-600" size={18} />
                      <span className="font-bold text-purple-700">💡 核心思想</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      使用回溯法，逐个选择元素，生成所有可能的子集。每个元素都有"选"和"不选"两种选择。
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <span className="font-semibold">特点：</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">回溯</span>
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded">O(2^n)</span>
                    </div>
                  </div>
                )}

                pathConfig={{
                  emptyMessage: "∅ 空集",
                  containerClassName: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
                  itemClassName: "bg-blue-500",
                }}

                choicesConfig={{
                  title: "原始数组（可选元素）",
                  gridCols: Math.min(nums.length, 6),
                }}

                solutionsConfig={{
                  title: "已生成的子集",
                  gridCols: 4,
                }}

                theme={{
                  primary: "purple",
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
                      {solution.length === 0 ? (
                        <span className="text-gray-400 text-sm">∅</span>
                      ) : (
                        solution.map((num, i) => (
                          <span
                            key={i}
                            className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold text-sm"
                          >
                            {num}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          );
        },
      }}
    />
  );
}

export default SubsetsVisualizer;
