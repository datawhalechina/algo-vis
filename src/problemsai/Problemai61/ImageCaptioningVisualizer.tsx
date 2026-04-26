import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateImageCaptioningSteps, CaptioningScene } from "./algorithm";

interface ImageCaptioningInput extends ProblemInput {
  scene: string;
}

const SCENES: Record<string, CaptioningScene> = {
  cat_window: {
    label: "A cat on the windowsill",
    emoji: "🐱",
    regions: [
      { name: "sky", color: "#bfdbfe" },
      { name: "cloud", color: "#e5e7eb" },
      { name: "curtain-L", color: "#fecaca" },
      { name: "cat-head", color: "#fde68a" },
      { name: "cat-body", color: "#fcd34d" },
      { name: "window", color: "#bae6fd" },
      { name: "sill", color: "#a16207" },
      { name: "wall", color: "#e5e7eb" },
      { name: "plant", color: "#86efac" },
    ],
    vocab: ["A", "cat", "is", "sitting", "on", "the", "windowsill"],
    caption: ["A", "cat", "is", "sitting", "on", "the", "windowsill"],
    attention: [
      [0, 0, 0, 2, 1, 0, 0, 0, 0], // A - general
      [0, 0, 0, 3, 2.5, 0, 0, 0, 0], // cat - cat regions
      [0, 0, 0, 1, 2, 0.5, 0, 0, 0], // is
      [0, 0, 0, 1, 3, 0, 1, 0, 0], // sitting
      [0, 0, 0, 0, 1, 1, 2, 0, 0], // on
      [0, 0, 0, 0, 0.5, 1, 2, 0, 0], // the
      [0, 0, 0, 0, 0, 1, 3, 0, 0], // windowsill
    ],
  },
  dog_park: {
    label: "A dog running in the park",
    emoji: "🐶",
    regions: [
      { name: "sky", color: "#bfdbfe" },
      { name: "tree-L", color: "#86efac" },
      { name: "tree-R", color: "#4ade80" },
      { name: "grass", color: "#bbf7d0" },
      { name: "dog", color: "#fef08a" },
      { name: "ball", color: "#fca5a5" },
      { name: "path", color: "#d4d4d8" },
      { name: "bench", color: "#b45309" },
      { name: "flower", color: "#f0abfc" },
    ],
    vocab: ["A", "dog", "is", "running", "in", "the", "park"],
    caption: ["A", "dog", "is", "running", "in", "the", "park"],
    attention: [
      [0, 0, 0, 0, 2, 0.5, 0, 0, 0],
      [0, 0, 0, 0.5, 3, 1, 0, 0, 0],
      [0, 0.5, 0.5, 1, 2, 0, 0.5, 0, 0],
      [0, 0, 0, 2, 3, 0.5, 1, 0, 0],
      [0, 1, 1, 2, 1, 0, 0.5, 0, 0],
      [0, 1, 1, 2, 0, 0, 0, 0, 0],
      [1, 2, 2, 2, 0, 0, 0, 1, 1],
    ],
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    cnn_encode: { label: "CNN 编码", color: "bg-blue-100 text-blue-700" },
    decode_start: { label: "<START>", color: "bg-pink-100 text-pink-700" },
    decode_step: { label: "解码中", color: "bg-amber-100 text-amber-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function ImageCaptioningVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10061);

  return (
    <ConfigurableVisualizer<ImageCaptioningInput, Record<string, never>>
      config={{
        defaultInput: { scene: "cat_window" },
        algorithm: (input) => {
          const key = String(input.scene) as keyof typeof SCENES;
          const scene = SCENES[key] ?? SCENES.cat_window;
          return generateImageCaptioningSteps(scene);
        },
        inputTypes: [{ type: "string", key: "scene", label: "场景" }],
        inputFields: [
          {
            type: "string",
            key: "scene",
            label: "场景（cat_window / dog_park）",
            placeholder: "cat_window",
          },
        ],
        testCases: [
          { label: "🐱 猫在窗台", value: { scene: "cat_window" } },
          { label: "🐶 狗在公园", value: { scene: "dog_park" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const scene = variables?.scene as unknown as CaptioningScene | undefined;
          const generated = (variables?.generated as string[]) ?? [];
          const attention = (variables?.attention as unknown as number[][]) ?? [];
          const currentStep = variables?.currentStep as number | undefined;
          const currentToken = variables?.currentToken as string | undefined;

          if (!scene) return null;

          const currentAttention =
            currentStep !== undefined && attention[currentStep]
              ? attention[currentStep]
              : attention[attention.length - 1];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "给一张图，让模型\"说\"出描述？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          人看到 🐱 坐在窗台上，会自然说出 "A cat is sitting on the windowsill"。
                          可模型要怎么做？<b>它既要"看懂"图，又要"组织语言"</b>——两个难题凑在一起。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "拆成两步：看懂 → 逐字说",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          先用 <b>CNN</b>（Encoder）把图变成一堆区域特征 <InlineMath math="V = \{v_1, \ldots, v_L\}" />，
                          就像给图贴了 L 张"便签"（本例 L=9，把图切成 3×3 的网格）。
                        </p>
                        <p>
                          再用 <b>RNN/Transformer</b>（Decoder）像写作一样<b>一个词一个词地生成</b>：
                          从 &lt;START&gt; 开始，每步看上一个词和图的便签，预测下一个词，直到 &lt;END&gt;。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——每个词关注图里不同的位置",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          这里有个很自然的问题：<b>说 "cat" 时</b>模型应该"看"哪里？——显然应该看<b>猫的位置</b>。
                          说 "windowsill" 时则应该看<b>窗台</b>的位置。
                        </p>
                        <p>
                          所以每生成一个词，都让模型<b>重新算一次注意力权重</b>
                          {" "}<InlineMath math="\alpha_t" />，
                          用这些权重对 9 张便签加权求和，得到"当前最相关的视觉信息" <InlineMath math="c_t" />。
                          这就是 <b>Show, Attend and Tell</b> 的核心！
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "公式其实就是两行",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          <b>① 算权重</b>：
                          <InlineMath math="\alpha_t = \text{softmax}(f_{att}(h_{t-1}, V))" />
                          —— 问题：上一步隐状态看 V 的哪里？
                        </p>
                        <p>
                          <b>② 算上下文</b>：
                          <InlineMath math="c_t = \sum_i \alpha_{t,i} \cdot v_i" />
                          —— 加权平均，得到当前该看的视觉信息，拼到 Decoder 里预测下一词。
                        </p>
                        <p className="text-slate-600">
                          下方的黄色高亮就是 <InlineMath math="\alpha_t" />——随着生成进度，你会看到它在图上"移动"。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    图像描述生成（Attention-based Show, Attend and Tell）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\alpha_t = \text{softmax}(f_{att}(h_{t-1}, V)),\quad c_t = \sum_{i=1}^{L}\alpha_{t,i}\cdot v_i`} />
                <BlockMath math={String.raw`p(y_t|y_{<t}, I) = \text{softmax}(W_o[h_t; c_t])`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 图像 + 区域 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>{scene.emoji}</span>
                    <span>图像区域 V（3×3 网格）</span>
                  </h4>
                  <div className="relative w-full max-w-sm mx-auto">
                    <div className="grid grid-cols-3 gap-1 aspect-square">
                      {scene.regions.map((region, i) => {
                        const attnWeight = currentAttention?.[i] ?? 0;
                        const highlighted = phase === "decode_step" || phase === "complete";
                        const intensity = highlighted ? attnWeight : 0;
                        return (
                          <div
                            key={i}
                            className="relative rounded-md flex items-center justify-center border border-gray-300 overflow-hidden"
                            style={{ backgroundColor: region.color }}
                          >
                            {highlighted && intensity > 0.05 && (
                              <div
                                className="absolute inset-0 rounded-md"
                                style={{
                                  backgroundColor: "#facc15",
                                  opacity: Math.min(intensity * 1.2, 0.85),
                                }}
                              />
                            )}
                            <div className="relative z-10 text-center">
                              <div className="text-[10px] text-gray-700 font-semibold">
                                {region.name}
                              </div>
                              {highlighted && (
                                <div className="text-[10px] font-mono font-bold text-gray-900">
                                  α={(intensity * 100).toFixed(0)}%
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      黄色高亮显示当前生成词的注意力分布
                    </p>
                  </div>
                </div>

                {/* 解码过程 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Decoder 自回归生成
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {generated.map((tok, i) => {
                      const isNew =
                        currentStep !== undefined && i === generated.length - 1;
                      return (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-md text-xs font-mono border ${
                            tok === "<START>" || tok === "<END>"
                              ? "bg-gray-100 text-gray-600 border-gray-300"
                              : isNew
                              ? "bg-amber-100 text-amber-800 border-amber-400 ring-2 ring-amber-300 font-bold"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          {tok}
                        </span>
                      );
                    })}
                    {phase === "decode_step" && (
                      <span className="px-2 py-1 rounded-md text-xs font-mono border border-dashed border-gray-300 text-gray-400 animate-pulse">
                        ...
                      </span>
                    )}
                  </div>
                  {currentStep !== undefined && currentToken && (
                    <div className="bg-amber-50 rounded-md p-2 border border-amber-200 text-xs">
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="font-semibold">第 {currentStep + 1} 步：</span>
                        <InlineMath math={`y_{${currentStep + 1}}`} />
                        <span>=</span>
                        <span className="font-bold text-amber-900">"{currentToken}"</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-600">
                    <div className="font-semibold mb-1 text-gray-800">完整生成序列：</div>
                    <div className="p-2 bg-gray-50 rounded-md italic text-gray-700">
                      {generated.filter((t) => t !== "<START>" && t !== "<END>").join(" ") || "（尚未生成）"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 流程图 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入图像" },
                    { id: "cnn_encode", label: "② CNN 特征" },
                    { id: "decode_start", label: "③ <START>" },
                    { id: "decode_step", label: "④ 注意力解码" },
                    { id: "complete", label: "⑤ <END>" },
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

export default ImageCaptioningVisualizer;
