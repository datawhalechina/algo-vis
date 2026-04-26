import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateVQASteps, VQAScene } from "./algorithm";

interface VQAInput extends ProblemInput {
  scene: string;
}

const SCENES: Record<string, VQAScene> = {
  kitchen: {
    label: "Kitchen scene",
    emoji: "🍳",
    regions: [
      { name: "fridge", color: "#e5e7eb", emoji: "🧊" },
      { name: "stove", color: "#fde68a", emoji: "🔥" },
      { name: "sink", color: "#bae6fd", emoji: "🚰" },
      { name: "table", color: "#d4d4aa", emoji: "🪑" },
      { name: "cup", color: "#f9a8d4", emoji: "☕" },
      { name: "apple", color: "#fca5a5", emoji: "🍎" },
    ],
    question: ["What", "color", "is", "the", "fridge", "?"],
    candidates: [
      { label: "white", score: 3.2 },
      { label: "red", score: 0.5 },
      { label: "blue", score: 0.3 },
      { label: "black", score: 1.2 },
    ],
    qToR: [
      [0.5, 0.3, 0.2, 0.1, 0.1, 0.1], // What
      [1.0, 0.2, 0.3, 0.1, 0.3, 0.2], // color
      [0.3, 0.1, 0.1, 0.1, 0.1, 0.1], // is
      [0.5, 0.1, 0.1, 0.1, 0.2, 0.1], // the
      [3.0, 0.1, 0.1, 0.1, 0.1, 0.1], // fridge
      [0.2, 0.1, 0.1, 0.1, 0.1, 0.1], // ?
    ],
    rToQ: [
      [0.3, 2.0, 0.2, 0.5, 3.0, 0.2], // fridge
      [0.2, 0.5, 0.1, 0.2, 0.3, 0.1], // stove
      [0.2, 0.3, 0.1, 0.2, 0.2, 0.1], // sink
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1], // table
      [0.1, 0.3, 0.1, 0.2, 0.2, 0.1], // cup
      [0.1, 0.2, 0.1, 0.2, 0.1, 0.1], // apple
    ],
    answer: "white",
  },
  street: {
    label: "Street scene",
    emoji: "🏙️",
    regions: [
      { name: "sky", color: "#bfdbfe", emoji: "☁️" },
      { name: "building", color: "#d6d3d1", emoji: "🏢" },
      { name: "tree", color: "#86efac", emoji: "🌳" },
      { name: "car", color: "#fca5a5", emoji: "🚗" },
      { name: "person", color: "#fde68a", emoji: "🚶" },
      { name: "road", color: "#78716c", emoji: "🛣️" },
    ],
    question: ["How", "many", "cars", "?"],
    candidates: [
      { label: "1", score: 3.5 },
      { label: "2", score: 1.5 },
      { label: "3", score: 0.5 },
      { label: "0", score: 0.1 },
    ],
    qToR: [
      [0.2, 0.3, 0.2, 1.0, 0.2, 0.3],
      [0.1, 0.3, 0.2, 1.5, 0.2, 0.3],
      [0.1, 0.2, 0.1, 3.0, 0.2, 0.2],
      [0.1, 0.1, 0.1, 0.5, 0.1, 0.1],
    ],
    rToQ: [
      [0.1, 0.2, 0.1, 0.1],
      [0.2, 0.3, 0.3, 0.1],
      [0.2, 0.2, 0.2, 0.1],
      [0.5, 1.0, 3.0, 0.3], // car
      [0.3, 0.3, 0.5, 0.2],
      [0.2, 0.3, 0.3, 0.1],
    ],
    answer: "1",
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode_visual: { label: "视觉编码", color: "bg-blue-100 text-blue-700" },
    encode_text: { label: "文本编码", color: "bg-indigo-100 text-indigo-700" },
    cross_attn_q2r: { label: "Q→R 注意力", color: "bg-amber-100 text-amber-700" },
    cross_attn_r2q: { label: "R→Q 注意力", color: "bg-orange-100 text-orange-700" },
    fusion: { label: "多模态融合", color: "bg-violet-100 text-violet-700" },
    answer_prob: { label: "答案概率", color: "bg-pink-100 text-pink-700" },
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

function VQAVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10062);

  return (
    <ConfigurableVisualizer<VQAInput, Record<string, never>>
      config={{
        defaultInput: { scene: "kitchen" },
        algorithm: (input) => {
          const key = String(input.scene) as keyof typeof SCENES;
          const s = SCENES[key] ?? SCENES.kitchen;
          return generateVQASteps(s);
        },
        inputTypes: [{ type: "string", key: "scene", label: "场景" }],
        inputFields: [
          {
            type: "string",
            key: "scene",
            label: "场景（kitchen / street）",
            placeholder: "kitchen",
          },
        ],
        testCases: [
          { label: "🍳 厨房（冰箱什么颜色）", value: { scene: "kitchen" } },
          { label: "🏙️ 街景（多少辆车）", value: { scene: "street" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const scene = variables?.scene as VQAScene | undefined;
          const qToR = variables?.qToR as number[][] | undefined;
          const probs = variables?.probs as number[] | undefined;
          const finalAnswer = variables?.finalAnswer as string | undefined;

          if (!scene) return null;

          const showQ2R = ["cross_attn_q2r", "cross_attn_r2q", "fusion", "answer_prob", "complete"].includes(phase);
          const showAnswer = ["answer_prob", "complete"].includes(phase);

          // 聚合所有 Q 位置对区域的平均注意力，用于高亮
          const regionAttention = new Array(scene.regions.length).fill(0);
          if (qToR) {
            for (const row of qToR) {
              for (let i = 0; i < row.length; i++) regionAttention[i] += row[i];
            }
            const maxR = Math.max(...regionAttention, 0.01);
            for (let i = 0; i < regionAttention.length; i++) regionAttention[i] /= maxR;
          }

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "给 AI 看图 + 问问题 = ？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          你指着一张厨房照片问："<b>冰箱什么颜色？</b>"
                          要回答这个问题，AI 既要<b>读懂问题</b>（"冰箱""颜色"是关键词），
                          又要<b>在图里找到冰箱</b>，最后<b>识别它的颜色</b>。
                        </p>
                        <p className="text-slate-600">
                          这是一个<b>跨模态推理</b>任务——任何一边没"对齐"，就答不对。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "让两个模态\"对话\"",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          先分别理解两边：
                          视觉编码器把图切成<b>若干区域</b>（冰箱、灶台、水槽……），
                          文本编码器把问题变成 token 序列。
                        </p>
                        <p>
                          然后关键一步：让问题里的 token <b>去"查问"</b>图的每个区域——
                          "冰箱" 这个词应该<b>指向</b>图里的冰箱位置；"颜色" 应该<b>连接</b>对应区域的颜色属性。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——跨模态注意力做这件事",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          注意力的本质是：<b>Query 询问 Key，决定关注哪些 Value</b>。
                          在 VQA 里，让问题（Q）询问图像区域（K），得到<b>"问题每个词应该看图的哪里"</b>的权重矩阵。
                        </p>
                        <p>
                          同时反过来：让图像区域（Q）询问问题（K），得到<b>"图像每个区域应该关注哪些问题词"</b>。
                          两个方向的信息交互——<b>双向交叉注意力</b>——让模态真正"对话"起来。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "融合 + 分类 = 答案",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          把"看到的东西" <InlineMath math="v^*" /> 和"问的内容" <InlineMath math="q^*" /> 做逐元素乘
                          <InlineMath math="m = v^* \odot q^*" />——相当于让视觉和语言的强特征"同时存在"才激活。
                        </p>
                        <p>
                          最后一层 Softmax 在候选答案集合（white/red/blue/...）里选概率最高的那个。
                          <b>图、文字、推理——三合一</b>，就能回答 "white" 了。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    视觉问答（Visual Question Answering）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\alpha^{q\to r} = \text{softmax}(QK_R^\top/\sqrt{d}),\quad v^* = \alpha^{q\to r}\cdot V_R`} />
                <BlockMath math={String.raw`m = v^* \odot q^*,\quad P(a|I,Q) = \text{softmax}(W\cdot m)`} />
              </div>

              {/* 图像 + 问题 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>{scene.emoji}</span>
                    <span>图像：{scene.label}</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {scene.regions.map((r, i) => {
                      const attn = regionAttention[i] ?? 0;
                      return (
                        <div
                          key={i}
                          className="relative rounded-md border aspect-square flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: r.color,
                            borderColor: showQ2R && attn > 0.3 ? "#f59e0b" : "#e5e7eb",
                            borderWidth: showQ2R && attn > 0.3 ? "2px" : "1px",
                          }}
                        >
                          {showQ2R && (
                            <div
                              className="absolute inset-0 rounded-md bg-yellow-400"
                              style={{ opacity: attn * 0.5 }}
                            />
                          )}
                          <div className="relative z-10 text-center">
                            <div className="text-lg">{r.emoji}</div>
                            <div className="text-[10px] text-gray-700 font-semibold">
                              {r.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">问题 Q</h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {scene.question.map((tok, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-xs font-mono bg-indigo-50 text-indigo-800 border border-indigo-200"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>

                  {/* 答案候选 */}
                  {showAnswer && probs && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">
                        候选答案概率 P(a|I, Q)
                      </h5>
                      <div className="space-y-1.5">
                        {scene.candidates.map((c, i) => {
                          const p = probs[i] ?? 0;
                          const isBest = c.label === finalAnswer;
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span
                                className={`w-16 font-mono ${
                                  isBest ? "font-bold text-emerald-700" : "text-gray-700"
                                }`}
                              >
                                {c.label}
                              </span>
                              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isBest ? "bg-emerald-500" : "bg-gray-400"
                                  }`}
                                  style={{ width: `${p * 100}%` }}
                                />
                              </div>
                              <span
                                className={`w-10 text-right font-mono ${
                                  isBest ? "font-bold text-emerald-700" : "text-gray-600"
                                }`}
                              >
                                {(p * 100).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {finalAnswer && phase === "complete" && (
                        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-300 rounded-md text-center">
                          <span className="text-xs text-emerald-700">最终答案：</span>
                          <span className="text-lg font-bold text-emerald-800 ml-2">
                            {finalAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Q->R 注意力热力图 */}
              {showQ2R && qToR && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    跨模态注意力 Q → R（问题 token 对图像区域）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          <td className="w-20"></td>
                          {scene.regions.map((r, j) => (
                            <td key={j} className="w-16 text-center text-gray-500 pb-1 text-[10px]">
                              {r.name}
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {qToR.map((row, i) => (
                          <tr key={i}>
                            <td className="pr-2 text-gray-600 font-mono text-right text-[11px]">
                              {scene.question[i]}
                            </td>
                            {row.map((v, j) => (
                              <td
                                key={j}
                                className="w-16 h-8 text-center font-mono border border-white/60 rounded"
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
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入 I+Q" },
                    { id: "encode_visual", label: "② 视觉编码" },
                    { id: "encode_text", label: "③ 文本编码" },
                    { id: "cross_attn_q2r", label: "④ 交叉注意力" },
                    { id: "fusion", label: "⑤ 多模态融合" },
                    { id: "answer_prob", label: "⑥ 分类器" },
                    { id: "complete", label: "⑦ 答案" },
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

export default VQAVisualizer;
