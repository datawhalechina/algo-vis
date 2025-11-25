import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate } from "@/components/visualizers/templates/GridTemplate";
import { generateSearchMatrix2Steps } from "./algorithm";

interface SearchMatrix2Input {
  [key: string]: any;
  matrix: number[][];
  target: number;
}

interface SearchMatrix2Data {
  matrix?: number[][];
  target?: number;
  row?: number;
  col?: number;
  currentValue?: number;
  found?: boolean;
  direction?: string;
}

function SearchMatrix2Visualizer() {
  return (
    <ConfigurableVisualizer<SearchMatrix2Input, SearchMatrix2Data>
      config={{
        defaultInput: { 
          matrix: [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], 
          target: 5 
        },
        algorithm: (input) => generateSearchMatrix2Steps(input.matrix, input.target),
        
        inputTypes: [
          { type: "array", key: "matrix", label: "矩阵" },
          { type: "number", key: "target", label: "目标值" }
        ],
        inputFields: [
          { type: "string", key: "matrix", label: "矩阵（JSON格式）", placeholder: "例如: [[1,4],[2,5]]" },
          { type: "number", key: "target", label: "目标值", placeholder: "例如: 5" }
        ],
        testCases: [
          { label: "示例 1", value: { matrix: [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target: 5 } },
          { label: "示例 2", value: { matrix: [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target: 20 } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as SearchMatrix2Input;
          const matrix = data.matrix || input.matrix;
          const target = data.target ?? input.target;
          const currentRow = data.row;
          const currentCol = data.col;
          const found = data.found;
          const direction = data.direction;
          
          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Search size={20} className="text-blue-600" />
                  搜索二维矩阵 II
                </h3>
                <p className="text-sm text-gray-600">
                  从Z字形搜索：从右上角开始，利用矩阵的行递增、列递增特性。时间O(m+n)，空间O(1)。
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">目标值:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">{target}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <GridTemplate
                  data={matrix}
                  renderCell={(cell) => {
                    const isCurrent = cell.row === currentRow && cell.col === currentCol;
                    const isFound = isCurrent && found;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-full h-full flex items-center justify-center text-lg font-bold rounded-lg ${
                          isFound
                            ? 'bg-green-500 text-white scale-125 shadow-lg'
                            : isCurrent
                            ? 'bg-yellow-500 text-white scale-110'
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

              {direction && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">移动方向</h4>
                  <div className="text-sm">
                    {direction === 'left' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">← 向左移动</p>
                        <p className="text-blue-700">当前值大于目标，向左减小</p>
                      </div>
                    )}
                    {direction === 'down' && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900">↓ 向下移动</p>
                        <p className="text-purple-700">当前值小于目标，向下增大</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {found !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">搜索结果</h4>
                  {found ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">✓ 找到目标值！</p>
                      <p className="text-green-700">位置: [{currentRow}, {currentCol}]</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-900">✗ 未找到目标值</p>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default SearchMatrix2Visualizer;
