import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
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
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode_image: { label: "图像编码", color: "bg-pink-100 text-pink-700" },
    encode_text: { label: "文本编码", color: "bg-indigo-100 text-indigo-700" },
    similarity: { label: "相似度矩阵", color: "bg-blue-100 text-blue-700" },
    softmax_i2t: { label: "Softmax (I→T)", color: "bg-amber-100 text-amber-700" },
    softmax_t2i: { label: "Softmax (T→I)", color: "bg-orange-100 text-orange-700" },
    loss: { label: "对比损失", color: "bg-violet-100 text-violet-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
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
        inputTypes: [
          { type: "number", key: "temperature", label: "温度 τ" },
        ],
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

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    CLIP 对比学习
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\mathcal{L} = -\frac{1}{2N}\sum_{i=1}^{N}\left[\log \frac{e^{s_{ii}/\tau}}{\sum_{j}e^{s_{ij}/\tau}} + \log \frac{e^{s_{ii}/\tau}}{\sum_{j}e^{s_{ji}/\tau}}\right]`} />
                <p className="text-xs text-gray-500 mt-1">
                  其中 <InlineMath math="s_{ij} = I_i \cdot T_j" />，τ={tau}
                </p>
              </div>

              {/* 图像与文本 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    图像 <InlineMath math="I_i = f_{img}(\text{image})" />
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                          phase === "encode_image" && currentIdx === i
                            ? "ring-2 ring-pink-400 bg-pink-50"
                            : imgEmbs && imgEmbs[i]
                            ? "bg-pink-50/60 border-pink-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="text-3xl">{img.emoji}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          I<sub>{i}</sub>
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                          {imgEmbs && imgEmbs[i]
                            ? imgEmbs[i].map((v) => v.toFixed(2)).join(",")
                            : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    文本 <InlineMath math="T_j = f_{txt}(\text{text})" />
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {texts.map((txt, j) => (
                      <div
                        key={j}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                          phase === "encode_text" && currentIdx === j
                            ? "ring-2 ring-indigo-400 bg-indigo-50"
                            : txtEmbs && txtEmbs[j]
                            ? "bg-indigo-50/60 border-indigo-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span className="font-mono text-gray-500">T<sub>{j}</sub></span>
                        <span className="flex-1 text-gray-800">"{txt.label}"</span>
                        <span className="text-[9px] text-gray-500 font-mono">
                          {txtEmbs && txtEmbs[j]
                            ? txtEmbs[j].map((v) => v.toFixed(2)).join(",")
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 相似度矩阵 */}
              {showSim && sim && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    相似度矩阵 <InlineMath math="S_{ij} = (I_i \cdot T_j) / \tau" />
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      对角线=正样本，非对角线=负样本
                    </span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          <td className="w-10"></td>
                          {texts.map((_, j) => (
                            <td key={j} className="w-16 text-center text-gray-500 pb-1 truncate">
                              T<sub>{j}</sub>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sim.map((row, i) => (
                          <tr key={i}>
                            <td className="pr-2 text-gray-500 font-mono text-right">
                              I<sub>{i}</sub>
                            </td>
                            {row.map((v, j) => {
                              const isDiag = i === j;
                              return (
                                <td
                                  key={j}
                                  className={`w-16 h-10 text-center font-mono border rounded ${
                                    isDiag
                                      ? "ring-2 ring-emerald-500 font-bold"
                                      : "border-white/60"
                                  }`}
                                  style={{ backgroundColor: getHeatColor(v, maxSim) }}
                                  title={`${images[i].label} ↔ "${texts[j].label}" = ${v.toFixed(3)}`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showI2T && probsI2T && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        <span className="text-pink-700">I → T</span>：
                        <InlineMath math="p(T_j|I_i) = \frac{e^{s_{ij}/\tau}}{\sum_k e^{s_{ik}/\tau}}" />
                      </h4>
                      <table className="text-xs border-collapse">
                        <tbody>
                          {probsI2T.map((row, i) => (
                            <tr key={i}>
                              <td className="pr-2 text-gray-500 font-mono">I<sub>{i}</sub></td>
                              {row.map((v, j) => (
                                <td
                                  key={j}
                                  className={`w-14 h-9 text-center font-mono border rounded ${
                                    i === j ? "ring-2 ring-emerald-500 font-bold" : "border-white/60"
                                  }`}
                                  style={{ backgroundColor: getHeatColor(v, 1) }}
                                >
                                  {v.toFixed(2)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {showT2I && probsT2I && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        <span className="text-indigo-700">T → I</span>：
                        <InlineMath math="p(I_i|T_j) = \frac{e^{s_{ij}/\tau}}{\sum_k e^{s_{kj}/\tau}}" />
                      </h4>
                      <table className="text-xs border-collapse">
                        <tbody>
                          {probsT2I.map((row, i) => (
                            <tr key={i}>
                              <td className="pr-2 text-gray-500 font-mono">I<sub>{i}</sub></td>
                              {row.map((v, j) => (
                                <td
                                  key={j}
                                  className={`w-14 h-9 text-center font-mono border rounded ${
                                    i === j ? "ring-2 ring-emerald-500 font-bold" : "border-white/60"
                                  }`}
                                  style={{ backgroundColor: getHeatColor(v, 1) }}
                                >
                                  {v.toFixed(2)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 对比损失 */}
              {showLoss && loss !== undefined && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">对比损失</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-pink-700 mb-1">
                        <InlineMath math="L_{i\to t}" />
                      </div>
                      <div className="text-lg font-bold text-pink-800">{lossI2T}</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-indigo-700 mb-1">
                        <InlineMath math="L_{t\to i}" />
                      </div>
                      <div className="text-lg font-bold text-indigo-800">{lossT2I}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-emerald-700 mb-1">
                        <InlineMath math="\mathcal{L} = (L_{i\to t} + L_{t\to i})/2" />
                      </div>
                      <div className="text-lg font-bold text-emerald-800">{loss}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入对" },
                    { id: "encode_image", label: "② 图像编码" },
                    { id: "encode_text", label: "③ 文本编码" },
                    { id: "similarity", label: "④ 相似度矩阵" },
                    { id: "softmax_i2t", label: "⑤ Softmax" },
                    { id: "loss", label: "⑥ 对比损失" },
                    { id: "complete", label: "⑦ 完成" },
                  ].map((step, idx, arr) => {
                    const isDone = arr.findIndex((s) => s.id === phase) >= idx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
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
