import { motion } from "framer-motion";
import { Grid } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { generateSetMatrixZeroesSteps } from "./algorithm";

interface SetMatrixZeroesInput {
  [key: string]: any;
  matrix: number[][];
}

interface SetMatrixZeroesData {
  matrix?: number[][];
  originalMatrix?: number[][];
  currentRow?: number;
  currentCol?: number;
  markedRow?: number;
  markedCol?: number;
  completed?: boolean;
}

function SetMatrixZeroesVisualizer() {
  return (
    <ConfigurableVisualizer<SetMatrixZeroesInput, SetMatrixZeroesData>
      config={{
        defaultInput: { matrix: [[1,1,1],[1,0,1],[1,1,1]] },
        algorithm: (input) => generateSetMatrixZeroesSteps(input.matrix),
        
        inputTypes: [{ type: "array", key: "matrix", label: "矩阵" }],
        inputFields: [{ type: "string", key: "matrix", label: "矩阵（JSON格式）", placeholder: "例如: [[1,1,1],[1,0,1],[1,1,1]]" }],
        testCases: [
          { label: "示例 1", value: { matrix: [[1,1,1],[1,0,1],[1,1,1]] } },
          { label: "示例 2", value: { matrix: [[0,1,2,0],[3,4,5,2],[1,3,1,5]] } },
          { label: "示例 3", value: { matrix: [[1,2,3],[4,0,6],[7,8,9]] } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as SetMatrixZeroesInput;
          const matrix = data.matrix || input.matrix;
          const currentRow = data.currentRow;
          const currentCol = data.currentCol;
          const markedRow = data.markedRow;
          const markedCol = data.markedCol;
          
          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Grid size={20} className="text-blue-600" />
                  矩阵置零
                </h3>
                <p className="text-sm text-gray-600">
                  将包含0的行和列全部置零。使用第一行和第一列作为标记数组，空间复杂度O(1)。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isZero = cell.value === 0;
                    const isCurrent = cell.row === currentRow && cell.col === currentCol;
                    const isMarkedRow = cell.row === markedRow;
                    const isMarkedCol = cell.col === markedCol;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex items-center justify-center text-lg font-bold rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-blue-500 text-white scale-110'
                            : isZero
                            ? 'bg-red-500 text-white'
                            : isMarkedRow || isMarkedCol
                            ? 'bg-yellow-200 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cell.value}
                      </motion.div>
                    );
                  }}
                  layout={{ cellSize: 60, gap: 4 }}
                />
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SetMatrixZeroesVisualizer;
