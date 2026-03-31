import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateKVCacheSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10023;

interface KVCacheInput extends ProblemInput {
  promptLen: number;
  genSteps: number;
  dHead: number;
}

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "--";
}

function KVCacheVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<KVCacheInput, Record<string, never>>
      config={{
        defaultInput: { promptLen: 4, genSteps: 4, dHead: 4 },

        algorithm: (input) => {
          const promptLen = Math.max(2, Math.min(6, input.promptLen ?? 4));
          const genSteps = Math.max(1, Math.min(5, input.genSteps ?? 4));
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 4));
          return generateKVCacheSteps(promptLen, genSteps, dHead);
        },

        inputTypes: [
          { type: "number", key: "promptLen", label: "Prompt 长度" },
          { type: "number", key: "genSteps", label: "生成步数" },
          { type: "number", key: "dHead", label: "头维度" },
        ],
        inputFields: [
          { type: "number", key: "promptLen", label: "Prompt 长度", placeholder: "4" },
          { type: "number", key: "genSteps", label: "生成步数", placeholder: "4" },
          { type: "number", key: "dHead", label: "头维度 d_head", placeholder: "4" },
        ],
        testCases: [
          { label: "默认（4+4）", value: { promptLen: 4, genSteps: 4, dHead: 4 } },
          { label: "短 Prompt（2+4）", value: { promptLen: 2, genSteps: 4, dHead: 4 } },
          { label: "长 Prompt（6+3）", value: { promptLen: 6, genSteps: 3, dHead: 4 } },
          { label: "多生成步骤（3+5）", value: { promptLen: 3, genSteps: 5, dHead: 4 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const promptTokens = variables?.promptTokens as string[] | undefined;
          const allTokens = variables?.allTokens as string[] | undefined;
          const kvCache = variables?.kvCache as { k: number[]; v: number[] }[] | undefined;
          const cacheSize = (variables?.cacheSize as number) ?? 0;
          const withCacheFlops = variables?.withCacheFlops as number | undefined;
          const withoutCacheFlops = variables?.withoutCacheFlops as number | undefined;
          const speedup = variables?.speedup as number | undefined;
          const generationSteps = variables?.generationSteps as Array<{ tokenIdx: number; newToken: string; cacheSize: number; computationFlops: number }> | undefined;
          const savingRatio = variables?.savingRatio as number | undefined;
          const promptLen = (variables?.promptLen as number) ?? 4;
          const genSteps = (variables?.genSteps as number) ?? 4;
          const dHead = (variables?.dHead as number) ?? 4;

          const isGenPhase = phase.startsWith("gen_step_");
          const currentGenStep = isGenPhase ? parseInt(phase.split("_")[2]) : 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">KV 缓存优化</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  prompt_len={promptLen} · gen_steps={genSteps} · d_head={dHead}
                </p>
              </div>

              {/* Two-phase explanation */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                <h4 className="text-sm font-semibold text-purple-800 mb-3">KV 缓存的两个阶段</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`rounded p-3 border ${phase === "prefill" ? "bg-white border-purple-400 ring-1 ring-purple-400" : "bg-white border-gray-200"}`}>
                    <div className="font-semibold text-purple-700 mb-1">① Prefill 预填充</div>
                    <div className="text-gray-600">一次性处理所有 Prompt token</div>
                    <div className="text-gray-600">计算并缓存所有 K/V</div>
                    <div className="font-mono text-red-500 mt-1">O(N²) — 只做一次</div>
                    {phase === "prefill" && <div className="text-purple-600 font-medium mt-1">← 当前阶段</div>}
                  </div>
                  <div className={`rounded p-3 border ${isGenPhase ? "bg-white border-purple-400 ring-1 ring-purple-400" : "bg-white border-gray-200"}`}>
                    <div className="font-semibold text-teal-700 mb-1">② Generation 生成</div>
                    <div className="text-gray-600">每步只计算新 token 的 K/V</div>
                    <div className="text-gray-600">与缓存做注意力（1对N）</div>
                    <div className="font-mono text-green-500 mt-1">O(N) per step — 很快</div>
                    {isGenPhase && <div className="text-teal-600 font-medium mt-1">← 当前阶段（步骤{currentGenStep}）</div>}
                  </div>
                </div>
              </div>

              {/* Token visualization */}
              {promptTokens && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Token 序列（实时更新）</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Prompt tokens */}
                    {promptTokens.map((tok, i) => (
                      <div key={`p-${i}`} className="flex flex-col items-center gap-1">
                        <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm font-mono border border-blue-300">
                          {tok}
                        </div>
                        <div className="text-xs text-blue-600">P{i}</div>
                      </div>
                    ))}
                    {/* Generated tokens */}
                    {allTokens && allTokens.slice(promptLen).map((tok, i) => (
                      <div key={`g-${i}`} className="flex flex-col items-center gap-1">
                        <div className={`px-3 py-2 rounded text-sm font-mono border ${i === currentGenStep - 1 ? "bg-emerald-200 text-emerald-900 border-emerald-400 ring-2 ring-emerald-400" : "bg-teal-100 text-teal-800 border-teal-300"}`}>
                          {tok}
                        </div>
                        <div className="text-xs text-teal-600">G{i}</div>
                      </div>
                    ))}
                    {isGenPhase && allTokens && allTokens.length < promptLen + genSteps && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="px-3 py-2 bg-gray-100 text-gray-400 rounded text-sm font-mono border border-dashed border-gray-300">
                          ?
                        </div>
                        <div className="text-xs text-gray-400">next</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KV Cache visualization */}
              {kvCache && kvCache.length > 0 && (
                <div className="bg-teal-50 rounded-lg border border-teal-200 p-4">
                  <h4 className="text-sm font-semibold text-teal-800 mb-3">
                    KV 缓存状态（{cacheSize} 个 token）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse w-full min-w-max">
                      <thead>
                        <tr className="bg-teal-100">
                          <th className="p-2 border border-teal-200 text-left">位置</th>
                          <th className="p-2 border border-teal-200 text-left">Token</th>
                          <th className="p-2 border border-teal-200">类型</th>
                          <th className="p-2 border border-teal-200">K（前4维）</th>
                          <th className="p-2 border border-teal-200">V（前4维）</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kvCache.map((entry, idx) => {
                          const isPrompt = idx < promptLen;
                          const isLatest = isGenPhase && idx === cacheSize - 1;
                          return (
                            <tr key={idx} className={`border-t border-teal-100 ${isLatest ? "bg-emerald-50" : ""}`}>
                              <td className="p-2 border border-teal-200 font-mono">{idx}</td>
                              <td className="p-2 border border-teal-200 font-mono">
                                {allTokens ? (allTokens[idx] ?? `tok${idx}`) : `tok${idx}`}
                                {isLatest && <span className="ml-1 text-emerald-600 font-medium">← 新增</span>}
                              </td>
                              <td className="p-2 border border-teal-200 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${isPrompt ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}`}>
                                  {isPrompt ? "Prompt" : "Gen"}
                                </span>
                              </td>
                              <td className="p-2 border border-teal-200 font-mono text-xs text-center">
                                [{entry.k.map((v) => fmt(v, 2)).join(", ")}]
                              </td>
                              <td className="p-2 border border-teal-200 font-mono text-xs text-center">
                                [{entry.v.map((v) => fmt(v, 2)).join(", ")}]
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Computation comparison */}
              {withCacheFlops !== undefined && withoutCacheFlops !== undefined && speedup !== undefined && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-3">
                    当前步骤计算量对比（步骤 {currentGenStep}，序列长度 {cacheSize}）
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded p-2 border border-red-200">
                      <div className="font-semibold text-red-700 mb-1">无缓存（全量重计算）</div>
                      <div className="font-mono text-red-600">O(N²) = {withoutCacheFlops} flops</div>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <div className="font-semibold text-green-700 mb-1">有缓存（仅新 token）</div>
                      <div className="font-mono text-green-600">O(N) = {withCacheFlops} flops</div>
                      <div className="font-medium text-green-700 mt-1">加速 {fmt(speedup, 1)}×</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation history */}
              {generationSteps && generationSteps.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">生成历史</h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 border border-gray-200">步骤</th>
                          <th className="p-2 border border-gray-200">生成 token</th>
                          <th className="p-2 border border-gray-200">缓存大小</th>
                          <th className="p-2 border border-gray-200">计算量（有缓存）</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generationSteps.map((s) => (
                          <tr key={s.tokenIdx} className="border-t border-gray-100">
                            <td className="p-2 border border-gray-200 text-center">{s.tokenIdx - promptLen + 1}</td>
                            <td className="p-2 border border-gray-200 font-mono text-center">{s.newToken}</td>
                            <td className="p-2 border border-gray-200 text-center">{s.cacheSize}</td>
                            <td className="p-2 border border-gray-200 text-center font-mono text-green-600">{s.computationFlops}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              {savingRatio !== undefined && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    总结：KV 缓存节省 {Math.round(savingRatio * 100)}% 计算量
                  </h4>
                  <div className="text-xs text-emerald-700 space-y-1">
                    <div>代价：内存占用 = num_layers × num_heads × seq_len × d_head × 2 × dtype_size</div>
                    <div>例如：LLaMA-7B，32层，32头，4096维，fp16 → 1K tokens 需要约 256MB</div>
                  </div>
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">KV 缓存核心原理</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">生成第 t 步时，注意力计算</div>
                    <BlockMath math="\text{Attn}(q_t, K_{1:t}, V_{1:t}) = \text{softmax}\!\left(\frac{q_t K_{1:t}^T}{\sqrt{d_k}}\right) V_{1:t}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">KV 缓存更新（追加新 token）</div>
                    <BlockMath math="K_{1:t} = \text{concat}(K_{1:t-1},\; k_t), \quad V_{1:t} = \text{concat}(V_{1:t-1},\; v_t)" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">复杂度对比</div>
                    <BlockMath math="\text{无缓存}: O(t^2 d) \quad \text{有缓存}: O(t \cdot d)" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default KVCacheVisualizer;
