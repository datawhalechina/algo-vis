import { Grid3x3 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";
import { uniquePathsSteps } from "./algorithm";

interface UniquePathsInput extends ProblemInput {
  m: number;
  n: number;
}

function UniquePathsVisualizer() {
  return (
    <ConfigurableVisualizer<UniquePathsInput, Record<string, any>>
      config={{
        defaultInput: { m: 3, n: 7 },
        algorithm: (input) => uniquePathsSteps(input.m, input.n),
        
        inputTypes: [
          { type: "number", key: "m", label: "m", min: 1, max: 10 },
          { type: "number", key: "n", label: "n", min: 1, max: 10 },
        ],
        inputFields: [
          { type: "number", key: "m", label: "行数 m", placeholder: "输入行数" },
          { type: "number", key: "n", label: "列数 n", placeholder: "输入列数" },
        ],
        testCases: [
          { label: "示例 1", value: { m: 3, n: 7 } },
          { label: "示例 2", value: { m: 3, n: 2 } },
          { label: "示例 3", value: { m: 3, n: 3 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as UniquePathsInput;
          const m = input.m;
          const n = input.n;
          const dp = variables?.dp as number[][] | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const result = variables?.result as number | undefined;

          const coreIdea = getProblemCoreIdea(107);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Grid3x3 className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">不同路径 - 二维动态规划</h3>
                </div>

              {/* 网格大小 */}
              <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
                <div className="text-center">
                  <div className="text-sm text-gray-700 mb-1">网格大小</div>
                  <div className="text-2xl font-bold text-blue-700">{m} × {n}</div>
                </div>
              </div>

              {/* DP网格 - 使用 GridTemplate */}
              {dp && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">DP网格（到达各位置的路径数）</div>
                  <GridTemplate
                    data={dp}
                    renderCell={(cell) => {
                      const isActive = currentRow === cell.row && currentCol === cell.col;
                      const isStart = cell.row === 0 && cell.col === 0;
                      const isEnd = cell.row === m - 1 && cell.col === n - 1;
                      
                      return (
                        <div
                          className="w-full h-full rounded flex flex-col items-center justify-center border-2 font-bold transition-all"
                          style={{
                            backgroundColor: isActive 
                              ? '#a78bfa' 
                              : isStart 
                              ? '#86efac' 
                              : isEnd 
                              ? '#fbbf24' 
                              : '#e0e7ff',
                            borderColor: isActive 
                              ? '#7c3aed' 
                              : isStart 
                              ? '#16a34a' 
                              : isEnd 
                              ? '#f59e0b' 
                              : '#c7d2fe',
                            color: isActive ? '#ffffff' : '#4338ca',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <div className="text-xs opacity-70">({cell.row},{cell.col})</div>
                          <div className="text-lg">{cell.value}</div>
                        </div>
                      );
                    }}
                    getCellState={(row, col) => ({
                      isCurrent: currentRow === row && currentCol === col,
                    })}
                    layout={{
                      cellSize: 56,
                      gap: 4,
                    }}
                    animation={{
                      duration: 0.4,
                      staggerDelay: 0.03,
                    }}
                    renderLegend={() => (
                      <div className="flex gap-4 justify-center mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-green-300 border border-green-600"></div>
                          <span>起点</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-yellow-300 border border-yellow-600"></div>
                          <span>终点</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-purple-400 border border-purple-700"></div>
                          <span>当前</span>
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}

              {/* 最终结果 */}
              {result !== undefined && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">不同路径总数</div>
                    <div className="text-4xl font-bold text-green-700">{result}</div>
                  </div>
                </div>
              )}
            </div>
            </>
          );
        },
      }}
    />
  );
}

export default UniquePathsVisualizer;
