import { Apple } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate, GridCellState } from "@/components/visualizers/templates/GridTemplate";
import { generateRottenOrangesSteps, parseGrid } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface RottenOrangesInput extends ProblemInput {
  grid: string;
}

interface RottenOrangesData {
  grid?: number[][];
}

function RottenOrangesVisualizer() {
  return (
    <ConfigurableVisualizer<RottenOrangesInput, RottenOrangesData>
      config={{
        defaultInput: { grid: "2,1,1;1,1,0;0,1,1" },
        algorithm: (input) => {
          const grid = parseGrid(input.grid);
          return generateRottenOrangesSteps(grid);
        },

        inputTypes: [
          { type: "string", key: "grid", label: "网格（0=空，1=新鲜，2=腐烂）" }
        ],
        inputFields: [
          {
            type: "string",
            key: "grid",
            label: "网格（用;分隔行，用,分隔列）",
            placeholder: "例如: 2,1,1;1,1,0;0,1,1",
          },
        ],
        testCases: [
          { label: "示例 1", value: { grid: "2,1,1;1,1,0;0,1,1" } },
          { label: "示例 2", value: { grid: "2,1,1;0,1,1;1,0,1" } },
          { label: "无法腐烂", value: { grid: "0,2;1,0" } },
        ],

        render: ({ data, variables }) => {
          const grid = data.grid || [];
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const time = variables?.time as number | undefined;
          const freshCount = variables?.freshCount as number | undefined;
          const rottenCount = variables?.rottenCount as number | undefined;
          const completed = variables?.completed as boolean | undefined;
          const success = variables?.success as boolean | undefined;
          const result = variables?.result as number | undefined;
          const spreading = variables?.spreading as boolean | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Apple className="text-orange-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">腐烂的橘子 - 多源BFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-orange-700">💡 核心思想：</span>
                    多源BFS。将所有腐烂的橘子作为起点同时开始扩散，每分钟向四个方向传播。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">同时扩散</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">层序遍历</span>
                  </div>
                </div>

                {/* 状态显示 */}
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    {time !== undefined && (
                      <div>
                        <div className="text-gray-500 text-xs mb-1">经过时间</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{time} 分钟</div>
                      </div>
                    )}
                    {freshCount !== undefined && (
                      <div>
                        <div className="text-gray-500 text-xs mb-1">新鲜橘子</div>
                        <div className={`font-mono font-bold text-lg ${
                          freshCount > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {freshCount} 个
                        </div>
                      </div>
                    )}
                    {rottenCount !== undefined && (
                      <div>
                        <div className="text-gray-500 text-xs mb-1">腐烂橘子</div>
                        <div className="font-mono font-bold text-orange-600 text-lg">{rottenCount} 个</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 结果显示 */}
                {completed && result !== undefined && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="text-center">
                      <div className={`font-bold text-lg mb-2 ${
                        success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {success ? '✓ 完成！' : '✗ 失败！'}
                      </div>
                      <div className="text-gray-700">
                        {success 
                          ? `所有橘子在 ${result} 分钟后腐烂`
                          : `有 ${freshCount} 个橘子无法腐烂（返回 -1）`
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* 网格可视化 */}
                <GridTemplate
                  data={grid}
                  renderCell={(cell: GridCellState) => {
                    const row = cell.row;
                    const col = cell.col;
                    const value = cell.value as number;
                    const isCurrent = row === currentRow && col === currentCol;

                    let bgColor = 'bg-gray-100';
                    let icon = '';
                    let textColor = 'text-gray-500';

                    if (value === 2) {
                      bgColor = isCurrent && spreading
                        ? 'bg-yellow-500'
                        : 'bg-orange-500';
                      icon = '🍊';
                      textColor = 'text-white';
                    } else if (value === 1) {
                      bgColor = 'bg-green-500';
                      icon = '🍊';
                      textColor = 'text-white';
                    } else {
                      icon = '⬜';
                    }

                    return (
                      <div
                        className={`
                          ${bgColor} ${textColor}
                          border-2 ${isCurrent ? 'border-yellow-600 ring-2 ring-yellow-300' : 'border-gray-300'}
                          rounded-lg
                          flex items-center justify-center
                          text-2xl
                          transition-all duration-300
                          ${isCurrent ? 'scale-110 shadow-lg' : ''}
                        `}
                        style={{
                          width: '100%',
                          height: '100%',
                          minHeight: '50px',
                        }}
                      >
                        {icon}
                      </div>
                    );
                  }}
                  layout={{
                    cellSize: 60,
                    gap: 8,
                  }}
                />

                {/* 图例 */}
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-lg">🍊</div>
                    <span>新鲜橘子</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-lg">🍊</div>
                    <span>腐烂橘子</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">⬜</div>
                    <span>空格子</span>
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

export default RottenOrangesVisualizer;
