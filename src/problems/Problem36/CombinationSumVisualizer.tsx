import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate } from "@/components/visualizers/templates/BacktrackingTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateCombinationSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface CombinationSumInput extends ProblemInput {
  candidates: number[];
  target: number;
}

function CombinationSumVisualizer() {
  return (
    <ConfigurableVisualizer<CombinationSumInput, { candidates?: number[]; target?: number }>
      config={{
        defaultInput: { candidates: [2, 3, 6, 7], target: 7 },
        algorithm: (input) => generateCombinationSumSteps(input.candidates, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "candidates", numberKey: "target", arrayLabel: "candidates", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "candidates", label: "候选数组", placeholder: "输入数字，用逗号分隔" },
          { type: "number", key: "target", label: "目标值", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { candidates: [2, 3, 6, 7], target: 7 } },
          { label: "示例 2", value: { candidates: [2, 3, 5], target: 8 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as CombinationSumInput;
          const candidates = input.candidates;
          const target = input.target;
          const path = variables?.path as number[] | undefined;
          const sum = variables?.sum as number | undefined;
          const result = variables?.result as number[][] | undefined;
          const coreIdea = getProblemCoreIdea(36);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <BacktrackingTemplate
              title="组合总和（回溯）"
              currentPath={path || []}
              solutions={result || []}
              currentAction={sum !== undefined ? `当前和：${sum} / 目标：${target}` : undefined}
              
              renderHeader={undefined}

              renderStats={() => (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">目标值：</span>
                      <span className="font-bold text-blue-600">{target}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">当前和：</span>
                      <span className="font-bold text-purple-600">{sum ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">候选数：</span>
                      <span className="font-bold text-orange-600">[{candidates.join(', ')}]</span>
                    </div>
                  </div>
                </div>
              )}

              pathConfig={{
                emptyMessage: "空路径",
                containerClassName: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
                itemClassName: "bg-blue-500",
              }}

              solutionsConfig={{
                title: "已找到的组合",
                gridCols: 1,
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
                  className="bg-white rounded-lg p-3 border border-green-300 flex items-center gap-2"
                >
                  <span className="text-gray-600">组合 {index + 1}:</span>
                  <div className="flex gap-1">
                    {solution.map((num, i) => (
                      <span key={i} className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold">
                        {num}
                      </span>
                    ))}
                  </div>
                  <span className="text-green-700 font-semibold ml-2">
                    = {solution.reduce((a, b) => a + b, 0)}
                  </span>
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

export default CombinationSumVisualizer;
