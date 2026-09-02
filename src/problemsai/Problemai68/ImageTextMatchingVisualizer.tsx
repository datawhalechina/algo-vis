import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateITMSteps, ITMItem } from "./algorithm";

interface ITMInput extends ProblemInput {
  threshold: number;
}

const DEFAULT_ITEMS: ITMItem[] = [
  {
    id: "1",
    imageLabel: "cat",
    imageEmoji: "🐱",
    text: "a cat sitting",
    imageEmb: [0.9, 0.1, 0.2, 0.1],
    textEmb: [0.88, 0.15, 0.2, 0.1],
  },
  {
    id: "2",
    imageLabel: "dog",
    imageEmoji: "🐶",
    text: "a red car",
    imageEmb: [0.1, 0.9, 0.2, 0.1],
    textEmb: [0.9, 0.1, 0.15, 0.6],
  },
  {
    id: "3",
    imageLabel: "car",
    imageEmoji: "🚗",
    text: "a fast red car",
    imageEmb: [0.9, 0.1, 0.2, 0.8],
    textEmb: [0.92, 0.1, 0.2, 0.75],
  },
  {
    id: "4",
    imageLabel: "tree",
    imageEmoji: "🌳",
    text: "a green tree",
    imageEmb: [0.1, 0.2, 0.9, 0.1],
    textEmb: [0.12, 0.22, 0.88, 0.12],
  },
  {
    id: "5",
    imageLabel: "bird",
    imageEmoji: "🐦",
    text: "a sleeping cat",
    imageEmb: [0.2, 0.1, 0.3, 0.9],
    textEmb: [0.88, 0.12, 0.18, 0.12],
  },
];

function heatColor(v: number): string {
  const w = Math.max(0, Math.min(v, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 75%, ${90 - w * 35}%)`;
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode: { label: "编码", color: "bg-blue-100 text-blue-700" },
    similarity: { label: "相似度计算", color: "bg-amber-100 text-amber-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function ImageTextMatchingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10068);

  return (
    <ConfigurableVisualizer<ITMInput, Record<string, never>>
      config={{
        defaultInput: { threshold: 0.7 },
        algorithm: (input) => {
          const t =
            typeof input.threshold === "number"
              ? input.threshold
              : parseFloat(String(input.threshold)) || 0.7;
          return generateITMSteps(DEFAULT_ITEMS, t);
        },
        inputTypes: [{ type: "number", key: "threshold", label: "阈值 τ" }],
        inputFields: [
          {
            type: "number",
            key: "threshold",
            label: "匹配阈值 τ",
            placeholder: "0.7",
          },
        ],
        testCases: [
          { label: "τ=0.7（中等严格）", value: { threshold: 0.7 } },
          { label: "τ=0.9（严格）", value: { threshold: 0.9 } },
          { label: "τ=0.5（宽松）", value: { threshold: 0.5 } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const items = (variables?.items as unknown as ITMItem[]) ?? DEFAULT_ITEMS;
          const threshold = (variables?.threshold as number) ?? 0.7;
          const sims = (variables?.sims as number[]) ?? [];
          const predictions = (variables?.predictions as unknown as boolean[]) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;

          const showSims = ["similarity", "complete"].includes(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "一张图 + 一段文字，它们\"配\"吗？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          这是多模态里最基础的问题：给你 🐱 和 "a cat"，匹配。
                          给你 🐱 和 "a red car"，不匹配。<b>模型怎么自动判断？</b>
                        </p>
                        <p className="text-slate-600">
                          这个小能力是<b>一切跨模态应用的地基</b>——检索、生成、过滤都建在上面。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "把它们变成向量，算夹角",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          用 CLIP 之类的模型，把图和文字都映射成<b>同一空间</b>的向量 <InlineMath math="I" />、<InlineMath math="T" />。
                          关键观察：语义相近的两个向量，<b>方向相近</b>（夹角小），
                          远离的则夹角大。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——余弦相似度 = 夹角余弦",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          两个向量的夹角 θ 可以用<b>点积除以模长</b>计算：
                          <InlineMath math="\cos\theta = (I \cdot T)/(\|I\|\|T\|)" />，值在 [−1, 1]。
                        </p>
                        <p>
                          • <span className="text-emerald-700 font-semibold">cos ≈ 1</span>：完全同向，语义高度匹配<br />
                          • cos ≈ 0：几乎正交，不相关<br />
                          • <span className="text-rose-700 font-semibold">cos ≈ −1</span>：方向相反，含义对立
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "画一条线——阈值决定\"算不算匹配\"",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          只有余弦值还不够——你得定一个<b>阈值 τ</b>。
                          sim ≥ τ → 匹配；sim &lt; τ → 不匹配。
                        </p>
                        <p>
                          τ 的选择决定了系统的<b>严格程度</b>：
                          τ 高 → 只认高度相似的（精确率高、召回率低）；
                          τ 低 → 宽容（召回率高、精确率低）。
                          实际系统常用 PR 曲线/AUC 来挑最优阈值。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    图像-文本匹配（ITM）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\text{sim}(I, T) = \frac{I \cdot T}{\|I\|\,\|T\|},\quad \text{match} = \mathbb{1}[\text{sim}(I, T) \geq \tau]`} />
                <p className="text-xs text-gray-500 mt-1">阈值 τ = {threshold}</p>
              </div>

              {/* 样本对 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  图像-文本对
                </h4>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const sim = sims[i];
                    const pred = predictions[i];
                    const isCurrent = phase === "similarity" && currentIdx === i;
                    const done = sim !== undefined;
                    return (
                      <div
                        key={i}
                        className={`grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-lg border transition-all ${
                          isCurrent
                            ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300"
                            : done
                            ? pred
                              ? "bg-emerald-50 border-emerald-300"
                              : "bg-rose-50 border-rose-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="col-span-2 flex items-center gap-1">
                          <span className="text-2xl">{item.imageEmoji}</span>
                          <span className="text-[10px] text-gray-500">
                            I<sub>{i}</sub>
                          </span>
                        </div>
                        <div className="col-span-4 text-xs text-gray-800">
                          "{item.text}"
                          <div className="text-[9px] text-gray-400 font-mono">
                            T<sub>{i}</sub>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          {showSims && sim !== undefined ? (
                            <span
                              className="font-mono text-xs px-2 py-1 rounded font-semibold"
                              style={{ backgroundColor: heatColor(sim) }}
                            >
                              {sim.toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          {done && (
                            <span
                              className={`text-[10px] font-mono ${
                                pred ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              {sim!.toFixed(2)} {pred ? "≥" : "<"} {threshold}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          {done ? (
                            pred ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                                ✓ Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                                ✗ No Match
                              </span>
                            )
                          ) : (
                            <span className="text-gray-300 text-xs">…</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 阈值可视化 */}
                {showSims && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 mb-2">相似度分布（橙色=阈值）</div>
                    <div className="relative h-12 bg-gradient-to-r from-blue-100 via-white to-red-100 rounded-lg border border-gray-200">
                      {/* 阈值线 */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
                        style={{ left: `${threshold * 100}%` }}
                      >
                        <span className="absolute -top-5 -left-6 text-[10px] text-orange-700 font-bold">
                          τ={threshold}
                        </span>
                      </div>
                      {/* 样本点 */}
                      {sims.map((sim, i) => (
                        <div
                          key={i}
                          className={`absolute w-6 h-6 -ml-3 rounded-full border-2 flex items-center justify-center text-xs ${
                            predictions[i]
                              ? "border-emerald-500 bg-emerald-100"
                              : "border-rose-500 bg-rose-100"
                          }`}
                          style={{
                            left: `${sim * 100}%`,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                          title={`${items[i].imageEmoji} ↔ "${items[i].text}" = ${sim.toFixed(3)}`}
                        >
                          {items[i].imageEmoji}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                      <span>0.0</span>
                      <span>0.5</span>
                      <span>1.0</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入图像-文本对" },
                    { id: "encode", label: "② 双模态编码" },
                    { id: "similarity", label: "③ 余弦相似度" },
                    { id: "complete", label: "④ 阈值判定" },
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

export default ImageTextMatchingVisualizer;
