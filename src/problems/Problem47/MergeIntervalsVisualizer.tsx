import { motion } from "framer-motion";
import { Combine } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMergeIntervalsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MergeIntervalsInput extends ProblemInput {
  intervals: number[][];
  [key: string]: any;
}

interface MergeIntervalsData {
  intervals?: number[][];
}

function MergeIntervalsVisualizer() {
  return (
    <ConfigurableVisualizer<MergeIntervalsInput, MergeIntervalsData>
      config={{
        defaultInput: { intervals: [[1,3],[2,6],[8,10],[15,18]] },
        algorithm: (input) => generateMergeIntervalsSteps(input.intervals),
        
        inputTypes: [
          { type: "array", key: "intervals", label: "区间数组" },
        ],
        inputFields: [
          { type: "array", key: "intervals", label: "区间数组", placeholder: "输入区间，如: 1,3,2,6,8,10,15,18 (每两个数一组)" },
        ],
        testCases: [
          { label: "示例 1", value: { intervals: [[1,3],[2,6],[8,10],[15,18]] } },
          { label: "示例 2", value: { intervals: [[1,4],[4,5]] } },
          { label: "示例 3", value: { intervals: [[1,4],[2,3]] } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as MergeIntervalsInput;
          const sortedIntervals = (variables?.sortedIntervals || input.intervals) as number[][];
          const currentIndex = getNumberVariable('i');
          const last = variables?.last as number[] | undefined;
          const overlap = variables?.overlap as boolean | undefined;
          const result = variables?.result as number[][] | undefined;
          const coreIdea = getProblemCoreIdea(47);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 排序后的区间可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Combine size={20} className="text-blue-600" />
                  排序后的区间
                </h3>
                
                {overlap !== undefined && (
                  <div className={`mb-4 p-3 rounded-lg border-2 ${
                    overlap 
                      ? "bg-green-50 border-green-500" 
                      : "bg-gray-50 border-gray-300"
                  }`}>
                    <div className="text-center font-mono text-sm">
                      <span className="font-semibold">当前判断：</span>
                      {overlap ? (
                        <span className="ml-2 text-green-700 font-bold">
                          ✓ 区间重叠，合并！
                        </span>
                      ) : (
                        <span className="ml-2 text-gray-700 font-bold">
                          ✗ 区间不重叠，添加到结果
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                  {sortedIntervals.map((interval: number[], index: number) => {
                    const isCurrent = currentIndex === index;
                    const isLast = last && interval[0] === last[0] && interval[1] === last[1];

                    return (
                      <motion.div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                          isCurrent
                            ? "bg-yellow-50 border-yellow-500 shadow-lg"
                            : isLast
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-200"
                        }`}
                        animate={{ 
                          scale: isCurrent || isLast ? 1.02 : 1
                        }}
                      >
                        <div className="flex-shrink-0 w-8 text-center text-gray-500 font-mono">
                          {index}
                        </div>
                        
                        <div className="flex-1 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            isCurrent ? "bg-yellow-500" : isLast ? "bg-blue-500" : "bg-gray-300"
                          }`}></div>
                          
                          <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <motion.div
                              className={`absolute h-full rounded-lg ${
                                isCurrent 
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                  : isLast
                                  ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                  : "bg-gradient-to-r from-purple-400 to-purple-500"
                              }`}
                              style={{
                                left: `${interval[0] * 4}%`,
                                width: `${(interval[1] - interval[0]) * 4}%`,
                              }}
                            />
                          </div>
                          
                          <div className={`font-mono font-bold text-sm ${
                            isCurrent ? "text-yellow-700" : isLast ? "text-blue-700" : "text-gray-700"
                          }`}>
                            [{interval[0]}, {interval[1]}]
                          </div>
                        </div>
                        
                        {isCurrent && (
                          <div className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            当前
                          </div>
                        )}
                        {isLast && !isCurrent && (
                          <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            最后
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 合并结果 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">合并后的区间</h3>
                {result && result.length > 0 ? (
                  <div className="space-y-3">
                    {result.map((interval, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200"
                      >
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="flex-1 relative h-8 bg-green-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 rounded-lg"
                            style={{
                              left: `${interval[0] * 4}%`,
                              width: `${(interval[1] - interval[0]) * 4}%`,
                            }}
                          />
                        </div>
                        <div className="font-mono font-bold text-green-700">
                          [{interval[0]}, {interval[1]}]
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                      <span className="font-semibold">合并后区间数：</span>
                      <span className="ml-2 font-mono text-green-600 font-bold">{result.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">等待开始合并...</div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default MergeIntervalsVisualizer;
