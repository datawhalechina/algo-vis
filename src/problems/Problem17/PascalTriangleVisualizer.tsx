import { generatePascalTriangleSteps } from "./algorithm";
import { motion } from "framer-motion";
import { Triangle, CheckCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";

interface PascalTriangleInput extends ProblemInput {
  numRows: number;
}

interface PascalTriangleData {
  triangle?: number[][];
  currentRow?: number[];
}

function PascalTriangleVisualizer() {
  return (
    <ConfigurableVisualizer<PascalTriangleInput, PascalTriangleData>
      config={{
        defaultInput: { numRows: 5 },
        algorithm: (input) => generatePascalTriangleSteps(input.numRows),
        
        inputTypes: [{ type: "number", key: "numRows", label: "行数" }],
        inputFields: [{ type: "number", key: "numRows", label: "行数 numRows", placeholder: "输入行数，如: 5" }],
        testCases: [
          { label: "示例 1", value: { numRows: 5 } },
          { label: "示例 2", value: { numRows: 1 } },
          { label: "示例 3", value: { numRows: 7 } },
          { label: "示例 4", value: { numRows: 10 } },
        ],
        
        customStepVariables: (variables) => {
          const currentRow = variables?.currentRow as number | undefined;
          const col = variables?.col as number | undefined;
          const value = variables?.value as number | undefined;
          const leftParent = variables?.leftParent as number | undefined;
          const rightParent = variables?.rightParent as number | undefined;
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {currentRow !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">当前行</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{currentRow + 1}</span>
                </div>
              )}
              {col !== undefined && (
                <div>
                  <span className="font-mono text-purple-600 font-semibold">列</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{col}</span>
                </div>
              )}
              {value !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">值</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{value}</span>
                </div>
              )}
              {leftParent !== undefined && rightParent !== undefined && (
                <div className="col-span-2">
                  <span className="font-mono text-orange-600 font-semibold">计算</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">
                    {leftParent} + {rightParent} = {value}
                  </span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { triangle = [], currentRow = [] } = data;
          const currentRowIndex = getNumberVariable('currentRow');
          const col = getNumberVariable('col');
          const finished = getBooleanVariable('finished');
          const isBorder = getBooleanVariable('isBorder');

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <Triangle className="text-blue-600" size={20} />
                杨辉三角
              </h3>
              
              <div className="flex flex-col items-center gap-2">
                {(triangle as number[][]).map((row: number[], rowIndex: number) => {
                  const isCurrentRow = currentRowIndex === rowIndex;
                  return (
                    <motion.div
                      key={rowIndex}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.1 }}
                      className="flex gap-2"
                    >
                      {row.map((num: number, colIndex: number) => {
                        const isCurrentCol = isCurrentRow && col === colIndex;
                        const isBorderCell = colIndex === 0 || colIndex === rowIndex;
                        
                        return (
                          <motion.div
                            key={colIndex}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: rowIndex * 0.1 + colIndex * 0.05, type: "spring" }}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border-2 ${
                              isCurrentCol && isBorder
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600 shadow-lg'
                                : isCurrentCol
                                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg'
                                : isBorderCell
                                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700'
                                : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-700'
                            }`}
                          >
                            {num}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  );
                })}

                {/* 当前正在生成的行 */}
                {!finished && currentRow && (currentRow as number[]).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 mt-2"
                  >
                    {(currentRow as number[]).map((num: number, colIndex: number) => {
                      const isCurrentCol = col === colIndex;
                      return (
                        <motion.div
                          key={colIndex}
                          initial={{ scale: 0 }}
                          animate={{ scale: isCurrentCol ? 1.1 : 1 }}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border-2 ${
                            isCurrentCol && isBorder
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600 shadow-xl'
                              : isCurrentCol
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-xl'
                              : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 border-gray-400'
                          }`}
                        >
                          {num}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl p-6 shadow-xl text-center text-white"
                >
                  <CheckCircle className="mx-auto mb-3" size={48} />
                  <div className="text-2xl font-bold">生成完成！</div>
                  <div className="mt-2 text-lg">共 {(triangle as number[][]).length} 行</div>
                </motion.div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default PascalTriangleVisualizer;
