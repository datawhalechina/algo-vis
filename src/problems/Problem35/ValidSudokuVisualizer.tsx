import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateValidSudokuSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ValidSudokuInput extends ProblemInput {
  board: string[][];
}

function ValidSudokuVisualizer() {
  const defaultBoard = [
    ["5","3",".",".","7",".",".",".","."],
    ["6",".",".","1","9","5",".",".","."],
    [".","9","8",".",".",".",".","6","."],
    ["8",".",".",".","6",".",".",".","3"],
    ["4",".",".","8",".","3",".",".","1"],
    ["7",".",".",".","2",".",".",".","6"],
    [".","6",".",".",".",".","2","8","."],
    [".",".",".","4","1","9",".",".","5"],
    [".",".",".",".","8",".",".","7","9"]
  ];

  return (
    <ConfigurableVisualizer<ValidSudokuInput, { board?: string[][] }>
      config={{
        defaultInput: { board: defaultBoard },
        algorithm: (input) => generateValidSudokuSteps(input.board),
        
        inputTypes: [],
        inputFields: [],
        testCases: [
          { label: "有效数独", value: { board: defaultBoard } },
        ],
        
        render: ({ variables }) => {
          const board = variables?.board as string[][] | undefined;
          const row = variables?.row as number | undefined;
          const col = variables?.col as number | undefined;
          const block = variables?.block as number | undefined;
          const valid = variables?.valid as boolean | undefined;
          const coreIdea = getProblemCoreIdea(35);

          if (!board) return null;

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">有效的数独</h3>

                <div className="flex justify-center">
                  <div className="grid grid-cols-9 gap-0 border-4 border-gray-800">
                    {board.map((r, i) =>
                      r.map((cell, j) => {
                        const isHighlighted = (row === i && col !== undefined) || 
                                             (col === j && row !== undefined) ||
                                             (block !== undefined && 
                                              Math.floor(i / 3) === Math.floor(block / 3) &&
                                              Math.floor(j / 3) === (block % 3));
                        const isCurrent = row === i && col === j;

                        return (
                          <motion.div
                            key={`${i}-${j}`}
                            className={`w-10 h-10 flex items-center justify-center font-bold text-lg border border-gray-300 ${
                              isCurrent ? "bg-red-200" :
                              isHighlighted ? "bg-yellow-100" :
                              "bg-white"
                            } ${
                              j % 3 === 2 && j !== 8 ? "border-r-2 border-r-gray-800" : ""
                            } ${
                              i % 3 === 2 && i !== 8 ? "border-b-2 border-b-gray-800" : ""
                            }`}
                            animate={{
                              scale: isCurrent ? 1.1 : 1,
                            }}
                          >
                            {cell !== '.' ? cell : ''}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {valid !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-lg border-2 ${
                      valid 
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                        : "bg-gradient-to-r from-red-100 to-rose-100 border-red-300"
                    }`}
                  >
                    <div className={`text-center font-semibold ${
                      valid ? "text-green-700" : "text-red-700"
                    }`}>
                      {valid ? "✓ 数独有效！" : "✗ 数独无效！"}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default ValidSudokuVisualizer;
