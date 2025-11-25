import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateRemoveNthFromEndSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface RemoveNthFromEndInput extends ProblemInput {
  list: number[];
  n: number;
}

interface RemoveNthFromEndData {
  list?: number[];
  n?: number;
  fast?: number;
  slow?: number;
  result?: number[];
  removeIdx?: number;
  phase?: string;
}

function RemoveNthFromEndVisualizer() {
  return (
    <ConfigurableVisualizer<RemoveNthFromEndInput, RemoveNthFromEndData>
      config={{
        defaultInput: { list: [1, 2, 3, 4, 5], n: 2 },
        algorithm: (input) => generateRemoveNthFromEndSteps(input.list, input.n),
        
        inputTypes: [
          { type: "array", key: "list", label: "链表节点值" },
          { type: "number", key: "n", label: "倒数第n个" },
        ],
        inputFields: [
          { type: "array", key: "list", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 1,2,3,4,5" },
          { type: "number", key: "n", label: "倒数第n个", placeholder: "输入n的值" },
        ],
        testCases: [
          { label: "删除倒数第2个", value: { list: [1, 2, 3, 4, 5], n: 2 } },
          { label: "删除倒数第1个", value: { list: [1, 2], n: 1 } },
          { label: "删除唯一节点", value: { list: [1], n: 1 } },
        ],
        
        render: ({ data }) => {
          const state = data as RemoveNthFromEndData;
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, n, fast, slow, result, removeIdx, phase } = state;

          return (
            <div className="space-y-6">
              {!result && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {phase === 'fast-advance' && `快指针先走 (目标：走${n}步)`}
                    {phase === 'sync-advance' && '双指针同步前进'}
                    {!phase && `删除倒数第${n}个节点`}
                  </div>
                  <div className="flex items-center gap-2">
                    {list.map((val, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div
                          className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold ${
                            idx === removeIdx
                              ? 'border-red-500 bg-red-100 text-red-700 ring-2 ring-red-300'
                              : idx === slow
                              ? 'border-blue-500 bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                              : idx === fast
                              ? 'border-purple-500 bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          {val}
                        </div>
                        {idx < list.length - 1 && (
                          <div className="text-gray-400 font-bold">→</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 指针说明 */}
              {slow !== undefined && fast !== undefined && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>慢指针 (索引 {slow})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>快指针 (索引 {fast})</span>
                  </div>
                </div>
              )}

              {/* 结果链表 */}
              {result && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">删除后的链表</div>
                  <div className="flex items-center gap-2">
                    {result.map((val, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="w-14 h-14 flex items-center justify-center border-2 border-green-500 bg-green-100 text-green-700 rounded-lg font-bold">
                          {val}
                        </div>
                        {idx < result.length - 1 && (
                          <div className="text-gray-400 font-bold">→</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                  >
                    <div className="text-green-700 font-medium">
                      ✓ 成功删除倒数第{n}个节点
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default RemoveNthFromEndVisualizer;
