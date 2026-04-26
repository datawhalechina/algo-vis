import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateMMTSteps, MMTSample } from "./algorithm";

interface MMTInput extends ProblemInput {
  sample: string;
}

const SAMPLES: Record<string, MMTSample> = {
  cat_on_chair: {
    imageLabel: "Cat on chair",
    imageEmoji: "🐱",
    patches: [
      { name: "p1 sky", color: "#bfdbfe" },
      { name: "p2 wall", color: "#e5e7eb" },
      { name: "p3 cat", color: "#fde68a" },
      { name: "p4 chair", color: "#d4a574" },
      { name: "p5 floor", color: "#a8a29e" },
      { name: "p6 plant", color: "#86efac" },
    ],
    tokens: ["[CLS]", "a", "cat", "on", "a", "chair"],
    dModel: 768,
    crossAttnRaw: [
      [0.3, 0.3, 0.3, 0.3, 0.3, 0.3], // [CLS]
      [0.2, 0.2, 0.5, 0.4, 0.2, 0.2], // a
      [0.1, 0.2, 3.0, 0.3, 0.1, 0.1], // cat -> p3
      [0.1, 0.2, 0.8, 2.0, 0.3, 0.1], // on
      [0.2, 0.2, 0.3, 0.5, 0.2, 0.2], // a
      [0.1, 0.2, 0.3, 3.0, 0.3, 0.1], // chair -> p4
    ],
  },
  dog_running: {
    imageLabel: "Dog running on grass",
    imageEmoji: "🐶",
    patches: [
      { name: "p1 sky", color: "#bfdbfe" },
      { name: "p2 tree", color: "#86efac" },
      { name: "p3 dog", color: "#fde68a" },
      { name: "p4 tail", color: "#fcd34d" },
      { name: "p5 grass", color: "#bbf7d0" },
      { name: "p6 path", color: "#d4d4d8" },
    ],
    tokens: ["[CLS]", "a", "dog", "running", "on", "grass"],
    dModel: 768,
    crossAttnRaw: [
      [0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
      [0.2, 0.2, 0.5, 0.3, 0.2, 0.2],
      [0.1, 0.3, 3.2, 2.0, 0.3, 0.1], // dog
      [0.1, 0.2, 2.0, 2.5, 1.0, 0.3],
      [0.2, 0.3, 0.8, 0.3, 1.5, 0.5],
      [0.1, 0.3, 0.2, 0.2, 3.3, 0.3], // grass
    ],
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    image_tokens: { label: "图像 Token", color: "bg-blue-100 text-blue-700" },
    text_tokens: { label: "文本 Token", color: "bg-indigo-100 text-indigo-700" },
    concat: { label: "拼接序列", color: "bg-violet-100 text-violet-700" },
    self_attn: { label: "Self-Attention", color: "bg-amber-100 text-amber-700" },
    cross_attn: { label: "Cross-Attention", color: "bg-orange-100 text-orange-700" },
    pool: { label: "[CLS] 汇聚", color: "bg-pink-100 text-pink-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function heatColor(v: number): string {
  const w = Math.max(0, Math.min(v, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 75%, ${90 - w * 35}%)`;
}

function MultimodalTransformerVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10069);

  return (
    <ConfigurableVisualizer<MMTInput, Record<string, never>>
      config={{
        defaultInput: { sample: "cat_on_chair" },
        algorithm: (input) => {
          const key = String(input.sample) as keyof typeof SAMPLES;
          const s = SAMPLES[key] ?? SAMPLES.cat_on_chair;
          return generateMMTSteps(s);
        },
        inputTypes: [{ type: "string", key: "sample", label: "样本" }],
        inputFields: [
          {
            type: "string",
            key: "sample",
            label: "样本（cat_on_chair / dog_running）",
            placeholder: "cat_on_chair",
          },
        ],
        testCases: [
          { label: "🐱 Cat on chair", value: { sample: "cat_on_chair" } },
          { label: "🐶 Dog running", value: { sample: "dog_running" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as MMTSample | undefined;
          const crossAttn = variables?.crossAttn as number[][] | undefined;

          if (!sample) return null;

          const showTokens = ["image_tokens", "text_tokens", "concat", "self_attn", "cross_attn", "pool", "complete"].includes(phase);
          const showConcat = ["concat", "self_attn", "cross_attn", "pool", "complete"].includes(phase);
          const showSelf = ["self_attn", "cross_attn", "pool", "complete"].includes(phase);
          const showCross = ["cross_attn", "pool", "complete"].includes(phase);

          const totalLen = sample.patches.length + sample.tokens.length + 1; // +SEP

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "一个 Transformer，能同时处理图像和文字吗？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          Transformer 原本是处理<b>文本</b>的——输入一串 token，输出一串 token。
                          图像是 224×224 的像素网格，完全不是 token 序列。怎么办？
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "先把图像\"切碎\"变成 token",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          ViT 的灵感：把图像切成 16×16 的<b>小方块（patch）</b>，
                          每个 patch 经过线性投影，就变成了一个 d 维向量——<b>和文字 token 长得一样</b>！
                        </p>
                        <p>
                          于是图像也成了"token 序列"：
                          <InlineMath math="\text{image} \to [p_1, p_2, \ldots, p_L]" />。
                          L 就是 patch 的数量（比如 14×14=196 个）。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——既然都是 token，直接拼起来",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          把图像 token 和文字 token <b>首尾相连</b>，再加两个特殊 token：
                          <InlineMath math="[\text{CLS}, p_1, \ldots, p_L, \text{SEP}, e_1, \ldots, e_T, \text{SEP}]" />。
                        </p>
                        <p>
                          然后扔给<b>普通的 Transformer</b>！Self-Attention 不关心 token 来自哪个模态——
                          它会自动让图像 token 关注文本 token，反之亦然。
                          <b>跨模态交互自然发生</b>。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "[CLS] 是魔法聚合点",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          [CLS] token 通过 Self-Attention 能看到序列里<b>所有其它 token</b>，
                          所以它最终的 hidden state <b>聚合了整张图 + 整段文字</b>的信息。
                        </p>
                        <p>
                          任何下游任务——判断匹配、分类答案、做检索——都只需在 [CLS] 上加个小分类头即可。
                          这就是 LXMERT、UNITER、ViLT 等模型的统一思路。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    多模态 Transformer（LXMERT / UNITER）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`H = \text{Transformer}([\text{CLS}; p_1, \ldots, p_L; \text{SEP}; e_1, \ldots, e_T; \text{SEP}])`} />
                <BlockMath math={String.raw`\text{CrossAttn}(Q_T, K_I, V_I) = \text{softmax}\left(\frac{Q_T K_I^\top}{\sqrt{d}}\right)V_I`} />
                <p className="text-xs text-gray-500 mt-1">
                  d_model = {sample.dModel}{" | L="}{sample.patches.length}（图像 patch）{" | T="}{sample.tokens.length - 1}（文本 token）
                </p>
              </div>

              {/* 图像与文本 tokens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>{sample.imageEmoji}</span>
                    <span>图像 Patch Tokens (p_1..p_{sample.patches.length})</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sample.patches.map((p, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-md border flex flex-col items-center justify-center transition-all ${
                          showTokens
                            ? "border-blue-300 shadow-sm"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: showTokens ? p.color : "#f3f4f6" }}
                      >
                        <div className="text-[10px] font-bold text-gray-800">
                          p<sub>{i + 1}</sub>
                        </div>
                        <div className="text-[9px] text-gray-700">{p.name.split(" ")[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    文本 Tokens (e_1..e_{sample.tokens.length - 1})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {sample.tokens.map((tok, i) => {
                      const isCLS = tok === "[CLS]";
                      return (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-md text-xs font-mono border ${
                            isCLS
                              ? "bg-pink-100 text-pink-800 border-pink-400 font-bold"
                              : showTokens
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {tok}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 拼接序列 */}
              {showConcat && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    拼接后的输入序列（长度 {totalLen}）
                  </h4>
                  <div className="flex flex-wrap items-center gap-1 overflow-x-auto">
                    <span className="px-2 py-1 rounded-md text-xs font-mono bg-pink-100 text-pink-800 border border-pink-400 font-bold">
                      [CLS]
                    </span>
                    {sample.patches.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-[11px] font-mono border border-blue-300"
                        style={{ backgroundColor: p.color }}
                      >
                        p{i + 1}
                      </span>
                    ))}
                    <span className="px-2 py-1 rounded-md text-xs font-mono bg-gray-200 text-gray-700 border border-gray-400">
                      [SEP]
                    </span>
                    {sample.tokens.slice(1).map((tok, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-[11px] font-mono bg-indigo-50 text-indigo-800 border border-indigo-200"
                      >
                        {tok}
                      </span>
                    ))}
                    <span className="px-2 py-1 rounded-md text-xs font-mono bg-gray-200 text-gray-700 border border-gray-400">
                      [SEP]
                    </span>
                  </div>
                </div>
              )}

              {/* Self-Attention 示意 */}
              {showSelf && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Self-Attention：所有 token 两两交互
                  </h4>
                  <div className="text-xs text-gray-600">
                    <InlineMath math="\text{Attention}(Q, K, V) = \text{softmax}(QK^\top/\sqrt{d})V" />
                    <span className="ml-2">
                      — 图像 patch 和文本 token 共享同一注意力矩阵，实现跨模态信息流动。
                    </span>
                  </div>
                </div>
              )}

              {/* Cross-Attention 热力图 */}
              {showCross && crossAttn && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    跨模态注意力：文本 Q → 图像 K/V
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          <td className="w-16"></td>
                          {sample.patches.map((p, j) => (
                            <td key={j} className="w-14 text-center text-gray-500 pb-1 text-[10px]">
                              p{j + 1}
                              <br />
                              <span className="text-[9px]">{p.name.split(" ")[1]}</span>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {crossAttn.map((row, i) => (
                          <tr key={i}>
                            <td className="pr-2 text-gray-600 font-mono text-right text-[11px]">
                              {sample.tokens[i]}
                            </td>
                            {row.map((v, j) => (
                              <td
                                key={j}
                                className="w-14 h-8 text-center font-mono border border-white/60 rounded"
                                style={{ backgroundColor: heatColor(v) }}
                              >
                                {v.toFixed(2)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    每行为 softmax(q_text · K_img^T / √d)，展示文本 token 对图像 patch 的关注度。
                  </p>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入" },
                    { id: "image_tokens", label: "② 图像 Token" },
                    { id: "text_tokens", label: "③ 文本 Token" },
                    { id: "concat", label: "④ 拼接" },
                    { id: "self_attn", label: "⑤ Self-Attn" },
                    { id: "cross_attn", label: "⑥ Cross-Attn" },
                    { id: "pool", label: "⑦ [CLS] 汇聚" },
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

export default MultimodalTransformerVisualizer;
