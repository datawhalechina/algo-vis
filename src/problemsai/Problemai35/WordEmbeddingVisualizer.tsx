import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateWordEmbeddingSteps,
  DEFAULT_VOCAB,
  WordEmbeddingWord,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface WordEmbeddingInput extends ProblemInput {
  queryWord: string;
}

function getHeatColor(val: number): string {
  const w = Math.max(0, Math.min(val, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 70%, ${88 - w * 30}%)`;
}

function SimilarityBar({ word, similarity, rank }: { word: string; similarity: number; rank: number }) {
  const pct = Math.round(similarity * 100);
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-mono w-4 text-gray-400`}>#{rank}</span>
      <span className="text-sm font-medium text-gray-700 w-16">{word}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: getHeatColor(similarity) }}
        >
          <span className="text-[10px] font-mono" style={{ color: similarity > 0.5 ? "#fff" : "#374151" }}>
            {similarity.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}

function VectorDisplay({ word, vector, highlight }: { word: string; vector: number[]; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm font-semibold ${highlight ? "text-blue-700" : "text-gray-700"}`}>{word}</span>
        <span className="text-xs text-gray-400 font-mono">dim={vector.length}</span>
      </div>
      <div className="flex gap-1">
        {vector.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-12 rounded flex items-end justify-center pb-1"
              style={{ backgroundColor: getHeatColor(v) }}
            >
              <span className="text-[9px] font-mono" style={{ color: v > 0.5 ? "#fff" : "#374151" }}>
                {v.toFixed(2)}
              </span>
            </div>
            <span className="text-[9px] text-gray-400">d{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordEmbeddingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10035);

  return (
    <ConfigurableVisualizer<WordEmbeddingInput, Record<string, never>>
      config={{
        defaultInput: { queryWord: "king" },

        algorithm: (input) => {
          const q = String(input.queryWord || "king").trim().toLowerCase();
          return generateWordEmbeddingSteps(DEFAULT_VOCAB, q);
        },

        inputTypes: [
          { type: "string", key: "queryWord", label: "查询词语" },
        ],
        inputFields: [
          {
            type: "string",
            key: "queryWord",
            label: "查询词语（从词汇表中选择）",
            placeholder: "king",
          },
        ],

        testCases: [
          { label: "king（王权语义）", value: { queryWord: "king" } },
          { label: "cat（动物语义）", value: { queryWord: "cat" } },
          { label: "apple（食物语义）", value: { queryWord: "apple" } },
          { label: "woman（性别语义）", value: { queryWord: "woman" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const vocab = (variables?.vocab as unknown as WordEmbeddingWord[]) ?? DEFAULT_VOCAB;
          const queryWord = (variables?.queryWord as string) ?? "king";
          const target = variables?.target as unknown as WordEmbeddingWord | undefined;
          const similarities = (variables?.similarities as unknown as Array<{ word: string; similarity: number }>) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            lookup: { label: "词语查找", color: "bg-blue-100 text-blue-700" },
            vector: { label: "词向量", color: "bg-violet-100 text-violet-700" },
            similarity: { label: "相似度计算", color: "bg-amber-100 text-amber-700" },
            complete: { label: "计算完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题与公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">词嵌入（Word Embedding）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\text{embed}(w) = E \cdot \text{onehot}(w) \in \mathbb{R}^d" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 词汇表与向量 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  词汇表嵌入矩阵 <InlineMath math="E \in \mathbb{R}^{|V| \times d}" />
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {vocab.map((w) => (
                    <VectorDisplay
                      key={w.word}
                      word={w.word}
                      vector={w.vector}
                      highlight={w.word === queryWord && ["lookup", "vector", "similarity", "complete"].includes(phase)}
                    />
                  ))}
                </div>
              </div>

              {/* 目标词向量 */}
              {target && ["vector", "similarity", "complete"].includes(phase) && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    查询词 "{queryWord}" 的词向量
                  </h4>
                  <div className="mb-2">
                    <BlockMath math={`v_{\\text{${queryWord}}} = [${target.vector.map((x) => x.toFixed(2)).join(",\\ ")}]`} />
                  </div>
                  <p className="text-xs text-blue-600">
                    向量空间中，语义相似的词语距离更近（余弦相似度更高）
                  </p>
                </div>
              )}

              {/* 相似度结果 */}
              {similarities.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    余弦相似度 <InlineMath math="\cos(v_a, v_b) = \frac{v_a \cdot v_b}{\|v_a\|\|v_b\|}" />
                  </h4>
                  <div className="space-y-2">
                    {similarities
                      .slice()
                      .sort((a, b) => b.similarity - a.similarity)
                      .map((s, idx) => (
                        <SimilarityBar
                          key={s.word}
                          word={s.word}
                          similarity={s.similarity}
                          rank={idx + 1}
                        />
                      ))}
                  </div>
                  {currentIdx !== undefined && currentIdx < similarities.length - 1 && (
                    <p className="text-xs text-gray-400 mt-2">
                      正在计算第 {currentIdx + 1}/{vocab.length - 1} 个词语...
                    </p>
                  )}
                </div>
              )}

              {/* 类比关系说明 */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">词向量类比关系</h4>
                  <div className="text-sm text-emerald-700">
                    <BlockMath math="\vec{king} - \vec{man} + \vec{woman} \approx \vec{queen}" />
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">
                    词嵌入能捕获语义关系：性别、王权等概念在向量空间中对应线性方向
                  </p>
                </div>
              )}

              {/* 计算流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化嵌入矩阵" },
                    { id: "lookup", label: "② 查找词语索引" },
                    { id: "vector", label: "③ 获取词向量" },
                    { id: "similarity", label: "④ 计算余弦相似度" },
                    { id: "complete", label: "⑤ 输出相似词" },
                  ].map((step, idx, arr) => {
                    const phaseOrder = ["init", "lookup", "vector", "similarity", "complete"];
                    const curIdx = phaseOrder.indexOf(phase);
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = curIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          step.id === phase ? "bg-blue-600 text-white shadow-sm" :
                          isDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
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

export default WordEmbeddingVisualizer;
