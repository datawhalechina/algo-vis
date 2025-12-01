import { Search } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSearchMatrixSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface SearchMatrixInput extends ProblemInput {
  matrix: number[][];
  target: number;
}

function SearchMatrixVisualizer() {
  return (
    <ConfigurableVisualizer<SearchMatrixInput, Record<string, never>>
      config={{
        defaultInput: { matrix: [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target: 5 },
        algorithm: (input) => generateSearchMatrixSteps(input.matrix, input.target),
        
        inputTypes: [],
        inputFields: [
          { type: "string", key: "matrix", label: "矩阵（JSON格式）", placeholder: '例如: [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]]' },
          { type: "number", key: "target", label: "目标值 target", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { matrix: [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target: 5 } },
          { label: "示例 2", value: { matrix: [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target: 3 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SearchMatrixInput;
          const matrix = input.matrix;
          const target = input.target;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const row = variables?.row as number | undefined;
          const col = variables?.col as number | undefined;
          const found = variables?.found as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const coreIdea = getProblemCoreIdea(123);
          const n = matrix[0]?.length || 0;
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Search size={20} className="text-blue-600" />
                  搜索二维矩阵（二分查找）
                </h3>
                <p className="text-sm text-gray-600">
                  将二维矩阵视为一维数组进行二分查找。行索引 = mid / n，列索引 = mid % n。
                </p>
              </div>

              {/* 状态信息 */}
              {(left !== undefined || right !== undefined || mid !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">二分查找状态</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {left !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">left</div>
                        <div className="text-2xl font-bold text-blue-600">{left}</div>
                      </div>
                    )}
                    {mid !== undefined && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="text-xs text-gray-600 mb-1">mid</div>
                        <div className="text-2xl font-bold text-yellow-600">{mid}</div>
                      </div>
                    )}
                    {right !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">right</div>
                        <div className="text-2xl font-bold text-purple-600">{right}</div>
                      </div>
                    )}
                  </div>
                  {row !== undefined && col !== undefined && (
                    <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-600 mb-1">矩阵位置</div>
                      <div className="text-xl font-bold text-green-600">({row}, {col})</div>
                    </div>
                  )}
                </div>
              )}

              {/* 矩阵可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">矩阵状态</h4>
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isCurrent = row === cell.row && col === cell.col;
                    const isTarget = cell.value === target;
                    const midValue = mid !== undefined ? Math.floor(mid / n) === cell.row && mid % n === cell.col : false;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-all ${
                          isCurrent && found
                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white scale-110 shadow-lg"
                            : isCurrent
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110 shadow-lg"
                            : isTarget
                            ? "bg-gradient-to-br from-red-400 to-red-500 text-white"
                            : midValue
                            ? "bg-gradient-to-br from-blue-300 to-blue-400 text-white"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="text-lg font-bold">{cell.value}</div>
                        {isCurrent && (
                          <div className="text-xs mt-1 opacity-80">
                            mid={mid}
                          </div>
                        )}
                      </motion.div>
                    );
                  }}
                  layout={{ cellSize: 70, gap: 4 }}
                />
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className={`text-center p-4 rounded-lg border-2 ${
                    found
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                      : "bg-gradient-to-r from-red-100 to-rose-100 border-red-300"
                  }`}>
                    <div className={`font-semibold text-lg ${
                      found ? "text-green-700" : "text-red-700"
                    }`}>
                      {found ? `✓ 找到目标值！位置 (${row}, ${col})` : `✗ 未找到目标值 ${target}`}
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

export default SearchMatrixVisualizer;

