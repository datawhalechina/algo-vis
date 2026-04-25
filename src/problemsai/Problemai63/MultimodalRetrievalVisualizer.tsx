import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import {
  generateRetrievalSteps,
  RetrievalItem,
  RetrievalQuery,
} from "./algorithm";

interface RetrievalInput extends ProblemInput {
  queryKind: string;
  topK: number;
}

const IMAGE_DB: RetrievalItem[] = [
  { id: "1", emoji: "🚗", label: "red car", embedding: [0.9, 0.1, 0.2, 0.8] },
  { id: "2", emoji: "🚕", label: "yellow taxi", embedding: [0.85, 0.2, 0.1, 0.2] },
  { id: "3", emoji: "🐕", label: "brown dog", embedding: [0.1, 0.9, 0.8, 0.1] },
  { id: "4", emoji: "🚙", label: "blue suv", embedding: [0.88, 0.15, 0.3, 0.1] },
  { id: "5", emoji: "🐈", label: "gray cat", embedding: [0.15, 0.85, 0.7, 0.1] },
  { id: "6", emoji: "🌻", label: "sunflower", embedding: [0.1, 0.3, 0.2, 0.9] },
];

const TEXT_DB: RetrievalItem[] = [
  { id: "1", emoji: "📝", label: "a fast sports car", embedding: [0.92, 0.1, 0.2, 0.3] },
  { id: "2", emoji: "📝", label: "a sleeping puppy", embedding: [0.1, 0.9, 0.85, 0.1] },
  { id: "3", emoji: "📝", label: "a beautiful flower", embedding: [0.15, 0.2, 0.3, 0.92] },
  { id: "4", emoji: "📝", label: "a running horse", embedding: [0.3, 0.88, 0.4, 0.2] },
  { id: "5", emoji: "📝", label: "a modern building", embedding: [0.4, 0.2, 0.15, 0.5] },
  { id: "6", emoji: "📝", label: "a red truck", embedding: [0.87, 0.15, 0.25, 0.6] },
];

const TEXT_QUERY: RetrievalQuery = {
  kind: "text",
  label: "a red vehicle",
  embedding: [0.9, 0.1, 0.15, 0.6],
};

const IMAGE_QUERY: RetrievalQuery = {
  kind: "image",
  label: "🌻 sunflower picture",
  embedding: [0.1, 0.25, 0.2, 0.92],
};

function heatColor(v: number, min: number, max: number): string {
  const w = Math.max(0, Math.min((v - min) / Math.max(max - min, 0.01), 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 75%, ${90 - w * 30}%)`;
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode_query: { label: "查询编码", color: "bg-indigo-100 text-indigo-700" },
    encode_db: { label: "数据库编码", color: "bg-blue-100 text-blue-700" },
    similarity: { label: "相似度计算", color: "bg-amber-100 text-amber-700" },
    rank: { label: "排序", color: "bg-violet-100 text-violet-700" },
    complete: { label: "Top-K 返回", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function MultimodalRetrievalVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10063);

  return (
    <ConfigurableVisualizer<RetrievalInput, Record<string, never>>
      config={{
        defaultInput: { queryKind: "text", topK: 3 },
        algorithm: (input) => {
          const kind = String(input.queryKind);
          const topK =
            typeof input.topK === "number"
              ? input.topK
              : parseInt(String(input.topK)) || 3;
          const query = kind === "image" ? IMAGE_QUERY : TEXT_QUERY;
          const db = kind === "image" ? TEXT_DB : IMAGE_DB;
          return generateRetrievalSteps(query, db, topK);
        },
        inputTypes: [
          { type: "string", key: "queryKind", label: "查询类型" },
          { type: "number", key: "topK", label: "Top-K" },
        ],
        inputFields: [
          {
            type: "string",
            key: "queryKind",
            label: "查询类型（text / image）",
            placeholder: "text",
          },
          {
            type: "number",
            key: "topK",
            label: "Top-K",
            placeholder: "3",
          },
        ],
        testCases: [
          { label: "📝 文本检索图像 Top-3", value: { queryKind: "text", topK: 3 } },
          { label: "🌻 图像检索文本 Top-3", value: { queryKind: "image", topK: 3 } },
          { label: "文本检索 Top-5", value: { queryKind: "text", topK: 5 } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const query = variables?.query as unknown as RetrievalQuery | undefined;
          const database = (variables?.database as unknown as RetrievalItem[]) ?? [];
          const topK = (variables?.topK as number) ?? 3;
          const qEmb = variables?.qEmb as number[] | undefined;
          const dbEmbs = variables?.dbEmbs as number[][] | undefined;
          const sims = (variables?.sims as number[]) ?? [];
          const rankedIdx = (variables?.rankedIdx as number[]) ?? [];
          const topKIdx = (variables?.topKIdx as number[]) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;

          if (!query) return null;

          const showSims = ["similarity", "rank", "complete"].includes(phase);
          const showRank = ["rank", "complete"].includes(phase);
          const showTopK = phase === "complete";

          const minSim = sims.length ? Math.min(...sims) : 0;
          const maxSim = sims.length ? Math.max(...sims) : 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    多模态检索（Multimodal Retrieval）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\cos(q, e_i) = \frac{q \cdot e_i}{\|q\|\,\|e_i\|},\quad \text{Top-}K = \arg\text{top}_K \cos(q, e_i)`} />
              </div>

              {/* 查询 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  查询 Q（{query.kind === "text" ? "文本" : "图像"}）
                </h4>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {query.kind === "text" ? "📝" : "🌻"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 font-medium">
                      "{query.label}"
                    </div>
                    {qEmb && (
                      <div className="text-[10px] font-mono text-gray-500 mt-1">
                        q = [{qEmb.map((v) => v.toFixed(2)).join(", ")}]
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 数据库 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  数据库条目（{database.length}）
                </h4>
                <div className="space-y-1.5">
                  {database.map((item, i) => {
                    const sim = sims[i];
                    const rank = rankedIdx.indexOf(i);
                    const inTopK = topKIdx.includes(i);
                    const isCurrent = phase === "similarity" && currentIdx === i;

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                          showTopK && inTopK
                            ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-200"
                            : isCurrent
                            ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300"
                            : dbEmbs && dbEmbs[i]
                            ? "bg-blue-50/40 border-blue-100"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="w-8 font-mono text-gray-500">
                          e<sub>{i}</sub>
                        </span>
                        <span className="flex-1 text-gray-800">
                          "{item.label}"
                        </span>
                        {dbEmbs && dbEmbs[i] && (
                          <span className="hidden md:inline font-mono text-[10px] text-gray-400">
                            [{dbEmbs[i].map((v) => v.toFixed(2)).join(",")}]
                          </span>
                        )}
                        {showSims && sim !== undefined && (
                          <span
                            className="font-mono text-xs px-2 py-0.5 rounded font-semibold"
                            style={{ backgroundColor: heatColor(sim, minSim, maxSim) }}
                          >
                            cos={sim.toFixed(3)}
                          </span>
                        )}
                        {showRank && rank >= 0 && (
                          <span
                            className={`w-8 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              rank < topK
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            #{rank + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top-K 结果 */}
              {showTopK && topKIdx.length > 0 && (
                <div className="bg-white rounded-lg border border-emerald-300 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">
                    Top-{topK} 检索结果
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topKIdx.map((idx, rank) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-300"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px]">
                          {rank + 1}
                        </span>
                        <span className="text-xl">{database[idx].emoji}</span>
                        <span className="text-xs font-medium text-gray-800">
                          "{database[idx].label}"
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700">
                          {sims[idx].toFixed(3)}
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
                  {[
                    { id: "init", label: "① 输入查询" },
                    { id: "encode_query", label: "② 查询编码" },
                    { id: "encode_db", label: "③ 数据库编码" },
                    { id: "similarity", label: "④ 相似度" },
                    { id: "rank", label: "⑤ 排序" },
                    { id: "complete", label: "⑥ Top-K" },
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

export default MultimodalRetrievalVisualizer;
