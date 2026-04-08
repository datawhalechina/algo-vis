import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateTextSimilaritySteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface TextSimilarityInput extends ProblemInput {
  text1: string;
  text2: string;
}

function getHeatColor(val: number): string {
  const w = Math.max(0, Math.min(val, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 70%, ${88 - w * 30}%)`;
}

function TextSimilarityVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10041);

  return (
    <ConfigurableVisualizer<TextSimilarityInput, Record<string, never>>
      config={{
        defaultInput: { text1: "机器学习很有趣", text2: "深度学习很精彩" },

        algorithm: (input) => {
          const t1 = String(input.text1 || "机器学习很有趣");
          const t2 = String(input.text2 || "深度学习很精彩");
          return generateTextSimilaritySteps(t1, t2);
        },

        inputTypes: [
          { type: "string", key: "text1", label: "文本 1" },
          { type: "string", key: "text2", label: "文本 2" },
        ],
        inputFields: [
          { type: "string", key: "text1", label: "文本 1", placeholder: "机器学习很有趣" },
          { type: "string", key: "text2", label: "文本 2", placeholder: "深度学习很精彩" },
        ],

        testCases: [
          { label: "语义相似", value: { text1: "机器学习很有趣", text2: "深度学习很精彩" } },
          { label: "语义相异", value: { text1: "自然语言处理", text2: "计算机视觉" } },
          { label: "完全相同", value: { text1: "机器学习", text2: "机器学习" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const text1 = (variables?.text1 as string) ?? "";
          const text2 = (variables?.text2 as string) ?? "";
          const vec1 = variables?.vec1 as number[] | undefined;
          const vec2 = variables?.vec2 as number[] | undefined;
          const cosSim = variables?.cosSim as number | undefined;
          const edSim = variables?.edSim as number | undefined;
          const ed = variables?.ed as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            vector1: { label: "文本1向量化", color: "bg-blue-100 text-blue-700" },
            vector2: { label: "文本2向量化", color: "bg-violet-100 text-violet-700" },
            cosine: { label: "余弦相似度", color: "bg-amber-100 text-amber-700" },
            edit: { label: "编辑距离", color: "bg-orange-100 text-orange-700" },
            complete: { label: "计算完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">文本相似度计算</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\cos(v_1, v_2) = \frac{v_1 \cdot v_2}{\|v_1\|\|v_2\|} \quad d_{edit}(s,t) = \min(\text{ins+del+sub})" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 两段文本 */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-lg border-2 p-4 shadow-sm ${vec1 ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">文本 1</h4>
                  <p className="text-base font-medium text-gray-900">"{text1}"</p>
                  {vec1 && (
                    <div className="mt-2">
                      <p className="text-[10px] text-gray-500 mb-1">向量表示</p>
                      <div className="flex gap-1">
                        {vec1.map((v, i) => (
                          <div key={i} className="flex flex-col items-center gap-0.5">
                            <div className="w-8 h-8 rounded text-[9px] flex items-center justify-center font-mono"
                              style={{ backgroundColor: getHeatColor(v), color: v > 0.5 ? "#fff" : "#1e3a5f" }}>
                              {v.toFixed(2)}
                            </div>
                            <span className="text-[8px] text-gray-400">d{i}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`rounded-lg border-2 p-4 shadow-sm ${vec2 ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-white"}`}>
                  <h4 className="text-sm font-semibold text-violet-800 mb-2">文本 2</h4>
                  <p className="text-base font-medium text-gray-900">"{text2}"</p>
                  {vec2 && (
                    <div className="mt-2">
                      <p className="text-[10px] text-gray-500 mb-1">向量表示</p>
                      <div className="flex gap-1">
                        {vec2.map((v, i) => (
                          <div key={i} className="flex flex-col items-center gap-0.5">
                            <div className="w-8 h-8 rounded text-[9px] flex items-center justify-center font-mono"
                              style={{ backgroundColor: getHeatColor(v), color: v > 0.5 ? "#fff" : "#4c1d95" }}>
                              {v.toFixed(2)}
                            </div>
                            <span className="text-[8px] text-gray-400">d{i}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 余弦相似度 */}
              {cosSim !== undefined && ["cosine", "edit", "complete"].includes(phase) && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">余弦相似度（语义层面）</h4>
                  <BlockMath math={`\\cos(v_1, v_2) = \\frac{v_1 \\cdot v_2}{\\|v_1\\|\\|v_2\\|} = ${cosSim.toFixed(4)}`} />
                  <div className="mt-2 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="h-4 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${Math.round(cosSim * 100)}%` }} />
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    {cosSim > 0.8 ? "高度相似（同一语义域）" : cosSim > 0.5 ? "中度相似（有共同主题）" : "低相似度（语义差异大）"}
                  </p>
                </div>
              )}

              {/* 编辑距离 */}
              {edSim !== undefined && ["edit", "complete"].includes(phase) && (
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-orange-800 mb-2">编辑距离（字符层面）</h4>
                  <BlockMath math={`d_{edit}(\\text{text}_1, \\text{text}_2) = ${ed}`} />
                  <p className="text-xs text-orange-700 mt-1">
                    字符串相似度 = 1 - {ed}/{Math.max(text1.length, text2.length)} = {edSim?.toFixed(4)}
                  </p>
                </div>
              )}

              {/* 综合比较 */}
              {phase === "complete" && cosSim !== undefined && edSim !== undefined && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">方法对比</h4>
                  <table className="text-sm w-full">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="text-left pb-1">方法</th>
                        <th className="text-left pb-1">得分</th>
                        <th className="text-left pb-1">适用场景</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-amber-700 font-medium">余弦相似度</td>
                        <td className="font-mono">{cosSim.toFixed(4)}</td>
                        <td className="text-xs text-gray-600">语义搜索、推荐系统</td>
                      </tr>
                      <tr>
                        <td className="text-orange-700 font-medium">编辑距离相似度</td>
                        <td className="font-mono">{edSim.toFixed(4)}</td>
                        <td className="text-xs text-gray-600">拼写检查、重复检测</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入文本" },
                    { id: "vector1", label: "② 文本1向量化" },
                    { id: "vector2", label: "③ 文本2向量化" },
                    { id: "cosine", label: "④ 余弦相似度" },
                    { id: "edit", label: "⑤ 编辑距离" },
                    { id: "complete", label: "⑥ 对比结果" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "vector1", "vector2", "cosine", "edit", "complete"];
                    const isDone = order.indexOf(phase) >= order.indexOf(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-2 py-1.5 rounded-lg font-medium ${
                          step.id === phase ? "bg-blue-600 text-white shadow-sm" :
                          isDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default TextSimilarityVisualizer;
