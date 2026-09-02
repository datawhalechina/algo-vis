import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateVideoUnderstandingSteps, VideoClip } from "./algorithm";

interface VideoUnderstandingInput extends ProblemInput {
  clip: string;
}

const CLIPS: Record<string, VideoClip> = {
  running: {
    label: "Person running",
    action: "running",
    frames: [
      { emoji: "🏃", label: "t=0 stride 1", feature: [0.8, 0.1, 0.7, 0.2] },
      { emoji: "🏃‍♂️", label: "t=1 stride 2", feature: [0.9, 0.15, 0.75, 0.25] },
      { emoji: "🏃", label: "t=2 stride 3", feature: [0.85, 0.1, 0.8, 0.3] },
      { emoji: "🏃‍♂️", label: "t=3 stride 4", feature: [0.9, 0.2, 0.7, 0.2] },
      { emoji: "🏃", label: "t=4 stride 5", feature: [0.8, 0.15, 0.75, 0.25] },
    ],
    classScores: [
      { action: "running", score: 3.2 },
      { action: "walking", score: 1.5 },
      { action: "jumping", score: 1.0 },
      { action: "standing", score: 0.3 },
    ],
  },
  waving: {
    label: "Person waving",
    action: "waving",
    frames: [
      { emoji: "🙋", label: "t=0 hand up", feature: [0.2, 0.8, 0.3, 0.6] },
      { emoji: "👋", label: "t=1 hand right", feature: [0.15, 0.9, 0.25, 0.7] },
      { emoji: "🙋", label: "t=2 hand up", feature: [0.2, 0.85, 0.3, 0.65] },
      { emoji: "👋", label: "t=3 hand left", feature: [0.25, 0.9, 0.2, 0.75] },
      { emoji: "🙋", label: "t=4 hand up", feature: [0.2, 0.85, 0.3, 0.7] },
    ],
    classScores: [
      { action: "waving", score: 3.5 },
      { action: "clapping", score: 1.0 },
      { action: "dancing", score: 0.8 },
      { action: "standing", score: 0.2 },
    ],
  },
  clapping: {
    label: "Person clapping",
    action: "clapping",
    frames: [
      { emoji: "🙌", label: "t=0 apart", feature: [0.1, 0.7, 0.8, 0.1] },
      { emoji: "👏", label: "t=1 closer", feature: [0.1, 0.9, 0.85, 0.1] },
      { emoji: "🙌", label: "t=2 apart", feature: [0.1, 0.75, 0.8, 0.1] },
      { emoji: "👏", label: "t=3 closer", feature: [0.1, 0.9, 0.85, 0.1] },
      { emoji: "🙌", label: "t=4 apart", feature: [0.1, 0.7, 0.8, 0.1] },
    ],
    classScores: [
      { action: "clapping", score: 3.3 },
      { action: "waving", score: 1.2 },
      { action: "dancing", score: 0.6 },
      { action: "standing", score: 0.3 },
    ],
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    spatial: { label: "空间特征", color: "bg-blue-100 text-blue-700" },
    temporal: { label: "时序特征", color: "bg-amber-100 text-amber-700" },
    spatiotemporal: { label: "时空融合", color: "bg-violet-100 text-violet-700" },
    classify: { label: "分类器", color: "bg-pink-100 text-pink-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function VideoUnderstandingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10065);

  return (
    <ConfigurableVisualizer<VideoUnderstandingInput, Record<string, never>>
      config={{
        defaultInput: { clip: "running" },
        algorithm: (input) => {
          const key = String(input.clip) as keyof typeof CLIPS;
          const c = CLIPS[key] ?? CLIPS.running;
          return generateVideoUnderstandingSteps(c);
        },
        inputTypes: [{ type: "string", key: "clip", label: "视频片段" }],
        inputFields: [
          {
            type: "string",
            key: "clip",
            label: "片段（running / waving / clapping）",
            placeholder: "running",
          },
        ],
        testCases: [
          { label: "🏃 running", value: { clip: "running" } },
          { label: "👋 waving", value: { clip: "waving" } },
          { label: "👏 clapping", value: { clip: "clapping" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const clip = variables?.clip as VideoClip | undefined;
          const frameFeats = variables?.frameFeats as number[][] | undefined;
          const temporalFeat = variables?.temporalFeat as number[] | undefined;
          const probs = variables?.probs as number[] | undefined;
          const predAction = variables?.predAction as string | undefined;
          const currentIdx = variables?.currentIdx as number | undefined;

          if (!clip) return null;

          const showSpatial = ["spatial", "temporal", "spatiotemporal", "classify", "complete"].includes(phase);
          const showTemporal = ["temporal", "spatiotemporal", "classify", "complete"].includes(phase);
          const showClassify = ["classify", "complete"].includes(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "单张照片 vs 一段视频，差在哪？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          给你一张 🏃 的照片，你只能说"有个人"。但一段视频里，你能看到<b>他在跑</b>——
                          这个"动作"不在任何单帧里，而在<b>帧与帧之间的变化</b>中。
                        </p>
                        <p className="text-slate-600">
                          所以视频理解的核心矛盾是：<b>如何同时捕捉"空间"（每帧内容）和"时间"（帧间变化）</b>？
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "两个维度，分别处理",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          <b>空间维度</b>：对每一帧用 2D CNN 或 ViT 提取特征 <InlineMath math="f_i" />，
                          捕获"这一帧里有什么物体、在哪里"。
                        </p>
                        <p>
                          <b>时间维度</b>：把连续帧的特征沿<b>时间轴</b>融合——最简单是平均池化，
                          进阶用 3D 卷积、RNN、或 Video Transformer（沿时间做注意力）。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——动作是时空联合模式",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          举个例子：<b>"挥手"</b>这个动作。
                          单帧看：手在头上（t=0）、手在右（t=1）、手在左（t=3）……
                          <b>每一帧单独都不能说明是"挥手"</b>。
                        </p>
                        <p>
                          但当模型把这些帧<b>连起来看</b>，它会注意到手在<b>左右周期性摆动</b>——
                          这个<b>时空联合模式</b>就是"挥手"的特征。
                          所以好的视频模型学的是 <InlineMath math="h_{st} = \text{Fuse}(f_1, f_2, \ldots, f_N)" />。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "最后一步：分类器给答案",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          时空特征 <InlineMath math="h_{st}" /> 过一个线性层 + Softmax，
                          在候选动作集合（running / waving / clapping / ...）里选概率最高的一个。
                        </p>
                        <p className="text-slate-600">
                          这个架构能迁移到：动作识别（UCF-101）、事件检测（监控视频）、视频描述（Video Captioning），
                          甚至抖音的视频内容标签。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    视频理解（Video Understanding）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`f_i = \text{CNN}(x_i),\quad h_t = \text{Pool}_t\{f_1, f_2, \ldots, f_N\}`} />
                <BlockMath math={String.raw`P(a | V) = \text{softmax}(W\cdot h_{st})`} />
              </div>

              {/* 视频帧 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  视频帧序列（{clip.frames.length} 帧）
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {clip.frames.map((frame, i) => {
                    const isCurrent = phase === "spatial" && currentIdx === i;
                    const hasFeature = frameFeats && frameFeats[i];
                    return (
                      <div key={i} className="flex flex-col items-center min-w-[80px]">
                        <div
                          className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-3xl transition-all ${
                            isCurrent
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                              : hasFeature
                              ? "border-blue-300 bg-blue-50/60"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          {frame.emoji}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 text-center">
                          {frame.label}
                        </div>
                        {hasFeature && showSpatial && (
                          <div className="text-[9px] font-mono text-blue-700 mt-0.5">
                            [{frameFeats![i].map((v) => v.toFixed(1)).join(",")}]
                          </div>
                        )}
                        {i < clip.frames.length - 1 && (
                          <div className="text-gray-400 text-lg">↓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-gray-400 mt-2 text-center">
                  时间轴 t = 0, 1, 2, ..., N-1
                </div>
              </div>

              {/* 时序融合特征 */}
              {showTemporal && temporalFeat && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    时序池化特征 <InlineMath math="h_t = \frac{1}{N}\sum_i f_i" />
                  </h4>
                  <div className="flex items-end gap-1 h-16">
                    {temporalFeat.map((v, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-amber-400 to-amber-200"
                          style={{ height: `${v * 56}px` }}
                        />
                        <div className="text-[9px] text-gray-500 mt-0.5">
                          h<sub>{i}</sub>
                        </div>
                        <div className="text-[9px] font-mono text-gray-700">
                          {v.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 分类结果 */}
              {showClassify && probs && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    动作分类 <InlineMath math="P(a|V)" />
                  </h4>
                  <div className="space-y-1.5">
                    {clip.classScores.map((c, i) => {
                      const p = probs[i] ?? 0;
                      const isBest = c.action === predAction;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={`w-24 font-mono ${
                              isBest ? "font-bold text-emerald-700" : "text-gray-700"
                            }`}
                          >
                            {c.action}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full ${isBest ? "bg-emerald-500" : "bg-gray-400"}`}
                              style={{ width: `${p * 100}%` }}
                            />
                          </div>
                          <span
                            className={`w-12 text-right font-mono ${
                              isBest ? "font-bold text-emerald-700" : "text-gray-600"
                            }`}
                          >
                            {(p * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {phase === "complete" && predAction && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-300 rounded-md text-center">
                      <span className="text-xs text-emerald-700">识别动作：</span>
                      <span className="text-lg font-bold text-emerald-800 ml-2">
                        {predAction}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入视频" },
                    { id: "spatial", label: "② 2D CNN" },
                    { id: "temporal", label: "③ 时序池化" },
                    { id: "spatiotemporal", label: "④ 时空融合" },
                    { id: "classify", label: "⑤ 分类器" },
                    { id: "complete", label: "⑥ 完成" },
                  ].map((step, idx, arr) => {
                    const isDone = arr.findIndex((s) => s.id === phase) >= idx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium ${
                            step.id === phase
                              ? "bg-blue-600 text-white shadow-sm"
                              : isDone
                              ? "bg-blue-100 text-blue-700"
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

export default VideoUnderstandingVisualizer;
