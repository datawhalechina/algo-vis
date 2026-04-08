import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateSpeechSegmentationSteps, Utterance } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SpeechSegInput extends ProblemInput {
  utterance: string;
}

const PHASE_MAP: Record<string, { label: string; color: string }> = {
  init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
  energy: { label: "能量计算", color: "bg-cyan-100 text-cyan-700" },
  minima: { label: "极值检测", color: "bg-blue-100 text-blue-700" },
  threshold: { label: "阈值过滤", color: "bg-amber-100 text-amber-700" },
  segments: { label: "段提取", color: "bg-violet-100 text-violet-700" },
  label: { label: "段标注", color: "bg-emerald-100 text-emerald-700" },
  complete: { label: "分割完成", color: "bg-emerald-100 text-emerald-700" },
};

const PHASE_ORDER = ["init", "energy", "minima", "threshold", "segments", "label", "complete"];

const SEGMENT_COLORS = [
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
];

const UTTERANCE_LABELS: Record<string, string[]> = {
  你好世界: ["你", "好", "世", "界"],
  人工智能: ["人", "工", "智", "能"],
  语音识别: ["语", "音", "识", "别"],
};

function EnergyBar({
  frames,
  candidateBoundaries,
  finalBoundaries,
  energyThreshold,
  phase,
}: {
  frames: number[];
  candidateBoundaries?: number[];
  finalBoundaries?: number[];
  energyThreshold: number;
  phase: string;
}) {
  if (!frames || frames.length === 0) return null;

  const showCandidates = ["minima", "threshold", "segments", "label", "complete"].includes(phase);
  const showFinal = ["threshold", "segments", "label", "complete"].includes(phase);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-0.5 relative" style={{ height: 80, minWidth: frames.length * 14 }}>
        {/* Threshold line */}
        {["threshold", "segments", "label", "complete"].includes(phase) && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 z-10"
            style={{ bottom: energyThreshold * 76 }}
          >
            <span
              className="absolute right-0 text-[9px] text-amber-600 bg-white px-1"
              style={{ top: -10 }}
            >
              θ={energyThreshold}
            </span>
          </div>
        )}

        {frames.map((e, i) => {
          const isCandidate = showCandidates && (candidateBoundaries ?? []).includes(i);
          const isFinal = showFinal && (finalBoundaries ?? []).includes(i);
          const h = Math.max(2, e * 72);
          let bg = "#06b6d4";
          if (isFinal) bg = "#f43f5e";
          else if (isCandidate) bg = "#f59e0b";
          else if (e < energyThreshold) bg = "#d1d5db";

          return (
            <div key={i} className="relative flex flex-col items-center" style={{ width: 12 }}>
              {isFinal && (
                <div
                  className="absolute bottom-0 w-0.5 bg-red-500 z-20"
                  style={{ height: 80 }}
                />
              )}
              {isCandidate && !isFinal && (
                <div
                  className="absolute bottom-0 w-px border-l-2 border-dashed border-amber-400 z-10"
                  style={{ height: 80 }}
                />
              )}
              <div
                style={{ height: h, backgroundColor: bg, borderRadius: 2, width: 10 }}
                className="absolute bottom-0"
              />
            </div>
          );
        })}
      </div>

      {/* Frame index labels */}
      <div className="flex gap-0.5 mt-1" style={{ minWidth: frames.length * 14 }}>
        {frames.map((_, i) => (
          <div key={i} style={{ width: 12 }} className="text-center">
            {i % 4 === 0 && (
              <span className="text-[8px] text-gray-400">{i}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SegmentSpans({
  frames,
  utterance,
  finalBoundaries,
}: {
  frames: number[];
  utterance: string;
  finalBoundaries: number[];
}) {
  if (!frames || frames.length === 0) return null;

  const labels = UTTERANCE_LABELS[utterance] ?? [];
  const THRESHOLD = 0.25;

  // Build spans
  const spans: Array<{ start: number; end: number; isSilence: boolean; label?: string }> = [];
  let segIdx = 0;
  let inSpeech = false;
  let spanStart = 0;

  for (let i = 0; i <= frames.length; i++) {
    const isEnd = i === frames.length;
    const isBoundary = finalBoundaries.includes(i);
    const isSpeechFrame = !isEnd && frames[i] >= THRESHOLD;

    if (!isEnd && isBoundary) {
      if (inSpeech) {
        spans.push({ start: spanStart, end: i - 1, isSilence: false, label: labels[segIdx++] });
        inSpeech = false;
      }
      spans.push({ start: i, end: i, isSilence: true });
      spanStart = i + 1;
    } else if (isSpeechFrame && !inSpeech) {
      inSpeech = true;
      spanStart = i;
    } else if (!isSpeechFrame && inSpeech) {
      spans.push({ start: spanStart, end: i - 1, isSilence: false, label: labels[segIdx++] });
      inSpeech = false;
      spanStart = i;
    }
  }
  if (inSpeech) {
    spans.push({ start: spanStart, end: frames.length - 1, isSilence: false, label: labels[segIdx] });
  }

  const totalFrames = frames.length;

  return (
    <div className="flex h-8 rounded overflow-hidden border border-gray-200" style={{ minWidth: totalFrames * 14 }}>
      {frames.map((e, i) => {
        const isBoundary = finalBoundaries.includes(i);
        const isSpeech = e >= THRESHOLD && !isBoundary;
        let bg = "#f3f4f6";
        if (isBoundary) {
          bg = "#fca5a5";
        } else if (isSpeech) {
          // Find which segment
          let sIdx = 0;
          let inS = false;
          let sId = -1;
          for (let j = 0; j <= i; j++) {
            if (finalBoundaries.includes(j)) {
              inS = false;
            } else if (frames[j] >= THRESHOLD && !inS) {
              inS = true;
              sId = sIdx++;
            } else if (frames[j] < THRESHOLD) {
              inS = false;
            }
          }
          bg = SEGMENT_COLORS[sId % SEGMENT_COLORS.length] + "40";
        }
        return (
          <div
            key={i}
            style={{ flex: 1, backgroundColor: bg }}
            className="border-r border-gray-100"
          />
        );
      })}
    </div>
  );
}

function SpeechSegmentationVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10058);

  return (
    <ConfigurableVisualizer<SpeechSegInput, Record<string, never>>
      config={{
        defaultInput: { utterance: "你好世界" },

        algorithm: (input) => {
          const u = (input.utterance as Utterance) || "你好世界";
          return generateSpeechSegmentationSteps(u);
        },

        inputTypes: [{ type: "string", key: "utterance", label: "语音内容" }],
        inputFields: [
          {
            type: "string",
            key: "utterance",
            label: "语音内容",
            placeholder: "你好世界",
          },
        ],

        testCases: [
          { label: "你好世界", value: { utterance: "你好世界" } },
          { label: "人工智能", value: { utterance: "人工智能" } },
          { label: "语音识别", value: { utterance: "语音识别" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const utterance = (variables?.utterance as string) ?? "你好世界";
          const frames = (variables?.frames as unknown as number[]) ?? [];
          const candidateBoundaries = (variables?.candidateBoundaries as unknown as number[]) ?? [];
          const finalBoundaries = (variables?.finalBoundaries as unknown as number[]) ?? [];
          const energyThreshold = (variables?.energyThreshold as number) ?? 0.25;

          const pi = PHASE_MAP[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
          const phaseIdx = PHASE_ORDER.indexOf(phase);

          const labels = UTTERANCE_LABELS[utterance] ?? [];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      语音分割（Speech Segmentation）
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="E_n = \frac{1}{N}\sum_{k}x^2(k)" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg">
                      「{utterance}」
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>
                      {pi.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Energy bar chart */}
              {frames.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    帧能量序列{" "}
                    <span className="text-xs font-normal text-gray-500">
                      （红线=最终边界，橙虚线=候选边界，灰=静音）
                    </span>
                  </h4>
                  <EnergyBar
                    frames={frames}
                    candidateBoundaries={candidateBoundaries}
                    finalBoundaries={finalBoundaries}
                    energyThreshold={energyThreshold}
                    phase={phase}
                  />
                </div>
              )}

              {/* Boundary stats */}
              {(candidateBoundaries.length > 0 || finalBoundaries.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                    <div className="text-xs text-amber-600 font-medium mb-1">候选边界</div>
                    <div className="text-2xl font-bold text-amber-700">
                      {candidateBoundaries.length}
                    </div>
                    <div className="text-xs text-amber-500 mt-1">局部能量极小值点</div>
                  </div>
                  <div className="bg-red-50 rounded-lg border border-red-200 p-3">
                    <div className="text-xs text-red-600 font-medium mb-1">真实边界</div>
                    <div className="text-2xl font-bold text-red-700">
                      {finalBoundaries.length}
                    </div>
                    <div className="text-xs text-red-500 mt-1">
                      阈值过滤后 <InlineMath math={`E < ${energyThreshold}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Segment spans visualization */}
              {finalBoundaries.length > 0 && frames.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    分割结果可视化{" "}
                    <span className="text-xs font-normal text-gray-500">
                      （彩色=各语音段，红=边界，灰=静音）
                    </span>
                  </h4>
                  <SegmentSpans
                    frames={frames}
                    utterance={utterance}
                    finalBoundaries={finalBoundaries}
                  />
                  {["label", "complete"].includes(phase) && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {labels.map((label, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold"
                          style={{
                            backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] + "25",
                            borderColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                            border: `2px solid ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`,
                            color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Complete formula box */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">分割结果</h4>
                  <BlockMath
                    math={`\\text{Segments}(\\text{「${utterance}」}) = [${labels.map((l) => `\\text{「${l}」}`).join(",\\ ")}]`}
                  />
                  <p className="text-xs text-emerald-600 mt-2">
                    能量阈值法将连续语音成功切分为 {labels.length}{" "}
                    个音节单元，可直接输入声学模型或字典进行后续识别。
                  </p>
                </div>
              )}

              {/* Pipeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">处理流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入" },
                    { id: "energy", label: "② 能量计算" },
                    { id: "minima", label: "③ 极值检测" },
                    { id: "threshold", label: "④ 阈值过滤" },
                    { id: "segments", label: "⑤ 段提取" },
                    { id: "label", label: "⑥ 标注" },
                    { id: "complete", label: "⑦ 完成" },
                  ].map((step, idx, arr) => {
                    const stepIdx = PHASE_ORDER.indexOf(step.id);
                    const isDone = phaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-cyan-600 text-white shadow-sm"
                              : isDone
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="text-gray-300">→</span>
                        )}
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

export default SpeechSegmentationVisualizer;
