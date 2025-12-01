import { motion } from "framer-motion";
import { GitMerge, ArrowRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMergeKListsSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface MergeKListsInput extends ProblemInput {
  lists: number[][];
}

interface MergeKListsData {
  lists?: number[][];
  left?: number;
  right?: number;
  mid?: number;
  leftMerged?: number[];
  rightMerged?: number[];
  merged?: number[];
  result?: number[];
  completed?: boolean;
}

function MergeKListsVisualizer() {
  return (
    <ConfigurableVisualizer<MergeKListsInput, MergeKListsData>
      config={{
        defaultInput: {
          lists: [[1, 4, 5], [1, 3, 4], [2, 6]],
        },
        algorithm: (input) => generateMergeKListsSteps(input.lists),
        
        inputTypes: [],
        inputFields: [],
        testCases: [
          { 
            label: "示例1 (3个链表)", 
            value: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] } 
          },
          { 
            label: "示例2 (2个链表)", 
            value: { lists: [[1, 2, 4], [1, 3, 5]] } 
          },
          { 
            label: "示例3 (4个链表)", 
            value: { lists: [[1, 3], [2, 4], [5, 6], [7, 8]] } 
          },
          { 
            label: "空链表", 
            value: { lists: [] } 
          },
        ],
        
        render: ({ data }) => {
          const state = data as MergeKListsData;
          const coreIdea = getProblemCoreIdea(66);
          
          if (!state || !state.lists) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { lists, left, right, mid, leftMerged, rightMerged, merged, result, completed } = state;

          const colors = [
            'border-blue-500 bg-blue-100 text-blue-700',
            'border-purple-500 bg-purple-100 text-purple-700',
            'border-green-500 bg-green-100 text-green-700',
            'border-orange-500 bg-orange-100 text-orange-700',
            'border-pink-500 bg-pink-100 text-pink-700',
            'border-cyan-500 bg-cyan-100 text-cyan-700',
          ];

          return (
            <div className="space-y-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 标题说明 */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <GitMerge size={20} className="text-blue-600" />
                  合并K个升序链表
                </h3>
                <p className="text-sm text-gray-600">
                  使用分治法两两合并，时间复杂度 O(N log k)
                </p>
              </div>

              {/* 原始链表 */}
              {!completed && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-4 text-gray-700">
                    原始链表（共{lists.length}个）
                  </h4>
                  <div className="space-y-3">
                    {lists.map((list, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg border-2 ${
                          left !== undefined && right !== undefined && idx >= left && idx <= right
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-semibold text-gray-600 w-16">
                            链表 {idx}
                          </div>
                          <div className="flex items-center gap-2">
                            {list.map((val, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 font-bold ${colors[idx % colors.length]}`}>
                                  {val}
                                </div>
                                {i < list.length - 1 && (
                                  <ArrowRight size={16} className="text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 分治过程 */}
              {left !== undefined && right !== undefined && mid !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="text-sm font-medium text-blue-900">
                    🔄 分治：处理链表 [{left}..{right}]，中点 mid = {mid}
                  </div>
                </motion.div>
              )}

              {/* 合并过程 */}
              {leftMerged && rightMerged && merged && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h4 className="text-sm font-semibold mb-4 text-gray-700">🔀 合并操作</h4>
                  <div className="space-y-4">
                    {/* 左侧 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-2">左侧部分</div>
                      <div className="flex items-center gap-2">
                        {leftMerged.map((val, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-blue-400 bg-blue-50 text-blue-700 font-bold">
                              {val}
                            </div>
                            {i < leftMerged.length - 1 && (
                              <ArrowRight size={16} className="text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 右侧 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-2">右侧部分</div>
                      <div className="flex items-center gap-2">
                        {rightMerged.map((val, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-purple-400 bg-purple-50 text-purple-700 font-bold">
                              {val}
                            </div>
                            {i < rightMerged.length - 1 && (
                              <ArrowRight size={16} className="text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-2xl text-gray-400">↓</div>
                    
                    {/* 合并结果 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-2">合并结果</div>
                      <div className="flex items-center gap-2">
                        {merged.map((val, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-green-500 bg-green-100 text-green-700 font-bold">
                              {val}
                            </div>
                            {i < merged.length - 1 && (
                              <ArrowRight size={16} className="text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 最终结果 */}
              {completed && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h4 className="text-sm font-semibold mb-4 text-gray-700">✓ 最终合并结果</h4>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {result.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-orange-500 bg-orange-100 text-orange-700 font-bold"
                        >
                          {val}
                        </motion.div>
                        {i < result.length - 1 && (
                          <ArrowRight size={16} className="text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                  >
                    <div className="text-green-700 font-medium">
                      ✓ 成功合并 {lists.length} 个链表，结果包含 {result.length} 个节点
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* 算法说明 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2">💡 分治法思路</div>
                  <div className="space-y-1">
                    <div>1️⃣ 分解：将k个链表递归分成两组</div>
                    <div>2️⃣ 合并：递归合并左右两组</div>
                    <div>3️⃣ 组合：合并两个有序链表</div>
                    <div className="mt-2 text-xs">⏱️ 时间 O(N log k) | 💾 空间 O(log k)，N为总节点数</div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default MergeKListsVisualizer;
