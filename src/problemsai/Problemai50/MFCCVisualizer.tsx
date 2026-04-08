import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateMFCCSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface MFCCInput extends ProblemInput {
  nMfcc: number;
  frameIdx: number;
}

// Blue-ish heatmap
function heatColorBlue(val: number): string {
  const v = Math.max(0, Math.min(1, val));
  if (v < 0.5) {
    const t = v / 0.5;
    return `hsl(220, 75%, ${20 + t * 30}%)`;
  }
  const t = (v - 0.5) / 0.5;
  return `hsl(${220 - t * 160}, 80%, ${50 + t * 30}%)`;
}

// Green heatmap for delta
function heatColorGreen(val: number): string {
  const v = Math.max(0, Math.min(1, Math.abs(val)));
  if (v < 0.5) {
    const t = v / 0.5;
    return `hsl(160, 60%, ${20 + t * 25}%)`;
  }
  const t = (v - 0.5) / 0.5;
  return `hsl(${160 - t * 60}, 70%, ${45 + t * 30}%)`;
}

// Orange heatmap for delta-delta
function heatColorOrange(val: number): string {
  const v = Math.max(0, Math.min(1, Math.abs(val)));
  if (v < 0.5) {
    const t = v / 0.5;
    return `hsl(30, 70%, ${20 + t * 25}%)`;
  }
  const t = (v - 0.5) / 0.5;
  return `hsl(${30 + t * 30}, 80%, ${45 + t * 30}%)`;
}

function HeatmapMatrix({
  data,
  label,
  colorFn,
  highlightFrame,
  rowLabel,
  colLabel,
}: {
  data: number[][];
  label: string;
  colorFn: (v: number) => string;
  highlightFrame?: number;
  rowLabel: string;
  colLabel: string;
}) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400 italic p-2">等待计算...</div>;
  }
  const nCols = data[0]?.length ?? 0;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex gap-px">
        <div
          className="flex flex-col justify-between text-[9px] text-gray-400 pr-1"
          style={{ width: 20 }}
        >
          <span>t=0</span>
          <span>{rowLabel}</span>
          <span>t={data.length - 1}</span>
        </div>
        <div className="flex flex-col gap-px flex-1">
          {data.map((row, ti) => (
            <div
              key={ti}
              className={`flex gap-px ${highlightFrame === ti ? "ring-1 ring-blue-400 rounded" : ""}`}
            >
              {row.map((val, ci) => (
                <div
                  key={ci}
                  className="flex-1 rounded-sm"
                  style={{ height: 11, backgroundColor: colorFn(val) }}
                  title={`t=${ti} coeff=${ci} val=${val.toFixed(3)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1 ml-5">
        <span>c0</span>
        <span>{colLabel} →</span>
        <span>c{nCols - 1}</span>
      </div>
    </div>
  );
}

function CoeffBar({
  coeffs,
  label,
  colorFn,
}: {
  coeffs: number[];
  label: string;
  colorFn: (v: number) => string;
}) {
  if (!coeffs || coeffs.length === 0) return null;
  const max = Math.max(...coeffs.map(Math.abs), 0.001);
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex items-end gap-1 h-14 bg-gray-50 rounded p-1">
        {coeffs.map((v, i) => {
          const h = Math.max(2, (Math.abs(v) / max) * 44);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full rounded-t"
                style={{ height: h, backgroundColor: colorFn(Math.abs(v) / max) }}
                title={`c${i}=${v.toFixed(4)}`}
              />
              {i % 3 === 0 && (
                <span className="text-[8px] text-gray-400 mt-px">{i}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DCTBasisViz({ nMfcc }: { nMfcc: number }) {
  const nBasis = Math.min(nMfcc, 6);
  const M = 8;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-2">DCT 基函数（前 {nBasis} 个）</div>
      <div className="flex gap-2">
        {Array.from({ length: nBasis }, (_, n) => {
          const vals = Array.from({ length: M }, (__, m) =>
            Math.cos((Math.PI * (n + 1) * (m + 0.5)) / M)
          );
          const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];
          return (
            <div key={n} className="flex-1">
              <div className="text-[9px] text-gray-500 text-center mb-1">n={n + 1}</div>
              <div className="flex items-center gap-px h-8 bg-gray-50 rounded">
                {vals.map((v, m) => {
                  const h = Math.max(2, Math.abs(v) * 14);
                  return (
                    <div key={m} className="flex-1 flex items-center justify-center" style={{ height: 32 }}>
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height: h,
                          backgroundColor: colors[n % colors.length],
                          opacity: v >= 0 ? 1 : 0.5,
                          marginTop: v < 0 ? (32 - h) / 2 + 8 : (32 - h) / 2,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MFCCVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10050);

  return (
    <ConfigurableVisualizer<MFCCInput, Record<string, never>>
      config={{
        defaultInput: { nMfcc: 13, frameIdx: 4 },

        algorithm: (input) => {
          const nMfcc = Math.max(4, Math.min(20, Number(input.nMfcc) || 13));
          const frameIdx = Math.max(0, Math.min(15, Number(input.frameIdx) || 4));
          return generateMFCCSteps(nMfcc, frameIdx);
        },

        inputTypes: [
          { type: "number", key: "nMfcc", label: "MFCC 系数数量" },
          { type: "number", key: "frameIdx", label: "分析帧索引 (0-15)" },
        ],
        inputFields: [
          { type: "number", key: "nMfcc", label: "MFCC 系数数量 (4-20)", placeholder: "13" },
          { type: "number", key: "frameIdx", label: "分析帧索引 (0-15)", placeholder: "4" },
        ],

        testCases: [
          { label: "标准 13 系数", value: { nMfcc: 13, frameIdx: 4 } },
          { label: "20 系数（高维）", value: { nMfcc: 20, frameIdx: 8 } },
          { label: "6 系数（精简）", value: { nMfcc: 6, frameIdx: 0 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const melSpec = (variables?.melSpec as unknown as number[][]) ?? [];
          const logMelSpec = (variables?.logMelSpec as unknown as number[][]) ?? [];
          const mfccMatrix = (variables?.mfccMatrix as unknown as number[][]) ?? [];
          const deltaMatrix = (variables?.deltaMatrix as unknown as number[][]) ?? [];
          const delta2Matrix = (variables?.delta2Matrix as unknown as number[][]) ?? [];
          const currentFrame = (variables?.currentFrame as number) ?? -1;
          const nMfcc = (variables?.nMfcc as number) ?? 13;
          const nMels = (variables?.nMels as number) ?? 8;
          const nFrames = (variables?.nFrames as number) ?? 16;
          const currentCoeffs = (variables?.currentCoeffs as number[]) ?? [];

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "梅尔频谱", color: "bg-gray-100 text-gray-700" },
            log: { label: "对数压缩", color: "bg-blue-100 text-blue-700" },
            dct: { label: "DCT 变换", color: "bg-violet-100 text-violet-700" },
            mfcc: { label: "MFCC 提取", color: "bg-indigo-100 text-indigo-700" },
            delta: { label: "Delta 计算", color: "bg-emerald-100 text-emerald-700" },
            complete: { label: "全部完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const pipelineSteps = [
            { id: "init", label: "① 梅尔频谱" },
            { id: "log", label: "② 取对数" },
            { id: "dct", label: "③ DCT" },
            { id: "mfcc", label: "④ MFCC" },
            { id: "delta", label: "⑤ Delta" },
            { id: "complete", label: "⑥ 完成" },
          ];
          const phaseOrder = pipelineSteps.map((s) => s.id);
          const curIdx = phaseOrder.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      MFCC（梅尔频率倒谱系数）
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="c_n = \sum_{m=1}^{M} \log S_m \cdot \cos\!\left(\frac{\pi n(m-0.5)}{M}\right)" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Pipeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                  {pipelineSteps.map((s, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(s.id);
                    const isDone = curIdx >= stepIdx;
                    return (
                      <div key={s.id} className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-lg font-medium transition-all ${
                          s.id === phase ? "bg-emerald-600 text-white shadow-sm" :
                          isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}>{s.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Params */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex gap-6 text-xs text-gray-600 flex-wrap">
                  <span>MFCC 系数数 N = <strong>{nMfcc}</strong></span>
                  <span>梅尔频带数 M = <strong>{nMels}</strong></span>
                  <span>帧数 T = <strong>{nFrames}</strong></span>
                  <span>特征维度 = <strong>{nMfcc * 3}</strong>（含 Δ + ΔΔ）</span>
                  {currentFrame >= 0 && (
                    <span>当前帧 = <strong>#{currentFrame + 1}</strong></span>
                  )}
                </div>
              </div>

              {/* Mel spectrogram */}
              {melSpec.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">梅尔频谱图（输入）</h4>
                  <HeatmapMatrix
                    data={melSpec}
                    label={`梅尔幅度谱 — ${nFrames} 帧 × ${nMels} 梅尔频带`}
                    colorFn={heatColorBlue}
                    rowLabel="时间帧"
                    colLabel="梅尔频带"
                  />
                </div>
              )}

              {/* Log mel spectrogram */}
              {logMelSpec.length > 0 && (phase === "log" || phase === "dct" || phase === "mfcc" || phase === "delta" || phase === "complete") && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">对数梅尔频谱（Log Mel Spectrogram）</h4>
                  <HeatmapMatrix
                    data={logMelSpec}
                    label={`log S_mel — ${nFrames} 帧 × ${nMels} 频带`}
                    colorFn={heatColorBlue}
                    rowLabel="时间帧"
                    colLabel="梅尔频带"
                  />
                  <div className="mt-2">
                    <BlockMath math="\hat{S}(t, m) = \log\!\left(\max\!\left(S_{mel}(t, m),\ \epsilon\right)\right)" />
                  </div>
                </div>
              )}

              {/* DCT basis */}
              {(phase === "dct" || phase === "mfcc") && (
                <div className="bg-violet-50 rounded-lg border border-violet-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-violet-800 mb-3">离散余弦变换（DCT-II）</h4>
                  <DCTBasisViz nMfcc={nMfcc} />
                  <div className="mt-3">
                    <BlockMath math="c_n = \sum_{m=1}^{M} \log S_m \cdot \cos\!\left(\frac{\pi n(m-0.5)}{M}\right),\ n = 1, \ldots, N" />
                  </div>
                  <p className="text-xs text-violet-600 mt-1">
                    DCT 基函数在梅尔频率域上正交，将相关的梅尔系数变换为不相关的倒谱系数
                  </p>
                </div>
              )}

              {/* Current frame coefficients */}
              {currentCoeffs.length > 0 && (phase === "dct" || phase === "mfcc") && (
                <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-indigo-800 mb-2">
                    第 {currentFrame + 1} 帧的 MFCC 系数（{nMfcc} 维）
                  </h4>
                  <CoeffBar coeffs={currentCoeffs} label="MFCC 倒谱系数" colorFn={heatColorBlue} />
                  <p className="text-xs text-indigo-600 mt-2">
                    c0 反映总能量；c1-c{Math.min(4, nMfcc - 1)} 捕获共振峰位置（声道形状）；高阶系数反映谱细节
                  </p>
                </div>
              )}

              {/* MFCC full matrix */}
              {mfccMatrix.length > 0 && (phase === "dct" || phase === "mfcc" || phase === "delta" || phase === "complete") && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    MFCC 矩阵{phase === "dct" ? "（计算中）" : ""}
                  </h4>
                  <HeatmapMatrix
                    data={mfccMatrix}
                    label={`MFCC C ∈ ℝ^{T×N} — ${nFrames} 帧 × ${nMfcc} 系数`}
                    colorFn={heatColorBlue}
                    highlightFrame={currentFrame >= 0 ? currentFrame : undefined}
                    rowLabel="时间帧"
                    colLabel="倒谱系数"
                  />
                </div>
              )}

              {/* Delta */}
              {deltaMatrix.length > 0 && (phase === "delta" || phase === "complete") && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">Delta MFCC（一阶差分）</h4>
                  <HeatmapMatrix
                    data={deltaMatrix}
                    label={`ΔC — ${nFrames} 帧 × ${nMfcc} 系数`}
                    colorFn={heatColorGreen}
                    rowLabel="时间帧"
                    colLabel="倒谱系数"
                  />
                  <div className="mt-2">
                    <BlockMath math="\Delta c_t = \frac{c_{t+1} - c_{t-1}}{2}" />
                  </div>
                </div>
              )}

              {/* Delta-Delta */}
              {delta2Matrix.length > 0 && phase === "complete" && (
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-orange-800 mb-3">Delta-Delta MFCC（二阶差分）</h4>
                  <HeatmapMatrix
                    data={delta2Matrix}
                    label={`ΔΔC — ${nFrames} 帧 × ${nMfcc} 系数`}
                    colorFn={heatColorOrange}
                    rowLabel="时间帧"
                    colLabel="倒谱系数"
                  />
                  <div className="mt-2">
                    <BlockMath math="\Delta^2 c_t = \Delta c_{t+1} - \Delta c_{t-1}" />
                  </div>
                </div>
              )}

              {/* Summary */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">MFCC 特征提取完成</h4>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    {[
                      { label: "MFCC", dim: nMfcc, color: "bg-blue-100 text-blue-700" },
                      { label: "Delta", dim: nMfcc, color: "bg-emerald-100 text-emerald-700" },
                      { label: "Delta²", dim: nMfcc, color: "bg-orange-100 text-orange-700" },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-lg p-2 ${item.color}`}>
                        <div className="text-sm font-bold">{item.dim}D</div>
                        <div className="text-xs">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-emerald-800">
                      最终特征维度：{nMfcc * 3}D（{nMfcc} + {nMfcc} + {nMfcc}）
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-2">
                    标准 ASR 系统（如 GMM-HMM、LSTM-CTC）使用 39 维 MFCC 特征（13+13+13），
                    有效压缩语音信号、去除噪声、捕获声道共振模式。
                  </p>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default MFCCVisualizer;
