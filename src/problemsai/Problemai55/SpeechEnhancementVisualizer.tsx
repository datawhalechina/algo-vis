import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateSpeechEnhancementSteps, NoiseLevel, EnhancementMethod } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SpeechEnhancementInput extends ProblemInput {
  noise_level: string;
  method: string;
}

function parseSpec(str: string): number[][] {
  if (!str) return [];
  return str.split("|").map((row) => row.split(",").map(Number));
}

function parseProfile(str: string): number[] {
  if (!str) return [];
  return str.split(",").map(Number);
}

// Map a value 0-1 to a heatmap color (blue -> cyan -> green -> yellow -> red)
function heatColor(v: number): string {
  const clamped = Math.max(0, Math.min(1, v));
  // Use a teal-to-red spectrum
  const h = Math.round(220 - clamped * 220);
  const s = 70;
  const l = Math.round(85 - clamped * 40);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function Spectrogram({
  spec,
  label,
  highlightFrame,
  compact,
}: {
  spec: number[][];
  label: string;
  highlightFrame?: number;
  compact?: boolean;
}) {
  if (!spec || spec.length === 0) return null;
  const cellSize = compact ? 18 : 24;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="inline-flex flex-col gap-0.5">
        {spec.map((frame, t) => (
          <div
            key={t}
            className={`flex gap-0.5 rounded transition-all ${
              highlightFrame === t ? "ring-2 ring-blue-400 ring-offset-1" : ""
            }`}
          >
            {frame.map((v, f) => (
              <div
                key={f}
                className="rounded-sm flex items-center justify-center transition-all duration-200"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: heatColor(v),
                }}
                title={`t=${t} f=${f}: ${v.toFixed(3)}`}
              >
                {!compact && (
                  <span className="text-[7px] font-mono" style={{ color: v > 0.6 ? "#fff" : "#374151" }}>
                    {v.toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-0.5 mt-0.5">
          {spec[0]?.map((_, f) => (
            <div key={f} style={{ width: cellSize }} className="text-[8px] text-center text-gray-400">
              f{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoiseProfileBars({ profile }: { profile: number[] }) {
  const maxVal = Math.max(...profile, 0.01);
  return (
    <div className="flex gap-1 items-end h-14">
      {profile.map((v, f) => (
        <div key={f} className="flex flex-col items-center gap-0.5">
          <div
            className="w-6 rounded-t transition-all duration-300 bg-red-400"
            style={{ height: `${Math.round((v / maxVal) * 48)}px`, opacity: 0.7 + (v / maxVal) * 0.3 }}
          />
          <span className="text-[8px] text-gray-400 font-mono">f{f}</span>
        </div>
      ))}
    </div>
  );
}

function SNRGauge({ value, label, color }: { value: number; label: string; color: string }) {
  // SNR range roughly -5 to 30 dB
  const pct = Math.max(0, Math.min(100, ((value + 5) / 35) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>
          {value} dB
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SpeechEnhancementVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10055);

  return (
    <ConfigurableVisualizer<SpeechEnhancementInput, Record<string, never>>
      config={{
        defaultInput: { noise_level: "medium", method: "wiener_filter" },

        algorithm: (input) => {
          const noiseLevel = (input.noise_level as NoiseLevel) || "medium";
          const method = (input.method as EnhancementMethod) || "wiener_filter";
          return generateSpeechEnhancementSteps(noiseLevel, method);
        },

        inputTypes: [
          { type: "string", key: "noise_level", label: "噪声级别" },
          { type: "string", key: "method", label: "增强方法" },
        ],
        inputFields: [
          {
            type: "string",
            key: "noise_level",
            label: "噪声级别（low/medium/high）",
            placeholder: "medium",
          },
          {
            type: "string",
            key: "method",
            label: "增强方法（spectral_subtraction/wiener_filter）",
            placeholder: "wiener_filter",
          },
        ],

        testCases: [
          { label: "低噪声（SNR=20dB）", value: { noise_level: "low", method: "spectral_subtraction" } },
          { label: "中等噪声（SNR=10dB）", value: { noise_level: "medium", method: "wiener_filter" } },
          { label: "高噪声（SNR=0dB）", value: { noise_level: "high", method: "wiener_filter" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const method = (variables?.method as string) ?? "wiener_filter";
          const noiseLevel = (variables?.noiseLevel as string) ?? "medium";
          const noisySpecStr = (variables?.noisySpec as string) ?? "";
          const enhancedSpecStr = (variables?.enhancedSpec as string) ?? "";
          const noiseProfileStr = (variables?.noiseProfile as string) ?? "";
          const maskStr = (variables?.mask as string) ?? "";
          const currentBin = variables?.currentBin as number | undefined;
          const snrBefore = variables?.snrBefore as number | undefined;
          const snrAfter = variables?.snrAfter as number | undefined;

          const noisySpec = parseSpec(noisySpecStr);
          const enhancedSpec = parseSpec(enhancedSpecStr);
          const noiseProfile = parseProfile(noiseProfileStr);
          const mask = parseSpec(maskStr);

          const isWiener = method === "wiener_filter";

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "输入频谱", color: "bg-gray-100 text-gray-700" },
            noise_est: { label: "噪声估计", color: "bg-red-100 text-red-700" },
            mask: { label: "计算掩蔽", color: "bg-amber-100 text-amber-700" },
            apply: { label: "应用掩蔽", color: "bg-blue-100 text-blue-700" },
            compare: { label: "增强对比", color: "bg-violet-100 text-violet-700" },
            complete: { label: "增强完成", color: "bg-teal-100 text-teal-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "noise_est", "mask", "apply", "compare", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          const noiseLabelMap: Record<string, string> = {
            low: "低（SNR≈20dB）",
            medium: "中（SNR≈10dB）",
            high: "高（SNR≈0dB）",
          };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">语音增强（Speech Enhancement）</h3>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <div>
                        <span className="text-gray-400 mr-2">方法：</span>
                        <span className="font-medium text-teal-700">
                          {isWiener ? "维纳滤波（Wiener Filter）" : "谱减法（Spectral Subtraction）"}
                        </span>
                        <span className="ml-3 text-gray-400 mr-2">噪声：</span>
                        <span className="font-medium">{noiseLabelMap[noiseLevel] ?? noiseLevel}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Formulas */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">增强公式</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`rounded-lg p-3 border ${!isWiener ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                    <div className="text-xs font-semibold mb-1 text-amber-700">谱减法</div>
                    <BlockMath math="|Y_{\text{enh}}(f)| = \max(|Y(f)| - \alpha|\hat{N}(f)|,\ 0)" />
                  </div>
                  <div className={`rounded-lg p-3 border ${isWiener ? "bg-teal-50 border-teal-200" : "bg-gray-50 border-gray-200"}`}>
                    <div className="text-xs font-semibold mb-1 text-teal-700">维纳滤波</div>
                    <BlockMath math="W(f) = \frac{|\hat{S}(f)|^2}{|\hat{S}(f)|^2 + |\hat{N}(f)|^2}" />
                  </div>
                </div>
              </div>

              {/* Noisy Spectrogram */}
              {noisySpec.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    带噪语音频谱图（{noisySpec.length} 帧 × {noisySpec[0]?.length ?? 0} 频段）
                  </h4>
                  <div className="flex flex-wrap gap-6">
                    <Spectrogram
                      spec={noisySpec}
                      label="带噪频谱 Y(t,f)"
                      highlightFrame={phase === "noise_est" ? 6 : phase === "noise_est" ? 7 : undefined}
                    />
                    {["noise_est", "mask", "apply", "compare", "complete"].includes(phase) && noiseProfile.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          噪声功率谱估计 N̂(f)
                        </div>
                        <NoiseProfileBars profile={noiseProfile} />
                        <p className="text-xs text-gray-400 mt-1">从第 6-7 帧（静音段）估计</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mask */}
              {mask.length > 0 && ["mask", "apply", "compare", "complete"].includes(phase) && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">
                    时频掩蔽 W(t,f)
                    {currentBin !== undefined && phase === "mask" && (
                      <span className="ml-2 text-xs font-normal text-amber-600">
                        正在计算第 {(currentBin ?? 0) + 1}/{noisySpec.length} 帧...
                      </span>
                    )}
                  </h4>
                  <Spectrogram
                    spec={mask}
                    label="掩蔽权重（0=噪声抑制，1=保留）"
                    highlightFrame={phase === "mask" ? currentBin : undefined}
                    compact
                  />
                  <p className="text-xs text-amber-600 mt-2">
                    掩蔽值接近 1 表示该时频单元为语音主导；接近 0 表示噪声主导，需被抑制
                  </p>
                </div>
              )}

              {/* Before/After Comparison */}
              {enhancedSpec.length > 0 && ["apply", "compare", "complete"].includes(phase) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">增强前后频谱对比</h4>
                  <div className="flex flex-wrap gap-6">
                    <Spectrogram spec={noisySpec} label="带噪语音 Y(t,f)" compact />
                    <Spectrogram spec={enhancedSpec} label="增强语音 Ŷ(t,f)" compact />
                  </div>
                </div>
              )}

              {/* SNR Improvement */}
              {snrBefore !== undefined && snrAfter !== undefined && (
                <div className="bg-teal-50 rounded-xl border border-teal-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-teal-800 mb-3">信噪比（SNR）改善</h4>
                  <div className="space-y-3">
                    <SNRGauge value={snrBefore} label="增强前 SNR" color="#ef4444" />
                    <SNRGauge value={snrAfter} label="增强后 SNR" color="#0d9488" />
                  </div>
                  <div className="mt-3 text-xs text-teal-600">
                    <BlockMath math="\text{SNR} = 10\log_{10}\frac{\sum |s(t,f)|^2}{\sum |n(t,f)|^2}\ \text{(dB)}" />
                  </div>
                  <div className="bg-teal-100 rounded-lg px-3 py-2 text-sm font-semibold text-teal-800">
                    SNR 提升：+{(snrAfter - snrBefore).toFixed(1)} dB
                  </div>
                </div>
              )}

              {/* Pipeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">增强流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入带噪频谱" },
                    { id: "noise_est", label: "② 估计噪声谱" },
                    { id: "mask", label: "③ 计算掩蔽" },
                    { id: "apply", label: "④ 应用掩蔽" },
                    { id: "compare", label: "⑤ 对比增强效果" },
                    { id: "complete", label: "⑥ 完成" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-teal-600 text-white shadow-sm"
                              : isDone
                              ? "bg-teal-100 text-teal-700"
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

export default SpeechEnhancementVisualizer;
