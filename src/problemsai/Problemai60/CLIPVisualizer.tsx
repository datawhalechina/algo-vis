import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateCLIPSteps, CLIPItem } from "./algorithm";

interface CLIPInput extends ProblemInput {
  temperature: number;
}

const DEFAULT_IMAGES: CLIPItem[] = [
  { kind: "image", label: "cat", emoji: "🐱", embedding: [0.9, 0.1, 0.2, 0.1] },
  { kind: "image", label: "dog", emoji: "🐶", embedding: [0.1, 0.9, 0.2, 0.1] },
  { kind: "image", label: "car", emoji: "🚗", embedding: [0.2, 0.1, 0.9, 0.1] },
  { kind: "image", label: "tree", emoji: "🌳", embedding: [0.1, 0.2, 0.1, 0.9] },
];

const DEFAULT_TEXTS: CLIPItem[] = [
  { kind: "text", label: "a cat", emoji: "📝", embedding: [0.85, 0.15, 0.2, 0.1] },
  { kind: "text", label: "a dog", emoji: "📝", embedding: [0.12, 0.88, 0.2, 0.1] },
  { kind: "text", label: "a car", emoji: "📝", embedding: [0.2, 0.15, 0.85, 0.1] },
  { kind: "text", label: "a tree", emoji: "📝", embedding: [0.1, 0.2, 0.15, 0.88] },
];

function getHeatColor(v: number, maxV: number): string {
  const w = Math.max(0, Math.min(v / (maxV || 1), 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 75%, ${90 - w * 35}%)`;
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "① 初始化", color: "bg-gray-100 text-gray-700" },
    encode_image: { label: "② 图像编码", color: "bg-pink-100 text-pink-700" },
    encode_text: { label: "③ 文本编码", color: "bg-indigo-100 text-indigo-700" },
    similarity: { label: "④ 相似度矩阵", color: "bg-blue-100 text-blue-700" },
    softmax_i2t: { label: "⑤ I→T Softmax", color: "bg-amber-100 text-amber-700" },
    softmax_t2i: { label: "⑥ T→I Softmax", color: "bg-orange-100 text-orange-700" },
    loss: { label: "⑦ 对比损失", color: "bg-purple-100 text-purple-700" },
    complete: { label: "✓ 完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

// 用小竖条表示嵌入向量（避免溢出）
function EmbeddingBars({ emb, color }: { emb: number[]; color: string }) {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {emb.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: `${Math.max(3, Math.abs(v) * 22)}px`,
            backgroundColor: color,
            opacity: 0.5 + Math.min(Math.abs(v), 1) * 0.5,
          }}
          title={`d${i}=${v.toFixed(2)}`}
        />
      ))}
    </div>
  );
}

// 架构图：双塔结构
function CLIPArchitecture({ phase }: { phase: string }) {
  const active = {
    image: ["encode_image", "similarity", "softmax_i2t", "softmax_t2i", "loss", "complete"].includes(phase),
    text: ["encode_text", "similarity", "softmax_i2t", "softmax_t2i", "loss", "complete"].includes(phase),
    space: ["similarity", "softmax_i2t", "softmax_t2i", "loss", "complete"].includes(phase),
  };
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        🏗️ CLIP 双塔架构（Two-Tower Architecture）
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* 左侧：图像分支 */}
        <div className="space-y-2">
          <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-2 text-center">
            <div className="text-2xl">🖼️</div>
            <div className="text-[10px] text-pink-700 font-semibold">图像输入</div>
          </div>
          <div className="text-center text-gray-400 text-xs">↓</div>
          <div
            className={`border-2 rounded-lg p-2 text-center transition-all ${
              active.image
                ? "bg-pink-100 border-pink-400 ring-2 ring-pink-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="text-[11px] font-bold text-pink-800">
              图像编码器 <InlineMath math="f_{img}" />
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">ViT / ResNet</div>
          </div>
          <div className="text-center text-gray-400 text-xs">↓</div>
          <div
            className={`border rounded-lg p-1.5 text-center text-[10px] ${
              active.image ? "bg-white border-pink-300" : "bg-gray-50 border-gray-200"
            }`}
          >
            <InlineMath math="I_i \in \mathbb{R}^d" />
            <div className="text-[9px] text-gray-500">(L2 归一化)</div>
          </div>
        </div>

        {/* 中间：共享空间 */}
        <div className="relative">
          <div
            className={`rounded-lg p-3 text-center transition-all ${
              active.space
                ? "bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-300 shadow"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="text-xs font-bold text-gray-800 mb-1">共享嵌入空间</div>
            <div className="text-[10px] text-gray-600 mb-2">
              Shared Embedding Space
            </div>
            <div className="flex justify-center items-center gap-2 text-lg">
              <span className="text-pink-600">🖼️</span>
              <span className="text-gray-400">↔</span>
              <span className="text-indigo-600">📝</span>
            </div>
            <div className="text-[10px] text-gray-600 mt-2">
              cos(I, T) 衡量对齐
            </div>
          </div>
          {/* 箭头装饰 */}
          <div className="hidden md:block absolute top-1/2 -left-2 text-gray-400">
            →
          </div>
          <div className="hidden md:block absolute top-1/2 -right-2 text-gray-400">
            ←
          </div>
        </div>

        {/* 右侧：文本分支 */}
        <div className="space-y-2">
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-2 text-center">
            <div className="text-2xl">📝</div>
            <div className="text-[10px] text-indigo-700 font-semibold">文本输入</div>
          </div>
          <div className="text-center text-gray-400 text-xs">↓</div>
          <div
            className={`border-2 rounded-lg p-2 text-center transition-all ${
              active.text
                ? "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="text-[11px] font-bold text-indigo-800">
              文本编码器 <InlineMath math="f_{txt}" />
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">Transformer</div>
          </div>
          <div className="text-center text-gray-400 text-xs">↓</div>
          <div
            className={`border rounded-lg p-1.5 text-center text-[10px] ${
              active.text ? "bg-white border-indigo-300" : "bg-gray-50 border-gray-200"
            }`}
          >
            <InlineMath math="T_j \in \mathbb{R}^d" />
            <div className="text-[9px] text-gray-500">(L2 归一化)</div>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-slate-50 rounded-md p-2 text-[11px] text-slate-700 leading-relaxed">
        <span className="font-bold">💡 架构要点：</span>
        两个独立的编码器分别处理图像和文本，最后输出到<span className="font-semibold text-emerald-700">同一向量空间</span>。
        语义匹配的图文对（如🐱 ↔ "a cat"）会被拉近，不匹配的推远。
      </div>
    </div>
  );
}

// 符号说明卡片
function SymbolGlossary({ N, tau }: { N: number; tau: number }) {
  const symbols = [
    { sym: "N", desc: `批次大小 (batch size) — 本例 N=${N}`, color: "bg-blue-50 text-blue-800" },
    { sym: "I_i", desc: "第 i 张图像经编码器得到的嵌入向量（d 维）", color: "bg-pink-50 text-pink-800" },
    { sym: "T_j", desc: "第 j 条文本经编码器得到的嵌入向量（d 维）", color: "bg-indigo-50 text-indigo-800" },
    { sym: "f_{img}", desc: "图像编码器（如 ViT、ResNet）", color: "bg-pink-50 text-pink-800" },
    { sym: "f_{txt}", desc: "文本编码器（如 Transformer）", color: "bg-indigo-50 text-indigo-800" },
    { sym: "s_{ij}", desc: "图像 i 与文本 j 的相似度，= I_i · T_j（L2 归一化后即余弦相似度）", color: "bg-blue-50 text-blue-800" },
    { sym: "\\tau", desc: `温度参数 — 越小分布越尖锐，本例 τ=${tau}`, color: "bg-amber-50 text-amber-800" },
    { sym: "\\mathcal{L}", desc: "对比损失（InfoNCE），训练目标是最小化该损失", color: "bg-purple-50 text-purple-800" },
  ];
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        📖 符号说明（Legend）
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {symbols.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 px-2 py-1.5 rounded-md text-[11px] ${s.color}`}
          >
            <span className="font-mono font-bold text-sm min-w-[32px] pt-0.5">
              <InlineMath math={s.sym} />
            </span>
            <span className="flex-1">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 训练直觉示意图（正样本靠近、负样本远离）
function TrainingIntuition() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        🎯 训练目标直觉（Contrastive Learning）
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="text-xs font-semibold text-emerald-800 mb-2">
            正样本对 <InlineMath math="(I_i, T_i)" />
          </div>
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="text-2xl">🐱</span>
            <span className="text-emerald-600 text-xl font-bold">←→</span>
            <span className="text-lg text-emerald-900 bg-white px-2 py-1 rounded">"a cat"</span>
          </div>
          <div className="text-[10px] text-emerald-700 text-center">
            拉近 (maximize <InlineMath math="s_{ii}" />)
          </div>
        </div>
        <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
          <div className="text-xs font-semibold text-rose-800 mb-2">
            负样本对 <InlineMath math="(I_i, T_j), i \neq j" />
          </div>
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="text-2xl">🐱</span>
            <span className="text-rose-600 text-xl font-bold">←✗→</span>
            <span className="text-lg text-rose-900 bg-white px-2 py-1 rounded">"a car"</span>
          </div>
          <div className="text-[10px] text-rose-700 text-center">
            推远 (minimize <InlineMath math="s_{ij}" />)
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
        <span className="font-bold">核心思想：</span>
        Batch 中共 N×N 个配对，其中 <span className="font-semibold text-emerald-700">N 个正样本</span>（对角线）、
        <span className="font-semibold text-rose-700"> N²−N 个负样本</span>（非对角线）。
        对比损失推动正样本相似度 <InlineMath math="s_{ii}" /> 最大、负样本 <InlineMath math="s_{ij}" /> 最小。
      </p>
    </div>
  );
}

// 样本对的紧凑展示
function SampleList({
  items,
  embs,
  color,
  currentIdx,
  activePhase,
  label,
  matchPhase,
}: {
  items: CLIPItem[];
  embs: number[][] | undefined;
  color: string;
  currentIdx: number | undefined;
  activePhase: string;
  label: "I" | "T";
  matchPhase: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">
        {label === "I" ? "🖼️ 图像批次" : "📝 文本批次"} (N={items.length})
      </h4>
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isCurrent = activePhase === matchPhase && currentIdx === i;
          const done = embs && embs[i];
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-all text-xs ${
                isCurrent
                  ? label === "I"
                    ? "bg-pink-50 border-pink-400 ring-2 ring-pink-200"
                    : "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200"
                  : done
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <span className="text-xl w-7 flex-shrink-0 text-center">
                {item.emoji}
              </span>
              <span className="font-mono text-gray-500 w-8 flex-shrink-0">
                {label}<sub>{i}</sub>
              </span>
              <span className="flex-1 text-gray-800 truncate">
                {label === "T" ? `"${item.label}"` : item.label}
              </span>
              <div className="flex-shrink-0">
                {done ? (
                  <EmbeddingBars emb={embs![i]} color={color} />
                ) : (
                  <span className="text-[10px] text-gray-400">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CLIPVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10060);

  return (
    <ConfigurableVisualizer<CLIPInput, Record<string, never>>
      config={{
        defaultInput: { temperature: 0.1 },
        algorithm: (input) => {
          const t =
            typeof input.temperature === "number"
              ? input.temperature
              : parseFloat(String(input.temperature)) || 0.1;
          return generateCLIPSteps(DEFAULT_IMAGES, DEFAULT_TEXTS, t);
        },
        inputTypes: [{ type: "number", key: "temperature", label: "温度 τ" }],
        inputFields: [
          {
            type: "number",
            key: "temperature",
            label: "温度 τ（越小越尖锐）",
            placeholder: "0.1",
          },
        ],
        testCases: [
          { label: "默认 τ=0.1（尖锐）", value: { temperature: 0.1 } },
          { label: "τ=0.3（中等）", value: { temperature: 0.3 } },
          { label: "τ=1.0（平坦）", value: { temperature: 1.0 } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const images = (variables?.images as unknown as CLIPItem[]) ?? DEFAULT_IMAGES;
          const texts = (variables?.texts as unknown as CLIPItem[]) ?? DEFAULT_TEXTS;
          const imgEmbs = variables?.imgEmbs as number[][] | undefined;
          const txtEmbs = variables?.txtEmbs as number[][] | undefined;
          const sim = variables?.sim as number[][] | undefined;
          const probsI2T = variables?.probsI2T as number[][] | undefined;
          const probsT2I = variables?.probsT2I as number[][] | undefined;
          const tau = (variables?.tau as number) ?? 0.1;
          const N = (variables?.N as number) ?? images.length;
          const currentIdx = variables?.currentIdx as number | undefined;
          const loss = variables?.loss as number | undefined;
          const lossI2T = variables?.lossI2T as number | undefined;
          const lossT2I = variables?.lossT2I as number | undefined;

          const showSim = ["similarity", "softmax_i2t", "softmax_t2i", "loss", "complete"].includes(phase);
          const showI2T = ["softmax_i2t", "softmax_t2i", "loss", "complete"].includes(phase);
          const showT2I = ["softmax_t2i", "loss", "complete"].includes(phase);
          const showLoss = ["loss", "complete"].includes(phase);

          const maxSim = sim ? Math.max(...sim.flat().map(Math.abs)) : 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 3B1B 风格叙事：从零理解 CLIP */}
              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "假如你要做一个图片搜索引擎……",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          用户输入 "a red car"，你想返回一张<b>红色汽车</b>的图片。
                          问题是：<b>计算机怎么知道这段文字和这张图片"说的是同一件事"？</b>
                        </p>
                        <p className="text-slate-600">
                          文字是 token 序列，图片是像素网格——它们根本不是同一种东西。
                          即使是同一只猫，描述可以是 "a cat"、"a kitty"、"a small feline"，
                          写法千变万化。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "关键想法：让它们说同一种\"语言\"",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          如果我们能把任何图片翻译成一个 d 维向量、任何文字也翻译成一个 d 维向量，
                          那就<b>可以直接比较它们</b>（算余弦相似度）。
                        </p>
                        <p>
                          这需要两个"翻译器"——图像编码器 <InlineMath math="f_{img}" /> 和文本编码器
                          {" "}<InlineMath math="f_{txt}" />。关键是：<b>两个翻译器的输出要落到同一个向量空间</b>，
                          让"🐱 的向量" 和 '"a cat" 的向量' 几乎相等。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——怎么训练这两个翻译器？",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          想象你一次拿到 <b>N 对</b>图文（比如 N=4）：{" "}
                          🐱↔"a cat"、🐶↔"a dog"、🚗↔"a car"、🌳↔"a tree"。
                          <b>你早就知道谁配对谁</b>。
                        </p>
                        <p>
                          那就让模型<b>做个小测验</b>：给它一张 🐱，让它在 4 段文字里选出 "a cat"。
                          选对 → 奖励；选错 → 惩罚。同样反过来：给 "a cat"，在 4 张图里选出 🐱。
                          <b>这就是"对比学习"</b>——对比正样本（对角线）和负样本（其它位置）。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "这怎么变成一个公式？",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          把所有图像向量 <InlineMath math="I_1..I_N" /> 和文本向量 <InlineMath math="T_1..T_N" /> 两两算内积，
                          得到一个 <b>N×N 的相似度矩阵 S</b>。对角线 <InlineMath math="s_{ii}" /> 是正样本分数、其它是负样本分数。
                        </p>
                        <p>
                          对每一行做 Softmax — 得到"给定图 i，它对应文 j 的概率"。
                          训练目标就是<b>让这个概率分布把全部质量压在对角线上</b>（即用交叉熵最小化）。
                          这就是下面公式里 <InlineMath math="\mathcal{L}" /> 的来源！
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              {/* 标题 + 阶段 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      CLIP — Contrastive Language-Image Pre-training
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      用对比学习把图像和文本映射到同一向量空间
                    </p>
                  </div>
                  <PhaseTag phase={phase} />
                </div>
              </div>

              {/* 架构图 */}
              <CLIPArchitecture phase={phase} />

              {/* 训练直觉（核心思想图示） */}
              <TrainingIntuition />

              {/* 符号说明 */}
              <SymbolGlossary N={N} tau={tau} />

              {/* 完整损失公式 + 分步解释 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  🧮 对比损失（InfoNCE）
                </h4>
                <BlockMath math={String.raw`\mathcal{L} = -\frac{1}{2N}\sum_{i=1}^{N}\underbrace{\log \frac{e^{s_{ii}/\tau}}{\sum_{j=1}^{N}e^{s_{ij}/\tau}}}_{L_{i\to t}:\ \text{图像找文本}} \;-\; \frac{1}{2N}\sum_{i=1}^{N}\underbrace{\log \frac{e^{s_{ii}/\tau}}{\sum_{j=1}^{N}e^{s_{ji}/\tau}}}_{L_{t\to i}:\ \text{文本找图像}}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px]">
                  <div className="bg-pink-50 rounded-md p-2">
                    <span className="font-semibold text-pink-800">I→T：</span>
                    给定图像 <InlineMath math="I_i" />，在 N 条文本中预测正确的 <InlineMath math="T_i" />
                  </div>
                  <div className="bg-indigo-50 rounded-md p-2">
                    <span className="font-semibold text-indigo-800">T→I：</span>
                    给定文本 <InlineMath math="T_i" />，在 N 张图像中预测正确的 <InlineMath math="I_i" />
                  </div>
                </div>
              </div>

              {/* Batch 数据：图像批次 + 文本批次 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SampleList
                  items={images}
                  embs={imgEmbs}
                  color="#ec4899"
                  currentIdx={currentIdx}
                  activePhase={phase}
                  label="I"
                  matchPhase="encode_image"
                />
                <SampleList
                  items={texts}
                  embs={txtEmbs}
                  color="#6366f1"
                  currentIdx={currentIdx}
                  activePhase={phase}
                  label="T"
                  matchPhase="encode_text"
                />
              </div>

              {/* 相似度矩阵 */}
              {showSim && sim && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    🔢 相似度矩阵 S ∈ ℝ<sup>N×N</sup>
                  </h4>
                  <p className="text-[11px] text-gray-600 mb-3">
                    <InlineMath math="S_{ij} = (I_i \cdot T_j)/\tau" />
                    {" "}— 绿框 (对角线) = 正样本，其它 = 负样本
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse mx-auto">
                      <thead>
                        <tr>
                          <td className="w-10 text-right pr-2 pb-1 text-[10px] text-gray-400">
                            I\T
                          </td>
                          {texts.map((t, j) => (
                            <td
                              key={j}
                              className="text-center text-gray-600 pb-1 px-1"
                              style={{ minWidth: "72px", maxWidth: "96px" }}
                            >
                              <div className="font-mono text-[10px]">T<sub>{j}</sub></div>
                              <div className="text-[9px] text-gray-400 truncate" title={t.label}>
                                {t.emoji}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sim.map((row, i) => (
                          <tr key={i}>
                            <td className="pr-2 text-gray-600 font-mono text-right">
                              <div className="text-[10px]">I<sub>{i}</sub></div>
                              <div className="text-sm leading-none">{images[i].emoji}</div>
                            </td>
                            {row.map((v, j) => {
                              const isDiag = i === j;
                              return (
                                <td
                                  key={j}
                                  className={`h-10 text-center font-mono border rounded ${
                                    isDiag
                                      ? "ring-2 ring-emerald-500 font-bold"
                                      : "border-white/60"
                                  }`}
                                  style={{
                                    backgroundColor: getHeatColor(v, maxSim),
                                    minWidth: "72px",
                                    maxWidth: "96px",
                                  }}
                                  title={`${images[i].emoji} ↔ "${texts[j].label}" = ${v.toFixed(3)}`}
                                >
                                  {v.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Softmax 概率 */}
              {(showI2T || showT2I) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {showI2T && probsI2T && (
                    <div className="bg-white rounded-lg border border-pink-200 p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-pink-800 mb-1">
                        I → T 概率（对每行做 Softmax）
                      </h4>
                      <p className="text-[11px] text-gray-600 mb-2">
                        <InlineMath math="p(T_j \mid I_i) = \dfrac{e^{s_{ij}/\tau}}{\sum_k e^{s_{ik}/\tau}}" />
                      </p>
                      <div className="overflow-x-auto">
                        <table className="text-xs border-collapse">
                          <tbody>
                            {probsI2T.map((row, i) => (
                              <tr key={i}>
                                <td className="pr-2 text-gray-600 font-mono text-right text-[10px]">
                                  {images[i].emoji} I<sub>{i}</sub>
                                </td>
                                {row.map((v, j) => (
                                  <td
                                    key={j}
                                    className={`h-8 text-center font-mono border rounded text-[10px] ${
                                      i === j ? "ring-2 ring-emerald-500 font-bold" : "border-white/60"
                                    }`}
                                    style={{
                                      backgroundColor: getHeatColor(v, 1),
                                      minWidth: "56px",
                                    }}
                                  >
                                    {(v * 100).toFixed(0)}%
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-pink-700 mt-2">
                        每行之和 = 100%；对角线应最大
                      </p>
                    </div>
                  )}
                  {showT2I && probsT2I && (
                    <div className="bg-white rounded-lg border border-indigo-200 p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-indigo-800 mb-1">
                        T → I 概率（对每列做 Softmax）
                      </h4>
                      <p className="text-[11px] text-gray-600 mb-2">
                        <InlineMath math="p(I_i \mid T_j) = \dfrac{e^{s_{ij}/\tau}}{\sum_k e^{s_{kj}/\tau}}" />
                      </p>
                      <div className="overflow-x-auto">
                        <table className="text-xs border-collapse">
                          <tbody>
                            {probsT2I.map((row, i) => (
                              <tr key={i}>
                                <td className="pr-2 text-gray-600 font-mono text-right text-[10px]">
                                  {images[i].emoji} I<sub>{i}</sub>
                                </td>
                                {row.map((v, j) => (
                                  <td
                                    key={j}
                                    className={`h-8 text-center font-mono border rounded text-[10px] ${
                                      i === j ? "ring-2 ring-emerald-500 font-bold" : "border-white/60"
                                    }`}
                                    style={{
                                      backgroundColor: getHeatColor(v, 1),
                                      minWidth: "56px",
                                    }}
                                  >
                                    {(v * 100).toFixed(0)}%
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-indigo-700 mt-2">
                        每列之和 = 100%；对角线应最大
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 对比损失 */}
              {showLoss && loss !== undefined && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    📉 最终损失（越小说明模型对齐得越好）
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-200">
                      <div className="text-[11px] text-pink-700 mb-1">
                        图像→文本 <InlineMath math="L_{i\to t}" />
                      </div>
                      <div className="text-2xl font-bold text-pink-800">{lossI2T}</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                      <div className="text-[11px] text-indigo-700 mb-1">
                        文本→图像 <InlineMath math="L_{t\to i}" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-800">{lossT2I}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-300">
                      <div className="text-[11px] text-emerald-700 mb-1">
                        总损失 <InlineMath math="\mathcal{L}" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-800">{loss}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                    <span className="font-bold">💡 训练逻辑：</span>
                    反向传播会调整两个编码器的参数，使匹配对的 <InlineMath math="s_{ii}" /> 变大、不匹配对 <InlineMath math="s_{ij}" /> 变小，
                    从而把总损失推向 <InlineMath math="\mathcal{L} \to \log(1)=0" />。
                  </p>
                </div>
              )}

              {/* 流程进度 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">📍 计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入 N 对图文" },
                    { id: "encode_image", label: "② 图像编码 f_img" },
                    { id: "encode_text", label: "③ 文本编码 f_txt" },
                    { id: "similarity", label: "④ 相似度矩阵 S" },
                    { id: "softmax_i2t", label: "⑤ I→T Softmax" },
                    { id: "softmax_t2i", label: "⑥ T→I Softmax" },
                    { id: "loss", label: "⑦ InfoNCE 损失" },
                    { id: "complete", label: "✓ 完成" },
                  ].map((step, idx, arr) => {
                    const isDone = arr.findIndex((s) => s.id === phase) >= idx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
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

export default CLIPVisualizer;
