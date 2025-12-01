import { BookOpen } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { GraphTemplate, GraphNodeState, GraphEdgeState } from "@/components/visualizers/templates/GraphTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateCourseScheduleSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface CourseScheduleInput extends ProblemInput {
  numCourses: string;
  prerequisites: string;
}

function CourseScheduleVisualizer() {
  return (
    <ConfigurableVisualizer<CourseScheduleInput, Record<string, any>>
      config={{
        defaultInput: { 
          numCourses: "4",
          prerequisites: "[[1,0],[2,0],[3,1],[3,2]]"
        },
        algorithm: (input) => {
          const numCourses = parseInt(input.numCourses);
          const prerequisites = JSON.parse(input.prerequisites) as number[][];
          return generateCourseScheduleSteps(numCourses, prerequisites);
        },

        inputTypes: [
          { type: "string", key: "numCourses", label: "课程数量" },
          { type: "string", key: "prerequisites", label: "先修关系" }
        ],
        inputFields: [
          {
            type: "string",
            key: "numCourses",
            label: "课程数量",
            placeholder: "例如: 4",
          },
          {
            type: "string",
            key: "prerequisites",
            label: "先修关系（JSON格式）",
            placeholder: "例如: [[1,0],[2,0],[3,1],[3,2]]",
          },
        ],
        testCases: [
          { 
            label: "示例 1: 可完成", 
            value: { numCourses: "2", prerequisites: "[[1,0]]" } 
          },
          { 
            label: "示例 2: 有环", 
            value: { numCourses: "2", prerequisites: "[[1,0],[0,1]]" } 
          },
          { 
            label: "示例 3: 复杂图", 
            value: { numCourses: "4", prerequisites: "[[1,0],[2,0],[3,1],[3,2]]" } 
          },
        ],

        render: ({ variables }) => {
          const graphNodes = variables?.graphNodes as GraphNodeState[] | undefined;
          const graphEdges = variables?.graphEdges as GraphEdgeState[] | undefined;
          const inDegree = variables?.inDegree as number[] | undefined;
          const queue = variables?.queue as number[] | undefined;
          const completed = variables?.completed as number[] | undefined;
          const count = variables?.count as number | undefined;
          const success = variables?.success as boolean | undefined;
          const phase = variables?.phase as string | undefined;
          const coreIdea = getProblemCoreIdea(87);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">课程表 - 拓扑排序（BFS）</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-indigo-700">💡 核心思想：</span>
                    使用拓扑排序判断有向图是否存在环。从入度为0的节点开始BFS，每次移除一个节点并减少其邻居的入度。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">入度数组</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">BFS队列</span>
                  </div>
                </div>

                {/* 状态显示 */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  {/* 入度数组 */}
                  {inDegree && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-sm font-semibold text-gray-700 mb-2">入度数组</div>
                      <div className="flex flex-wrap gap-2">
                        {inDegree.map((deg, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-1 rounded text-sm font-mono ${
                              deg === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {idx}: {deg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BFS队列 */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      BFS队列 {queue && `(${queue.length})`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {queue && queue.length > 0 ? (
                        queue.map((course, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono"
                          >
                            {course}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm">空</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 完成状态 */}
                {completed && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      已完成课程 {count !== undefined && `(${count})`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {completed.map((course, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-mono"
                        >
                          {course}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {phase === 'result' && success !== undefined && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="text-center">
                      <div className={`font-bold text-lg mb-2 ${
                        success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {success ? '✓ 可以完成所有课程！' : '✗ 存在循环依赖，无法完成！'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 图可视化 */}
                {graphNodes && graphEdges && (
                  <GraphTemplate
                    nodes={graphNodes}
                    edges={graphEdges}
                    directed={true}
                    layout={{
                      type: 'hierarchical',
                      nodeSize: 50,
                      width: 800,
                      height: 450,
                    }}
                    renderNode={(node: GraphNodeState) => {
                      let bgColor = '';
                      let textColor = 'text-white';
                      let shadowStyle = '';

                      if (node.isCurrent) {
                        bgColor = 'bg-yellow-400';
                        shadowStyle = 'shadow-lg';
                      } else if (node.isProcessed) {
                        bgColor = 'bg-green-400';
                        shadowStyle = 'shadow-md';
                      } else if (node.isInQueue) {
                        bgColor = 'bg-blue-400';
                        shadowStyle = 'shadow-md';
                      } else {
                        bgColor = 'bg-gray-300';
                        textColor = 'text-gray-700';
                        shadowStyle = 'shadow-sm';
                      }

                      return (
                        <div
                          className={`
                            w-full h-full rounded-full flex flex-col items-center justify-center
                            transition-colors duration-300
                            ${bgColor} ${textColor} ${shadowStyle}
                          `}
                        >
                          <div className="font-bold text-base">{node.id}</div>
                          {node.inDegree !== undefined && (
                            <div className="text-xs mt-0.5">
                              d:{node.inDegree}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                )}

                {/* 图例 */}
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-md"></div>
                    <span>当前处理</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-400 rounded-full shadow-md"></div>
                    <span>队列中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-400 rounded-full shadow-md"></div>
                    <span>已完成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full shadow-sm"></div>
                    <span className="text-gray-600">未处理</span>
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

export default CourseScheduleVisualizer;
