import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateVADSteps, VADFrame } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface VADInput extends ProblemInput {
  signal_pattern: string;
  energy_threshold: number;
  zcr_threshold: number;
}

function parseFrames(raw: unknown): VADFrame[] {
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as VADFrame[]; } catch { return []; }
  }
  return [];
}

function parseSegments(raw: unknown): Array<{ start: number; end: number }> {
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as Array<{ start: number; end: number }>; } catch { return []; }
  }
  return [];
}

function EnergyBar({ frame, threshold, isCurrent }: { frame: VADFrame; threshold: number; isCurrent: boolean }) {
  const pct = Math.round(frame.energy * 100);
  const aboveThreshold = frame.energy > threshold;
  return (
    <div className={`flex flex-col items-center gap-1 ${isCurrent ? "opacity-100" : "opacity-80"}`}>
      <div className="relative w-5 h-20 bg-gray-100 rounded flex flex-col-reverse overflow-hidden">
        <div
          className="w-full rounded transition-all duration-300"
          style={{
            height: `${pct}%`,
            backgroundColor: frame.isSpeech ? "#22c55e" : aboveThreshold ? "#f59e0b" : "#94a3b8",
          }}
        />
        <div
          className="absolute w-full border-t-2 border-dashed border-red-400"
          style={{ bottom: `${Math.round(threshold * 100)}%` }}
        />
      </div>
      <span className="text-[9px] text-gray-400">{frame.idx}</span>
      {isCurrent && (
        <span className="text-[9px] font-bold text-blue-600">▲</span>
      )}
    </div>
  );
}

function ZCRBar({ frame, isCurrent }: { frame: VADFrame; isCurrent: boolean }) {
  const pct = Math.round(frame.zcr * 100);
  return (
    <div className={`flex flex-col items-center gap-1 ${isCurrent ? "opacity-100" : "opacity-80"}`}>
      <div className="relative w-5 h-12 bg-gray-100 rounded flex flex-col-reverse overflow-hidden">
        <div
          className="w-full rounded transition-all duration-300"
          style={{
            height: `${pct}%`,
            backgroundColor: "#8b5cf6",
            opacity: 0.7 + pct * 0.003,
          }}
        />
      </div>
      <span className="text-[9px] text-gray-400">{frame.idx}</span>
    </div>
  );
}

function VADVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10051);

  return (
    <ConfigurableVisualizer<VADInput, Record<string, never>>
      config={{
        defaultInput: {
          signal_pattern: "speech_silence",
          energy_threshold: 0.3,
          zcr_threshold: 0.2,
        },

        algorithm: (input) => {
          return generateVADSteps({
            signal_pattern: String(input.signal_pattern || "speech_silence"),
            energy_threshold: Number(input.energy_threshold ?? 0.3),
            zcr_threshold: Number(input.zcr_threshold ?? 0.2),
          });
        },

        inputTypes: [
          { type: "string", key: "signal_pattern", label: "信号模式" },
          { type: "number", key: "energy_threshold", label: "能量阈值" },
          { type: "number", key: "zcr_threshold", label: "ZCR阈值" },
        ],
        inputFields: [
          {
            type: "string",
            key: "signal_pattern",
            label: "信号模式",
            placeholder: "speech_silence",
          },
          {
            type: "number",
            key: "energy_threshold",
            label: "能量阈值 (0-1)",
            placeholder: "0.3",
          },
          {
            type: "number",
            key: "zcr_threshold",
            label: "ZCR 参考阈值",
            placeholder: "0.2",
          },
        ],

        testCases: [
          {
            label: "清晰语音（低噪声）",
            value: { signal_pattern: "speech_silence", energy_threshold: 0.3, zcr_threshold: 0.2 },
          },
          {
            label: "嘈杂环境",
            value: { signal_pattern: "noisy", energy_threshold: 0.35, zcr_threshold: 0.2 },
          },
          {
            label: "长时静音",
            value: { signal_pattern: "long_silence", energy_threshold: 0.3, zcr_threshold: 0.2 },
          },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const frames = parseFrames(variables?.frames);
          const currentFrameIdx = (variables?.currentFrameIdx as number) ?? -1;
          const voiceSegments = parseSegments(variables?.voiceSegments);
          const energyThreshold = (variables?.energyThreshold as number) ?? 0.3;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            energy_calc: { label: "能量计算", color: "bg-amber-100 text-amber-700" },
            zcr_calc: { label: "过零率计算", color: "bg-violet-100 text-violet-700" },
            decision: { label: "阈值判决", color: "bg-blue-100 text-blue-700" },
            complete: { label: "检测完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "energy_calc", "zcr_calc", "decision", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题栏 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">语音活动检测（VAD）</h3>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-4">
                      <InlineMath math="E_n = \frac{1}{N}\sum_{k=0}^{N-1} x^2(k)" />
                      <InlineMath math="ZCR_n = \frac{1}{2N}\sum_{k=1}^{N-1}|\text{sgn}(x_k)-\text{sgn}(x_{k-1})|" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 流程步骤条 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "energy_calc", label: "② 能量计算" },
                    { id: "zcr_calc", label: "③ ZCR计算" },
                    { id: "decision", label: "④ 阈值判决" },
                    { id: "complete", label: "⑤ 完成" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          step.id === phase ? "bg-amber-500 text-white shadow-sm" :
                          isDone ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 能量图 */}
              {frames.length > 0 && ["energy_calc", "zcr_calc", "decision", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    帧能量分布{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      — 红虚线为能量阈值 θ_E = {energyThreshold}
                    </span>
                  </h4>
                  <div className="flex items-end gap-0.5 overflow-x-auto pb-2">
                    {frames.map((f) => (
                      <EnergyBar
                        key={f.idx}
                        frame={f}
                        threshold={energyThreshold}
                        isCurrent={f.idx === currentFrameIdx && phase === "decision"}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 语音帧</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-400 inline-block" /> 静音帧</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t-2 border-dashed border-red-400 inline-block" /> 能量阈值</span>
                  </div>
                </div>
              )}

              {/* ZCR 图 */}
              {frames.length > 0 && ["zcr_calc", "decision", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    帧过零率（ZCR）<span className="text-xs text-gray-400 font-normal">— 清音/摩擦音过零率高</span>
                  </h4>
                  <div className="flex items-end gap-0.5 overflow-x-auto pb-2">
                    {frames.map((f) => (
                      <ZCRBar key={f.idx} frame={f} isCurrent={f.idx === currentFrameIdx && phase === "decision"} />
                    ))}
                  </div>
                </div>
              )}

              {/* VAD 时间线 */}
              {frames.length > 0 && ["decision", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">VAD 标签时间线</h4>
                  <div className="flex gap-0.5">
                    {frames.map((f) => (
                      <div
                        key={f.idx}
                        className="flex-1 h-8 rounded flex items-center justify-center transition-all"
                        style={{ backgroundColor: f.isSpeech ? "#22c55e" : "#e2e8f0" }}
                        title={`帧${f.idx}: ${f.isSpeech ? "语音" : "静音"}`}
                      >
                        <span className="text-[8px] font-bold" style={{ color: f.isSpeech ? "#fff" : "#94a3b8" }}>
                          {f.isSpeech ? "S" : "·"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>帧 0</span>
                    <span>帧 {frames.length - 1}</span>
                  </div>
                </div>
              )}

              {/* 检测到的语音段 */}
              {voiceSegments.length > 0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    检测到 {voiceSegments.length} 个语音段
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {voiceSegments.map((seg, i) => (
                      <div key={i} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-mono">
                        语音段 {i + 1}: 帧 {seg.start}–{seg.end}
                        <span className="ml-2 opacity-80">({seg.end - seg.start + 1} 帧)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 公式说明 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">双阈值判决规则</h4>
                <div className="space-y-2">
                  <BlockMath math="\text{isSpeech}(n) = \mathbb{1}[E_n > \theta_E] \wedge \mathbb{1}[\theta_{ZCR,\text{low}} < ZCR_n < \theta_{ZCR,\text{high}}]" />
                  <p className="text-xs text-gray-500">
                    能量阈值过滤弱信号（静音），过零率范围排除高频噪声，二者联合判决减少误检。
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

export default VADVisualizer;
