import { Crown } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSolveNQueensSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface SolveNQueensInput extends ProblemInput {
  n: number;
}

function SolveNQueensVisualizer() {
  return (
    <ConfigurableVisualizer<SolveNQueensInput, Record<string, never>>
      config={{
        defaultInput: { n: 4 },
        algorithm: (input) => generateSolveNQueensSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { type: "number", key: "n", label: "n", placeholder: "请输入n值（1-9）" },
        ],
        testCases: [
          { label: "示例 1", value: { n: 4 } },
          { label: "示例 2", value: { n: 1 } },
          { label: "示例 3", value: { n: 8 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SolveNQueensInput;
          const n = input.n;
          const board = variables?.board as string[] | undefined;
          const row = variables?.row as number | undefined;
          const col = variables?.col as number | undefined;
          const cols = variables?.cols as number[] | undefined;
          const diag1 = variables?.diag1 as number[] | undefined;
          const diag2 = variables?.diag2 as number[] | undefined;
          const conflict = variables?.conflict as boolean | undefined;
          const placed = variables?.placed as boolean | undefined;
          const found = variables?.found as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(124);
          
          // 构建棋盘矩阵
          const matrix: string[][] = [];
          for (let i = 0; i < n; i++) {
            const rowStr = board?.[i] || '.'.repeat(n);
            matrix.push(rowStr.split(''));
          }
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Crown size={20} className="text-blue-600" />
                  N 皇后（回溯算法）
                </h3>
                <p className="text-sm text-gray-600">
                  逐行放置皇后，使用三个集合记录已占用的列、主对角线、副对角线。
                </p>
              </div>

              {/* 状态信息 */}
              {(row !== undefined || cols !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {row !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">当前行</div>
                        <div className="text-2xl font-bold text-blue-600">{row}</div>
                      </div>
                    )}
                    {col !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">尝试列</div>
                        <div className="text-2xl font-bold text-purple-600">{col}</div>
                      </div>
                    )}
                    {cols && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">已占列</div>
                        <div className="text-lg font-bold text-green-600">[{cols.join(',')}]</div>
                      </div>
                    )}
                    {result !== undefined && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="text-xs text-gray-600 mb-1">找到解数</div>
                        <div className="text-2xl font-bold text-yellow-600">{result}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 棋盘可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">棋盘状态</h4>
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isQueen = cell.value === 'Q';
                    const isCurrent = row === cell.row && col === cell.col;
                    const isConflict = conflict && isCurrent;
                    const isPlaced = placed && isCurrent;
                    const isInCol = cols?.includes(cell.col);
                    const isInDiag1 = diag1?.includes(cell.row - cell.col);
                    const isInDiag2 = diag2?.includes(cell.row + cell.col);
                    const isAttacked = !isQueen && (isInCol || isInDiag1 || isInDiag2);
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex items-center justify-center rounded-lg transition-all ${
                          isQueen
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110 shadow-lg"
                            : isConflict
                            ? "bg-gradient-to-br from-red-400 to-red-500 text-white scale-105"
                            : isCurrent
                            ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white scale-105"
                            : isAttacked
                            ? "bg-gradient-to-br from-pink-200 to-pink-300 text-gray-700"
                            : (cell.row + cell.col) % 2 === 0
                            ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800"
                            : "bg-gradient-to-br from-white to-gray-50 text-gray-800"
                        }`}
                      >
                        {isQueen ? (
                          <Crown size={24} className="text-white" />
                        ) : (
                          <div className="text-xs font-bold">{cell.value}</div>
                        )}
                      </motion.div>
                    );
                  }}
                  layout={{ cellSize: 50, gap: 2 }}
                />
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！共找到 {result} 个解
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                      <Crown size={16} className="text-white" />
                    </div>
                    <span className="text-gray-700">皇后</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <span className="text-gray-700">冲突位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-pink-200 rounded"></div>
                    <span className="text-gray-700">被攻击位置</span>
                  </div>
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SolveNQueensVisualizer;

