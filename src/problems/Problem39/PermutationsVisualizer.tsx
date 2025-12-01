import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate, ChoiceState } from "@/components/visualizers/templates/BacktrackingTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generatePermutationsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PermutationsInput extends ProblemInput {
  nums: number[];
}

function PermutationsVisualizer() {
  return (
    <ConfigurableVisualizer<PermutationsInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [1, 2, 3] },
        algorithm: (input) => generatePermutationsSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3] } },
          { label: "示例 2", value: { nums: [0, 1] } },
          { label: "示例 3", value: { nums: [1] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PermutationsInput;
          const nums = input.nums;
          const path = variables?.path as number[] | undefined;
          const used = variables?.used as boolean[] | undefined;
          const result = variables?.result as number[][] | undefined;
          const coreIdea = getProblemCoreIdea(39);

          // 构建选择项状态
          const choices: ChoiceState[] = nums.map((num, idx) => ({
            value: num,
            label: String(num),
            isSelected: used?.[idx],
            isAvailable: !used?.[idx],
          }));

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <BacktrackingTemplate
              title="全排列（回溯）"
              currentPath={path || []}
              solutions={result || []}
              choices={choices}
              
              renderHeader={undefined}

              pathConfig={{
                emptyMessage: "空路径",
                containerClassName: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
                itemClassName: "bg-blue-500",
              }}

              choicesConfig={{
                title: "数字使用状态",
                gridCols: Math.min(nums.length, 6),
              }}

              solutionsConfig={{
                title: "已生成的排列",
                gridCols: 3,
              }}

              theme={{
                primary: "purple",
                success: "green",
                warning: "yellow",
                danger: "red",
              }}

              renderChoice={(choice, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl transition-all duration-300 ${
                    choice.isSelected
                      ? "bg-gray-300 text-gray-500 line-through opacity-40 scale-90"
                      : "bg-gradient-to-br from-green-400 to-green-500 text-white"
                  }`}
                >
                  {choice.label}
                </div>
              )}

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
            </>
          );
        },
      }}
    />
  );
}

export default PermutationsVisualizer;
