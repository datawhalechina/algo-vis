import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateGroundingSteps, GroundingScene } from "./algorithm";

interface GroundingInput extends ProblemInput {
  scene: string;
}

const SCENES: Record<string, GroundingScene> = {
  red_car: {
    imageLabel: "Cars parked on street",
    queryTokens: ["the", "red", "car"],
    queryEmbedding: [0.9, 0.1, 0.2, 0.8], // red + car
    proposals: [
      {
        id: "b1",
        label: "blue car",
        emoji: "🚙",
        box: [5, 40, 30, 70],
        feature: [0.85, 0.1, 0.2, 0.2],
      },
      {
        id: "b2",
        label: "red car",
        emoji: "🚗",
        box: [35, 35, 60, 70],
        feature: [0.92, 0.12, 0.2, 0.85],
      },
      {
        id: "b3",
        label: "yellow taxi",
        emoji: "🚕",
        box: [62, 40, 85, 70],
        feature: [0.85, 0.2, 0.1, 0.3],
      },
      {
        id: "b4",
        label: "person",
        emoji: "🚶",
        box: [15, 15, 25, 35],
        feature: [0.2, 0.3, 0.9, 0.2],
      },
    ],
  },
  brown_dog: {
    imageLabel: "Pets in a yard",
    queryTokens: ["the", "brown", "dog"],
    queryEmbedding: [0.1, 0.95, 0.5, 0.3],
    proposals: [
      {
        id: "b1",
        label: "black cat",
        emoji: "🐈",
        box: [10, 50, 30, 80],
        feature: [0.15, 0.8, 0.7, 0.05],
      },
      {
        id: "b2",
        label: "brown dog",
        emoji: "🐕",
        box: [40, 45, 65, 85],
        feature: [0.1, 0.95, 0.55, 0.35],
      },
      {
        id: "b3",
        label: "white dog",
        emoji: "🐩",
        box: [70, 40, 90, 80],
        feature: [0.1, 0.9, 0.5, 0.85],
      },
      {
        id: "b4",
        label: "bird",
        emoji: "🐦",
        box: [30, 10, 45, 25],
        feature: [0.3, 0.4, 0.2, 0.1],
      },
    ],
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    proposals: { label: "候选框", color: "bg-blue-100 text-blue-700" },
    region_features: { label: "区域特征", color: "bg-indigo-100 text-indigo-700" },
    query_encode: { label: "查询编码", color: "bg-violet-100 text-violet-700" },
    match_score: { label: "匹配分数", color: "bg-amber-100 text-amber-700" },
    softmax: { label: "Softmax", color: "bg-orange-100 text-orange-700" },
    complete: { label: "定位完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function VisualGroundingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10070);

  return (
    <ConfigurableVisualizer<GroundingInput, Record<string, never>>
      config={{
        defaultInput: { scene: "red_car" },
        algorithm: (input) => {
          const key = String(input.scene) as keyof typeof SCENES;
          const s = SCENES[key] ?? SCENES.red_car;
          return generateGroundingSteps(s);
        },
        inputTypes: [{ type: "string", key: "scene", label: "场景" }],
        inputFields: [
          {
            type: "string",
            key: "scene",
            label: "场景（red_car / brown_dog）",
            placeholder: "red_car",
          },
        ],
        testCases: [
          { label: "🚗 the red car", value: { scene: "red_car" } },
          { label: "🐕 the brown dog", value: { scene: "brown_dog" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const scene = variables?.scene as GroundingScene | undefined;
          const scores = (variables?.scores as number[]) ?? [];
          const probs = variables?.probs as number[] | undefined;
          const currentIdx = variables?.currentIdx as number | undefined;
          const bestIdx = variables?.bestIdx as number | undefined;

          if (!scene) return null;

          const showBoxes = ["proposals", "region_features", "query_encode", "match_score", "softmax", "complete"].includes(phase);
          const showScores = ["match_score", "softmax", "complete"].includes(phase);
          const showProbs = ["softmax", "complete"].includes(phase);
          const showBest = phase === "complete";

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "说\"红色的车\"，在图里框出来给我看",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          图里有 🚗（红）、🚙（蓝）、🚕（黄）三辆车。我说 "the red car"，
                          你要<b>画一个矩形框</b>把那辆红的圈出来。这叫<b>视觉定位（Visual Grounding）</b>。
                        </p>
                        <p className="text-slate-600">
                          它和普通目标检测的区别：普通检测是"找所有车"，定位是"找<b>文字描述的那辆</b>"——
                          需要跨模态理解。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "分两步：先给候选，再选最好的",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          第一步用预训练的<b>区域提议网络 (RPN)</b> 在图里生成 N 个候选框 {"{b₁, ..., bₙ}"}，
                          每个框可能圈住一个物体。
                        </p>
                        <p>
                          第二步从这 N 个里<b>选一个最匹配文字的</b>——这就把问题转成了<b>多选题</b>：
                          "哪个框是 the red car？"
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——匹配分 = cos(文字, 区域特征)",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          对每个候选框提取<b>区域特征</b> <InlineMath math="r_i" />，
                          文字查询编码为 <InlineMath math="q" />，
                          两者算余弦相似度：<InlineMath math="s_i = \cos(q, r_i)" />。
                        </p>
                        <p>
                          分数高 = 这个框的<b>内容</b>和<b>文字描述</b>语义接近。
                          比如 "red car" 的向量和红车框的视觉向量会有高相似度、和蓝车框相似度低。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "Softmax + argmax = 框出来",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          对所有分数做 Softmax，得到每个框<b>是目标</b>的概率。
                          取概率最高的那个 <InlineMath math="\hat{b} = \arg\max_i p_i" />——就是答案。
                        </p>
                        <p className="text-slate-600">
                          现代模型（MDETR、GLIP）把候选框和匹配一起端到端训练，
                          甚至<b>直接从图像+文字预测坐标</b>——更强大但思路一致。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    视觉定位（Visual Grounding）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`s_i = \cos(q, r_i) = \frac{q \cdot r_i}{\|q\|\,\|r_i\|},\quad p_i = \text{softmax}(\alpha\cdot s_i)`} />
                <BlockMath math={String.raw`\hat{b} = \arg\max_i\, p_i`} />
              </div>

              {/* 查询 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  文本查询 Q
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {scene.queryTokens.map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-xs font-mono bg-violet-50 text-violet-800 border border-violet-200"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-2">
                  q = [{scene.queryEmbedding.map((v) => v.toFixed(2)).join(", ")}]
                </p>
              </div>

              {/* 图像与候选框 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  图像 + 候选框（{scene.imageLabel}）
                </h4>
                <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-100 to-emerald-100 rounded-lg overflow-hidden border border-gray-300">
                  {scene.proposals.map((p, i) => {
                    const [x1, y1, x2, y2] = p.box;
                    const isCurrent = phase === "match_score" && currentIdx === i;
                    const isBest = showBest && bestIdx === i;
                    const prob = probs?.[i] ?? 0;
                    const showProbOverlay = showProbs && !showBest;

                    return (
                      <div
                        key={i}
                        className={`absolute border-2 rounded transition-all ${
                          isBest
                            ? "border-emerald-500 bg-emerald-500/20 ring-4 ring-emerald-300"
                            : isCurrent
                            ? "border-amber-500 bg-amber-500/25 ring-2 ring-amber-300"
                            : showScores
                            ? "border-blue-500/70 bg-blue-500/10"
                            : "border-blue-400 bg-blue-500/5"
                        }`}
                        style={{
                          left: `${x1}%`,
                          top: `${y1}%`,
                          width: `${x2 - x1}%`,
                          height: `${y2 - y1}%`,
                        }}
                      >
                        <div className="absolute -top-5 left-0 text-[10px] font-mono bg-white/90 px-1 rounded">
                          b<sub>{i + 1}</sub>
                          {isBest && <span className="text-emerald-700 ml-1">✓</span>}
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl drop-shadow">{p.emoji}</span>
                        </div>
                        {showProbOverlay && (
                          <div className="absolute bottom-0 right-0 text-[10px] font-mono bg-white/90 px-1 rounded">
                            {(prob * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {showBoxes && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    {scene.proposals.length} 个候选框由 RPN / DETR 提出
                  </p>
                )}
              </div>

              {/* 匹配分数 */}
              {showScores && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    文本-区域匹配分数 <InlineMath math="s_i = \cos(q, r_i)" />
                  </h4>
                  <div className="space-y-1.5">
                    {scene.proposals.map((p, i) => {
                      const s = scores[i];
                      const prob = probs?.[i];
                      const isBest = bestIdx === i && showBest;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-xl w-8">{p.emoji}</span>
                          <span className="w-24 text-gray-700">"{p.label}"</span>
                          <span className="w-16 font-mono text-gray-600">
                            s={s?.toFixed(3) ?? "—"}
                          </span>
                          {showProbs && prob !== undefined && (
                            <>
                              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isBest ? "bg-emerald-500" : "bg-gray-400"
                                  }`}
                                  style={{ width: `${prob * 100}%` }}
                                />
                              </div>
                              <span
                                className={`w-12 text-right font-mono ${
                                  isBest ? "font-bold text-emerald-700" : "text-gray-600"
                                }`}
                              >
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </>
                          )}
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
                    { id: "init", label: "① 图像+查询" },
                    { id: "proposals", label: "② 候选框" },
                    { id: "region_features", label: "③ 区域特征" },
                    { id: "query_encode", label: "④ 查询编码" },
                    { id: "match_score", label: "⑤ 匹配分数" },
                    { id: "softmax", label: "⑥ Softmax" },
                    { id: "complete", label: "⑦ 定位框" },
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

export default VisualGroundingVisualizer;
