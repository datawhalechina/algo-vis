import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateSingleControllerSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  "multi-controller": { label: "传统方式", color: "bg-red-100 text-red-700" },
  "single-controller": { label: "Single-Controller", color: "bg-blue-100 text-blue-700" },
  "worker-group": { label: "RayWorkerGroup", color: "bg-indigo-100 text-indigo-700" },
  "one-to-all": { label: "ONE_TO_ALL", color: "bg-amber-100 text-amber-700" },
  "dp-compute": { label: "DP_COMPUTE_PROTO", color: "bg-purple-100 text-purple-700" },
  dataproto: { label: "DataProto", color: "bg-emerald-100 text-emerald-700" },
  "full-flow": { label: "完整流程", color: "bg-green-100 text-green-700" },
};

function WorkerNode({ id, active, label }: { id: number; active: boolean; label?: string }) {
  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${active ? "scale-105" : "opacity-40"}`}>
      <div
        className={`w-16 h-16 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
          active ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-500"
        }`}
      >
        GPU {id}
      </div>
      {label && <span className="text-[10px] text-gray-500 mt-1 text-center max-w-[70px] truncate">{label}</span>}
    </div>
  );
}

function SingleControllerVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateSingleControllerSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "multi-controller";
          const workers = (variables?.workers as number[]) ?? [0, 1, 2, 3];
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["multi-controller"];
          const batches = variables?.batches as unknown as Array<{ worker: number; data: string }> | undefined;
          const fields = variables?.fields as unknown as Array<{ name: string; shape: string; desc: string }> | undefined;

          return (
            <div className="space-y-4">
              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Single-Controller 调度架构</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      一个 Driver 统一调度 → RayWorkerGroup 分布式执行
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* Multi vs Single Controller 对比 */}
              {(phase === "multi-controller" || phase === "single-controller") && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Multi-Controller */}
                    <div className={`rounded-lg p-4 border-2 transition-all ${
                      phase === "multi-controller" ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 opacity-50"
                    }`}>
                      <h4 className="text-sm font-semibold text-red-700 mb-3">Multi-Controller</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {workers.map((w) => (
                          <div key={w} className="bg-red-100 rounded-lg p-2 text-center">
                            <div className="text-xs font-mono text-red-600">Worker {w}</div>
                            <div className="text-[10px] text-red-500 mt-1">控制+计算</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-[11px] text-red-600 text-center">
                        ↔ 复杂的 Worker 间通信
                      </div>
                    </div>
                    {/* Single-Controller */}
                    <div className={`rounded-lg p-4 border-2 transition-all ${
                      phase === "single-controller" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-50"
                    }`}>
                      <h4 className="text-sm font-semibold text-blue-700 mb-3">Single-Controller</h4>
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-gray-700 text-white rounded-lg px-4 py-2 text-xs font-bold">
                          Controller (Driver)
                        </div>
                        <div className="text-gray-400 text-xs">↓ dispatch</div>
                        <div className="flex gap-2">
                          {workers.map((w) => (
                            <div key={w} className="bg-blue-100 rounded-lg p-2 text-center">
                              <div className="text-xs font-mono text-blue-600">W{w}</div>
                              <div className="text-[10px] text-blue-500">计算</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WorkerGroup 展示 */}
              {phase === "worker-group" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">RayWorkerGroup 架构</h4>
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-gray-700 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md">
                      Single-Controller
                    </div>
                    <div className="text-gray-400 text-xs">管理多个 WorkerGroup</div>
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {["ActorRolloutRef\nWorkerGroup", "Critic\nWorkerGroup", "Reward\nWorkerGroup"].map(
                        (group, i) => (
                          <div key={i} className="border-2 border-dashed border-indigo-200 rounded-lg p-3">
                            <div className="text-xs font-semibold text-indigo-700 text-center whitespace-pre-line mb-2">
                              {group}
                            </div>
                            <div className="flex gap-1 justify-center">
                              {workers.map((w) => (
                                <WorkerNode key={w} id={w} active label={`GPU ${w}`} />
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ONE_TO_ALL 模式 */}
              {phase === "one-to-all" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    ONE_TO_ALL 模式 — <span className="font-mono text-amber-600">init_model()</span>
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">相同指令广播到所有 Worker</p>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gray-700 text-white rounded-xl px-6 py-2 text-sm font-bold">Controller</div>
                    <div className="flex items-center gap-1">
                      {workers.map((_, i) => (
                        <span key={i} className="text-amber-500 text-lg">↓</span>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 font-mono">
                      init_model() → 广播到全部 Worker
                    </div>
                    <div className="flex gap-3">
                      {workers.map((w) => (
                        <WorkerNode key={w} id={w} active label="init_model" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DP_COMPUTE_PROTO 模式 */}
              {phase === "dp-compute" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    DP_COMPUTE_PROTO 模式 — <span className="font-mono text-purple-600">generate_sequences()</span>
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">数据按 DP 维度分片分发</p>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gray-700 text-white rounded-xl px-6 py-2 text-sm font-bold">
                      Controller | batch_size=8
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {(batches ?? []).map((b) => (
                        <div key={b.worker} className="flex flex-col items-center gap-2">
                          <span className="text-purple-500 text-lg">↓</span>
                          <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            {b.data}
                          </span>
                          <WorkerNode id={b.worker} active label="generate" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {workers.map((_, i) => (
                        <span key={i} className="text-purple-500 text-lg">↑</span>
                      ))}
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-xs text-purple-700">
                      结果自动收集合并 → 完整 DataProto
                    </div>
                  </div>
                </div>
              )}

              {/* DataProto */}
              {phase === "dataproto" && fields && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">DataProto 数据容器</h4>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden">
                    <div className="bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 font-mono">
                      class DataProto
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-emerald-200">
                          <th className="px-4 py-2 text-left text-emerald-700">字段名</th>
                          <th className="px-4 py-2 text-left text-emerald-700">Shape</th>
                          <th className="px-4 py-2 text-left text-emerald-700">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((f) => (
                          <tr key={f.name} className="border-b border-emerald-100">
                            <td className="px-4 py-2 font-mono font-medium text-emerald-800">{f.name}</td>
                            <td className="px-4 py-2 font-mono text-emerald-600">{f.shape}</td>
                            <td className="px-4 py-2 text-gray-600">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3">
                    DataProto 支持按 batch 维度自动 split/merge，是 Controller 与 Worker 之间的统一数据接口。
                  </p>
                </div>
              )}

              {/* 完整流程 */}
              {phase === "full-flow" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">完整调度流程</h4>
                  <div className="space-y-3">
                    {[
                      { step: "1", text: "Controller: actor_wg.generate_sequences(prompts)", color: "bg-blue-50 border-blue-200 text-blue-700" },
                      { step: "2", text: "DP_COMPUTE_PROTO: 按 batch 维度分片到 4 个 Worker", color: "bg-purple-50 border-purple-200 text-purple-700" },
                      { step: "3", text: "Worker 0~3: 各生成 1/4 batch 的 response", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
                      { step: "4", text: "结果自动收集合并为完整 DataProto → 返回 Controller", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                    ].map((s) => (
                      <div key={s.step} className={`border rounded-lg px-4 py-2 text-xs font-mono ${s.color}`}>
                        <span className="font-bold mr-2">Step {s.step}:</span>
                        {s.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 流程指示器 */}
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
                            isCurrent ? "bg-blue-600 text-white shadow-sm" : isDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
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

              {/* verl 链接 + 返回 */}
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

export default SingleControllerVisualizer;
