import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateMachineTranslationSteps, DEFAULT_TRANSLATION } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface MachineTranslationInput extends ProblemInput {
  sampleIdx: number;
}

function getHeatColor(weight: number): string {
  const w = Math.max(0, Math.min(weight, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 70%, ${88 - w * 30}%)`;
}

function MachineTranslationVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10045);

  return (
    <ConfigurableVisualizer<MachineTranslationInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: () => generateMachineTranslationSteps(DEFAULT_TRANSLATION),

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例", min: 0, max: 0 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例（固定）", placeholder: "0" }],

        testCases: [{ label: "英译中", value: { sampleIdx: 0 } }],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sourceTokens = (variables?.sourceTokens as string[]) ?? DEFAULT_TRANSLATION.sourceTokens;
          const targetTokens = (variables?.targetTokens as string[]) ?? DEFAULT_TRANSLATION.targetTokens;
          const sourceLang = (variables?.sourceLang as string) ?? DEFAULT_TRANSLATION.sourceLang;
          const targetLang = (variables?.targetLang as string) ?? DEFAULT_TRANSLATION.targetLang;
          const alignmentWeights = (variables?.alignmentWeights as unknown as number[][]) ?? [];
          const currentStep = variables?.currentStep as number | undefined;
          const currentWeights = currentStep !== undefined ? alignmentWeights[currentStep] ?? [] : [];

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            "src-embed": { label: "源语言嵌入", color: "bg-blue-100 text-blue-700" },
            encoding: { label: "编码", color: "bg-blue-100 text-blue-700" },
            decoding: { label: "解码生成", color: "bg-emerald-100 text-emerald-700" },
            complete: { label: "翻译完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const isDecoding = ["decoding", "complete"].includes(phase);
          const showAlignment = isDecoding && alignmentWeights.length > 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">神经机器翻译（NMT）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="P(y_1,\ldots,y_m|x_1,\ldots,x_n) = \prod_{t=1}^{m} P(y_t|y_{<t}, \text{Attn}(s_t, H))" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 翻译对 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-semibold">{sourceLang}</span>
                    <span className="text-xs text-gray-500">源语言</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sourceTokens.map((token, i) => {
                      const weight = currentWeights[i] ?? 0;
                      const isHighlighted = isDecoding && weight > 0.3;
                      return (
                        <div key={i}
                          className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${isHighlighted ? "shadow-md scale-105" : ""}`}
                          style={{
                            borderColor: isDecoding ? getHeatColor(weight) : "#93c5fd",
                            backgroundColor: isDecoding ? getHeatColor(weight) + "40" : "white",
                          }}
                        >
                          {token}
                          {isDecoding && <div className="text-[9px] text-center font-mono text-gray-500">{weight.toFixed(2)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-semibold">{targetLang}</span>
                    <span className="text-xs text-gray-500">目标语言</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {targetTokens.map((token, i) => {
                      const isGenerated = currentStep !== undefined ? i <= currentStep : phase === "complete";
                      const isCurrent = i === currentStep && phase === "decoding";
                      return (
                        <div key={i} className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                          isCurrent ? "border-emerald-500 bg-emerald-200 shadow-lg scale-105" :
                          isGenerated ? "border-emerald-300 bg-white text-emerald-800" :
                          "border-gray-200 bg-gray-50 text-gray-300"
                        }`}>
                          {isGenerated ? token : "?"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 注意力对齐矩阵 */}
              {showAlignment && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    注意力对齐矩阵 <InlineMath math="\alpha_{t,i}" />（行=目标词，列=源词）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          <td className="w-8" />
                          {sourceTokens.map((t, i) => (
                            <td key={i} className="text-center pb-2 font-medium text-blue-700 px-1">{t}</td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {alignmentWeights.map((row, t) => {
                          const isCurrentRow = t === currentStep;
                          return (
                            <tr key={t}>
                              <td className={`pr-2 font-medium ${isCurrentRow ? "text-emerald-700" : "text-gray-500"}`}>
                                {targetTokens[t]}
                              </td>
                              {row.map((weight, s) => (
                                <td key={s}
                                  className={`w-14 h-10 text-center font-mono border border-white/60 rounded transition-all ${isCurrentRow ? "ring-1 ring-emerald-400" : ""}`}
                                  style={{ backgroundColor: getHeatColor(weight), color: weight > 0.5 ? "#fff" : "#1e3a5f" }}
                                >
                                  {weight.toFixed(2)}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                    <span className="w-4 h-2 rounded inline-block" style={{ background: getHeatColor(0) }} />低
                    <span className="w-4 h-2 rounded inline-block" style={{ background: getHeatColor(1) }} />高
                  </div>
                </div>
              )}

              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">翻译完成</h4>
                  <p className="text-sm text-emerald-700">
                    "{sourceTokens.join(" ")}" ({sourceLang}) → "{targetTokens.join("")}" ({targetLang})
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "src-embed", label: "② 源语言嵌入" },
                    { id: "encoding", label: "③ 编码器" },
                    { id: "decoding", label: "④ 注意力解码" },
                    { id: "complete", label: "⑤ 翻译完成" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "src-embed", "encoding", "decoding", "complete"];
                    const isDone = order.indexOf(phase) >= order.indexOf(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium ${
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

export default MachineTranslationVisualizer;
