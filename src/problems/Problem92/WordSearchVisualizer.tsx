import { Search } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GridTemplate, GridCellState } from "@/components/visualizers/templates/GridTemplate";
import { generateWordSearchSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface WordSearchInput extends ProblemInput {
  board: string;
  word: string;
}

function WordSearchVisualizer() {
  return (
    <ConfigurableVisualizer<WordSearchInput, Record<string, any>>
      config={{
        defaultInput: { 
          board: '["ABCE","SFCS","ADEE"]',
          word: "ABCCED"
        },
        algorithm: (input) => {
          const board = JSON.parse(input.board) as string[][];
          return generateWordSearchSteps(board, input.word);
        },

        inputTypes: [
          { type: "string", key: "board", label: "board" },
          { type: "string", key: "word", label: "word" },
        ],
        inputFields: [
          {
            type: "string",
            key: "board",
            label: "字符网格（JSON格式）",
            placeholder: '例如: ["ABC","DEF","GHI"]',
          },
          {
            type: "string",
            key: "word",
            label: "搜索单词",
            placeholder: "例如: ABCD",
          },
        ],
        testCases: [
          { 
            label: "示例 1", 
            value: { 
              board: '["ABCE","SFCS","ADEE"]',
              word: "ABCCED"
            } 
          },
          { 
            label: "示例 2", 
            value: { 
              board: '["ABCE","SFCS","ADEE"]',
              word: "SEE"
            } 
          },
          { 
            label: "示例 3", 
            value: { 
              board: '["ABCE","SFCS","ADEE"]',
              word: "ABCB"
            } 
          },
        ],

        render: ({ variables }) => {
          const board = variables?.board as string[][] | undefined;
          const word = variables?.word as string | undefined;
          const path = variables?.path as [number, number][] | undefined;
          const wordIndex = variables?.wordIndex as number | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const visited = variables?.visited as boolean[][] | undefined;
          const found = variables?.found as boolean | undefined;
          const backtrack = variables?.backtrack as boolean | undefined;

          if (!board || !word) {
            return <div className="text-gray-500">加载中...</div>;
          }

          // 判断单元格是否在路径中
          const isInPath = (row: number, col: number): boolean => {
            return path?.some(([r, c]) => r === row && c === col) || false;
          };

          // 判断单元格是否被访问过
          const isVisitedCell = (row: number, col: number): boolean => {
            return visited?.[row]?.[col] || false;
          };

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="text-orange-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">单词搜索（回溯）</h3>
                </div>

                <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-orange-700">💡 核心思想：</span>
                    使用DFS+回溯在网格中搜索单词。从匹配首字母的位置开始，向四个方向递归搜索。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">DFS</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">回溯</span>
                  </div>
                </div>

                {/* 搜索信息 */}
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">目标单词：</span>
                      <span className="ml-2 font-mono font-bold text-lg text-blue-600">{word}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">进度：</span>
                      <span className="ml-2 font-bold text-lg text-purple-600">
                        {wordIndex ?? 0} / {word.length}
                      </span>
                    </div>
                    {found !== undefined && (
                      <div className={`font-bold text-lg ${found ? 'text-green-600' : 'text-red-600'}`}>
                        {found ? '✓ 找到' : '✗ 未找到'}
                      </div>
                    )}
                  </div>
                  {/* 单词进度条 */}
                  <div className="mt-3 flex gap-1">
                    {word.split('').map((char, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-10 rounded flex items-center justify-center font-bold text-lg ${
                          wordIndex !== undefined && idx < wordIndex
                            ? 'bg-green-500 text-white'
                            : idx === wordIndex
                            ? 'bg-yellow-400 text-gray-800'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 网格可视化 */}
                <GridTemplate
                  data={board}
                  layout={{
                    cellSize: 60,
                    gap: 4,
                  }}
                  getCellState={(row, col, value) => {
                    const isCurrent = row === currentRow && col === currentCol;
                    const inPath = isInPath(row, col);
                    const visitedCell = isVisitedCell(row, col);
                    
                    return {
                      row,
                      col,
                      value,
                      isCurrent,
                      isHighlighted: inPath,
                      isVisited: visitedCell,
                    };
                  }}
                  renderCell={(cell: GridCellState) => {
                    let bgColor = 'bg-gray-100';
                    let textColor = 'text-gray-700';
                    let borderColor = 'border-gray-300';
                    let shadowStyle = '';

                    if (cell.isCurrent) {
                      bgColor = backtrack ? 'bg-red-400' : 'bg-yellow-400';
                      textColor = 'text-gray-900';
                      borderColor = 'border-yellow-600';
                      shadowStyle = 'shadow-lg';
                    } else if (cell.isHighlighted) {
                      bgColor = 'bg-green-500';
                      textColor = 'text-white';
                      borderColor = 'border-green-600';
                      shadowStyle = 'shadow-md';
                    } else if (cell.isVisited) {
                      bgColor = 'bg-blue-200';
                      textColor = 'text-blue-800';
                      borderColor = 'border-blue-400';
                    }

                    return (
                      <div
                        className={`
                          w-full h-full rounded-lg border-2 flex items-center justify-center
                          transition-all duration-300
                          ${bgColor} ${textColor} ${borderColor} ${shadowStyle}
                        `}
                      >
                        <div className="font-bold text-2xl">{cell.value}</div>
                      </div>
                    );
                  }}
                />

                {/* 图例 */}
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded border-2 border-yellow-600 shadow-lg"></div>
                    <span>当前访问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-600 shadow-md"></div>
                    <span>路径中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-200 rounded border-2 border-blue-400"></div>
                    <span>已访问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-400 rounded border-2 border-red-600 shadow-lg"></div>
                    <span>回溯</span>
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

export default WordSearchVisualizer;
