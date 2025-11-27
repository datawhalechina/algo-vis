import { Braces } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { BacktrackingTemplate, ChoiceState } from "@/components/visualizers/templates/BacktrackingTemplate";
import { generateParenthesesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface GenerateParenthesesInput extends ProblemInput {
  n: number;
}

function GenerateParenthesesVisualizer() {
  return (
    <ConfigurableVisualizer<GenerateParenthesesInput, Record<string, any>>
      config={{
        defaultInput: { n: 3 },
        algorithm: (input) => generateParenthesesSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { 
            type: "number", 
            key: "n", 
            label: "括号对数 n", 
            placeholder: "例如: 3" 
          },
        ],
        testCases: [
          { label: "示例 1: n=1", value: { n: 1 } },
          { label: "示例 2: n=2", value: { n: 2 } },
          { label: "示例 3: n=3", value: { n: 3 } },
          { label: "示例 4: n=4", value: { n: 4 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as GenerateParenthesesInput;
          const n = input.n;
          const path = variables?.path as string | undefined;
          const open = variables?.open as number | undefined;
          const close = variables?.close as number | undefined;
          const result = variables?.result as string[] | undefined;
          const canAddOpen = variables?.canAddOpen as boolean | undefined;
          const canAddClose = variables?.canAddClose as boolean | undefined;
          const action = variables?.action as string | undefined;

          // 构建选择项
          const choices: ChoiceState[] = [
            {
              value: '(',
              label: '(',
              isAvailable: canAddOpen,
              isHighlighted: action === 'add_open',
            },
            {
              value: ')',
              label: ')',
              isAvailable: canAddClose,
              isHighlighted: action === 'add_close',
            },
          ];

          return (
            <BacktrackingTemplate
              title="括号生成（回溯）"
              currentPath={path ? path.split('') : []}
              solutions={(result || []).map(s => [s])}
              choices={choices}
              isBacktracking={action === 'backtrack'}
              
              renderHeader={() => (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Braces className="text-indigo-600" size={18} />
                    <span className="font-bold text-indigo-700">💡 核心思想</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    使用回溯法生成所有有效的括号组合。确保左括号数 ≤ n，右括号数 ≤ 左括号数。
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">回溯</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">卡特兰数</span>
                  </div>
                </div>
              )}

              renderStats={() => (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    生成 {n} 对括号（共 {2 * n} 个字符）
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">左括号已用：</span>
                      <span className="font-bold text-blue-600">{open ?? 0} / {n}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">右括号已用：</span>
                      <span className="font-bold text-purple-600">{close ?? 0} / {n}</span>
                    </div>
                  </div>
                </div>
              )}

              pathConfig={{
                emptyMessage: "开始构建...",
                containerClassName: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200",
              }}

              choicesConfig={{
                title: "可添加的括号",
                gridCols: 2,
              }}

              solutionsConfig={{
                title: "已生成的有效组合",
                gridCols: 3,
              }}

              theme={{
                primary: "indigo",
                success: "green",
                warning: "yellow",
                danger: "red",
              }}

              renderPathItem={(item, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-2xl shadow-md ${
                    item === '('
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {item}
                </div>
              )}

              renderChoice={(choice, index) => (
                <div
                  key={index}
                  className={`px-6 py-4 rounded-lg border-2 ${
                    choice.isHighlighted
                      ? "bg-yellow-100 border-yellow-400 scale-110"
                      : choice.isAvailable
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-100 border-gray-300 opacity-30"
                  } transition-all duration-300`}
                >
                  <div className="text-3xl font-bold text-center mb-2">{choice.label}</div>
                  <div className="text-xs text-center text-gray-600">
                    {choice.isAvailable ? '可添加' : choice.label === '(' ? '已达上限' : '需先添加('}
                  </div>
                </div>
              )}

              renderSolution={(solution, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-green-300 text-center font-mono font-bold text-lg text-green-700"
                >
                  {solution[0]}
                </div>
              )}
            />
          );
        },
      }}
    />
  );
}

export default GenerateParenthesesVisualizer;
