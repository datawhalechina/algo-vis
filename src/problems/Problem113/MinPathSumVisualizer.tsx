import { Navigation } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMinPathSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface MinPathSumInput extends ProblemInput {
  grid: number[][];
}

function MinPathSumVisualizer() {
  return (
    <ConfigurableVisualizer<MinPathSumInput, Record<string, never>>
      config={{
        defaultInput: { grid: [[1,3,1],[1,5,1],[4,2,1]] },
        algorithm: (input) => generateMinPathSumSteps(input.grid),
        
        inputTypes: [],
        inputFields: [
          { type: "string", key: "grid", label: "网格（JSON格式）", placeholder: '例如: [[1,3,1],[1,5,1],[4,2,1]]' },
        ],
        testCases: [
          { label: "示例 1", value: { grid: [[1,3,1],[1,5,1],[4,2,1]] } },
          { label: "示例 2", value: { grid: [[1,2,3],[4,5,6]] } },
          { label: "示例 3", value: { grid: [[1,2],[1,1]] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as MinPathSumInput;
          const grid = input.grid;
          const dp = variables?.dp as number[][] | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const fromTop = variables?.fromTop as number | undefined;
          const fromLeft = variables?.fromLeft as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const phase = variables?.phase as string | undefined;
          const coreIdea = getProblemCoreIdea(113);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Navigation size={20} className="text-blue-600" />
                  最小路径和（二维DP）
                </h3>
                <p className="text-sm text-gray-600">
                  dp[i][j]表示到达(i,j)的最小路径和，只能从上方或左方来。
                </p>
              </div>

              {/* 网格可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">网格状态</h4>
                <GridTemplate
                  data={grid}
                  renderCell={(cell) => {
                    const isCurrent = currentRow === cell.row && currentCol === cell.col;
                    const isFromTop = fromTop !== undefined && currentRow === cell.row && currentCol === cell.col && phase === 'dp';
                    const isFromLeft = fromLeft !== undefined && currentRow === cell.row && currentCol === cell.col && phase === 'dp';
                    const dpValue = dp?.[cell.row]?.[cell.col];
                    const gridValue = cell.value as number;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-all ${
                          isCurrent
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110 shadow-lg"
                            : "bg-gradient-to-br from-blue-100 to-blue-200 text-gray-800"
                        }`}
                      >
                        <div className="text-lg font-bold">{gridValue}</div>
                        {dpValue !== undefined && (
                          <div className={`text-xs mt-1 ${
                            isCurrent ? "text-yellow-100" : "text-blue-700"
                          }`}>
                            dp={dpValue}
                          </div>
                        )}
                        {(isFromTop || isFromLeft) && (
                          <div className="text-xs mt-1 text-orange-300">
                            {isFromTop ? "↑" : "←"}
                          </div>
                        )}
                      </motion.div>
                    );
                  }}
                  layout={{ cellSize: 80, gap: 4 }}
                />
              </div>

              {/* DP值说明 */}
              {fromTop !== undefined && fromLeft !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前计算</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1">从上方来</div>
                      <div className="text-xl font-bold text-blue-600">{fromTop}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-xs text-gray-600 mb-1">从左方来</div>
                      <div className="text-xl font-bold text-purple-600">{fromLeft}</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">最小值</div>
                    <div className="text-xl font-bold text-green-600">{Math.min(fromTop, fromLeft)}</div>
                  </div>
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！最小路径和为 {result}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default MinPathSumVisualizer;

