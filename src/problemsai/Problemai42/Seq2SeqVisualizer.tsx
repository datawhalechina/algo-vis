import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateSeq2SeqSteps, DEFAULT_SEQ2SEQ } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface Seq2SeqInput extends ProblemInput {
  sampleIdx: number;
}

function getHeatColor(val: number): string {
  const w = Math.max(0, Math.min(val, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 70%, ${88 - w * 30}%)`;
}

function Seq2SeqVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10042);

  return (
    <ConfigurableVisualizer<Seq2SeqInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: () => generateSeq2SeqSteps(DEFAULT_SEQ2SEQ),

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例", min: 0, max: 0 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例（固定示例）", placeholder: "0" }],

        testCases: [{ label: "英译中示例", value: { sampleIdx: 0 } }],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const inputTokens = (variables?.inputTokens as string[]) ?? DEFAULT_SEQ2SEQ.inputTokens;
          const outputTokens = (variables?.outputTokens as string[]) ?? DEFAULT_SEQ2SEQ.outputTokens;
          const encoderStates = (variables?.encoderStates as unknown as number[][]) ?? [];
          const decoderStates = (variables?.decoderStates as unknown as number[][]) ?? [];
          const contextVector = variables?.contextVector as number[] | undefined;
          const currentEncoderStep = variables?.currentEncoderStep as number | undefined;
          const currentDecoderStep = variables?.currentDecoderStep as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            "encoder-init": { label: "编码器初始化", color: "bg-blue-100 text-blue-700" },
            encoding: { label: "编码中", color: "bg-blue-100 text-blue-700" },
            context: { label: "上下文向量", color: "bg-violet-100 text-violet-700" },
            decoding: { label: "解码中", color: "bg-emerald-100 text-emerald-700" },
            complete: { label: "生成完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const isEncoding = ["encoder-init", "encoding", "context"].includes(phase);
          const isDecoding = ["decoding", "complete"].includes(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">序列到序列（Seq2Seq）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="h_t = \tanh(W_x x_t + W_h h_{t-1} + b) \quad P(y_t|y_{<t}, X) = \text{Decoder}(c, y_{t-1})" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 编码器 */}
              <div className={`rounded-lg border-2 p-4 shadow-sm transition-all ${isEncoding ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isEncoding ? "text-blue-800" : "text-gray-600"}`}>
                  编码器（Encoder）
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {inputTokens.map((token, i) => {
                    const isProcessed = i <= (currentEncoderStep ?? -1) || ["context", "decoding", "complete"].includes(phase);
                    const isCurrent = i === currentEncoderStep && phase === "encoding";
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                          isCurrent ? "border-blue-500 bg-blue-200 shadow-lg scale-105" :
                          isProcessed ? "border-blue-300 bg-blue-100 text-blue-800" :
                          "border-gray-200 bg-gray-50 text-gray-400"
                        }`}>{token}</div>
                        {isProcessed && encoderStates[i] && (
                          <div className="flex gap-0.5">
                            {encoderStates[i].slice(0, 4).map((v, d) => (
                              <div key={d} className="w-5 h-4 rounded text-[8px] flex items-center justify-center"
                                style={{ backgroundColor: getHeatColor(Math.abs(v)) }}>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="text-[9px] text-gray-400">x_{i}</span>
                      </div>
                    );
                  })}
                  <span className="text-gray-400">→</span>
                  <div className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm ${
                    contextVector ? "border-violet-400 bg-violet-100 text-violet-800" : "border-dashed border-gray-300 text-gray-400"
                  }`}>
                    {contextVector ? `c = [${contextVector.slice(0, 2).map((v) => v.toFixed(2)).join(", ")}...]` : "上下文向量 c"}
                  </div>
                </div>
              </div>

              {/* 解码器 */}
              <div className={`rounded-lg border-2 p-4 shadow-sm transition-all ${isDecoding ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isDecoding ? "text-emerald-800" : "text-gray-600"}`}>
                  解码器（Decoder）
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-3 py-2 rounded-lg border border-dashed border-violet-300 text-violet-600 text-sm">c</div>
                  <span className="text-gray-400">+</span>
                  {outputTokens.map((token, i) => {
                    const isGenerated = i <= (currentDecoderStep ?? -1) || phase === "complete";
                    const isCurrent = i === currentDecoderStep && phase === "decoding";
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                          isCurrent ? "border-emerald-500 bg-emerald-200 shadow-lg scale-105" :
                          isGenerated ? "border-emerald-300 bg-emerald-100 text-emerald-800" :
                          "border-gray-200 bg-gray-50 text-gray-400"
                        }`}>{isGenerated ? token : "?"}</div>
                        {isGenerated && decoderStates[i] && (
                          <div className="flex gap-0.5">
                            {decoderStates[i].slice(0, 4).map((v, d) => (
                              <div key={d} className="w-5 h-4 rounded text-[8px] flex items-center justify-center"
                                style={{ backgroundColor: getHeatColor(Math.abs(v)) }}>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="text-[9px] text-gray-400">y_{i}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 架构对比说明 */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">Seq2Seq vs Transformer</h4>
                  <p className="text-xs text-emerald-700">
                    经典 Seq2Seq 用固定长度的上下文向量 c 传递信息，存在信息瓶颈。
                    加入注意力机制后，解码器每步都能动态关注编码器的全部状态，
                    Transformer 进一步将 RNN 替换为自注意力，实现并行计算。
                  </p>
                  <div className="mt-2">
                    <InlineMath math="P(y_1, \ldots, y_m | x_1, \ldots, x_n) = \prod_{t=1}^{m} P(y_t | y_{<t}, c)" />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "encoder-init", label: "② 编码器初始化" },
                    { id: "encoding", label: "③ 编码输入" },
                    { id: "context", label: "④ 上下文向量" },
                    { id: "decoding", label: "⑤ 解码生成" },
                    { id: "complete", label: "⑥ 完成" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "encoder-init", "encoding", "context", "decoding", "complete"];
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

export default Seq2SeqVisualizer;
