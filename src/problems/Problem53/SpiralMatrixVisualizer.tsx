import { motion } from "framer-motion";
import { Repeat } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSpiralMatrixSteps } from "./algorithm";

interface SpiralMatrixInput {
  [key: string]: any;
  matrix: number[][];
}

interface SpiralMatrixData {
  matrix?: number[][];
  result?: number[];
  currentRow?: number;
  currentCol?: number;
  visited?: boolean[][];
  direction?: string;
}

function SpiralMatrixVisualizer() {

  return (
    <ConfigurableVisualizer<SpiralMatrixInput, SpiralMatrixData>
      config={{
        defaultInput: { matrix: [[1,2,3],[4,5,6],[7,8,9]] },
        algorithm: (input) => generateSpiralMatrixSteps(input.matrix),
        
        inputTypes: [{ type: "array", key: "matrix", label: "矩阵" }],
        inputFields: [{ type: "string", key: "matrix", label: "矩阵（JSON格式）", placeholder: "例如: [[1,2,3],[4,5,6],[7,8,9]]" }],
        testCases: [
          { label: "示例 1", value: { matrix: [[1,2,3],[4,5,6],[7,8,9]] } },
          { label: "示例 2", value: { matrix: [[1,2,3,4],[5,6,7,8],[9,10,11,12]] } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as SpiralMatrixInput;
          const matrix = data.matrix || input.matrix;
          const result = data.result || [];
          const currentRow = data.currentRow;
          const currentCol = data.currentCol;
          const visited = data.visited || [];
          const coreIdea = getProblemCoreIdea(53);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Repeat size={20} className="text-blue-600" />
                  螺旋矩阵
                </h3>
                <p className="text-sm text-gray-600">
                  按照顺时针螺旋顺序遍历：右→下→左→上。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isCurrent = cell.row === currentRow && cell.col === currentCol;
                    const isVisited = visited[cell.row]?.[cell.col];
                    const order = result.indexOf(cell.value as number);
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex flex-col items-center justify-center text-lg font-bold rounded-lg ${
                          isCurrent
                            ? 'bg-blue-500 text-white scale-110'
                            : isVisited
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div>{cell.value}</div>
                        {order >= 0 && <div className="text-xs">#{order + 1}</div>}
                      </motion.div>
                    );
                  }}
                  layout={{ cellSize: 60, gap: 4 }}
                />
              </div>

              {result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">螺旋顺序</h4>
                  <div className="flex gap-2 flex-wrap">
                    {result.map((val, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-12 h-12 flex items-center justify-center border-2 border-blue-400 bg-blue-50 rounded font-bold text-blue-700"
                      >
                        {val}
                      </motion.div>
                    ))}
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

export default SpiralMatrixVisualizer;
