import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateSpectrogramSteps, SignalType } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SpectrogramInput extends ProblemInput {
  signalType: string;
  nFft: number;
}

function heatColor(val: number): string {
  // 0 = dark blue, 1 = bright yellow (viridis-like)
  const v = Math.max(0, Math.min(1, val));
  if (v < 0.25) {
    const t = v / 0.25;
    return `hsl(240, 80%, ${20 + t * 20}%)`;
  } else if (v < 0.5) {
    const t = (v - 0.25) / 0.25;
    return `hsl(${240 - t * 120}, 75%, ${40 + t * 10}%)`;
  } else if (v < 0.75) {
    const t = (v - 0.5) / 0.25;
    return `hsl(${120 - t * 60}, 70%, ${50 + t * 10}%)`;
  } else {
    const t = (v - 0.75) / 0.25;
    return `hsl(${60 - t * 20}, 90%, ${60 + t * 20}%)`;
  }
}

function WaveformBars({ signal }: { signal: number[] }) {
  const display = 64;
  const step = Math.max(1, Math.floor(signal.length / display));
  const bars: number[] = [];
  for (let i = 0; i < display; i++) {
    bars.push(signal[i * step] ?? 0);
  }
  return (
    <div className="flex items-center gap-px h-16 bg-gray-50 rounded p-1">
      {bars.map((v, i) => {
        const height = Math.abs(v) * 28 + 2;
        const isPos = v >= 0;
        return (
          <div key={i} className="flex flex-col items-center justify-center flex-1" style={{ height: 56 }}>
            {isPos ? (
              <>
                <div className="w-full rounded-sm bg-blue-400" style={{ height }} />
                <div className="w-full" style={{ height: 56 - height }} />
              </>
            ) : (
              <>
                <div className="w-full" style={{ height: 56 - height }} />
                <div className="w-full rounded-sm bg-blue-300" style={{ height }} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HeatmapGrid({
  data,
  label,
  nFreqs,
  nFrames,
  highlightCol,
}: {
  data: number[][];
  label: string;
  nFreqs: number;
  nFrames: number;
  highlightCol?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic p-2">等待计算...</div>
    );
  }

  // data is [nFrames][nFreqs], display transposed: rows=freqs (top=high freq), cols=time
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex gap-px">
        {/* Y-axis label */}
        <div className="flex flex-col justify-between text-[9px] text-gray-400 pr-1 py-px" style={{ width: 20 }}>
          <span>高</span>
          <span>频</span>
          <span>率</span>
          <span>低</span>
        </div>
        <div className="flex flex-col gap-px flex-1">
          {Array.from({ length: nFreqs }, (_, freqIdx) => {
            const row = nFreqs - 1 - freqIdx; // flip: top = high freq
            return (
              <div key={row} className="flex gap-px">
                {data.map((frameData, colIdx) => {
                  const val = frameData[row] ?? 0;
                  return (
                    <div
                      key={colIdx}
                      className={`flex-1 rounded-sm transition-all duration-100 ${highlightCol === colIdx ? "ring-1 ring-white ring-inset" : ""}`}
                      style={{
                        height: 14,
                        backgroundColor: heatColor(val),
                        opacity: data.length < nFrames ? 0.5 + (0.5 * colIdx) / data.length : 1,
                      }}
                      title={`t=${colIdx} f=${row} val=${val.toFixed(3)}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {/* X-axis */}
      <div className="flex justify-between text-[9px] text-gray-400 mt-1 ml-5">
        <span>t=0</span>
        <span>时间帧 →</span>
        <span>t={data.length - 1}</span>
      </div>
    </div>
  );
}

function WindowBars({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 0.01);
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex items-end gap-px h-12 bg-gray-50 rounded p-1">
        {values.map((v, i) => {
          const h = Math.max(2, Math.round((v / max) * 40));
          return (
            <div
              key={i}
              className="flex-1 rounded-sm bg-violet-400"
              style={{ height: h }}
              title={`n=${i}: ${v.toFixed(3)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function SpectrogramVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10048);

  return (
    <ConfigurableVisualizer<SpectrogramInput, Record<string, never>>
      config={{
        defaultInput: { signalType: "sine", nFft: 64 },

        algorithm: (input) => {
          const st = (input.signalType as SignalType) || "sine";
          const nFft = Number(input.nFft) || 64;
          return generateSpectrogramSteps(st, nFft);
        },

        inputTypes: [
          { type: "string", key: "signalType", label: "信号类型" },
          { type: "number", key: "nFft", label: "FFT 点数" },
        ],
        inputFields: [
          {
            type: "string",
            key: "signalType",
            label: "信号类型 (sine/speech/noise)",
            placeholder: "sine",
          },
          {
            type: "number",
            key: "nFft",
            label: "FFT 点数 (32/64/128)",
            placeholder: "64",
          },
        ],

        testCases: [
          { label: "正弦信号", value: { signalType: "sine", nFft: 64 } },
          { label: "语音信号", value: { signalType: "speech", nFft: 64 } },
          { label: "噪声信号", value: { signalType: "noise", nFft: 64 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const signal = (variables?.signal as number[]) ?? [];
          const spectrogram = (variables?.spectrogram as unknown as number[][]) ?? [];
          const frames = (variables?.frames as unknown as number[][]) ?? [];
          const currentFrameIdx = (variables?.currentFrameIdx as number) ?? -1;
          const nFft = (variables?.nFft as number) ?? 64;
          const signalType = (variables?.signalType as string) ?? "sine";
          const windowSize = (variables?.windowSize as number) ?? 32;
          const hopLength = (variables?.hopLength as number) ?? 16;
          const windowValues = (variables?.windowValues as number[]) ?? [];
          const N_FREQS = 8;
          const DISPLAY_FRAMES = 16;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "信号采集", color: "bg-gray-100 text-gray-700" },
            windowing: { label: "分帧加窗", color: "bg-blue-100 text-blue-700" },
            fft: { label: "FFT 计算", color: "bg-violet-100 text-violet-700" },
            spectrogram: { label: "频谱图完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const signalLabel: Record<string, string> = {
            sine: "正弦波", speech: "语音模拟", noise: "噪声",
          };

          const pipelineSteps = [
            { id: "init", label: "① 音频信号" },
            { id: "windowing", label: "② 分帧加窗" },
            { id: "fft", label: "③ 逐帧 FFT" },
            { id: "spectrogram", label: "④ 频谱图" },
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
                      频谱图（Spectrogram）— {signalLabel[signalType] ?? signalType}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="X(m, k) = \sum_{n=0}^{N-1} x(n+mH) \cdot w(n) \cdot e^{-j2\pi kn/N}" />
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
                          s.id === phase ? "bg-blue-600 text-white shadow-sm" :
                          isDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
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
                  <span>窗口大小 N = <strong>{windowSize}</strong></span>
                  <span>帧移 H = <strong>{hopLength}</strong></span>
                  <span>FFT 点数 = <strong>{nFft}</strong></span>
                  <span>频率箱数 = <strong>{N_FREQS}</strong></span>
                </div>
              </div>

              {/* Signal waveform */}
              {signal.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    时域信号波形（{signal.length} 采样点）
                  </h4>
                  <WaveformBars signal={signal} />
                  <p className="text-xs text-gray-500 mt-2">
                    信号类型：<strong>{signalLabel[signalType]}</strong>，振幅范围 [-1, 1]
                  </p>
                </div>
              )}

              {/* Hanning window */}
              {phase === "windowing" && windowValues.length > 0 && (
                <div className="bg-violet-50 rounded-lg border border-violet-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-violet-800 mb-2">汉宁窗（Hanning Window）</h4>
                  <WindowBars values={windowValues} label={`w(n), N=${windowSize}`} />
                  <div className="mt-2">
                    <BlockMath math="w(n) = 0.5 \cdot \left(1 - \cos\!\left(\frac{2\pi n}{N-1}\right)\right)" />
                  </div>
                  <p className="text-xs text-violet-600">两端渐变为 0，减少分帧截断引起的频谱泄露</p>
                </div>
              )}

              {/* Frames being extracted */}
              {(phase === "windowing" || phase === "fft") && frames.length > 0 && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    已提取帧 ({frames.length} / {Math.floor((signal.length - windowSize) / hopLength) + 1} 帧)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {frames.slice(-3).map((frame, fi) => {
                      const frameNum = frames.length - (Math.min(frames.length, 3)) + fi;
                      const max = Math.max(...frame.map(Math.abs), 0.01);
                      return (
                        <div key={fi} className="bg-white rounded border border-blue-100 p-2">
                          <div className="text-xs font-mono text-blue-600 mb-1">帧 #{frameNum + 1}</div>
                          <div className="flex items-center gap-px h-8">
                            {frame.map((v, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-sm"
                                style={{
                                  height: Math.max(2, Math.abs(v / max) * 28),
                                  backgroundColor: v >= 0 ? "#60a5fa" : "#93c5fd",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {currentFrameIdx >= 0 && (
                    <p className="text-xs text-blue-500 mt-2">
                      当前帧起始位置：n = {currentFrameIdx * hopLength}，每帧与前帧重叠 {windowSize - hopLength} 点
                    </p>
                  )}
                </div>
              )}

              {/* Spectrogram heatmap */}
              {spectrogram.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    时频矩阵（频谱图热力图）
                    {phase === "fft" && (
                      <span className="ml-2 text-xs text-violet-600 font-normal">计算中...</span>
                    )}
                  </h4>
                  <HeatmapGrid
                    data={spectrogram}
                    label={`幅度谱 |X(m,k)| — ${spectrogram.length} 帧 × ${N_FREQS} 频率箱`}
                    nFreqs={N_FREQS}
                    nFrames={DISPLAY_FRAMES}
                    highlightCol={phase === "fft" ? spectrogram.length - 1 : undefined}
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-xs text-gray-500">低能量</div>
                    <div className="flex gap-px flex-1">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: heatColor(i / 19) }} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">高能量</div>
                  </div>
                </div>
              )}

              {/* Formula panel */}
              {(phase === "fft" || phase === "spectrogram") && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">STFT 核心公式</h4>
                  <BlockMath math="X(m, k) = \sum_{n=0}^{N-1} x(n+mH) \cdot w(n) \cdot e^{-j2\pi kn/N}" />
                  <div className="grid grid-cols-2 gap-2 text-xs text-amber-700 mt-2">
                    <div><InlineMath math="m" /> — 帧索引（时间轴）</div>
                    <div><InlineMath math="k" /> — 频率箱索引</div>
                    <div><InlineMath math="N" /> — 窗口长度 {windowSize}</div>
                    <div><InlineMath math="H" /> — 帧移（Hop） {hopLength}</div>
                    <div><InlineMath math="w(n)" /> — 汉宁窗函数</div>
                    <div><InlineMath math="|X(m,k)|" /> — 幅度谱（频谱图）</div>
                  </div>
                </div>
              )}

              {/* Complete message */}
              {phase === "spectrogram" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">频谱图生成完成</h4>
                  <p className="text-xs text-emerald-700">
                    STFT 将一维时域信号转化为二维时频表示。纵轴为频率（低→高），横轴为时间（帧索引），
                    颜色深浅编码幅度能量。频谱图是梅尔频谱图和 MFCC 的计算基础。
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

export default SpectrogramVisualizer;
