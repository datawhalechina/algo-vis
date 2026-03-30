import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateHybridEngineSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  problem: { label: "问题背景", color: "bg-red-100 text-red-700" },
  fsdp: { label: "FSDP 训练", color: "bg-blue-100 text-blue-700" },
  tp: { label: "TP 生成", color: "bg-purple-100 text-purple-700" },
  "train-to-generate": { label: "FSDP→TP", color: "bg-amber-100 text-amber-700" },
  "generate-to-train": { label: "TP→FSDP", color: "bg-orange-100 text-orange-700" },
  performance: { label: "性能收益", color: "bg-green-100 text-green-700" },
};

const GPU_COLORS = ["bg-sky-400", "bg-violet-400", "bg-rose-400", "bg-teal-400"];

function GpuMemoryBlock({
  gpuId,
  segments,
}: {
  gpuId: number;
  segments: Array<{ label: string; size: string; color: string }>;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-xs font-bold text-white rounded-t-lg px-3 py-1 ${GPU_COLORS[gpuId % GPU_COLORS.length]}`}>
        GPU {gpuId}
      </div>
      <div className="border-2 border-gray-300 rounded-b-lg w-28 overflow-hidden">
        {segments.map((seg, i) => (
          <div key={i} className={`${seg.color} px-2 py-2 text-center border-b border-white/30 last:border-b-0`}>
            <div className="text-[10px] font-semibold text-white">{seg.label}</div>
            <div className="text-[9px] text-white/80">{seg.size}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HybridEngineVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateHybridEngineSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "problem";
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["problem"];
          const gpus = (variables?.gpus as number) ?? 4;
          const gpuArray = Array.from({ length: gpus }, (_, i) => i);

          return (
            <div className="space-y-4">
              {/* 标题栏 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">HybridEngine 3D Resharding</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      训练（FSDP）与生成（TP）之间的动态并行策略切换
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* Phase: problem */}
              {phase === "problem" && (() => {
                const trainingNeeds = variables?.trainingNeeds as string[];
                const generationNeeds = variables?.generationNeeds as string[];
                const waste = variables?.wasteWithout as string;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">为什么需要 HybridEngine？</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Training needs */}
                      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="text-xs font-bold text-blue-700 mb-2">训练阶段 (FSDP)</div>
                        <ul className="space-y-1">
                          {trainingNeeds?.map((need, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Generation needs */}
                      <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                        <div className="text-xs font-bold text-purple-700 mb-2">生成阶段 (TP)</div>
                        <ul className="space-y-1">
                          {generationNeeds?.map((need, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Waste warning */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                      <div className="text-xs font-semibold text-red-700 mb-1">Naive 方案的问题</div>
                      <div className="text-sm font-bold text-red-600">{waste}</div>
                      <div className="text-[10px] text-red-500 mt-1">
                        分别部署训练和生成模型 → 显存翻倍
                      </div>
                    </div>
                    {/* Solution */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center mt-4">
                      <div className="text-xs font-semibold text-green-700 mb-1">HybridEngine 解决方案</div>
                      <div className="text-sm font-bold text-green-600">
                        同一份权重，动态切换 FSDP ↔ TP
                      </div>
                      <div className="text-[10px] text-green-500 mt-1">3D Resharding: 训练和生成共享模型参数</div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: fsdp */}
              {phase === "fsdp" && (() => {
                const mem = variables?.memoryPerGpu as unknown as {
                  params: string; optimizer: string; gradients: string; total: string;
                };
                const parallelism = variables?.parallelism as string;
                const communication = variables?.communication as string;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      训练模式 — {parallelism}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      参数均匀分片到 {gpus} 个 GPU，每个 GPU 持有 1/{gpus} 参数 + 优化器状态 + 梯度
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap mb-4">
                      {gpuArray.map((id) => (
                        <GpuMemoryBlock
                          key={id}
                          gpuId={id}
                          segments={[
                            { label: `Params (1/${gpus})`, size: mem?.params ?? "", color: "bg-blue-500" },
                            { label: "Optimizer (m,v)", size: mem?.optimizer ?? "", color: "bg-orange-500" },
                            { label: "Gradients", size: mem?.gradients ?? "", color: "bg-green-500" },
                          ]}
                        />
                      ))}
                    </div>
                    {/* Memory summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">每个 GPU 显存占用:</span>
                        <span className="font-bold text-blue-700">{mem?.total}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded" /> Params
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-orange-500 rounded" /> Optimizer
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-500 rounded" /> Gradients
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2">
                        通信模式: {communication}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: tp */}
              {phase === "tp" && (() => {
                const mem = variables?.memoryPerGpu as unknown as {
                  params: string; kvCache: string; total: string;
                };
                const parallelism = variables?.parallelism as string;
                const communication = variables?.communication as string;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      生成模式 — {parallelism}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      每个 GPU 持有完整层但按列/行切分权重，无需 all-gather，延迟更低
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap mb-4">
                      {gpuArray.map((id) => (
                        <GpuMemoryBlock
                          key={id}
                          gpuId={id}
                          segments={[
                            { label: `Params (col/${gpus})`, size: mem?.params ?? "", color: "bg-blue-500" },
                            { label: "KV-Cache", size: mem?.kvCache ?? "", color: "bg-purple-500" },
                          ]}
                        />
                      ))}
                    </div>
                    {/* Memory summary */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">每个 GPU 显存占用:</span>
                        <span className="font-bold text-purple-700">{mem?.total}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded" /> Params
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-purple-500 rounded" /> KV-Cache
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2">
                        通信模式: {communication}
                      </div>
                      <div className="text-[10px] text-green-600 mt-1 font-semibold">
                        无需 optimizer states 和 gradients → 显存更高效
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: train-to-generate */}
              {phase === "train-to-generate" && (() => {
                const direction = variables?.direction as string;
                const operations = variables?.operations as string[];
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Resharding: {direction}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">从训练模式切换到生成模式的参数重排过程</p>

                    {/* Animation: FSDP → TP transition */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                      {/* FSDP side */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-blue-700 mb-2">FSDP 布局</div>
                        <div className="flex gap-1">
                          {gpuArray.map((id) => (
                            <div key={id} className="w-12 border border-gray-300 rounded overflow-hidden transition-all duration-700 opacity-50">
                              <div className="bg-blue-500 h-4" />
                              <div className="bg-orange-500 h-6" />
                              <div className="bg-green-500 h-4" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl text-amber-500 animate-pulse font-bold">→</div>
                        <div className="text-[10px] text-gray-500">resharding</div>
                      </div>

                      {/* TP side */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-purple-700 mb-2">TP 布局</div>
                        <div className="flex gap-1">
                          {gpuArray.map((id) => (
                            <div key={id} className="w-12 border-2 border-purple-300 rounded overflow-hidden transition-all duration-700">
                              <div className="bg-blue-500 h-4" />
                              <div className="bg-purple-500 h-6" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Operations list */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-amber-700 mb-2">执行步骤</div>
                      <div className="space-y-2">
                        {operations?.map((op, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="text-gray-700">{op}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: generate-to-train */}
              {phase === "generate-to-train" && (() => {
                const direction = variables?.direction as string;
                const operations = variables?.operations as string[];
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Resharding: {direction}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">从生成模式切换回训练模式，恢复优化器状态</p>

                    {/* Animation: TP → FSDP transition */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                      {/* TP side */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-purple-700 mb-2">TP 布局</div>
                        <div className="flex gap-1">
                          {gpuArray.map((id) => (
                            <div key={id} className="w-12 border border-gray-300 rounded overflow-hidden transition-all duration-700 opacity-50">
                              <div className="bg-blue-500 h-4" />
                              <div className="bg-purple-500 h-6" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl text-orange-500 animate-pulse font-bold">→</div>
                        <div className="text-[10px] text-gray-500">resharding</div>
                      </div>

                      {/* FSDP side */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-blue-700 mb-2">FSDP 布局</div>
                        <div className="flex gap-1">
                          {gpuArray.map((id) => (
                            <div key={id} className="w-12 border-2 border-blue-300 rounded overflow-hidden transition-all duration-700">
                              <div className="bg-blue-500 h-4" />
                              <div className="bg-orange-500 h-6" />
                              <div className="bg-green-500 h-4" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Operations list */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-orange-700 mb-2">执行步骤</div>
                      <div className="space-y-2">
                        {operations?.map((op, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="flex-shrink-0 w-5 h-5 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="text-gray-700">{op}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: performance */}
              {phase === "performance" && (() => {
                const memorySaving = variables?.memorySaving as string;
                const throughputGain = variables?.throughputGain as string;
                const comparison = variables?.comparison as unknown as {
                  naive: { memory: number; throughput: number; label: string };
                  hybrid: { memory: number; throughput: number; label: string };
                };
                const benefits = variables?.benefits as string[];
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">性能收益</h4>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <div className="text-xs text-green-600 font-semibold">显存节省</div>
                        <div className="text-3xl font-bold text-green-700 mt-1">{memorySaving}</div>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                        <div className="text-xs text-blue-600 font-semibold">吞吐提升</div>
                        <div className="text-3xl font-bold text-blue-700 mt-1">{throughputGain}</div>
                      </div>
                    </div>

                    {/* Comparison bars */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="text-xs font-semibold text-gray-700 mb-3">显存占用对比</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{comparison?.naive?.label}</span>
                            <span className="font-mono text-gray-500">{comparison?.naive?.memory}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="bg-red-400 h-5 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                              style={{ width: `${comparison?.naive?.memory ?? 100}%` }}
                            >
                              <span className="text-[10px] text-white font-bold">100%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{comparison?.hybrid?.label}</span>
                            <span className="font-mono text-gray-500">{comparison?.hybrid?.memory}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="bg-green-500 h-5 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                              style={{ width: `${comparison?.hybrid?.memory ?? 53}%` }}
                            >
                              <span className="text-[10px] text-white font-bold">53%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-gray-700 mb-3 mt-6">吞吐量对比</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{comparison?.naive?.label}</span>
                            <span className="font-mono text-gray-500">{comparison?.naive?.throughput}x</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="bg-red-400 h-5 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                              style={{ width: `${((comparison?.naive?.throughput ?? 1.0) / 1.4) * 100}%` }}
                            >
                              <span className="text-[10px] text-white font-bold">1.0x</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{comparison?.hybrid?.label}</span>
                            <span className="font-mono text-gray-500">{comparison?.hybrid?.throughput}x</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="bg-green-500 h-5 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                              style={{ width: "100%" }}
                            >
                              <span className="text-[10px] text-white font-bold">1.4x</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits list */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-green-700 mb-2">核心优势</div>
                      <ul className="space-y-1">
                        {benefits?.map((b, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

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

export default HybridEngineVisualizer;
