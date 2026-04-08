import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateTTSSteps, TTSPhoneme } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface TTSInput extends ProblemInput {
  text: string;
}

function parseJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }
  return fallback;
}

function getMelColor(val: number): string {
  // Viridis-like: dark purple → teal → yellow
  const w = Math.max(0, Math.min(val, 1));
  if (w < 0.33) {
    const t = w / 0.33;
    return `rgb(${Math.round(68 + t * 20)}, ${Math.round(1 + t * 80)}, ${Math.round(84 + t * 50)})`;
  } else if (w < 0.66) {
    const t = (w - 0.33) / 0.33;
    return `rgb(${Math.round(88 + t * 65)}, ${Math.round(81 + t * 100)}, ${Math.round(134 - t * 60)})`;
  } else {
    const t = (w - 0.66) / 0.34;
    return `rgb(${Math.round(253 - t * 0)}, ${Math.round(231 - t * 30)}, ${Math.round(37 + t * 10)})`;
  }
}

function PhonemeCards({
  phonemes,
  currentPhoneme,
  phase,
}: {
  phonemes: TTSPhoneme[];
  currentPhoneme: number;
  phase: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {phonemes.map((p, i) => {
        const isActive = i === currentPhoneme && phase === "mel_gen";
        const isDone = phase === "mel_gen" ? i <= currentPhoneme :
          ["vocoder", "complete"].includes(phase);
        return (
          <div
            key={i}
            className={`rounded-lg border px-3 py-2 text-center transition-all ${
              isActive ? "border-sky-500 bg-sky-50 shadow-md" :
              isDone ? "border-sky-200 bg-sky-50/50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-xs text-gray-400">{p.char}</div>
            <div className={`text-sm font-mono font-bold ${isActive ? "text-sky-700" : "text-gray-700"}`}>
              {p.phoneme}
            </div>
            {["duration", "alignment", "mel_gen", "vocoder", "complete"].includes(phase) && (
              <div className="text-[10px] text-gray-400 mt-0.5">{p.duration} 帧</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DurationChart({ phonemes }: { phonemes: TTSPhoneme[] }) {
  if (!phonemes.length) return null;
  const maxDur = Math.max(...phonemes.map((p) => p.duration));
  return (
    <div className="flex items-end gap-2">
      {phonemes.map((p, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-mono text-sky-600">{p.duration}</span>
          <div
            className="w-8 rounded-t bg-sky-400 transition-all"
            style={{ height: `${(p.duration / maxDur) * 48}px` }}
          />
          <span className="text-[9px] text-gray-500 font-mono">{p.phoneme}</span>
        </div>
      ))}
    </div>
  );
}

function AlignmentHeatmap({
  alignmentMatrix,
  phonemes,
}: {
  alignmentMatrix: number[][];
  phonemes: TTSPhoneme[];
}) {
  if (!alignmentMatrix.length || !phonemes.length) return null;
  const T = Math.min(alignmentMatrix.length, 20); // show first 20 frames
  const P = phonemes.length;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex">
          <div className="w-8" />
          {phonemes.map((p, pi) => (
            <div key={pi} className="w-7 text-center text-[9px] font-mono text-gray-500">{p.phoneme}</div>
          ))}
        </div>
        {Array.from({ length: T }).map((_, ti) => {
          const row = alignmentMatrix[ti] ?? new Array(P).fill(0);
          return (
            <div key={ti} className="flex items-center">
              <div className="w-8 text-[9px] font-mono text-gray-400 text-right pr-1">{ti}</div>
              {Array.from({ length: P }).map((_, pi) => {
                const val = row[pi] ?? 0;
                return (
                  <div
                    key={pi}
                    className="w-7 h-5 border border-white"
                    style={{ backgroundColor: getMelColor(val) }}
                    title={`P(t=${ti}|p=${phonemes[pi].phoneme}) = ${(val * 100).toFixed(1)}%`}
                  />
                );
              })}
            </div>
          );
        })}
        {alignmentMatrix.length > T && (
          <div className="text-[9px] text-gray-400 mt-1 ml-8">...（仅显示前 {T} 帧）</div>
        )}
      </div>
    </div>
  );
}

function MelSpecHeatmap({ melSpec }: { melSpec: number[][] }) {
  if (!melSpec.length) return null;
  const T = Math.min(melSpec.length, 24);
  const B = melSpec[0]?.length ?? 8;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Band axis (vertical label) */}
        <div className="flex">
          <div className="w-8" />
          {Array.from({ length: B }).map((_, b) => (
            <div key={b} className="w-6 text-center text-[9px] font-mono text-gray-400">{b}</div>
          ))}
        </div>
        {Array.from({ length: T }).map((_, ti) => {
          const row = melSpec[ti] ?? [];
          return (
            <div key={ti} className="flex items-center">
              <div className="w-8 text-[9px] font-mono text-gray-400 text-right pr-1">{ti}</div>
              {Array.from({ length: B }).map((_, b) => {
                const val = row[b] ?? 0;
                return (
                  <div
                    key={b}
                    className="w-6 h-5 border border-white/20"
                    style={{ backgroundColor: getMelColor(val) }}
                    title={`mel[${ti}][${b}] = ${val.toFixed(2)}`}
                  />
                );
              })}
            </div>
          );
        })}
        {melSpec.length > T && (
          <div className="text-[9px] text-gray-400 mt-1 ml-8">...（仅显示前 {T} 帧）</div>
        )}
      </div>
    </div>
  );
}

function WaveformViz({ waveform }: { waveform: number[] }) {
  if (!waveform.length) return null;
  const maxAmp = Math.max(...waveform, 0.1);

  return (
    <div className="flex items-center gap-0.5 h-16">
      {waveform.map((amp, i) => {
        const h = Math.round((amp / maxAmp) * 28);
        return (
          <div key={i} className="flex flex-col items-center justify-center flex-1" style={{ height: "64px" }}>
            <div
              className="w-full rounded-sm bg-sky-500 opacity-80"
              style={{ height: `${h}px`, minHeight: "2px" }}
            />
            <div
              className="w-full rounded-sm bg-sky-300 opacity-50 mt-0.5"
              style={{ height: `${Math.round(h * 0.6)}px`, minHeight: "1px" }}
            />
          </div>
        );
      })}
    </div>
  );
}

function TTSVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10053);

  return (
    <ConfigurableVisualizer<TTSInput, Record<string, never>>
      config={{
        defaultInput: { text: "你好世界" },

        algorithm: (input) => {
          const text = String(input.text || "你好世界").trim().slice(0, 8);
          return generateTTSSteps(text);
        },

        inputTypes: [{ type: "string", key: "text", label: "输入文本" }],
        inputFields: [
          {
            type: "string",
            key: "text",
            label: "输入文本（最多8字）",
            placeholder: "你好世界",
          },
        ],

        testCases: [
          { label: "你好世界", value: { text: "你好世界" } },
          { label: "Hello World", value: { text: "Hello" } },
          { label: "人工智能", value: { text: "人工智能" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const text = (variables?.text as string) ?? "你好世界";
          const phonemes = parseJSON<TTSPhoneme[]>(variables?.phonemes, []);
          const alignmentMatrix = parseJSON<number[][]>(variables?.alignmentMatrix, []);
          const melSpec = parseJSON<number[][]>(variables?.melSpec, []);
          const waveform = parseJSON<number[]>(variables?.waveform, []);
          const currentPhoneme = (variables?.currentPhoneme as number) ?? -1;
          const totalFrames = (variables?.totalFrames as number) ?? 0;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            phoneme: { label: "音素分析", color: "bg-sky-100 text-sky-700" },
            duration: { label: "时长预测", color: "bg-blue-100 text-blue-700" },
            alignment: { label: "对齐矩阵", color: "bg-indigo-100 text-indigo-700" },
            mel_gen: { label: "梅尔频谱生成", color: "bg-violet-100 text-violet-700" },
            vocoder: { label: "声码器合成", color: "bg-purple-100 text-purple-700" },
            complete: { label: "合成完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const phaseOrder = ["init", "phoneme", "duration", "alignment", "mel_gen", "vocoder", "complete"];
          const curPhaseIdx = phaseOrder.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">文本转语音（Tacotron TTS）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\text{mel}(t) = f(\text{phoneme}[a(t)],\ \text{context})" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                      「{text}」
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                  </div>
                </div>
              </div>

              {/* 流程步骤条 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                  {[
                    { id: "init", label: "① 文本" },
                    { id: "phoneme", label: "② 音素" },
                    { id: "duration", label: "③ 时长" },
                    { id: "alignment", label: "④ 对齐" },
                    { id: "mel_gen", label: "⑤ 梅尔谱" },
                    { id: "vocoder", label: "⑥ 声码器" },
                    { id: "complete", label: "⑦ 完成" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-1.5">
                        <span className={`px-2 py-1.5 rounded-lg font-medium transition-all ${
                          step.id === phase ? "bg-sky-500 text-white shadow-sm" :
                          isDone ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 音素卡片 */}
              {phonemes.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    音素序列
                    {totalFrames > 0 && (
                      <span className="text-xs font-normal text-gray-400 ml-2">（共 {totalFrames} 个梅尔帧）</span>
                    )}
                  </h4>
                  <PhonemeCards
                    phonemes={phonemes}
                    currentPhoneme={currentPhoneme}
                    phase={phase}
                  />
                </div>
              )}

              {/* 时长预测图 */}
              {phonemes.length > 0 && ["duration", "alignment", "mel_gen", "vocoder", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">时长预测（帧数）</h4>
                  <DurationChart phonemes={phonemes} />
                  <p className="text-xs text-gray-400 mt-2">每个音素持续的梅尔帧数，决定语速和节奏</p>
                </div>
              )}

              {/* 对齐矩阵 */}
              {alignmentMatrix.length > 0 && ["alignment", "mel_gen", "vocoder", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    注意力对齐矩阵
                    <span className="text-xs font-normal text-gray-400 ml-2">（梅尔帧 × 音素，对角主导）</span>
                  </h4>
                  <AlignmentHeatmap alignmentMatrix={alignmentMatrix} phonemes={phonemes} />
                </div>
              )}

              {/* 梅尔频谱 */}
              {melSpec.length > 0 && ["mel_gen", "vocoder", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    梅尔频谱
                    <span className="text-xs font-normal text-gray-400 ml-2">（{melSpec.length} 帧 × 8 梅尔频带，深色=高能量）</span>
                  </h4>
                  <MelSpecHeatmap melSpec={melSpec} />
                </div>
              )}

              {/* 波形 */}
              {waveform.length > 0 && ["vocoder", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    合成波形
                    <span className="text-xs font-normal text-gray-400 ml-2">（声码器输出）</span>
                  </h4>
                  <WaveformViz waveform={waveform} />
                  <p className="text-xs text-gray-400 mt-2">WaveNet/HiFi-GAN 将梅尔频谱解码为高质量音频波形</p>
                </div>
              )}

              {/* 完成提示 */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">TTS 合成完成</h4>
                  <p className="text-sm text-emerald-700">
                    文本「{text}」→ {phonemes.length} 个音素 → {totalFrames} 帧梅尔频谱 → 音频波形
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    现代 TTS（如 Tacotron2、VITS）端到端可学习，无需手工对齐，合成质量接近真人录音
                  </p>
                </div>
              )}

              {/* 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">TTS 核心数学</h4>
                <div className="space-y-2">
                  <BlockMath math="\text{Mel}(t,b) = \log\left(\sum_f H_b(f) \cdot |STFT(x)|^2(t,f)\right)" />
                  <p className="text-xs text-gray-500">
                    梅尔滤波器组将线性频谱变换为感知线性的梅尔频谱，更接近人耳听觉特性，便于神经网络学习。
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

export default TTSVisualizer;
