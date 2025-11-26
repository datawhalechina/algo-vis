import { Binary } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateSortedArrayToBSTSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SortedArrayToBSTInput extends ProblemInput {
  nums: number[];
}

interface SortedArrayToBSTData {
  tree?: (number | null)[];
}

function SortedArrayToBSTVisualizer() {
  return (
    <ConfigurableVisualizer<SortedArrayToBSTInput, SortedArrayToBSTData>
      config={{
        defaultInput: { nums: [-10, -3, 0, 5, 9] },
        algorithm: (input) => generateSortedArrayToBSTSteps(input.nums),

        inputTypes: [{ type: "array", key: "nums", label: "有序数组" }],
        inputFields: [
          {
            type: "array",
            key: "nums",
            label: "有序数组（升序）",
            placeholder: "例如: -10,-3,0,5,9",
          },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [-10, -3, 0, 5, 9] } },
          { label: "示例 2", value: { nums: [1, 3] } },
          { label: "示例 3", value: { nums: [1, 2, 3, 4, 5, 6, 7] } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentValue = variables?.currentValue as number | undefined;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const inputArray = variables?.inputArray as number[] | undefined;
          const subarray = variables?.subarray as number[] | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Binary className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">有序数组转BST - 分治递归</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-indigo-700">核心思想：</span>
                    选择中间元素作为根节点，左半部分构建左子树，右半部分构建右子树，自然形成平衡BST。
                  </p>
                </div>

                {/* 输入数组 */}
                {inputArray && (
                  <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-gray-600 mb-2 text-center">输入数组（升序）</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {inputArray.map((val, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded font-mono font-semibold"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 当前子数组 */}
                {subarray && left !== undefined && right !== undefined && mid !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-2">当前范围</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-gray-600">left={left}</span>
                          <span className="font-mono text-blue-700 font-bold text-lg">mid={mid}</span>
                          <span className="font-mono text-gray-600">right={right}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-2">选中元素</div>
                        <div className="font-mono font-bold text-indigo-700 text-2xl">{currentValue}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {subarray.map((val, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded font-mono font-semibold ${
                            val === currentValue
                              ? 'bg-indigo-600 text-white border-2 border-indigo-700'
                              : 'bg-white border border-blue-300 text-blue-700'
                          }`}
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentValue;
                    return {
                      isCurrent,
                      customState: { current: isCurrent }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={isCurrent ? "url(#node-gradient-indigo)" : "url(#node-gradient-default)"}
                          stroke={isCurrent ? "#6366f1" : "#cbd5e1"}
                          strokeWidth={isCurrent ? "3" : "2"}
                        />
                        
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          className="text-base font-bold select-none"
                          fill="white"
                        >
                          {pos.node.val}
                        </text>

                        <defs>
                          <linearGradient id="node-gradient-default" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#64748b" />
                          </linearGradient>
                          <linearGradient id="node-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '默认' },
                    { color: '#6366f1', label: '当前节点' },
                  ]}
                />
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SortedArrayToBSTVisualizer;
