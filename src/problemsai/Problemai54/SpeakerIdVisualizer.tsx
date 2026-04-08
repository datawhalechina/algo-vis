import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateSpeakerIdSteps,
  ENROLLED_SPEAKERS,
  THRESHOLD,
  SpeakerProfile,
  SimilarityResult,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SpeakerIdInput extends ProblemInput {
  test_speaker: string;
}

function parseEmbedding(str: string): number[] {
  return str.split(",").map(Number);
}

function parseSimilarities(str: string): SimilarityResult[] {
  if (!str) return [];
  return str.split("|").map((s) => {
    const [name, sim] = s.split(":");
    return { name, similarity: Number(sim) };
  });
}

function EmbeddingBars({ embedding, color }: { embedding: number[]; color: string }) {
  return (
    <div className="flex gap-1 items-end h-12">
      {embedding.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            className="w-6 rounded-t transition-all duration-300"
            style={{ height: `${Math.round(v * 44)}px`, backgroundColor: color, opacity: 0.7 + v * 0.3 }}
          />
          <span className="text-[8px] text-gray-400 font-mono">d{i}</span>
        </div>
      ))}
    </div>
  );
}

function SpeakerCard({
  speaker,
  highlighted,
  similarity,
}: {
  speaker: SpeakerProfile;
  highlighted: boolean;
  similarity?: number;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all duration-300 ${
        highlighted
          ? "border-opacity-100 shadow-lg scale-105"
          : "border-gray-200 bg-white"
      }`}
      style={highlighted ? { borderColor: speaker.color, backgroundColor: `${speaker.color}10` } : {}}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: highlighted ? speaker.color : "#374151" }}>
          {speaker.name}
        </span>
        {similarity !== undefined && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: speaker.color }}
          >
            {similarity.toFixed(4)}
          </span>
        )}
      </div>
      <EmbeddingBars embedding={speaker.embedding} color={speaker.color} />
      <div className="mt-1 text-[9px] text-gray-400 font-mono truncate">
        [{speaker.embedding.map((v) => v.toFixed(2)).join(", ")}]
      </div>
    </div>
  );
}

function SimilarityGauge({ value, threshold, color }: { value: number; threshold: number; color: string }) {
  const pct = Math.round(value * 100);
  const thresholdPct = Math.round(threshold * 100);
  return (
    <div className="relative">
      <div className="w-full bg-gray-100 rounded-full h-6 overflow-visible relative">
        <div
          className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${pct}%`, backgroundColor: color }}
        >
          <span className="text-[10px] text-white font-mono font-bold">{value.toFixed(4)}</span>
        </div>
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${thresholdPct}%` }}
        >
          <span className="absolute -top-4 -translate-x-1/2 text-[9px] text-red-500 font-mono whitespace-nowrap">
            θ={threshold}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpeakerIdVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10054);

  return (
    <ConfigurableVisualizer<SpeakerIdInput, Record<string, never>>
      config={{
        defaultInput: { test_speaker: "Alice的声音" },

        algorithm: (input) => {
          const speaker = String(input.test_speaker || "Alice的声音");
          return generateSpeakerIdSteps(speaker);
        },

        inputTypes: [{ type: "string", key: "test_speaker", label: "测试语音" }],
        inputFields: [
          {
            type: "string",
            key: "test_speaker",
            label: "待识别说话人",
            placeholder: "Alice的声音",
          },
        ],

        testCases: [
          { label: "Alice的声音", value: { test_speaker: "Alice的声音" } },
          { label: "Bob的声音", value: { test_speaker: "Bob的声音" } },
          { label: "陌生人（未注册）", value: { test_speaker: "陌生人" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const testSpeaker = (variables?.testSpeaker as string) ?? "";
          const testEmbeddingStr = (variables?.testEmbedding as string) ?? "";
          const testEmbedding = testEmbeddingStr ? parseEmbedding(testEmbeddingStr) : null;
          const simStr = (variables?.similarities as string) ?? "";
          const similarities = parseSimilarities(simStr);
          const currentCompareIdx = variables?.currentCompareIdx as number | undefined;
          const identified = (variables?.identified as string) ?? "";
          const isKnown = (variables?.isKnown as string) === "true";
          const maxSim = variables?.maxSim as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            extract: { label: "特征提取", color: "bg-blue-100 text-blue-700" },
            compare: { label: "相似度比对", color: "bg-amber-100 text-amber-700" },
            decision: { label: "阈值决策", color: "bg-violet-100 text-violet-700" },
            complete: { label: "识别完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "extract", "compare", "decision", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">说话人识别（Speaker Identification）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\cos(e_{\text{test}}, e_i) = \frac{e_{\text{test}} \cdot e_i}{\|e_{\text{test}}\| \|e_i\|}" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Enrolled Speakers */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  已注册说话人声纹库（d-vector 嵌入，dim=6）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ENROLLED_SPEAKERS.map((s, i) => {
                    const simEntry = similarities.find((x) => x.name === s.name);
                    const isCurrentlyComparing =
                      phase === "compare" && currentCompareIdx === i;
                    const hasBeenCompared =
                      phase === "compare"
                        ? (currentCompareIdx ?? -1) >= i
                        : ["decision", "complete"].includes(phase);
                    return (
                      <SpeakerCard
                        key={s.name}
                        speaker={s}
                        highlighted={isCurrentlyComparing || (phase === "complete" && isKnown && identified === s.name)}
                        similarity={hasBeenCompared ? simEntry?.similarity : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Test Embedding */}
              {testEmbedding && ["extract", "compare", "decision", "complete"].includes(phase) && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    待识别语音的声纹嵌入：「{testSpeaker}」
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <EmbeddingBars embedding={testEmbedding} color="#3b82f6" />
                    <div>
                      <BlockMath math={`e_{\\text{test}} = [${testEmbedding.map((v) => v.toFixed(2)).join(",\\ ")}]`} />
                      <p className="text-xs text-blue-600 mt-1">
                        神经网络将任意长度语音压缩为固定维度的声纹向量
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Similarity Scores */}
              {similarities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    余弦相似度得分
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    阈值 <InlineMath math={`\\theta = ${THRESHOLD}`} />，超过阈值则确认身份
                  </p>
                  <div className="space-y-3">
                    {similarities.map((sim) => {
                      const sp = ENROLLED_SPEAKERS.find((s) => s.name === sim.name)!;
                      return (
                        <div key={sim.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{sim.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                                sim.similarity >= THRESHOLD
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {sim.similarity >= THRESHOLD ? "✓ 匹配" : "✗ 不匹配"}
                            </span>
                          </div>
                          <SimilarityGauge
                            value={sim.similarity}
                            threshold={THRESHOLD}
                            color={sp?.color ?? "#6366f1"}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Decision Result */}
              {["decision", "complete"].includes(phase) && identified && (
                <div
                  className={`rounded-xl border-2 p-4 shadow-sm ${
                    isKnown
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-orange-50 border-orange-300"
                  }`}
                >
                  <h4 className={`text-sm font-semibold mb-2 ${isKnown ? "text-emerald-800" : "text-orange-800"}`}>
                    {isKnown ? "身份确认" : "拒识（未知说话人）"}
                  </h4>
                  <div className="text-2xl font-bold mb-2" style={{ color: isKnown ? "#065f46" : "#9a3412" }}>
                    {identified}
                  </div>
                  {maxSim !== undefined && (
                    <div className="text-xs mt-1">
                      <BlockMath
                        math={`\\max_i \\cos(e_{\\text{test}}, e_i) = ${maxSim.toFixed(4)} ${
                          isKnown ? "\\geq" : "<"
                        } \\theta = ${THRESHOLD}`}
                      />
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${isKnown ? "text-emerald-600" : "text-orange-600"}`}>
                    {isKnown
                      ? `测试声纹与 ${identified} 的嵌入在向量空间中高度重合`
                      : "测试声纹与所有已注册声纹距离过大，判定为未知说话人"}
                  </p>
                </div>
              )}

              {/* Pipeline Steps */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">识别流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 注册声纹库" },
                    { id: "extract", label: "② 提取测试嵌入" },
                    { id: "compare", label: "③ 逐一计算相似度" },
                    { id: "decision", label: "④ 阈值决策" },
                    { id: "complete", label: "⑤ 输出结果" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-violet-600 text-white shadow-sm"
                              : isDone
                              ? "bg-violet-100 text-violet-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
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

export default SpeakerIdVisualizer;
