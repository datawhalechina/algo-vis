import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateRotateImageSteps } from "./algorithm";

interface RotateImageInput {
  [key: string]: any;
  matrix: number[][];
}

interface RotateImageData {
  matrix?: number[][];
  originalMatrix?: number[][];
  phase?: string;
  currentRow?: number;
  swapPos1?: [number, number];
  swapPos2?: [number, number];
}

function RotateImageVisualizer() {
  return (
    <ConfigurableVisualizer<RotateImageInput, RotateImageData>
      config={{
        defaultInput: { matrix: [[1,2,3],[4,5,6],[7,8,9]] },
        algorithm: (input) => generateRotateImageSteps(input.matrix),
        
        inputTypes: [{ type: "array", key: "matrix", label: "矩阵" }],
        inputFields: [{ type: "string", key: "matrix", label: "矩阵（JSON格式）", placeholder: "例如: [[1,2,3],[4,5,6],[7,8,9]]" }],
        testCases: [
          { label: "示例 1", value: { matrix: [[1,2,3],[4,5,6],[7,8,9]] } },
          { label: "示例 2", value: { matrix: [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]] } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as RotateImageInput;
          const matrix = data.matrix || input.matrix;
          const phase = data.phase;
          const swapPos1 = data.swapPos1;
          const swapPos2 = data.swapPos2;
          const currentRow = data.currentRow;
          const coreIdea = getProblemCoreIdea(54);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <RotateCw size={20} className="text-blue-600" />
                  旋转图像（顺时针90度）
                </h3>
                <p className="text-sm text-gray-600">
                  两步旋转法：转置矩阵 + 翻转每一行。时间O(n²)，空间O(1)原地操作。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isSwap1 = swapPos1 && cell.row === swapPos1[0] && cell.col === swapPos1[1];
                    const isSwap2 = swapPos2 && cell.row === swapPos2[0] && cell.col === swapPos2[1];
                    const isCurrentRow = currentRow !== undefined && cell.row === currentRow;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex items-center justify-center text-lg font-bold rounded-lg ${
                          isSwap1 || isSwap2
                            ? 'bg-yellow-500 text-white scale-110'
                            : isCurrentRow && phase === 'reverse'
                            ? 'bg-purple-100 text-purple-700'
                            : phase === 'transpose'
                            ? 'bg-blue-100 text-blue-700'
                            : phase === 'complete'
                            ? 'bg-green-100 text-green-700'
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

              {phase && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前阶段</h4>
                  <div className="text-sm">
                    {phase === 'transpose' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">转置矩阵阶段</p>
                        <p className="text-blue-700">matrix[i][j] ↔ matrix[j][i]</p>
                      </div>
                    )}
                    {phase === 'reverse' && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900">翻转行阶段</p>
                        <p className="text-purple-700">matrix[i][j] ↔ matrix[i][n-1-j]</p>
                      </div>
                    )}
                    {phase === 'complete' && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-900">✓ 旋转完成！</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default RotateImageVisualizer;
