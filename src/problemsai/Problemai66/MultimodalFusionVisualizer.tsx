import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateFusionSteps, FusionStrategy } from "./algorithm";

interface FusionInput extends ProblemInput {
  strategy: string;
}

const IMAGE_FEAT = [0.8, 0.2, 0.6, 0.1];
const TEXT_FEAT = [0.7, 0.3, 0.4, 0.2];
const AUDIO_FEAT = [0.5, 0.5, 0.5, 0.3];

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    features: { label: "提取特征", color: "bg-blue-100 text-blue-700" },
    fuse: { label: "早期拼接", color: "bg-amber-100 text-amber-700" },
    project: { label: "线性投影", color: "bg-violet-100 text-violet-700" },
    late_predict: { label: "独立预测", color: "bg-amber-100 text-amber-700" },
    late_weighted: { label: "加权平均", color: "bg-violet-100 text-violet-700" },
    attn_scores: { label: "注意力分数", color: "bg-amber-100 text-amber-700" },
    attn_softmax: { label: "Softmax 权重", color: "bg-orange-100 text-orange-700" },
    attn_fuse: { label: "注意力加权", color: "bg-violet-100 text-violet-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function FeatureBar({
  feat,
  color,
  label,
  emoji,
}: {
  feat: number[];
  color: string;
  label: string;
  emoji: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-xs font-semibold text-gray-700">{label}</span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {feat.map((v, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t"
              style={{ height: `${v * 44}px`, backgroundColor: color }}
            />
            <span className="text-[9px] text-gray-400 mt-0.5">d{i}</span>
          </div>
        ))}
      </div>
      <div className="text-[9px] font-mono text-gray-500 mt-1">
        [{feat.map((v) => v.toFixed(2)).join(",")}]
      </div>
    </div>
  );
}

function MultimodalFusionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10066);

  return (
    <ConfigurableVisualizer<FusionInput, Record<string, never>>
      config={{
        defaultInput: { strategy: "attention" },
        algorithm: (input) => {
          const s = String(input.strategy) as FusionStrategy;
          const strat: FusionStrategy =
            s === "early" || s === "late" || s === "attention" ? s : "attention";
          return generateFusionSteps(IMAGE_FEAT, TEXT_FEAT, AUDIO_FEAT, strat);
        },
        inputTypes: [{ type: "string", key: "strategy", label: "策略" }],
        inputFields: [
          {
            type: "string",
            key: "strategy",
            label: "策略（early / late / attention）",
            placeholder: "attention",
          },
        ],
        testCases: [
          { label: "注意力融合（动态）", value: { strategy: "attention" } },
          { label: "早期融合（拼接）", value: { strategy: "early" } },
          { label: "晚期融合（加权）", value: { strategy: "late" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const strategy = (variables?.strategy as string) ?? "attention";
          const fusionWeights = variables?.fusionWeights as number[] | undefined;
          const fused = variables?.fused as number[] | undefined;
          const concatFeat = variables?.concatFeat as number[] | undefined;
          const scores = variables?.scores as number[] | undefined;

          const showFeatures = phase !== "init";
          const showWeights = fusionWeights && fusionWeights.length > 0;
          const showFused = fused && fused.length > 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "三个模态的特征，怎么\"合\"成一个？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          看视频时，你的大脑同时收到<b>画面（图像）、字幕（文本）、声音（音频）</b>——
                          它们<b>互相补充</b>：光看画面不知道在说什么，光听声音不知道谁在说。
                        </p>
                        <p>
                          如果每个模态都有自己的特征向量，<b>要怎么把它们合并成一个统一表示</b>去做下游任务？
                          这个"合并"叫<b>多模态融合</b>——方法不止一种，各有优劣。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "最朴素：直接拼接（Early Fusion）",
                    accent: "blue",
                    body: (
                      <>
                        <p>
                          把三个向量<b>首尾相连</b>：
                          <InlineMath math="z = [f_{img}; f_{text}; f_{audio}]" />，维度变成 3d。
                          然后加一个线性层<b>把维度压回 d</b>，让下游网络一起处理。
                        </p>
                        <p className="text-slate-600">
                          👍 简单、让模态从一开始就交互。
                          👎 所有模态按固定比例合并，无法强调"这次该多听音频"。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "反向做：各自决策再投票（Late Fusion）",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          让每个模态<b>独立完成任务</b>（比如分类），得到各自的预测概率，
                          最后按<b>固定权重</b> w 做加权平均：
                          <InlineMath math="z = \sum_m w_m \cdot f_m" />。
                        </p>
                        <p className="text-slate-600">
                          👍 鲁棒：某个模态坏了不至于全挂。
                          👎 模态之间<b>不共享特征</b>，失去细粒度交互。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "\"啊哈！\"——让模型自己决定谁重要（Attention Fusion）",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          为什么要<b>固定</b>权重？不同问题里不同模态的重要性不一样——
                          问"天空什么颜色"应该重图像，问"歌手是谁"应该重音频。
                        </p>
                        <p>
                          用<b>注意力机制</b>动态算权重：
                          <InlineMath math="\alpha_m = \text{softmax}(q \cdot k_m / \sqrt{d})" />，
                          然后 <InlineMath math="z = \sum_m \alpha_m \cdot v_m" />。
                          每次输入不同，权重也不同——<b>自适应融合</b>。现代 Transformer 里几乎都用这种。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    多模态融合（Multimodal Fusion）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                {strategy === "early" && (
                  <BlockMath math={String.raw`z = W \cdot [f_{img};\,f_{text};\,f_{audio}] + b`} />
                )}
                {strategy === "late" && (
                  <BlockMath math={String.raw`z = \sum_{m} w_m \cdot f_m,\quad \sum_m w_m = 1`} />
                )}
                {strategy === "attention" && (
                  <>
                    <BlockMath math={String.raw`\alpha_m = \frac{\exp(q\cdot k_m/\sqrt{d})}{\sum_{m'}\exp(q\cdot k_{m'}/\sqrt{d})}`} />
                    <BlockMath math={String.raw`z = \sum_m \alpha_m \cdot v_m`} />
                  </>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  当前策略：<span className="font-semibold text-gray-800">{strategy}</span>
                </p>
              </div>

              {/* 各模态特征 */}
              {showFeatures && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    模态特征（独立编码后）
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FeatureBar
                      feat={IMAGE_FEAT}
                      color="#3b82f6"
                      label="Image f_img"
                      emoji="🖼️"
                    />
                    <FeatureBar
                      feat={TEXT_FEAT}
                      color="#8b5cf6"
                      label="Text f_text"
                      emoji="📝"
                    />
                    <FeatureBar
                      feat={AUDIO_FEAT}
                      color="#f97316"
                      label="Audio f_audio"
                      emoji="🔊"
                    />
                  </div>
                </div>
              )}

              {/* 拼接展示（early） */}
              {strategy === "early" && concatFeat && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    拼接向量 [f_img; f_text; f_audio] ∈ ℝ^{concatFeat.length}
                  </h4>
                  <div className="flex items-end gap-0.5 h-14 overflow-x-auto">
                    {concatFeat.map((v, i) => {
                      const d = IMAGE_FEAT.length;
                      const color =
                        i < d ? "#3b82f6" : i < 2 * d ? "#8b5cf6" : "#f97316";
                      return (
                        <div
                          key={i}
                          className="w-3 rounded-t"
                          style={{ height: `${v * 50}px`, backgroundColor: color }}
                          title={`d${i}=${v.toFixed(2)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 分数（attention） */}
              {strategy === "attention" && scores && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    注意力分数 <InlineMath math="s_m = q\cdot k_m/\sqrt{d}" />
                  </h4>
                  <div className="flex gap-2">
                    {["🖼️", "📝", "🔊"].map((emoji, i) => (
                      <div key={i} className="flex-1 bg-amber-50 rounded-lg p-2 text-center">
                        <div className="text-xl">{emoji}</div>
                        <div className="text-xs text-amber-800 font-mono font-bold">
                          {scores[i].toFixed(3)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 融合权重 */}
              {showWeights && (strategy === "late" || strategy === "attention") && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    融合权重 {strategy === "attention" ? "α（动态）" : "w（固定）"}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { emoji: "🖼️", name: "Image", color: "bg-blue-500" },
                      { emoji: "📝", name: "Text", color: "bg-violet-500" },
                      { emoji: "🔊", name: "Audio", color: "bg-orange-500" },
                    ].map((m, i) => {
                      const w = fusionWeights![i] ?? 0;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-lg w-6">{m.emoji}</span>
                          <span className="w-16 text-gray-700">{m.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className={`h-full ${m.color} rounded-full flex items-center justify-end pr-2`}
                              style={{ width: `${w * 100}%` }}
                            >
                              <span className="text-white font-mono text-[10px] font-bold">
                                {w > 0.1 ? `${(w * 100).toFixed(1)}%` : ""}
                              </span>
                            </div>
                          </div>
                          <span className="w-12 text-right font-mono">
                            {w.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 融合后特征 */}
              {showFused && (
                <div className="bg-white rounded-lg border border-emerald-300 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    融合表示 z <InlineMath math="\in \mathbb{R}^d" />
                  </h4>
                  <div className="flex items-end gap-1 h-14 bg-emerald-50 rounded-lg p-2">
                    {fused!.map((v, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400"
                          style={{ height: `${v * 48}px` }}
                        />
                        <span className="text-[9px] text-emerald-700 font-mono mt-0.5">
                          {v.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {(strategy === "early"
                    ? [
                        { id: "init", label: "① 输入" },
                        { id: "features", label: "② 特征提取" },
                        { id: "fuse", label: "③ 拼接" },
                        { id: "project", label: "④ 投影" },
                        { id: "complete", label: "⑤ 完成" },
                      ]
                    : strategy === "late"
                    ? [
                        { id: "init", label: "① 输入" },
                        { id: "features", label: "② 特征提取" },
                        { id: "late_predict", label: "③ 独立预测" },
                        { id: "late_weighted", label: "④ 加权平均" },
                        { id: "complete", label: "⑤ 完成" },
                      ]
                    : [
                        { id: "init", label: "① 输入" },
                        { id: "features", label: "② 特征提取" },
                        { id: "attn_scores", label: "③ 注意力分数" },
                        { id: "attn_softmax", label: "④ Softmax" },
                        { id: "attn_fuse", label: "⑤ 加权求和" },
                        { id: "complete", label: "⑥ 完成" },
                      ]
                  ).map((step, idx, arr) => {
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

export default MultimodalFusionVisualizer;
