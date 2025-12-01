import { Scissors } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { StringTemplate } from "@/components/visualizers/templates/StringTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generatePartitionLabelsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface PartitionLabelsInput extends ProblemInput {
  s: string;
}

function PartitionLabelsVisualizer() {
  return (
    <ConfigurableVisualizer<PartitionLabelsInput, Record<string, never>>
      config={{
        defaultInput: { s: "ababcbacadefegdehijhklij" },
        algorithm: (input) => generatePartitionLabelsSteps(input.s),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: ababcbacadefegdehijhklij" },
        ],
        testCases: [
          { label: "示例 1", value: { s: "ababcbacadefegdehijhklij" } },
          { label: "示例 2", value: { s: "eccbbbbdec" } },
          { label: "示例 3", value: { s: "ab" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PartitionLabelsInput;
          const s = input.s;
          const current = variables?.current as number | undefined;
          const start = variables?.start as number | undefined;
          const end = variables?.end as number | undefined;
          const result = variables?.result as number[] | undefined;
          const lastIndex = variables?.lastIndex as Map<string, number> | undefined;
          const segmentComplete = variables?.segmentComplete as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const coreIdea = getProblemCoreIdea(110);
          
          // 计算每个字符的最后位置
          const charLastPos = new Map<string, number>();
          if (lastIndex) {
            lastIndex.forEach((pos, char) => charLastPos.set(char, pos));
          } else {
            for (let i = 0; i < s.length; i++) {
              charLastPos.set(s[i], i);
            }
          }
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Scissors size={20} className="text-blue-600" />
                  划分字母区间
                </h3>
                <p className="text-sm text-gray-600">
                  贪心策略：记录每个字符最后出现的位置，维护当前片段的右边界，到达边界时完成一个片段。
                </p>
              </div>

              {/* 状态信息 */}
              {(start !== undefined || end !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {start !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">片段起始</div>
                        <div className="text-2xl font-bold text-blue-600">{start}</div>
                      </div>
                    )}
                    {end !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">片段边界</div>
                        <div className="text-2xl font-bold text-green-600">{end}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">字符串状态</h4>
                <StringTemplate
                  data={s}
                  renderChar={(char, index) => {
                    const isCurrent = current === index;
                    const isStart = start === index;
                    const isEnd = end === index;
                    const isInSegment = start !== undefined && end !== undefined && index >= start && index <= end;
                    const charLastPos = lastIndex?.get(char) || (() => {
                      let last = index;
                      for (let i = index + 1; i < s.length; i++) {
                        if (s[i] === char) last = i;
                      }
                      return last;
                    })();
                    const isLastOccurrence = charLastPos === index;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {/* 标签 */}
                        {(isStart || isEnd || isCurrent) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              isStart ? "bg-blue-500 text-white" :
                              isEnd ? "bg-green-500 text-white" :
                              "bg-yellow-500 text-white"
                            }`}
                          >
                            {isStart ? "start" : isEnd ? "end" : "当前"}
                          </motion.div>
                        )}

                        {/* 字符 */}
                        <motion.div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isCurrent && segmentComplete
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 scale-110 shadow-lg"
                              : isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-105 shadow-md"
                              : isStart || isEnd
                              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-md"
                              : isInSegment
                              ? "bg-gradient-to-br from-blue-400 to-blue-500"
                              : isLastOccurrence
                              ? "bg-gradient-to-br from-purple-400 to-purple-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isCurrent && segmentComplete ? 1.15 : isCurrent ? 1.05 : 1,
                          }}
                        >
                          {char}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isCurrent ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>

                        {/* 最后出现标记 */}
                        {isLastOccurrence && !isInSegment && (
                          <div className="absolute -bottom-4 text-xs text-purple-600 font-semibold">
                            最后
                          </div>
                        )}
                      </motion.div>
                    );
                  }}
                  getCharState={(index) => {
                    const isCurrent = current === index;
                    const isInSegment = start !== undefined && end !== undefined && index >= start && index <= end;
                    
                    return {
                      index,
                      isCurrent,
                      isPassed: current !== undefined && index < current,
                      isMatched: isInSegment,
                    };
                  }}
                  currentIndex={current}
                  layout={{ gap: "0.5rem", direction: "row", wrap: false }}
                />
              </div>

              {/* 划分结果 */}
              {result && result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">划分结果</h4>
                  <div className="flex gap-2 flex-wrap">
                    {result.map((length, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-lg font-bold"
                      >
                        {length}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！划分结果：[{result?.join(', ') || ''}]
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">当前片段</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">片段边界</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">最后出现</span>
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

export default PartitionLabelsVisualizer;

