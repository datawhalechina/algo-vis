import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateVoiceCloningSteps, ReferenceSpeaker, TargetText } from "./algorithm";

interface VoiceCloningInput extends ProblemInput {
  referenceSpeaker: string;
  targetText: string;
}

const SPEAKER_COLORS: Record<string, string> = {
  Alice: "#ec4899",
  Bob: "#3b82f6",
  Charlie: "#10b981",
};

const phaseMap: Record<string, { label: string; color: string }> = {
  init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
  speaker_encode: { label: "说话人编码", color: "bg-pink-100 text-pink-700" },
  text_encode: { label: "文本编码", color: "bg-purple-100 text-purple-700" },
  synthesize: { label: "合成器", color: "bg-blue-100 text-blue-700" },
  vocoder: { label: "声码器", color: "bg-orange-100 text-orange-700" },
  compare: { label: "相似度验证", color: "bg-amber-100 text-amber-700" },
  complete: { label: "克隆完成", color: "bg-emerald-100 text-emerald-700" },
};

const phaseOrder = ["init", "speaker_encode", "text_encode", "synthesize", "vocoder", "complete"];

function MelHeatmap({ melRows, melBands }: { melRows: string; melBands: number }) {
  if (!melRows) return null;
  const rows = melRows.split(";").map((r) => r.split(",").map(Number));
  return (
    <div className="flex gap-0.5">
      {rows.map((row, fi) => (
        <div key={fi} className="flex flex-col gap-0.5">
          {row.slice(0, melBands).map((v, bi) => {
            const intensity = Math.round(v * 255);
            return (
              <div
                key={bi}
                className="w-4 h-3 rounded-sm"
                style={{ backgroundColor: `rgb(${255 - intensity}, ${Math.round(intensity * 0.6)}, ${intensity})` }}
                title={v.toFixed(2)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function WaveformBars({ waveformStr }: { waveformStr: string }) {
  if (!waveformStr) return null;
  const vals = waveformStr.split(",").map(Number).slice(0, 48);
  const maxAbs = Math.max(...vals.map(Math.abs), 0.01);
  return (
    <div className="flex items-center gap-0.5 h-12">
      {vals.map((v, i) => {
        const h = Math.abs(v) / maxAbs;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${v >= 0 ? "bg-orange-400" : "bg-orange-300"}`}
            style={{ height: `${Math.max(4, h * 46)}px` }}
          />
        );
      })}
    </div>
  );
}

function EmbeddingBars({ embStr, speaker }: { embStr: string; speaker: string }) {
  if (!embStr) return null;
  const vals = embStr.split(",").map(Number);
  const color = SPEAKER_COLORS[speaker] ?? "#6366f1";
  return (
    <div className="flex items-end gap-1 h-12">
      {vals.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t"
            style={{ height: `${v * 44}px`, backgroundColor: color }}
          />
          <span className="text-[9px] text-gray-400 mt-0.5">e{i}</span>
        </div>
      ))}
    </div>
  );
}

function VoiceCloningVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10059);

  return (
    <ConfigurableVisualizer<VoiceCloningInput, Record<string, never>>
      config={{
        defaultInput: { referenceSpeaker: "Alice", targetText: "你好" },

        algorithm: (input) => {
          const speaker = (input.referenceSpeaker ?? "Alice") as ReferenceSpeaker;
          const text = (input.targetText ?? "你好") as TargetText;
          const validSpeakers: ReferenceSpeaker[] = ["Alice", "Bob", "Charlie"];
          const validTexts: TargetText[] = ["你好", "谢谢", "再见"];
          const s = validSpeakers.includes(speaker) ? speaker : "Alice";
          const t = validTexts.includes(text) ? text : "你好";
          return generateVoiceCloningSteps(s, t);
        },

        inputTypes: [
          { type: "string", key: "referenceSpeaker", label: "参考说话人" },
          { type: "string", key: "targetText", label: "目标文本" },
        ],
        inputFields: [
          { type: "string", key: "referenceSpeaker", label: "参考说话人（Alice/Bob/Charlie）", placeholder: "Alice" },
          { type: "string", key: "targetText", label: "目标文本（你好/谢谢/再见）", placeholder: "你好" },
        ],

        testCases: [
          { label: "Alice + 你好", value: { referenceSpeaker: "Alice", targetText: "你好" } },
          { label: "Bob + 谢谢", value: { referenceSpeaker: "Bob", targetText: "谢谢" } },
          { label: "Charlie + 再见", value: { referenceSpeaker: "Charlie", targetText: "再见" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const referenceSpeaker = (variables?.referenceSpeaker as string) ?? "Alice";
          const targetText = (variables?.targetText as string) ?? "你好";
          const embStr = (variables?.embStr as string) ?? "";
          const phonemes = ((variables?.phonemes as string) ?? "").split(",").filter(Boolean);
          const durations = ((variables?.durations as string) ?? "").split(",").map(Number).filter(Boolean);
          const melRows = (variables?.melRows as string) ?? "";
          const melBands = (variables?.melBands as number) ?? 8;
          const melFrames = (variables?.melFrames as number) ?? 0;
          const totalFrames = (variables?.totalFrames as number) ?? 0;
          const waveformStr = (variables?.waveformStr as string) ?? "";
          const speakerDesc = (variables?.speakerDesc as string) ?? "";

          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
          const curPhaseIdx = phaseOrder.indexOf(phase);
          const speakerColor = SPEAKER_COLORS[referenceSpeaker] ?? "#6366f1";

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">语音克隆（Voice Cloning）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\hat{y} = \text{Vocoder}(\text{Synth}(\text{phonemes},\, e_{\text{spk}}))" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* Input info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">参考说话人</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: speakerColor }} />
                    <span className="font-semibold text-gray-800">{referenceSpeaker}</span>
                  </div>
                  {speakerDesc && <p className="text-xs text-gray-500 mt-1">{speakerDesc}</p>}
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">目标文本</p>
                  <span className="text-2xl font-bold text-gray-800">{targetText}</span>
                </div>
              </div>

              {/* Pipeline flow */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">克隆流程</h4>
                <div className="flex items-center gap-1 text-xs flex-wrap">
                  {[
                    { id: "init", label: "参考音频" },
                    { id: "speaker_encode", label: "说话人编码器" },
                    { id: "text_encode", label: "文本→音素" },
                    { id: "synthesize", label: "合成器" },
                    { id: "vocoder", label: "声码器" },
                    { id: "complete", label: "克隆音频" },
                  ].map((step, idx, arr) => {
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curPhaseIdx >= stepIdx;
                    const isCurrent = phase === step.id || (step.id === "synthesize" && phase === "synthesize");
                    return (
                      <div key={step.id} className="flex items-center gap-1">
                        <span
                          className={`px-2 py-1 rounded font-medium transition-all ${
                            isCurrent ? "text-white shadow-sm" :
                            isDone ? "bg-pink-50 text-pink-700" : "bg-gray-100 text-gray-400"
                          }`}
                          style={isCurrent ? { backgroundColor: speakerColor } : {}}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speaker embedding */}
              {embStr && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    说话人嵌入 <InlineMath math="e_{\text{spk}} \in \mathbb{R}^6" />
                  </h4>
                  <EmbeddingBars embStr={embStr} speaker={referenceSpeaker} />
                  <div className="mt-2 text-xs font-mono text-gray-500 bg-gray-50 rounded p-2 break-all">
                    [{embStr}]
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    说话人嵌入编码了 {referenceSpeaker} 独特的声纹特征，将被注入合成器。
                  </p>
                </div>
              )}

              {/* Phonemes */}
              {phonemes.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    音素序列「{targetText}」
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {phonemes.map((ph, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center rounded-lg border px-3 py-2"
                        style={{ borderColor: speakerColor, backgroundColor: `${speakerColor}12` }}
                      >
                        <span className="text-lg font-bold" style={{ color: speakerColor }}>{ph}</span>
                        {durations[i] && (
                          <span className="text-xs text-gray-500 mt-0.5">{durations[i] * 25}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mel spectrogram */}
              {melRows && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    生成梅尔频谱
                    {totalFrames > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        {melFrames || melRows.split(";").length}/{totalFrames || melRows.split(";").length} 帧
                      </span>
                    )}
                  </h4>
                  <div className="overflow-x-auto pb-1">
                    <MelHeatmap melRows={melRows} melBands={melBands} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>低频梅尔</span>
                    <span>高频梅尔</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    梅尔频谱融合了「{targetText}」的内容特征和 {referenceSpeaker} 的说话人特征
                  </p>
                </div>
              )}

              {/* Waveform */}
              {waveformStr && (phase === "vocoder" || phase === "complete") && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    克隆音频波形
                  </h4>
                  <WaveformBars waveformStr={waveformStr} />
                  <p className="text-xs text-gray-500 mt-2">
                    声码器将梅尔频谱还原为时域音频。波形携带了 {referenceSpeaker} 的音色。
                  </p>
                </div>
              )}

              {/* Complete summary */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">克隆完成</h4>
                  <BlockMath math="\hat{y}_{\text{cloned}} = \text{Vocoder}\!\left(\text{Synth}\!\left([\text{n,ǐ,h,ǎo}],\; e_{\text{spk}}^{\text{Alice}}\right)\right)" />
                  <p className="text-xs text-emerald-600 mt-2">
                    成功用 {referenceSpeaker} 的声音克隆了「{targetText}」的语音。
                    SV2TTS 三阶段架构：说话人编码器 + 合成器 + 声码器，支持零样本语音克隆。
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

export default VoiceCloningVisualizer;
