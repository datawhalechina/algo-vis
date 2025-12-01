import { Network } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TrieTemplate, TrieNodeState, TrieEdgeState } from "@/components/visualizers/templates/TrieTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateTrieSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface TrieInput extends ProblemInput {
  operations: string;
  values: string;
}

function TrieVisualizer() {
  return (
    <ConfigurableVisualizer<TrieInput, Record<string, any>>
      config={{
        defaultInput: { 
          operations: '["Trie","insert","search","search","startsWith","insert","search"]',
          values: '["","apple","apple","app","app","app","app"]'
        },
        algorithm: (input) => {
          const operations = JSON.parse(input.operations) as string[];
          const values = JSON.parse(input.values) as (string | null)[];
          return generateTrieSteps(operations, values);
        },

        inputTypes: [
          { type: "string", key: "operations", label: "操作序列" },
          { type: "string", key: "values", label: "参数序列" }
        ],
        inputFields: [
          {
            type: "string",
            key: "operations",
            label: "操作序列（JSON格式）",
            placeholder: '例如: ["Trie","insert","search"]',
          },
          {
            type: "string",
            key: "values",
            label: "参数序列（JSON格式）",
            placeholder: '例如: ["","apple","apple"]',
          },
        ],
        testCases: [
          { 
            label: "示例 1", 
            value: { 
              operations: '["Trie","insert","search","search","startsWith","insert","search"]',
              values: '["","apple","apple","app","app","app","app"]'
            } 
          },
          { 
            label: "示例 2: 多单词", 
            value: { 
              operations: '["Trie","insert","insert","search","startsWith"]',
              values: '["","hello","world","hello","wo"]'
            } 
          },
        ],

        render: ({ variables }) => {
          const nodes = variables?.nodes as TrieNodeState[] | undefined;
          const edges = variables?.edges as TrieEdgeState[] | undefined;
          const operation = variables?.operation as string | undefined;
          const word = variables?.word as string | undefined;
          const prefix = variables?.prefix as string | undefined;
          const result = variables?.result as boolean | undefined;
          const completed = variables?.completed as boolean | undefined;
          const coreIdea = getProblemCoreIdea(88);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="text-emerald-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">实现 Trie (前缀树)</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-emerald-700">💡 核心思想：</span>
                    Trie是一种多叉树结构，用于高效存储和检索字符串。通过共享公共前缀节省空间。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">多叉树</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">O(m)时间</span>
                  </div>
                </div>

                {/* 操作信息 */}
                {operation && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      当前操作: <span className="text-blue-600">{operation}</span>
                    </div>
                    {word && (
                      <div className="text-sm text-gray-600">
                        单词: <span className="font-mono font-bold text-blue-600">{word}</span>
                      </div>
                    )}
                    {prefix && (
                      <div className="text-sm text-gray-600">
                        前缀: <span className="font-mono font-bold text-blue-600">{prefix}</span>
                      </div>
                    )}
                    {completed && result !== undefined && (
                      <div className={`mt-2 text-sm font-semibold ${
                        result ? 'text-green-600' : 'text-red-600'
                      }`}>
                        结果: {result ? '✓ 找到' : '✗ 未找到'}
                      </div>
                    )}
                  </div>
                )}

                {/* Trie树可视化 */}
                {nodes && edges && (
                  <TrieTemplate
                    nodes={nodes}
                    edges={edges}
                    layout={{
                      nodeSize: 45,
                      levelHeight: 100,
                      nodeSpacing: 80,
                      width: 900,
                      height: 500,
                    }}
                    renderNode={(node: TrieNodeState) => {
                      let bgColor = '';
                      let textColor = 'text-white';
                      let shadowStyle = '';

                      if (node.isCurrent) {
                        bgColor = 'bg-yellow-400';
                        shadowStyle = 'shadow-lg';
                      } else if (node.isMatched) {
                        bgColor = 'bg-green-400';
                        shadowStyle = 'shadow-md';
                      } else if (node.isInPath) {
                        bgColor = 'bg-blue-400';
                        shadowStyle = 'shadow-md';
                      } else if (node.isEnd) {
                        bgColor = 'bg-emerald-300';
                        textColor = 'text-emerald-800';
                        shadowStyle = 'shadow-sm';
                      } else {
                        bgColor = 'bg-gray-200';
                        textColor = 'text-gray-700';
                        shadowStyle = 'shadow-sm';
                      }

                      return (
                        <div
                          className={`
                            w-full h-full rounded-full flex flex-col items-center justify-center
                            transition-all duration-300
                            ${bgColor} ${textColor} ${shadowStyle}
                          `}
                        >
                          {node.char === 'root' ? (
                            <div className="text-xs font-bold">根</div>
                          ) : (
                            <div className="font-bold text-base">{node.char}</div>
                          )}
                          {node.isEnd && node.char !== 'root' && (
                            <div className="text-xs mt-0.5">✓</div>
                          )}
                        </div>
                      );
                    }}
                  />
                )}

                {/* 图例 */}
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-lg"></div>
                    <span>当前访问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-400 rounded-full shadow-md"></div>
                    <span>路径中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-400 rounded-full shadow-md"></div>
                    <span>匹配成功</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-300 rounded-full shadow-sm"></div>
                    <span>单词结尾</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full shadow-sm"></div>
                    <span className="text-gray-600">普通节点</span>
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

export default TrieVisualizer;
