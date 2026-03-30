import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateActorRolloutSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  "dual-role": { label: "双重角色", color: "bg-violet-100 text-violet-700" },
  "prompt-prep": { label: "输入准备", color: "bg-sky-100 text-sky-700" },
  autoregressive: { label: "自回归生成", color: "bg-amber-100 text-amber-700" },
  sampling: { label: "采样策略", color: "bg-pink-100 text-pink-700" },
  vllm: { label: "vLLM 加速", color: "bg-cyan-100 text-cyan-700" },
  "logprob-recompute": { label: "Log-prob 重计算", color: "bg-orange-100 text-orange-700" },
  output: { label: "输出结果", color: "bg-green-100 text-green-700" },
};

function ActorRolloutVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateActorRolloutSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "dual-role";
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["dual-role"];

          return (
            <div className="space-y-4">
              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Actor & Rollout — ActorRolloutRefWorker
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      vLLM 高速生成 + Actor 可微分 log_probs 计算
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* dual-role: 双重角色 */}
              {phase === "dual-role" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">ActorRolloutRefWorker 双重角色</h4>
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-gray-700 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md">
                      ActorRolloutRefWorker
                    </div>
                    <div className="text-gray-400 text-xs">共享模型权重</div>
                    <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                      <div className="border-2 border-amber-300 bg-amber-50 rounded-lg p-4 text-center">
                        <div className="text-sm font-bold text-amber-700 mb-1">Rollout</div>
                        <div className="text-xs text-amber-600">vLLM 高速生成</div>
                        <div className="text-[10px] text-gray-500 mt-2">生成 response tokens</div>
                      </div>
                      <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-sm font-bold text-blue-700 mb-1">Actor</div>
                        <div className="text-xs text-blue-600">可微分前向传播</div>
                        <div className="text-[10px] text-gray-500 mt-2">计算 log_probs 用于 PPO</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* prompt-prep: 输入准备 */}
              {phase === "prompt-prep" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">DataProto 输入</h4>
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                    <div className="text-xs font-mono text-sky-800 mb-3 font-bold">DataProto</div>
                    <div className="space-y-2">
                      {(
                        (variables?.dataProtoFields as string[]) ?? ["input_ids", "attention_mask"]
                      ).map((field: string) => (
                        <div key={field} className="flex items-center gap-3">
                          <span className="font-mono text-xs text-sky-700 bg-sky-100 px-2 py-1 rounded">
                            {field}
                          </span>
                          {field === "input_ids" && (
                            <div className="flex gap-1">
                              {([8, 42, 15, 7, 3] as number[]).map((t: number, i: number) => (
                                <span
                                  key={i}
                                  className="w-8 h-8 bg-sky-200 text-sky-800 rounded flex items-center justify-center text-xs font-mono font-bold"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {field === "attention_mask" && (
                            <div className="flex gap-1">
                              {[1, 1, 1, 1, 1].map((m: number, i: number) => (
                                <span
                                  key={i}
                                  className="w-8 h-8 bg-sky-100 text-sky-600 rounded flex items-center justify-center text-xs font-mono"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* autoregressive: 自回归生成 */}
              {phase === "autoregressive" && (() => {
                const promptTokens = (variables?.promptTokens as number[]) ?? [];
                const generatedTokens = (variables?.generatedTokens as number[]) ?? [];
                const logits = (variables?.logits as number[]) ?? [];
                const vocabSample = (variables?.vocabSample as string[]) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Token-by-Token 自回归生成</h4>

                    {/* Token sequence */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Prompt + Generated Tokens</div>
                      <div className="flex gap-1 flex-wrap items-center">
                        {promptTokens.map((t: number, i: number) => (
                          <span
                            key={`p-${i}`}
                            className="w-10 h-10 bg-sky-200 text-sky-800 rounded flex items-center justify-center text-xs font-mono font-bold"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="text-gray-300 mx-1">|</span>
                        {generatedTokens.map((t: number, i: number) => (
                          <span
                            key={`g-${i}`}
                            className={`w-10 h-10 rounded flex items-center justify-center text-xs font-mono font-bold transition-all ${
                              i === generatedTokens.length - 1
                                ? "bg-amber-400 text-white shadow-md scale-110"
                                : "bg-amber-200 text-amber-800"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                        <span className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">
                          ?
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1 text-[10px] text-gray-400">
                        <span className="text-sky-500">prompt</span>
                        <span className="ml-auto text-amber-500">generated (current: {variables?.currentToken as number})</span>
                      </div>
                    </div>

                    {/* Logits probability bars */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        当前位置 Softmax 概率分布
                      </div>
                      <div className="space-y-1.5">
                        {logits.map((prob: number, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
                              {vocabSample[i] ?? i}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  prob === Math.max(...logits)
                                    ? "bg-amber-500"
                                    : "bg-gray-400"
                                }`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-gray-600 w-10 text-right">
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* sampling: 采样策略 */}
              {phase === "sampling" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">采样策略</h4>
                  <div className="space-y-3">
                    {(
                      (variables?.strategies as unknown as Array<{ name: string; desc: string; formula?: string; example?: string }>) ?? []
                    ).map((s) => (
                      <div key={s.name} className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-pink-700">{s.name}</span>
                          {s.example && (
                            <span className="text-[10px] font-mono bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                              {s.example}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{s.desc}</p>
                        {s.formula && (
                          <div className="mt-2 bg-white rounded px-3 py-1.5 text-xs font-mono text-pink-800 border border-pink-100">
                            {s.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* vllm: vLLM 加速 */}
              {phase === "vllm" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">vLLM 加速引擎</h4>
                  <div className="space-y-4">
                    {/* KV-Cache 图示 */}
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <div className="text-sm font-bold text-cyan-700 mb-2">KV-Cache</div>
                      <div className="flex items-center gap-2 mb-3">
                        {["t1", "t2", "t3", "t4"].map((t, i) => (
                          <div key={t} className="flex flex-col items-center gap-1">
                            <span
                              className={`w-12 h-8 rounded flex items-center justify-center text-xs font-mono font-bold ${
                                i < 3 ? "bg-cyan-200 text-cyan-700" : "bg-cyan-500 text-white shadow-md"
                              }`}
                            >
                              {t}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {i < 3 ? "cached" : "compute"}
                            </span>
                          </div>
                        ))}
                        <span className="text-cyan-400 text-lg ml-1">...</span>
                      </div>
                      <p className="text-xs text-cyan-700">
                        生成第 t 个 token 时，只需计算 1 个位置的 K/V，前 t-1 个位置从缓存读取。
                      </p>
                    </div>

                    {/* Continuous Batching 图示 */}
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <div className="text-sm font-bold text-cyan-700 mb-2">Continuous Batching</div>
                      <div className="space-y-1.5 mb-3">
                        {[
                          { label: "Req A", len: 4, maxLen: 6, done: false },
                          { label: "Req B", len: 6, maxLen: 6, done: true },
                          { label: "Req C", len: 2, maxLen: 6, done: false },
                          { label: "Req D", len: 0, maxLen: 6, done: false },
                        ].map((req) => (
                          <div key={req.label} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-600 w-10">{req.label}</span>
                            <div className="flex-1 bg-gray-200 rounded h-5 overflow-hidden relative">
                              <div
                                className={`h-full rounded ${req.done ? "bg-green-400" : "bg-cyan-400"}`}
                                style={{ width: `${(req.len / req.maxLen) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {req.done ? "done" : `${req.len}/${req.maxLen}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-cyan-700">
                        Req B 完成后立即释放槽位，Req D 动态加入，无需等待最长序列。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* logprob-recompute: 两次前向传播 */}
              {phase === "logprob-recompute" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">两次前向传播 (Two-Pass)</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    vLLM 不保留计算图，因此需要 Actor 重新做一次前向传播来获得可微分的 log_probs。
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      (variables?.twoPass as unknown as Array<{ name: string; speed: string; grad: boolean; purpose: string }>) ?? []
                    ).map((p) => (
                      <div
                        key={p.name}
                        className={`rounded-lg p-4 border-2 ${
                          p.grad
                            ? "border-blue-300 bg-blue-50"
                            : "border-amber-300 bg-amber-50"
                        }`}
                      >
                        <div className={`text-sm font-bold mb-1 ${p.grad ? "text-blue-700" : "text-amber-700"}`}>
                          {p.name}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">速度:</span>
                            <span className={`font-semibold ${p.grad ? "text-blue-600" : "text-amber-600"}`}>
                              {p.speed}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">梯度:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.grad
                                  ? "bg-blue-200 text-blue-700"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {p.grad ? "WITH GRAD" : "NO GRAD"}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1">{p.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                    <span className="font-bold">核心原因：</span>
                    PPO 需要 ∇ log π(a|s) · A(s,a)，必须有计算图才能反向传播。
                  </div>
                </div>
              )}

              {/* output: 输出 */}
              {phase === "output" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">输出 DataProto</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-100 px-4 py-2 text-xs font-bold text-green-800 font-mono">
                      DataProto (output) — finished=true
                    </div>
                    <div className="p-3 space-y-2">
                      {(
                        (variables?.outputFields as unknown as Array<{ name: string; desc: string }>) ?? []
                      ).map((f) => (
                        <div key={f.name} className="flex items-center gap-3">
                          <span className="font-mono text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-bold">
                            {f.name}
                          </span>
                          <span className="text-xs text-gray-600">{f.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Controller 收集所有 Worker 结果 → 合并 → 传递给 Critic / Reward
                  </div>
                </div>
              )}

              {/* 进度指示器 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">进度</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {Object.entries(PHASE_INFO).map(([key, info], idx, arr) => {
                    const order = Object.keys(PHASE_INFO);
                    const currentIdx = order.indexOf(phase);
                    const stepIdx = order.indexOf(key);
                    const isDone = currentIdx >= stepIdx;
                    const isCurrent = key === phase;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg font-medium transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-sm"
                              : isDone
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {info.label}
                        </span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 导航链接 */}
              <div className="flex items-center justify-between">
                <Link to="/drl/30030" className="text-xs text-blue-600 hover:underline">
                  ← 返回框架全景
                </Link>
                <a href={VERL_LINK} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                  verl GitHub →
                </a>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ActorRolloutVisualizer;
