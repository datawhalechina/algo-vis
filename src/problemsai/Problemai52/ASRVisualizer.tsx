import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateASRSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ASRInput extends ProblemInput {
  utterance: string;
}

function parseJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }
  return fallback;
}

function getHeatColor(val: number): string {
  // Blue heatmap: low = light, high = deep blue
  const w = Math.max(0, Math.min(val, 1));
  const r = Math.round(240 - w * 180);
  const g = Math.round(240 - w * 140);
  const b = Math.round(255 - w * 40);
  return `rgb(${r},${g},${b})`;
}

function ProbHeatmap({
  probMatrix,
  vocab,
  currentFrame,
  showCursor,
}: {
  probMatrix: number[][];
  vocab: string[];
  currentFrame: number;
  showCursor: boolean;
}) {
  if (!probMatrix.length || !vocab.length) return null;
  const T = probMatrix.length;
  const V = vocab.length;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Header: vocab */}
        <div className="flex">
          <div className="w-8" />
          {vocab.map((ch, vi) => (
            <div
              key={vi}
              className="w-8 text-center text-[10px] font-mono text-gray-500 pb-1"
            >
              {ch}
            </div>
          ))}
        </div>
        {/* Rows: frames */}
        {Array.from({ length: T }).map((_, ti) => {
          const row = probMatrix[ti] ?? [];
          const isCurrent = showCursor && ti === currentFrame;
          return (
            <div key={ti} className={`flex items-center ${isCurrent ? "ring-2 ring-blue-500 ring-offset-0 rounded" : ""}`}>
              <div className="w-8 text-[9px] font-mono text-gray-400 text-right pr-1">{ti}</div>
              {Array.from({ length: V }).map((_, vi) => {
                const prob = row[vi] ?? 0;
                const isMax = prob === Math.max(...row);
                return (
                  <div
                    key={vi}
                    className={`w-8 h-6 flex items-center justify-center border border-white text-[8px] font-mono transition-all ${isMax ? "ring-1 ring-orange-400" : ""}`}
                    style={{ backgroundColor: getHeatColor(prob), color: prob > 0.6 ? "#fff" : "#374151" }}
                    title={`P(${vocab[vi]}|x_${ti}) = ${(prob * 100).toFixed(1)}%`}
                  >
                    {(prob * 100).toFixed(0)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeqFlow({
  rawSeq,
  collapsedSeq,
  finalText,
  phase,
}: {
  rawSeq: string[];
  collapsedSeq: string[];
  finalText: string;
  phase: string;
}) {
  if (!rawSeq.length) return null;

  return (
    <div className="space-y-3">
      {/* Raw sequence */}
      <div>
        <div className="text-xs text-gray-500 mb-1 font-medium">原始序列（argmax）：</div>
        <div className="flex flex-wrap gap-1">
          {rawSeq.map((ch, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded text-xs font-mono border ${
                ch === "_"
                  ? "bg-gray-100 text-gray-400 border-gray-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Collapsed */}
      {["collapse", "blank_remove", "complete"].includes(phase) && collapsedSeq.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium">折叠重复后：</div>
          <div className="flex flex-wrap gap-1">
            {collapsedSeq.map((ch, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded text-xs font-mono border ${
                  ch === "_"
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : "bg-violet-50 text-violet-700 border-violet-200"
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Final */}
      {["blank_remove", "complete"].includes(phase) && finalText && (
        <div>
          <div className="text-xs text-gray-500 mb-1 font-medium">删除空白符后（最终文本）：</div>
          <div className="flex flex-wrap gap-1">
            {finalText.split("").map((ch, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-sm font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ASRVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10052);

  return (
    <ConfigurableVisualizer<ASRInput, Record<string, never>>
      config={{
        defaultInput: { utterance: "hello" },

        algorithm: (input) => {
          const utt = String(input.utterance || "hello").trim();
          return generateASRSteps(utt);
        },

        inputTypes: [{ type: "string", key: "utterance", label: "输入语音词语" }],
        inputFields: [
          {
            type: "string",
            key: "utterance",
            label: "输入语音词语",
            placeholder: "hello",
          },
        ],

        testCases: [
          { label: "hello", value: { utterance: "hello" } },
          { label: "world", value: { utterance: "world" } },
          { label: "你好", value: { utterance: "你好" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const utterance = (variables?.utterance as string) ?? "hello";
          const vocab = parseJSON<string[]>(variables?.vocab, []);
          const probMatrix = parseJSON<number[][]>(variables?.probMatrix, []);
          const rawSeq = parseJSON<string[]>(variables?.rawSeq, []);
          const collapsedSeq = parseJSON<string[]>(variables?.collapsedSeq, []);
          const finalText = (variables?.finalText as string) ?? "";
          const currentFrame = (variables?.currentFrame as number) ?? -1;
          const T = (variables?.T as number) ?? 12;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            acoustic: { label: "声学模型输出", color: "bg-blue-100 text-blue-700" },
            argmax: { label: "逐帧取 argmax", color: "bg-violet-100 text-violet-700" },
            collapse: { label: "折叠重复字符", color: "bg-amber-100 text-amber-700" },
            blank_remove: { label: "删除空白符", color: "bg-orange-100 text-orange-700" },
            complete: { label: "解码完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "acoustic", "argmax", "collapse", "blank_remove", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">语音识别（CTC-ASR）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="p(y|x) = \sum_{\pi:\mathcal{B}(\pi)=y} \prod_t p(\pi_t|x_t)" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                      「{utterance}」
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                  </div>
                </div>
              </div>

              {/* 流程步骤条 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "acoustic", label: "② 声学模型" },
                    { id: "argmax", label: "③ argmax" },
                    { id: "collapse", label: "④ 折叠重复" },
                    { id: "blank_remove", label: "⑤ 删空白" },
                    { id: "complete", label: "⑥ 完成" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-2 py-1.5 rounded-lg font-medium transition-all ${
                          step.id === phase ? "bg-rose-500 text-white shadow-sm" :
                          isDone ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 概率热力图 */}
              {probMatrix.length > 0 && vocab.length > 0 && ["acoustic", "argmax", "collapse", "blank_remove", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    声学模型概率矩阵 P ∈ ℝ^{"{"}T×|V|{"}"}
                    <span className="text-xs font-normal text-gray-400 ml-2">（T={T}，橙框=argmax）</span>
                  </h4>
                  <ProbHeatmap
                    probMatrix={probMatrix}
                    vocab={vocab}
                    currentFrame={currentFrame}
                    showCursor={phase === "argmax"}
                  />
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>深色 = 高概率</span>
                    <span>橙框 = 该帧 argmax 字符</span>
                  </div>
                </div>
              )}

              {/* 解码序列流 */}
              {rawSeq.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">CTC 解码变换流</h4>
                  <SeqFlow
                    rawSeq={rawSeq}
                    collapsedSeq={collapsedSeq}
                    finalText={finalText}
                    phase={phase}
                  />
                </div>
              )}

              {/* 最终结果 */}
              {phase === "complete" && finalText && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">识别结果</h4>
                  <div className="text-3xl font-bold text-emerald-700 font-mono tracking-wider">
                    {finalText}
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">
                    CTC 贪婪解码：argmax → 折叠重复 → 删空白，无需帧级别对齐标注
                  </p>
                </div>
              )}

              {/* 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">CTC 贪婪解码步骤</h4>
                <div className="space-y-2 text-sm">
                  <BlockMath math="\hat{\pi}_t = \arg\max_{c} P(c \mid x_t) \quad \forall t \in [1, T]" />
                  <p className="text-xs text-gray-500">
                    1. 每帧 argmax 得原始序列；2. 折叠连续重复（hello: h,h,e,l,l,_,l,o → h,e,l,_,l,o）；3. 删空白符 → 最终文本
                  </p>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ASRVisualizer;
