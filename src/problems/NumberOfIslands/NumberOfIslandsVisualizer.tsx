import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Network } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate, GridCellState } from "@/components/visualizers/templates/GridTemplate";
import { generateNumberOfIslandsSteps, parseGrid } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface NumberOfIslandsInput extends ProblemInput {
  grid: string; // 输入格式："11000,11000,00100,00011"
}

// 岛屿单元格组件（处理 GSAP 动画）
function IslandCell({ cell }: { cell: GridCellState }) {
  const cellRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  
  const isLand = cell.value === '1';
  const isCurrent = cell.isCurrent || false;
  const isVisited = cell.isVisited || false;
  const isInCurrentIsland = cell.isInRegion || false;

  let bgColor = 'bg-gray-200';
  let borderColor = 'border-gray-300';
  let textColor = 'text-gray-600';
  let shadow = '';

  if (isLand) {
    if (isCurrent) {
      bgColor = 'bg-yellow-500';
      borderColor = 'border-yellow-600';
      textColor = 'text-white';
      shadow = 'shadow-lg shadow-yellow-500/50';
    } else if (isInCurrentIsland) {
      bgColor = 'bg-blue-500';
      borderColor = 'border-blue-600';
      textColor = 'text-white';
      shadow = 'shadow-md';
    } else if (isVisited) {
      bgColor = 'bg-green-500';
      borderColor = 'border-green-600';
      textColor = 'text-white';
      shadow = 'shadow-sm';
    } else {
      bgColor = 'bg-gray-400';
      borderColor = 'border-gray-500';
      textColor = 'text-white';
    }
  }

  // GSAP 动画：当前单元格高亮
  useEffect(() => {
    if (isCurrent && cellRef.current) {
      gsap.to(cellRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (cellRef.current) {
      gsap.to(cellRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isCurrent]);

  // 脉冲动画
  useEffect(() => {
    if (isCurrent && pulseRef.current) {
      gsap.to(pulseRef.current, {
        scale: 1.4,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "power2.inOut",
      });
      
      return () => {
        if (pulseRef.current) {
          gsap.killTweensOf(pulseRef.current);
        }
      };
    }
  }, [isCurrent]);

  return (
    <div
      ref={cellRef}
      className={`
        ${bgColor} ${borderColor} ${textColor} ${shadow}
        border-2 rounded-lg
        flex items-center justify-center
        font-bold text-base
        transition-colors duration-300
        relative
      `}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {isLand ? '1' : '0'}
      {isCurrent && (
        <div
          ref={pulseRef}
          className="absolute inset-0 border-4 border-yellow-300 rounded-lg pointer-events-none"
          style={{ opacity: 0.8 }}
        />
      )}
    </div>
  );
}

interface NumberOfIslandsData {
  grid: number[][];
  visited: boolean[][];
  currentIsland: number[][];
  islandId?: number;
}

const code = `function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let islandCount = 0;
  
  function dfs(row: number, col: number) {
    if (row < 0 || row >= rows || col < 0 || col >= cols 
        || grid[row][col] === '0') {
      return;
    }
    
    grid[row][col] = '0'; // 标记为已访问
    
    // 四个方向DFS
    dfs(row - 1, col);
    dfs(row + 1, col);
    dfs(row, col - 1);
    dfs(row, col + 1);
  }
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        islandCount++;
        dfs(i, j);
      }
    }
  }
  
  return islandCount;
}`;

function NumberOfIslandsVisualizer() {
  const [showCode, setShowCode] = useState<boolean>(false);

  return (
    <ConfigurableVisualizer<NumberOfIslandsInput, NumberOfIslandsData>
      config={{
        defaultInput: { grid: "11000,11000,00100,00011" },
        algorithm: (input) => {
          const grid = parseGrid(input.grid);
          return generateNumberOfIslandsSteps(grid);
        },
        
        inputTypes: [
          { type: "string", key: "grid", label: "网格" },
        ],
        inputFields: [
          { 
            type: "string", 
            key: "grid", 
            label: "网格（用逗号分隔行，空格或逗号分隔列）", 
            placeholder: "例如: 11000,11000,00100,00011" 
          },
        ],
        testCases: [
          { label: "示例 1", value: { grid: "11000,11000,00100,00011" } },
          { label: "示例 2", value: { grid: "11110,11010,11000,00000" } },
          { label: "示例 3", value: { grid: "111,010,111" } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600 font-semibold">{key}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="font-mono text-gray-800 font-semibold">
                        {JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ data, getNumberVariable }) => {
          const grid = data.grid || [];
          const visited = data.visited || [];
          const currentIsland = data.currentIsland || [];
          const islandId = getNumberVariable('islandId');
          const islandCount = getNumberVariable('islandCount') || 0;
          const currentRow = getNumberVariable('row');
          const currentCol = getNumberVariable('col');

          // 转换为字符串数组用于 GridTemplate
          const gridData = grid.map(row => row.map(cell => String(cell)));

          return (
            <>
              {/* 网格可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="text-primary-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">岛屿数量可视化</h3>
                  </div>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {showCode ? "隐藏代码" : "查看代码"}
                  </button>
                </div>

                {/* 当前状态 */}
                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                    <span className="font-semibold text-gray-700">岛屿数量：</span>
                    <span className="font-mono text-green-700 font-bold text-lg">{islandCount}</span>
                    {islandId !== undefined && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="font-semibold text-gray-700">当前岛屿：</span>
                        <span className="font-mono text-blue-700 font-bold">{islandId}</span>
                      </>
                    )}
                    {currentRow !== undefined && currentCol !== undefined && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="font-semibold text-gray-700">当前位置：</span>
                        <span className="font-mono text-purple-700">[{currentRow}, {currentCol}]</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 使用 GridTemplate */}
                <GridTemplate
                  data={gridData}
                  getCellState={(row, col, value) => {
                    const isLand = value === '1';
                    const isVisited = visited[row]?.[col] || false;
                    const isCurrent = currentRow === row && currentCol === col;
                    const isInCurrentIsland = currentIsland.some(
                      ([r, c]) => r === row && c === col
                    );

                    return {
                      isCurrent,
                      isVisited: isLand && isVisited,
                      isInRegion: isLand && isInCurrentIsland,
                      value,
                    };
                  }}
                  renderCell={(cell) => <IslandCell cell={cell} />}
                  layout={{
                    maxWidth: 800,
                    maxHeight: 600,
                    gap: 6,
                  }}
                  animation={{
                    cell: {
                      hidden: { scale: 0, opacity: 0, rotate: -180 },
                      visible: { scale: 1, opacity: 1, rotate: 0 },
                    },
                    duration: 0.4,
                    staggerDelay: 0.02,
                  }}
                  emptyMessage="网格为空"
                />

                {/* 图例 */}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-gray-400 rounded shadow-sm"></div>
                    <span className="text-gray-700 font-medium">未访问的陆地</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                    <span className="text-gray-700 font-medium">当前岛屿</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                    <span className="text-gray-700 font-medium">已访问的陆地</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded shadow-sm"></div>
                    <span className="text-gray-700 font-medium">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className="w-4 h-4 bg-gray-200 rounded shadow-sm"></div>
                    <span className="text-gray-700 font-medium">水域</span>
                  </div>
                </div>
              </div>

              {/* 代码显示 */}
              {showCode && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">DFS解法代码</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800">{code}</code>
                  </pre>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default NumberOfIslandsVisualizer;

