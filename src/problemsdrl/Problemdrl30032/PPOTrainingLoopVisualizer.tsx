import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generatePPOTrainingLoopSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

const PHASES = [
  { key: "prompt", label: "Prompt", short: "Prompt" },
  { key: "generate", label: "Generate", short: "Gen" },
  { key: "actor-logprob", label: "Actor LogProb", short: "ActLP" },
  { key: "ref-logprob", label: "Ref LogProb", short: "RefLP" },
  { key: "values-rewards", label: "Values & Rewards", short: "V&R" },
  { key: "advantages", label: "GAE Advantages", short: "GAE" },
  { key: "actor-update", label: "Actor Update", short: "ActUpd" },
  { key: "critic-update", label: "Critic Update", short: "CritUpd" },
  { key: "loop", label: "Loop", short: "Loop" },
];

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  prompt: { label: "Prompt Batch", color: "bg-sky-100 text-sky-700" },
  generate: { label: "Generate Sequences", color: "bg-violet-100 text-violet-700" },
  "actor-logprob": { label: "Actor Log Prob", color: "bg-blue-100 text-blue-700" },
  "ref-logprob": { label: "Ref Log Prob", color: "bg-indigo-100 text-indigo-700" },
  "values-rewards": { label: "Values & Rewards", color: "bg-amber-100 text-amber-700" },
  advantages: { label: "GAE Advantages", color: "bg-emerald-100 text-emerald-700" },
  "actor-update": { label: "Actor PPO Update", color: "bg-rose-100 text-rose-700" },
  "critic-update": { label: "Critic Update", color: "bg-orange-100 text-orange-700" },
  loop: { label: "Next Iteration", color: "bg-green-100 text-green-700" },
};

/* ---------- small helper components ---------- */

function PhaseFlowDiagram({ currentPhase }: { currentPhase: string }) {
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        PPO Training Loop
      </h4>
      <div className="flex items-center flex-wrap gap-1 text-xs">
        {PHASES.map((p, idx) => {
          const isCurrent = p.key === currentPhase;
          const isDone = idx < currentIdx;
          return (
            <div key={p.key} className="flex items-center gap-1">
              <span
                className={`px-2 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDone
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {p.short}
              </span>
              {idx < PHASES.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComponentCard({
  title,
  component,
  input,
  output,
  extra,
  borderColor = "border-blue-200",
  bgColor = "bg-blue-50",
  titleColor = "text-blue-700",
}: {
  title: string;
  component: string;
  input: string;
  output: string;
  extra?: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
  titleColor?: string;
}) {
  return (
    <div className={`rounded-lg border-2 ${borderColor} ${bgColor} p-4`}>
      <h4 className={`text-sm font-semibold ${titleColor} mb-3`}>{title}</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-600 w-20 shrink-0">Component:</span>
          <span className="font-mono">{component}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-600 w-20 shrink-0">Input:</span>
          <span className="font-mono">{input}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-600 w-20 shrink-0">Output:</span>
          <span className="font-mono">{output}</span>
        </div>
      </div>
      {extra && <div className="mt-3">{extra}</div>}
    </div>
  );
}

function ProgressBar({ currentPhase }: { currentPhase: string }) {
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);
  const progress = ((currentIdx + 1) / PHASES.length) * 100;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>进度</span>
        <span>
          {currentIdx + 1} / {PHASES.length}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- main visualizer ---------- */

function PPOTrainingLoopVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generatePPOTrainingLoopSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "prompt";
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["prompt"];

          return (
            <div className="space-y-4">
              {/* Title bar with phase badge */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      PPO Training Loop
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      verl 中 PPO 训练的完整迭代流程：生成 → 评估 → 计算优势 → 更新模型
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}
                  >
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* Flow diagram */}
              <PhaseFlowDiagram currentPhase={phase} />

              {/* ============== Phase: prompt ============== */}
              {phase === "prompt" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Prompt Batch 进入系统
                  </h4>
                  <div className="space-y-2">
                    {(
                      (variables?.prompts as string[]) ?? []
                    ).map((p: string, i: number) => (
                      <div
                        key={i}
                        className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-2 text-xs font-mono text-sky-800"
                      >
                        <span className="font-bold text-sky-600 mr-2">
                          prompt[{i}]:
                        </span>
                        &quot;{p}&quot;
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3">
                    batch_size = {(variables?.batchSize as number) ?? "?"} — 从数据集采样的 prompt 封装为 DataProto
                  </p>
                </div>
              )}

              {/* ============== Phase: generate ============== */}
              {phase === "generate" && (
                <ComponentCard
                  title="Generate Sequences"
                  component={variables?.component as string}
                  input={variables?.input as string}
                  output={variables?.output as string}
                  borderColor="border-violet-200"
                  bgColor="bg-violet-50"
                  titleColor="text-violet-700"
                  extra={
                    <div className="bg-white rounded-lg border border-violet-200 p-3 text-xs font-mono">
                      <div className="text-gray-500 mb-1">// Example</div>
                      <div className="text-violet-700">
                        <span className="font-bold">Prompt:</span>{" "}
                        &quot;{(variables?.example as unknown as { prompt: string; response: string })?.prompt}&quot;
                      </div>
                      <div className="text-violet-500 my-1">↓ autoregressive generation</div>
                      <div className="text-violet-700">
                        <span className="font-bold">Response:</span>{" "}
                        &quot;{(variables?.example as unknown as { prompt: string; response: string })?.response}&quot;
                      </div>
                    </div>
                  }
                />
              )}

              {/* ============== Phase: actor-logprob ============== */}
              {phase === "actor-logprob" && (
                <ComponentCard
                  title="Compute Actor Log Probabilities"
                  component={variables?.component as string}
                  input={variables?.input as string}
                  output={variables?.output as string}
                  borderColor="border-blue-200"
                  bgColor="bg-blue-50"
                  titleColor="text-blue-700"
                  extra={
                    <div className="bg-white rounded-lg border border-blue-200 p-3 text-xs">
                      <div className="font-mono text-gray-500 mb-2">
                        // log π_θ(a_t | s_t) for each token
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {((variables?.exampleLogProbs as number[]) ?? []).map(
                          (lp: number, i: number) => (
                            <div
                              key={i}
                              className="bg-blue-100 rounded px-2 py-1 font-mono text-blue-700"
                            >
                              t{i}: {lp.toFixed(2)}
                            </div>
                          )
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2">
                        这些 log prob 将作为 π_old，用于后续计算 importance sampling ratio
                      </p>
                    </div>
                  }
                />
              )}

              {/* ============== Phase: ref-logprob ============== */}
              {phase === "ref-logprob" && (
                <ComponentCard
                  title="Compute Reference Log Probabilities"
                  component={variables?.component as string}
                  input={variables?.input as string}
                  output={variables?.output as string}
                  borderColor="border-indigo-200"
                  bgColor="bg-indigo-50"
                  titleColor="text-indigo-700"
                  extra={
                    <div className="bg-white rounded-lg border border-indigo-200 p-3 text-xs">
                      <div className="font-mono text-gray-500 mb-2">
                        // ref log probs for KL penalty
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {((variables?.exampleRefLogProbs as number[]) ?? []).map(
                          (lp: number, i: number) => (
                            <div
                              key={i}
                              className="bg-indigo-100 rounded px-2 py-1 font-mono text-indigo-700"
                            >
                              t{i}: {lp.toFixed(2)}
                            </div>
                          )
                        )}
                      </div>
                      <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded px-3 py-2 font-mono text-indigo-600 text-[11px]">
                        {variables?.klFormula as string}
                      </div>
                    </div>
                  }
                />
              )}

              {/* ============== Phase: values-rewards ============== */}
              {phase === "values-rewards" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">
                    Compute Values &amp; Rewards
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Critic side */}
                    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
                      <h5 className="text-xs font-semibold text-amber-700 mb-2">
                        {variables?.criticComponent as string}
                      </h5>
                      <div className="text-xs space-y-1 mb-3">
                        <div>
                          <span className="font-semibold text-gray-600">Input: </span>
                          <span className="font-mono">{variables?.criticInput as string}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Output: </span>
                          <span className="font-mono">{variables?.criticOutput as string}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {((variables?.exampleValues as number[]) ?? []).map(
                          (v: number, i: number) => (
                            <div
                              key={i}
                              className="bg-amber-100 rounded px-2 py-1 font-mono text-xs text-amber-800"
                            >
                              V(t{i})={v}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    {/* Reward side */}
                    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3">
                      <h5 className="text-xs font-semibold text-yellow-700 mb-2">
                        {variables?.rewardComponent as string}
                      </h5>
                      <div className="text-xs space-y-1 mb-3">
                        <div>
                          <span className="font-semibold text-gray-600">Input: </span>
                          <span className="font-mono">{variables?.rewardInput as string}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Output: </span>
                          <span className="font-mono">{variables?.rewardOutput as string}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {((variables?.exampleRewards as number[]) ?? []).map(
                          (r: number, i: number) => (
                            <div
                              key={i}
                              className={`rounded px-2 py-1 font-mono text-xs ${
                                r > 0
                                  ? "bg-green-200 text-green-800 font-bold"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              r(t{i})={r}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============== Phase: advantages (GAE) ============== */}
              {phase === "advantages" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Compute Advantages via GAE
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    gamma={variables?.gamma as number}, lambda={variables?.lambda as number}
                  </p>

                  {/* Formulas */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 space-y-1">
                    <div className="font-mono text-xs text-emerald-800">
                      {variables?.tdFormula as string}
                    </div>
                    <div className="font-mono text-xs text-emerald-800">
                      {variables?.gaeFormula as string}
                    </div>
                  </div>

                  {/* Numeric table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-emerald-100">
                          <th className="px-3 py-2 text-left text-emerald-800 font-semibold border border-emerald-200">
                            t
                          </th>
                          {((variables?.rewards as number[]) ?? []).map(
                            (_: number, i: number) => (
                              <th
                                key={i}
                                className="px-3 py-2 text-center text-emerald-800 font-semibold border border-emerald-200"
                              >
                                {i}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-semibold text-gray-700 border border-emerald-200 bg-gray-50">
                            rewards r_t
                          </td>
                          {((variables?.rewards as number[]) ?? []).map(
                            (r: number, i: number) => (
                              <td
                                key={i}
                                className={`px-3 py-2 text-center font-mono border border-emerald-200 ${
                                  r > 0 ? "bg-green-100 font-bold text-green-700" : ""
                                }`}
                              >
                                {r}
                              </td>
                            )
                          )}
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-semibold text-gray-700 border border-emerald-200 bg-gray-50">
                            values V(t)
                          </td>
                          {((variables?.values as number[]) ?? []).map(
                            (v: number, i: number) => (
                              <td
                                key={i}
                                className="px-3 py-2 text-center font-mono border border-emerald-200"
                              >
                                {v}
                              </td>
                            )
                          )}
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-semibold text-gray-700 border border-emerald-200 bg-gray-50">
                            TD error delta_t
                          </td>
                          {((variables?.tdErrors as number[]) ?? []).map(
                            (d: number, i: number) => (
                              <td
                                key={i}
                                className={`px-3 py-2 text-center font-mono border border-emerald-200 ${
                                  d > 0 ? "text-green-600" : d < 0 ? "text-red-600" : ""
                                }`}
                              >
                                {d.toFixed(4)}
                              </td>
                            )
                          )}
                        </tr>
                        <tr className="bg-emerald-50">
                          <td className="px-3 py-2 font-bold text-emerald-800 border border-emerald-200">
                            advantage A_t
                          </td>
                          {((variables?.advantages as number[]) ?? []).map(
                            (a: number, i: number) => (
                              <td
                                key={i}
                                className={`px-3 py-2 text-center font-mono font-bold border border-emerald-200 ${
                                  a > 0 ? "text-green-700" : a < 0 ? "text-red-700" : ""
                                }`}
                              >
                                {a.toFixed(4)}
                              </td>
                            )
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3">
                    正的 advantage 表示该 action 比预期好，负的表示比预期差。PPO 会增大正 advantage 对应 action 的概率。
                  </p>
                </div>
              )}

              {/* ============== Phase: actor-update ============== */}
              {phase === "actor-update" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Update Actor with PPO Clip Loss
                  </h4>
                  <div className="space-y-3">
                    {/* Loss formula */}
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-rose-700 mb-2">PPO Clip Objective</div>
                      <pre className="font-mono text-xs text-rose-800 whitespace-pre-wrap leading-relaxed">
{variables?.lossFormula as string}
                      </pre>
                      <pre className="font-mono text-xs text-rose-600 mt-1">
{variables?.ratioFormula as string}
                      </pre>
                    </div>
                    {/* Example calculation */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                      <div className="font-semibold text-gray-700 mb-2">Example Calculation</div>
                      <div className="space-y-1 font-mono text-gray-700">
                        <div>ratio = {variables?.exampleRatio as number}</div>
                        <div>advantage = {variables?.exampleAdvantage as number}</div>
                        <div>clip range = {variables?.clipRange as string} (eps={variables?.clipEpsilon as number})</div>
                        <div className="border-t border-gray-300 pt-1 mt-2">
                          ratio * A = {variables?.exampleRatio as number} * {variables?.exampleAdvantage as number} = {((variables?.exampleRatio as number) * (variables?.exampleAdvantage as number)).toFixed(4)}
                        </div>
                        <div>
                          clip(ratio, 0.8, 1.2) = {Math.min(Math.max(variables?.exampleRatio as number, 0.8), 1.2)} (not clipped since {variables?.exampleRatio as number} in [0.8, 1.2])
                        </div>
                        <div>
                          loss term = -min(ratio * A, clip(ratio) * A) = -{((variables?.exampleRatio as number) * (variables?.exampleAdvantage as number)).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============== Phase: critic-update ============== */}
              {phase === "critic-update" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Update Critic with Value Loss
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-orange-700 mb-2">
                        Value Loss (Clipped)
                      </div>
                      <pre className="font-mono text-xs text-orange-800 whitespace-pre-wrap leading-relaxed">
{variables?.lossFormula as string}
                      </pre>
                      <pre className="font-mono text-xs text-orange-600 mt-1">
{variables?.returnsFormula as string}
                      </pre>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                      <div className="font-semibold text-gray-700 mb-2">Example Calculation</div>
                      <div className="space-y-1 font-mono text-gray-700">
                        <div>old_value = {variables?.exampleOldValue as number}</div>
                        <div>new_value = {variables?.exampleNewValue as number}</div>
                        <div>return = {variables?.exampleReturn as number}</div>
                        <div className="border-t border-gray-300 pt-1 mt-2">
                          (V_new - return)^2 = ({variables?.exampleNewValue as number} - {variables?.exampleReturn as number})^2 = {(variables?.exampleLoss as number).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============== Phase: loop ============== */}
              {phase === "loop" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">
                    Iteration Complete — Loop Back
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {((variables?.iterationFlow as string[]) ?? []).map(
                      (step: string, idx: number, arr: string[]) => (
                        <div key={step} className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-lg font-mono font-medium ${
                              PHASE_INFO[step]?.color ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {PHASE_INFO[step]?.label ?? step}
                          </span>
                          {idx < arr.length - 1 && (
                            <span className="text-gray-400">→</span>
                          )}
                        </div>
                      )
                    )}
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 rounded-lg font-mono font-medium bg-sky-100 text-sky-700">
                      Next Iteration ...
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-4">
                    一次完整 PPO 迭代结束。Controller 采样新的 prompt batch，开始下一轮。
                    通常训练数百到数千个 iteration 直到策略收敛。
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <ProgressBar currentPhase={phase} />

              {/* Navigation & related links */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <Link
                    to="/drl/30030"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    ← 返回框架全景
                  </Link>
                  <a
                    href={VERL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    verl GitHub →
                  </a>
                </div>
                <div className="border-t border-gray-100 pt-2 flex flex-wrap gap-3 text-xs">
                  <span className="text-gray-400">Related:</span>
                  <Link to="/drl/30033" className="text-blue-600 hover:underline">
                    30033 Actor 详解
                  </Link>
                  <Link to="/drl/30034" className="text-blue-600 hover:underline">
                    30034 Critic 详解
                  </Link>
                  <Link to="/drl/30035" className="text-blue-600 hover:underline">
                    30035 Reward 详解
                  </Link>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default PPOTrainingLoopVisualizer;
