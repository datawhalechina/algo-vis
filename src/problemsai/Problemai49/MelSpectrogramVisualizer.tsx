import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateMelSpectrogramSteps, MelFilter, hzToMel } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface MelSpectrogramInput extends ProblemInput {
  nMels: number;
  fmin: number;
  fmax: number;
}

function heatColor(val: number): string {
  const v = Math.max(0, Math.min(1, val));
  if (v < 0.33) {
    const t = v / 0.33;
    return `hsl(260, 70%, ${20 + t * 20}%)`;
  } else if (v < 0.66) {
    const t = (v - 0.33) / 0.33;
    return `hsl(${260 - t * 140}, 65%, ${40 + t * 15}%)`;
  } else {
    const t = (v - 0.66) / 0.34;
    return `hsl(${120 - t * 80}, 80%, ${55 + t * 25}%)`;
  }
}

function HeatmapGrid({
  data,
  label,
  xLabel,
  yLabel,
  highlightCol,
}: {
  data: number[][];
  label: string;
  xLabel: string;
  yLabel: string;
  highlightCol?: number;
}) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400 italic p-2">等待计算...</div>;
  }
  const nFreqs = data[0]?.length ?? 0;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex gap-px">
        <div
          className="flex flex-col justify-between text-[9px] text-gray-400 pr-1 py-px"
          style={{ width: 20 }}
        >
          <span>高</span>
          <span>{yLabel}</span>
          <span>低</span>
        </div>
        <div className="flex flex-col gap-px flex-1">
          {Array.from({ length: nFreqs }, (_, freqIdx) => {
            const row = nFreqs - 1 - freqIdx;
            return (
              <div key={row} className="flex gap-px">
                {data.map((frameData, colIdx) => {
                  const val = frameData[row] ?? 0;
                  return (
                    <div
                      key={colIdx}
                      className={`flex-1 rounded-sm transition-all ${highlightCol === colIdx ? "ring-1 ring-white ring-inset" : ""}`}
                      style={{ height: 14, backgroundColor: heatColor(val) }}
                      title={`t=${colIdx} band=${row} val=${val.toFixed(3)}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1 ml-5">
        <span>t=0</span>
        <span>{xLabel}</span>
        <span>t={data.length - 1}</span>
      </div>
    </div>
  );
}

function FilterbankChart({ filters, nFreqs, currentFilter }: { filters: MelFilter[]; nFreqs: number; currentFilter: number }) {
  if (!filters || filters.length === 0) return null;

  const colors = [
    "#818cf8", "#a78bfa", "#c084fc", "#e879f9",
    "#f472b6", "#fb7185", "#f97316", "#facc15",
    "#4ade80", "#34d399", "#22d3ee", "#38bdf8",
    "#60a5fa", "#818cf8", "#a78bfa", "#c084fc",
  ];

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-2">
        梅尔三角滤波器组（{filters.length} 个滤波器，{nFreqs} 个频率箱）
      </div>
      <div className="relative h-20 bg-gray-50 rounded border border-gray-200 p-1">
        <svg className="w-full h-full" viewBox={`0 0 ${nFreqs} 1`} preserveAspectRatio="none">
          {filters.map((f, fi) => {
            const color = colors[fi % colors.length];
            const pts = f.values
              .map((v, k) => `${k},${1 - v}`)
              .join(" ");
            return (
              <polyline
                key={fi}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={fi === currentFilter ? 0.08 : 0.04}
                opacity={fi === currentFilter ? 1 : 0.6}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1">
        <span>0 Hz</span>
        <span>频率箱 →</span>
        <span>高频</span>
      </div>
    </div>
  );
}

function FreqScaleComparison({ nMels, fmax }: { nMels: number; fmax: number }) {
  const linearFreqs = Array.from({ length: 8 }, (_, i) => Math.round((i / 7) * fmax));
  const melMax = hzToMel(fmax);
  const melFreqs = Array.from({ length: nMels }, (_, i) => {
    const mel = (i / (nMels - 1)) * melMax;
    return Math.round(700 * (Math.pow(10, mel / 2595) - 1));
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1">线性频率刻度</div>
        <div className="flex flex-col gap-1">
          {linearFreqs.reverse().map((hz, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-600">{hz} Hz</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1">梅尔刻度（低频密集）</div>
        <div className="flex flex-col gap-1">
          {melFreqs.slice().reverse().slice(0, 8).map((hz, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-violet-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">{hz} Hz</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MelSpectrogramVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10049);

  return (
    <ConfigurableVisualizer<MelSpectrogramInput, Record<string, never>>
      config={{
        defaultInput: { nMels: 8, fmin: 0, fmax: 8000 },

        algorithm: (input) => {
          const nMels = Math.max(4, Math.min(32, Number(input.nMels) || 8));
          const fmin = Number(input.fmin) || 0;
          const fmax = Number(input.fmax) || 8000;
          return generateMelSpectrogramSteps(nMels, fmin, fmax);
        },

        inputTypes: [
          { type: "number", key: "nMels", label: "梅尔滤波器数" },
          { type: "number", key: "fmin", label: "最低频率 (Hz)" },
          { type: "number", key: "fmax", label: "最高频率 (Hz)" },
        ],
        inputFields: [
          { type: "number", key: "nMels", label: "梅尔滤波器数 (4-32)", placeholder: "8" },
          { type: "number", key: "fmin", label: "最低频率 fmin (Hz)", placeholder: "0" },
          { type: "number", key: "fmax", label: "最高频率 fmax (Hz)", placeholder: "8000" },
        ],

        testCases: [
          { label: "8 filters（默认）", value: { nMels: 8, fmin: 0, fmax: 8000 } },
          { label: "16 filters", value: { nMels: 16, fmin: 0, fmax: 8000 } },
          { label: "4 filters（精简）", value: { nMels: 4, fmin: 0, fmax: 4000 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const linearSpec = (variables?.linearSpec as unknown as number[][]) ?? [];
          const melSpec = (variables?.melSpec as unknown as number[][]) ?? [];
          const melFilters = (variables?.melFilters as unknown as MelFilter[]) ?? [];
          const melFreqs = (variables?.melFreqs as number[]) ?? [];
          const nMels = (variables?.nMels as number) ?? 8;
          const fmin = (variables?.fmin as number) ?? 0;
          const fmax = (variables?.fmax as number) ?? 8000;
          const nFreqs = (variables?.nFreqs as number) ?? 8;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "线性频谱图", color: "bg-gray-100 text-gray-700" },
            mel_scale: { label: "梅尔刻度转换", color: "bg-blue-100 text-blue-700" },
            filterbank: { label: "构造滤波器组", color: "bg-violet-100 text-violet-700" },
            apply: { label: "应用滤波器", color: "bg-amber-100 text-amber-700" },
            complete: { label: "梅尔频谱完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const pipelineSteps = [
            { id: "init", label: "① 线性频谱" },
            { id: "mel_scale", label: "② 梅尔转换" },
            { id: "filterbank", label: "③ 滤波器组" },
            { id: "apply", label: "④ 应用滤波" },
            { id: "complete", label: "⑤ 梅尔频谱" },
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
                    <h3 className="text-base font-semibold text-gray-900">梅尔频谱图（Mel Spectrogram）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="m = 2595 \cdot \log_{10}\!\left(1 + \frac{f}{700}\right)" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Pipeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {pipelineSteps.map((s, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(s.id);
                    const isDone = curIdx >= stepIdx;
                    return (
                      <div key={s.id} className="flex items-center gap-1">
                        <span className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          s.id === phase ? "bg-violet-600 text-white shadow-sm" :
                          isDone ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-400"
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
                  <span>梅尔滤波器数 = <strong>{nMels}</strong></span>
                  <span>fmin = <strong>{fmin} Hz</strong></span>
                  <span>fmax = <strong>{fmax} Hz</strong></span>
                  <span>线性频率箱 = <strong>{nFreqs}</strong></span>
                </div>
              </div>

              {/* Linear spectrogram */}
              {linearSpec.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">线性频谱图（输入）</h4>
                  <HeatmapGrid
                    data={linearSpec}
                    label={`线性幅度谱 — ${linearSpec.length} 帧 × ${nFreqs} 频率箱`}
                    xLabel="时间帧 →"
                    yLabel="频率"
                  />
                </div>
              )}

              {/* Mel scale comparison */}
              {(phase === "mel_scale" || phase === "filterbank" || phase === "apply" || phase === "complete") && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">线性频率 vs 梅尔频率刻度</h4>
                  <FreqScaleComparison nMels={nMels} fmax={fmax} />
                  <div className="mt-3">
                    <BlockMath math="m = 2595 \cdot \log_{10}\!\left(1 + \frac{f}{700}\right), \quad f = 700 \cdot \left(10^{m/2595} - 1\right)" />
                  </div>
                  {melFreqs.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      梅尔中心频率（前5个）：{melFreqs.slice(0, 5).join(", ")} Hz...（低频间距密，高频间距稀）
                    </p>
                  )}
                </div>
              )}

              {/* Filterbank */}
              {(phase === "filterbank" || phase === "apply" || phase === "complete") && melFilters.length > 0 && (
                <div className="bg-violet-50 rounded-lg border border-violet-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-violet-800 mb-3">梅尔三角滤波器组</h4>
                  <FilterbankChart filters={melFilters} nFreqs={nFreqs} currentFilter={-1} />
                  <div className="mt-3">
                    <BlockMath math="H_m(k) = \begin{cases} \frac{k - f(m-1)}{f(m) - f(m-1)} & f(m-1) \le k \le f(m) \\ \frac{f(m+1) - k}{f(m+1) - f(m)} & f(m) \le k \le f(m+1) \\ 0 & \text{otherwise} \end{cases}" />
                  </div>
                </div>
              )}

              {/* Mel spectrogram in progress */}
              {(phase === "apply" || phase === "complete") && melSpec.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    梅尔频谱图（输出）
                    {phase === "apply" && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">计算中 {melSpec.length}/16 帧...</span>
                    )}
                  </h4>
                  <HeatmapGrid
                    data={melSpec}
                    label={`梅尔幅度谱 — ${melSpec.length} 帧 × ${nMels} 梅尔频带`}
                    xLabel="时间帧 →"
                    yLabel="梅尔频带"
                    highlightCol={phase === "apply" ? melSpec.length - 1 : undefined}
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    滤波器应用公式：<InlineMath math="S_{mel}(t, m) = \sum_{k=0}^{K-1} H_m(k) \cdot S_{lin}(t, k)" />
                  </div>
                </div>
              )}

              {/* Color legend */}
              {(phase === "apply" || phase === "complete") && (
                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <div className="text-xs text-gray-500">低能量</div>
                  <div className="flex gap-px flex-1">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: heatColor(i / 19) }} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">高能量</div>
                </div>
              )}

              {/* Completion */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">梅尔频谱图完成</h4>
                  <p className="text-xs text-emerald-700">
                    通过 {nMels} 个梅尔三角滤波器，将 {nFreqs} 个线性频率箱压缩为 {nMels} 个梅尔频带。
                    低频区域（人声基频 80-300 Hz）获得更高的分辨率，适合语音识别和音乐信息检索任务。
                    下一步可对梅尔频谱取对数并做 DCT，得到 MFCC 特征。
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

export default MelSpectrogramVisualizer;
