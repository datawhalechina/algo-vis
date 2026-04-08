import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generatePhonemeRecognitionSteps,
  PHONEME_VOCAB,
  WORD_PHONEMES,
  PhonemeFrame,
  PhonemeAlignment,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface PhonemeInput extends ProblemInput {
  word: string;
}

function parseFrames(str: string): PhonemeFrame[] {
  if (!str) return [];
  return str.split("|").map((s) => {
    const parts = s.split(":");
    const frameIdx = Number(parts[0]);
    const truePhoneme = parts[1];
    const probValues = parts[2].split(",").map(Number);
    const probs: Record<string, number> = {};
    PHONEME_VOCAB.forEach((ph, i) => { probs[ph] = probValues[i] ?? 0; });
    return { frameIdx, mfcc: [], probs, truePhoneme };
  });
}

function parseAlignments(str: string): PhonemeAlignment[] {
  if (!str) return [];
  return str.split("|").map((s) => {
    const [phoneme, startFrame, endFrame] = s.split(":");
    return {
      phoneme,
      startFrame: Number(startFrame),
      endFrame: Number(endFrame),
      duration: Number(endFrame) - Number(startFrame) + 1,
    };
  });
}

// Color palette for phonemes
const PHONEME_COLORS: Record<string, string> = {
  HH: "#7c3aed", EH: "#db2777", L: "#0891b2", OW: "#059669",
  W:  "#d97706", ER: "#dc2626", D: "#4f46e5", S:  "#0d9488",
  P:  "#7c2d12", IY: "#065f46", CH: "#92400e", AO: "#1e40af",
};

function getPhonemeColor(ph: string): string {
  return PHONEME_COLORS[ph] ?? "#6b7280";
}

function PhonemeToken({ phoneme, duration, isActive }: { phoneme: string; duration?: number; isActive?: boolean }) {
  const color = getPhonemeColor(phoneme);
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center transition-all duration-300 ${isActive ? "scale-110 shadow-md" : ""}`}
      style={{
        backgroundColor: isActive ? color : `${color}20`,
        borderWidth: 2,
        borderColor: color,
        minWidth: 52,
      }}
    >
      <div className="text-base font-bold font-mono" style={{ color: isActive ? "#fff" : color }}>
        /{phoneme}/
      </div>
      {duration !== undefined && (
        <div className="text-[10px] mt-0.5" style={{ color: isActive ? "#fff" : color }}>
          {duration} 帧
        </div>
      )}
    </div>
  );
}

function ProbabilityHeatmap({ frames, highlightFrame }: { frames: PhonemeFrame[]; highlightFrame?: number }) {
  if (frames.length === 0) return null;
  const maxProb = 0.8;
  return (
    <div className="overflow-x-auto">
      <table className="text-[9px] border-collapse">
        <thead>
          <tr>
            <td className="px-1 py-0.5 text-gray-400 font-mono">音素 \\ 帧</td>
            {frames.map((f) => (
              <td
                key={f.frameIdx}
                className={`px-1 py-0.5 text-center font-mono ${
                  highlightFrame === f.frameIdx ? "bg-blue-100 font-bold text-blue-700" : "text-gray-400"
                }`}
              >
                {f.frameIdx + 1}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {PHONEME_VOCAB.map((ph) => (
            <tr key={ph}>
              <td
                className="px-1 py-0.5 font-mono font-semibold"
                style={{ color: getPhonemeColor(ph) }}
              >
                /{ph}/
              </td>
              {frames.map((f) => {
                const prob = f.probs[ph] ?? 0;
                const intensity = Math.min(1, prob / maxProb);
                const isTrue = f.truePhoneme === ph;
                return (
                  <td key={f.frameIdx} className="px-0.5 py-0.5">
                    <div
                      className={`rounded transition-all duration-200 ${isTrue ? "ring-1 ring-offset-0" : ""}`}
                      style={{
                        width: 20,
                        height: 16,
                        backgroundColor: `${getPhonemeColor(ph)}`,
                        opacity: 0.1 + intensity * 0.9,
                      }}
                      title={`P(${ph}|frame ${f.frameIdx + 1}) = ${prob.toFixed(3)}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AlignmentTimeline({
  alignments,
  totalFrames,
  currentFrame,
}: {
  alignments: PhonemeAlignment[];
  totalFrames: number;
  currentFrame?: number;
}) {
  if (alignments.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-2">时间对齐可视化</div>
      <div className="relative h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {alignments.map((aln) => {
          const leftPct = ((aln.startFrame / totalFrames) * 100).toFixed(1);
          const widthPct = ((aln.duration / totalFrames) * 100).toFixed(1);
          const color = getPhonemeColor(aln.phoneme);
          return (
            <div
              key={aln.phoneme + aln.startFrame}
              className="absolute top-0 bottom-0 flex items-center justify-center text-xs font-bold font-mono rounded-sm"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: `${color}40`,
                borderRight: `2px solid ${color}`,
                color,
              }}
            >
              /{aln.phoneme}/
            </div>
          );
        })}
        {currentFrame !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
            style={{ left: `${((currentFrame / totalFrames) * 100).toFixed(1)}%` }}
          />
        )}
      </div>
      {/* Frame axis */}
      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 font-mono">
        <span>帧 1</span>
        <span>帧 {totalFrames}</span>
      </div>
    </div>
  );
}

function DurationStats({ alignments }: { alignments: PhonemeAlignment[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {alignments.map((aln) => {
        const color = getPhonemeColor(aln.phoneme);
        return (
          <div
            key={aln.phoneme + aln.startFrame}
            className="rounded-lg px-3 py-2 text-center border"
            style={{ borderColor: color, backgroundColor: `${color}10` }}
          >
            <div className="text-sm font-bold font-mono" style={{ color }}>/{aln.phoneme}/</div>
            <div className="text-xs text-gray-500">{aln.duration} 帧</div>
            <div className="text-[10px] text-gray-400">~{aln.duration * 10}ms</div>
          </div>
        );
      })}
    </div>
  );
}

function PhonemeRecognitionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10056);

  return (
    <ConfigurableVisualizer<PhonemeInput, Record<string, never>>
      config={{
        defaultInput: { word: "hello" },

        algorithm: (input) => {
          const word = String(input.word || "hello").toLowerCase().trim();
          return generatePhonemeRecognitionSteps(word);
        },

        inputTypes: [{ type: "string", key: "word", label: "词语" }],
        inputFields: [
          {
            type: "string",
            key: "word",
            label: "输入词语（hello/world/speech/audio）",
            placeholder: "hello",
          },
        ],

        testCases: [
          { label: "hello → HH EH L OW", value: { word: "hello" } },
          { label: "world → W ER L D", value: { word: "world" } },
          { label: "speech → S P IY CH", value: { word: "speech" } },
          { label: "audio → AO D IY OW", value: { word: "audio" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const word = (variables?.word as string) ?? "hello";
          const phonemeSeqStr = (variables?.phonemeSeq as string) ?? "";
          const phonemeSeq = phonemeSeqStr ? phonemeSeqStr.split(",") : [];
          const framesStr = (variables?.frames as string) ?? "";
          const alignmentsStr = (variables?.alignments as string) ?? "";
          const currentFrame = variables?.currentFrame as number | undefined;
          const totalFrames = variables?.totalFrames as number | undefined;

          const frames = parseFrames(framesStr);
          const alignments = parseAlignments(alignmentsStr);

          // Get total frames from alignments if not in variables
          const computedTotal =
            totalFrames ??
            (alignments.length > 0
              ? alignments[alignments.length - 1].endFrame + 1
              : frames.length);

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            feature: { label: "特征提取", color: "bg-blue-100 text-blue-700" },
            model: { label: "声学建模", color: "bg-amber-100 text-amber-700" },
            alignment: { label: "时间对齐", color: "bg-violet-100 text-violet-700" },
            boundary: { label: "边界标注", color: "bg-indigo-100 text-indigo-700" },
            complete: { label: "识别完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "feature", "model", "alignment", "boundary", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          // Reference mapping for display
          const allWordKeys = Object.keys(WORD_PHONEMES) as (keyof typeof WORD_PHONEMES)[];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">音素识别（Phoneme Recognition）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="P(q_t \mid x_t) = \text{softmax}(W \cdot h_t + b)" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Word -> Phoneme Mapping Reference */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">ARPAbet 音素映射表</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allWordKeys.map((w) => (
                    <div
                      key={w}
                      className={`rounded-lg p-2 border transition-all ${
                        w === word ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className={`text-sm font-bold mb-1 ${w === word ? "text-indigo-700" : "text-gray-700"}`}>
                        {w}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {WORD_PHONEMES[w].map((ph) => (
                          <span
                            key={ph}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${getPhonemeColor(ph)}20`,
                              color: getPhonemeColor(ph),
                              border: `1px solid ${getPhonemeColor(ph)}60`,
                            }}
                          >
                            /{ph}/
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Phoneme Sequence */}
              {phonemeSeq.length > 0 && (
                <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-indigo-800 mb-3">
                    「{word}」的音素序列
                  </h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {phonemeSeq.map((ph, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <PhonemeToken
                          phoneme={ph}
                          duration={alignments.find((a) => a.phoneme === ph && idx === phonemeSeq.indexOf(ph))?.duration}
                          isActive={
                            phase === "complete" ||
                            (alignments.length > 0 && alignments.some((a) => a.phoneme === ph))
                          }
                        />
                        {idx < phonemeSeq.length - 1 && (
                          <span className="text-gray-400 text-lg">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature extraction: MFCC display */}
              {phase === "feature" && frames.length > 0 && currentFrame !== undefined && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    第 {(currentFrame ?? 0) + 1} 帧 MFCC 特征
                  </h4>
                  <div className="flex gap-1 items-end h-16 mb-2">
                    {(frames[currentFrame]?.mfcc ?? []).map((v, i) => (
                      <div key={i} className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-8 rounded-t bg-blue-500 transition-all"
                          style={{ height: `${Math.round(v * 52)}px`, opacity: 0.6 + v * 0.4 }}
                        />
                        <span className="text-[8px] text-gray-400 font-mono">c{i}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600">
                    MFCC 捕获语音频谱的包络特征，是音素识别的经典特征
                  </p>
                </div>
              )}

              {/* Probability Heatmap */}
              {frames.length > 0 && ["model", "alignment", "boundary", "complete"].includes(phase) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-x-auto">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    帧级音素后验概率 <InlineMath math="P(q_t \mid x_t)" />
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    颜色越深表示该帧对应该音素的概率越高
                  </p>
                  <ProbabilityHeatmap frames={frames} highlightFrame={currentFrame} />
                </div>
              )}

              {/* Alignment Timeline */}
              {alignments.length > 0 && ["alignment", "boundary", "complete"].includes(phase) && (
                <div className="bg-violet-50 rounded-xl border border-violet-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-violet-800 mb-3">
                    Viterbi 时间对齐结果
                  </h4>
                  <AlignmentTimeline
                    alignments={alignments}
                    totalFrames={computedTotal}
                    currentFrame={currentFrame}
                  />
                  <div className="mt-3">
                    <BlockMath math="\hat{q}_{1:T} = \arg\max_{q_{1:T}} \prod_t P(q_t \mid x_t) \cdot P(q_t \mid q_{t-1})" />
                  </div>
                  <p className="text-xs text-violet-600 mt-1">
                    维特比算法在 HMM 状态图中寻找最优路径，确定每帧最可能的音素标签
                  </p>
                </div>
              )}

              {/* Duration Statistics */}
              {alignments.length > 0 && ["boundary", "complete"].includes(phase) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">各音素时长统计</h4>
                  <DurationStats alignments={alignments} />
                  <p className="text-xs text-gray-400 mt-2">
                    每帧时长约 10ms；长音素（如元音）通常比短音素（如爆破音）持续更多帧
                  </p>
                </div>
              )}

              {/* CTC explanation on complete */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">CTC 对齐原理</h4>
                  <div className="text-sm text-emerald-700 mb-2">
                    <BlockMath math="P(l \mid x) = \sum_{\pi \in \mathcal{B}^{-1}(l)} \prod_t P(\pi_t \mid x_t)" />
                  </div>
                  <p className="text-xs text-emerald-600">
                    CTC（Connectionist Temporal Classification）允许帧数与音素数不等：
                    通过引入空白符 ε，枚举所有与目标标签等价的对齐路径求和，实现端到端训练，无需强制对齐标注。
                  </p>
                </div>
              )}

              {/* Pipeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">识别流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 音素序列" },
                    { id: "feature", label: "② MFCC提取" },
                    { id: "model", label: "③ 声学建模" },
                    { id: "alignment", label: "④ Viterbi对齐" },
                    { id: "boundary", label: "⑤ 边界标注" },
                    { id: "complete", label: "⑥ 识别结果" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-indigo-600 text-white shadow-sm"
                              : isDone
                              ? "bg-indigo-100 text-indigo-700"
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

export default PhonemeRecognitionVisualizer;
