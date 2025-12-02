import { Edit } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { DPTableTemplate, DPCellState } from "@/components/visualizers/templates/DPTableTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateEditDistanceSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface EditDistanceInput extends ProblemInput {
  word1: string;
  word2: string;
}

function EditDistanceVisualizer() {
  return (
    <ConfigurableVisualizer<EditDistanceInput, Record<string, never>>
      config={{
        defaultInput: { word1: "horse", word2: "ros" },
        algorithm: (input) => generateEditDistanceSteps(input.word1, input.word2),
        
        inputTypes: [],
        inputFields: [
          { type: "string", key: "word1", label: "字符串 word1", placeholder: "输入字符串，如: horse" },
          { type: "string", key: "word2", label: "字符串 word2", placeholder: "输入字符串，如: ros" },
        ],
        testCases: [
          { label: "示例 1", value: { word1: "horse", word2: "ros" } },
          { label: "示例 2", value: { word1: "intention", word2: "execution" } },
          { label: "示例 3", value: { word1: "abc", word2: "abc" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as EditDistanceInput;
          const word1 = input.word1;
          const word2 = input.word2;
          const dp = variables?.dp as number[][] | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const char1 = variables?.char1 as string | undefined;
          const char2 = variables?.char2 as string | undefined;
          const match = variables?.match as boolean | undefined;
          const fromDiag = variables?.fromDiag as number | undefined;
          const deleteOp = variables?.deleteOp as number | undefined;
          const insertOp = variables?.insertOp as number | undefined;
          const replaceOp = variables?.replaceOp as number | undefined;
          const phase = variables?.phase as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(118);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Edit size={20} className="text-blue-600" />
                  编辑距离（二维DP）
                </h3>
                <p className="text-sm text-gray-600">
                  dp[i][j]表示word1[0...i-1]转换为word2[0...j-1]的最少操作数。三种操作：删除、插入、替换。
                </p>
              </div>

              {/* DP表格可视化 */}
              {dp && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">DP表格</h4>
                  <DPTableTemplate
                    data={dp}
                    rowLabels={['', ...word1.split('')]}
                    colLabels={['', ...word2.split('')]}
                    renderCell={(cell: DPCellState) => {
                      const isCurrent = currentRow === cell.row && currentCol === cell.col;
                      const isDependency = phase === 'match' && fromDiag !== undefined &&
                        cell.row === currentRow! - 1 && cell.col === currentCol! - 1;
                      const isDependencyTop = phase === 'no_match' && deleteOp !== undefined &&
                        cell.row === currentRow! - 1 && cell.col === currentCol!;
                      const isDependencyLeft = phase === 'no_match' && insertOp !== undefined &&
                        cell.row === currentRow! && cell.col === currentCol! - 1;
                      const isDependencyDiag = phase === 'no_match' && replaceOp !== undefined &&
                        cell.row === currentRow! - 1 && cell.col === currentCol! - 1;
                      const value = cell.value as number;
                      
                      return (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`w-full h-full flex items-center justify-center rounded-lg border-2 font-bold transition-all ${
                            isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110 shadow-lg border-yellow-600"
                              : isDependency || isDependencyTop || isDependencyLeft || isDependencyDiag
                              ? "bg-gradient-to-br from-blue-300 to-blue-400 text-white scale-105 shadow-md border-blue-500"
                              : cell.row === 0 || cell.col === 0
                              ? "bg-gradient-to-br from-green-100 to-green-200 text-gray-800 border-green-300"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-gray-300"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg">{value}</div>
                            {(isDependency || isDependencyTop || isDependencyLeft || isDependencyDiag) && (
                              <div className="text-xs mt-0.5 opacity-80">
                                {isDependency ? '↖' : isDependencyTop ? '↑' : isDependencyLeft ? '←' : '↖'}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    }}
                    getCellState={(row, col) => {
                      const isCurrent = currentRow === row && currentCol === col;
                      const isDependency = phase === 'match' && fromDiag !== undefined &&
                        row === currentRow! - 1 && col === currentCol! - 1;
                      const isDependencyTop = phase === 'no_match' && deleteOp !== undefined &&
                        row === currentRow! - 1 && col === currentCol!;
                      const isDependencyLeft = phase === 'no_match' && insertOp !== undefined &&
                        row === currentRow! && col === currentCol! - 1;
                      const isDependencyDiag = phase === 'no_match' && replaceOp !== undefined &&
                        row === currentRow! - 1 && col === currentCol! - 1;
                      
                      return {
                        isCurrent,
                        isDependency: isDependency || isDependencyTop || isDependencyLeft || isDependencyDiag,
                        dependencies: isCurrent ? [
                          ...(phase === 'match' && fromDiag !== undefined ? [{ row: row - 1, col: col - 1, label: '↖' }] : []),
                          ...(phase === 'no_match' && deleteOp !== undefined ? [{ row: row - 1, col, label: '↑' }] : []),
                          ...(phase === 'no_match' && insertOp !== undefined ? [{ row, col: col - 1, label: '←' }] : []),
                          ...(phase === 'no_match' && replaceOp !== undefined ? [{ row: row - 1, col: col - 1, label: '↖' }] : []),
                        ] : undefined,
                      };
                    }}
                    layout={{ cellSize: 60, gap: 4 }}
                    showLabels={true}
                  />
                </div>
              )}

              {/* 当前计算说明 */}
              {char1 !== undefined && char2 !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前计算</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1">word1字符</div>
                      <div className="text-2xl font-bold text-blue-600">{char1}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-xs text-gray-600 mb-1">word2字符</div>
                      <div className="text-2xl font-bold text-purple-600">{char2}</div>
                    </div>
                  </div>
                  {match !== undefined && (
                    <div className={`rounded-lg p-3 border-2 ${
                      match
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className={`text-sm font-semibold mb-2 ${
                        match ? "text-green-700" : "text-red-700"
                      }`}>
                        {match ? '✓ 字符相同，无需操作' : '✗ 字符不同，需要操作'}
                      </div>
                      {match && fromDiag !== undefined && (
                        <div className="text-xs text-gray-600">
                          dp[{currentRow}][{currentCol}] = dp[{currentRow!-1}][{currentCol!-1}] = {fromDiag}
                        </div>
                      )}
                      {!match && deleteOp !== undefined && insertOp !== undefined && replaceOp !== undefined && (
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>删除操作：dp[{currentRow!-1}][{currentCol}] + 1 = {deleteOp} + 1 = {deleteOp + 1}</div>
                          <div>插入操作：dp[{currentRow}][{currentCol!-1}] + 1 = {insertOp} + 1 = {insertOp + 1}</div>
                          <div>替换操作：dp[{currentRow!-1}][{currentCol!-1}] + 1 = {replaceOp} + 1 = {replaceOp + 1}</div>
                          <div className="font-semibold text-gray-800 mt-2">
                            最小值：dp[{currentRow}][{currentCol}] = {dp?.[currentRow!]?.[currentCol!]}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                      ✓ 完成！编辑距离为 {result}
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

export default EditDistanceVisualizer;

