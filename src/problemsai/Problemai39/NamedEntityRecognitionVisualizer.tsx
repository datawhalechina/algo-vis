import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateNERSteps,
  DEFAULT_NER_SAMPLES,
  NERToken,
  EntityType,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface NERInput extends ProblemInput {
  sampleIdx: number;
}

const ENTITY_COLORS: Record<EntityType | string, { bg: string; text: string; border: string }> = {
  PERSON:       { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  LOCATION:     { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  ORGANIZATION: { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  O:            { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
};

const BIO_COLORS: Record<string, string> = {
  "B-PER": "#1d4ed8",
  "I-PER": "#60a5fa",
  "B-LOC": "#065f46",
  "I-LOC": "#34d399",
  "B-ORG": "#5b21b6",
  "I-ORG": "#a78bfa",
  "O": "#94a3b8",
};

function NamedEntityRecognitionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10039);

  return (
    <ConfigurableVisualizer<NERInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: (input) => {
          const idx = typeof input.sampleIdx === "number" ? input.sampleIdx : parseInt(String(input.sampleIdx)) || 0;
          const sample = DEFAULT_NER_SAMPLES[Math.max(0, Math.min(idx, DEFAULT_NER_SAMPLES.length - 1))];
          return generateNERSteps(sample);
        },

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例索引（0-1）", min: 0, max: 1 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例索引（0=苹果公司, 1=马云）", placeholder: "0" }],

        testCases: [
          { label: "苹果公司示例", value: { sampleIdx: 0 } },
          { label: "马云示例", value: { sampleIdx: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const text = variables?.text as string | undefined;
          const tokens = (variables?.tokens as unknown as NERToken[]) ?? [];
          const taggedTokens = (variables?.taggedTokens as unknown as NERToken[]) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;
          const entities = (variables?.entities as unknown as Array<{ text: string; type: EntityType; tokens: string[] }>) ?? [];

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            tagging: { label: "序列标注", color: "bg-blue-100 text-blue-700" },
            merge: { label: "实体合并", color: "bg-violet-100 text-violet-700" },
            complete: { label: "识别完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">命名实体识别（NER）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      BIO 标注体系：<InlineMath math="\text{B-TYPE} \rightarrow \text{I-TYPE}^* \rightarrow \text{O}" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 输入文本 */}
              {text && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">输入文本</h4>
                  <p className="text-base bg-gray-50 rounded p-3 border border-gray-100 text-gray-900">"{text}"</p>
                </div>
              )}

              {/* BIO标注过程 */}
              {(taggedTokens.length > 0 || phase === "init") && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    BIO 序列标注过程（共 {tokens.length} 个词）
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {tokens.map((t, i) => {
                      const isTagged = taggedTokens.some((tt) => tt.word === t.word);
                      const isCurrent = i === currentIdx;
                      const colors = ENTITY_COLORS[t.entityType] ?? ENTITY_COLORS.O;
                      return (
                        <div key={i} className={`flex flex-col items-center gap-1 transition-all ${isCurrent ? "scale-110" : ""}`}>
                          <div
                            className={`px-3 py-2 rounded-lg border-2 font-medium text-sm ${
                              isCurrent ? "shadow-lg ring-2 ring-offset-1 ring-blue-400" : ""
                            } ${isTagged ? "" : "opacity-40"}`}
                            style={{
                              backgroundColor: isTagged ? colors.bg : "#f8fafc",
                              borderColor: isTagged ? colors.border : "#e2e8f0",
                              color: isTagged ? colors.text : "#94a3b8",
                            }}
                          >
                            {t.word}
                          </div>
                          <span
                            className="text-[10px] font-mono font-semibold px-1 rounded"
                            style={{ color: BIO_COLORS[t.bioTag] ?? "#94a3b8" }}
                          >
                            {isTagged ? t.bioTag : "..."}
                          </span>
                          {isTagged && (
                            <span className="text-[9px] text-gray-400">{(t.confidence * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BIO图例 */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">BIO 标签说明</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(BIO_COLORS).filter(([k]) => k !== "O").map(([tag, color]) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded font-mono font-semibold"
                      style={{ backgroundColor: color + "20", color }}>
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs px-2 py-1 rounded font-mono font-semibold text-gray-400 bg-gray-100">O=非实体</span>
                </div>
              </div>

              {/* 识别出的实体 */}
              {entities.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">识别出的命名实体</h4>
                  <div className="flex flex-wrap gap-3">
                    {entities.map((e, i) => {
                      const colors = ENTITY_COLORS[e.type] ?? ENTITY_COLORS.O;
                      return (
                        <div key={i} className="flex flex-col items-center rounded-lg border-2 px-4 py-2"
                          style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                          <span className="text-sm font-semibold" style={{ color: colors.text }}>{e.text}</span>
                          <span className="text-[11px] font-mono mt-0.5" style={{ color: colors.text }}>{e.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 分词" },
                    { id: "tagging", label: "② BIO标注" },
                    { id: "merge", label: "③ 合并实体" },
                    { id: "complete", label: "④ 输出实体" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "tagging", "merge", "complete"];
                    const isDone = order.indexOf(phase) >= order.indexOf(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium ${
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

export default NamedEntityRecognitionVisualizer;
