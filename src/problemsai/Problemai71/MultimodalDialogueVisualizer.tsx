import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateDialogueSteps, DialogueSample } from "./algorithm";

interface DialogueInput extends ProblemInput {
  sample: string;
}

const SAMPLES: Record<string, DialogueSample> = {
  restaurant: {
    imageLabel: "A cozy restaurant scene",
    imageEmoji: "🍽️",
    imageRegions: [
      { name: "table", color: "#d4a574", emoji: "🪑" },
      { name: "plate", color: "#f3f4f6", emoji: "🍽️" },
      { name: "pasta", color: "#fde68a", emoji: "🍝" },
      { name: "wine", color: "#dc2626", emoji: "🍷" },
      { name: "candle", color: "#fb923c", emoji: "🕯️" },
      { name: "window", color: "#bae6fd", emoji: "🪟" },
    ],
    history: [
      { role: "user", text: "What is in this image?" },
      { role: "assistant", text: "A restaurant table with food." },
    ],
    currentQuestion: "What color is the wine?",
    visualAttention: [0.2, 0.3, 0.3, 3.5, 0.2, 0.2],
    historyAttention: [1.0, 1.5],
    responseTokens: ["The", "wine", "appears", "to", "be", "red", "."],
    tokenProbs: [
      { token: "The", prob: 0.85 },
      { token: "wine", prob: 0.9 },
      { token: "appears", prob: 0.72 },
      { token: "to", prob: 0.95 },
      { token: "be", prob: 0.97 },
      { token: "red", prob: 0.88 },
      { token: ".", prob: 0.99 },
    ],
  },
  park: {
    imageLabel: "Children playing in park",
    imageEmoji: "🌳",
    imageRegions: [
      { name: "sky", color: "#bfdbfe", emoji: "☁️" },
      { name: "tree", color: "#86efac", emoji: "🌳" },
      { name: "child1", color: "#fde68a", emoji: "🧒" },
      { name: "child2", color: "#fca5a5", emoji: "👧" },
      { name: "ball", color: "#f97316", emoji: "⚽" },
      { name: "grass", color: "#bbf7d0", emoji: "🌿" },
    ],
    history: [{ role: "user", text: "Describe this scene." }],
    currentQuestion: "How many children are there?",
    visualAttention: [0.2, 0.3, 2.5, 2.6, 0.5, 0.3],
    historyAttention: [1.2],
    responseTokens: ["There", "are", "two", "children", "playing", "."],
    tokenProbs: [
      { token: "There", prob: 0.88 },
      { token: "are", prob: 0.95 },
      { token: "two", prob: 0.92 },
      { token: "children", prob: 0.98 },
      { token: "playing", prob: 0.75 },
      { token: ".", prob: 0.99 },
    ],
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    visual_encode: { label: "视觉编码", color: "bg-blue-100 text-blue-700" },
    history_encode: { label: "历史编码", color: "bg-indigo-100 text-indigo-700" },
    visual_attn: { label: "视觉注意力", color: "bg-amber-100 text-amber-700" },
    history_attn: { label: "历史注意力", color: "bg-orange-100 text-orange-700" },
    fuse: { label: "上下文融合", color: "bg-violet-100 text-violet-700" },
    generate: { label: "生成中", color: "bg-pink-100 text-pink-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function MultimodalDialogueVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10071);

  return (
    <ConfigurableVisualizer<DialogueInput, Record<string, never>>
      config={{
        defaultInput: { sample: "restaurant" },
        algorithm: (input) => {
          const key = String(input.sample) as keyof typeof SAMPLES;
          const s = SAMPLES[key] ?? SAMPLES.restaurant;
          return generateDialogueSteps(s);
        },
        inputTypes: [{ type: "string", key: "sample", label: "场景" }],
        inputFields: [
          {
            type: "string",
            key: "sample",
            label: "场景（restaurant / park）",
            placeholder: "restaurant",
          },
        ],
        testCases: [
          { label: "🍽️ 餐厅（酒是什么颜色）", value: { sample: "restaurant" } },
          { label: "🌳 公园（有多少孩子）", value: { sample: "park" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as DialogueSample | undefined;
          const visualAttn = variables?.visualAttn as number[] | undefined;
          const historyAttn = variables?.historyAttn as number[] | undefined;
          const generated = (variables?.generated as string[]) ?? [];
          const currentStep = variables?.currentStep as number | undefined;

          if (!sample) return null;

          const showVisAttn = ["visual_attn", "history_attn", "fuse", "generate", "complete"].includes(phase);
          const showHistAttn = ["history_attn", "fuse", "generate", "complete"].includes(phase);
          const showGenerate = ["generate", "complete"].includes(phase);

          const maxVis = visualAttn ? Math.max(...visualAttn, 0.01) : 1;
          const maxHist = historyAttn ? Math.max(...historyAttn, 0.01) : 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "给 AI 一张图，和它\"聊\"这张图",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          你拍了一张餐厅照片发给 AI，问"这是哪家店？"；它回答后你又问"酒是什么颜色？"。
                          这需要 AI <b>同时处理图像、记住对话历史、回答当前问题</b>——
                          这就是 GPT-4V、Claude Vision、LLaVA 在做的事。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "关键思路：把图变成 LLM 能读的\"一段话\"",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          LLM（大语言模型）只会处理 token。所以先用<b>视觉编码器</b>（如 CLIP ViT）
                          把图变成一串"视觉 token" V，再用一个<b>投影层</b>把它对齐到 LLM 的词嵌入空间。
                        </p>
                        <p>
                          从 LLM 的角度看，图就是<b>一段特殊的"话"</b>被拼在 prompt 前面：
                          <InlineMath math="[V, H_1, H_2, \ldots, Q]" />——视觉 + 历史 + 问题。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——Attention 让生成时随时回头\"看图\"",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          LLM 生成每个词时，都会用<b>自注意力</b>扫一遍上下文。
                          它会<b>自动</b>把注意力权重分给图像 token、对话历史、当前问题。
                        </p>
                        <p>
                          生成 "red" 这个词时，模型会发现<b>图里的酒杯区域</b>提供了关键信息，
                          于是对那里的视觉 token 给高权重——
                          这就是 AI 能"引用图像细节"的机制。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "自回归逐词生成 → 完整回复",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          和普通 LLM 一样，每步预测<b>下一个 token 的概率分布</b>
                          <InlineMath math="p(y_t|y_{<t}, I, H)" />，采样或贪心取一个，
                          追加到序列里，再预测下一个——直到遇到 &lt;EOS&gt;。
                        </p>
                        <p className="text-slate-600">
                          多轮对话时，每轮的问答都会被加入历史，下轮<b>AI 能记住之前聊过什么</b>。
                          这种"视觉 + 历史 + LLM"的架构已成为多模态对话的主流范式。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    多模态对话（GPT-4V / LLaVA 风格）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`p(y_t|y_{<t}, I, H) = \text{softmax}\left(W\cdot h_t\right),\quad h_t = \text{LLM}(V, H_{1..k}, Q, y_{<t})`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 图像区域 + 注意力 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>{sample.imageEmoji}</span>
                    <span>图像 I（{sample.imageLabel}）</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sample.imageRegions.map((r, i) => {
                      const attn = visualAttn?.[i] ?? 0;
                      return (
                        <div
                          key={i}
                          className="relative rounded-md border aspect-square flex flex-col items-center justify-center transition-all"
                          style={{
                            backgroundColor: r.color,
                            borderColor:
                              showVisAttn && attn / maxVis > 0.5
                                ? "#f59e0b"
                                : "#e5e7eb",
                            borderWidth:
                              showVisAttn && attn / maxVis > 0.5 ? "2px" : "1px",
                          }}
                        >
                          {showVisAttn && (
                            <div
                              className="absolute inset-0 rounded-md bg-yellow-400"
                              style={{ opacity: (attn / maxVis) * 0.5 }}
                            />
                          )}
                          <div className="relative z-10 text-center">
                            <div className="text-xl">{r.emoji}</div>
                            <div className="text-[10px] text-gray-800 font-semibold">
                              {r.name}
                            </div>
                            {showVisAttn && (
                              <div className="text-[9px] font-mono font-bold">
                                {(attn * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 对话历史 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    对话历史 H + 当前问题 Q
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {sample.history.map((turn, i) => {
                      const attn = historyAttn?.[i] ?? 0;
                      const isHigh = showHistAttn && attn / maxHist > 0.5;
                      return (
                        <div
                          key={i}
                          className={`flex gap-2 ${
                            turn.role === "user" ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] px-3 py-2 rounded-lg text-xs relative transition-all ${
                              turn.role === "user"
                                ? "bg-blue-50 text-blue-900 border border-blue-200"
                                : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            } ${isHigh ? "ring-2 ring-amber-400" : ""}`}
                          >
                            <div className="text-[9px] font-bold opacity-70 mb-0.5">
                              {turn.role === "user" ? "👤 User" : "🤖 Assistant"}
                            </div>
                            {turn.text}
                            {showHistAttn && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-mono font-bold rounded-full w-8 h-5 flex items-center justify-center">
                                {(attn * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* 当前问题 */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] px-3 py-2 rounded-lg text-xs bg-violet-100 text-violet-900 border-2 border-violet-400 ring-2 ring-violet-200">
                        <div className="text-[9px] font-bold opacity-70 mb-0.5">
                          👤 User（当前问题 Q）
                        </div>
                        {sample.currentQuestion}
                      </div>
                    </div>

                    {/* 模型响应 */}
                    {showGenerate && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-3 py-2 rounded-lg text-xs bg-pink-50 text-pink-900 border-2 border-pink-300">
                          <div className="text-[9px] font-bold opacity-70 mb-0.5">
                            🤖 Assistant（生成中）
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {generated.map((tok, i) => {
                              const isNewest =
                                currentStep !== undefined &&
                                i === generated.length - 1 &&
                                phase === "generate";
                              return (
                                <span
                                  key={i}
                                  className={`inline-block transition-all ${
                                    isNewest ? "font-bold text-pink-700 animate-pulse" : ""
                                  }`}
                                >
                                  {tok}
                                </span>
                              );
                            })}
                            {phase === "generate" && (
                              <span className="inline-block w-2 h-3 bg-pink-400 animate-pulse rounded-sm" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* token 概率分布 */}
              {showGenerate && currentStep !== undefined && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    第 {currentStep + 1} 步 token 分布 <InlineMath math="P(y_t|y_{<t}, I, H)" />
                  </h4>
                  <div className="flex items-end gap-2 h-20">
                    {sample.tokenProbs.slice(0, currentStep + 1).map((tp, i) => {
                      const isCurrent = i === currentStep;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                          <div
                            className={`w-full rounded-t transition-all ${
                              isCurrent
                                ? "bg-gradient-to-t from-pink-600 to-pink-400"
                                : "bg-gray-300"
                            }`}
                            style={{ height: `${tp.prob * 64}px` }}
                          />
                          <div
                            className={`text-[10px] mt-1 font-mono truncate w-full text-center ${
                              isCurrent ? "font-bold text-pink-700" : "text-gray-500"
                            }`}
                          >
                            {tp.token}
                          </div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {(tp.prob * 100).toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入 I+H+Q" },
                    { id: "visual_encode", label: "② 视觉编码" },
                    { id: "history_encode", label: "③ 历史编码" },
                    { id: "visual_attn", label: "④ 视觉注意力" },
                    { id: "history_attn", label: "⑤ 历史注意力" },
                    { id: "fuse", label: "⑥ 上下文融合" },
                    { id: "generate", label: "⑦ 自回归生成" },
                    { id: "complete", label: "⑧ 完成" },
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

export default MultimodalDialogueVisualizer;
