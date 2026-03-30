import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateCriticAdvantageSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  "critic-role": { label: "Critic 角色", color: "bg-indigo-100 text-indigo-700" },
  "value-compute": { label: "价值计算", color: "bg-blue-100 text-blue-700" },
  "reward-signal": { label: "奖励信号", color: "bg-amber-100 text-amber-700" },
  "td-error": { label: "TD Error", color: "bg-orange-100 text-orange-700" },
  gae: { label: "GAE", color: "bg-purple-100 text-purple-700" },
  "ppo-clip": { label: "PPO Clip", color: "bg-red-100 text-red-700" },
  "critic-update": { label: "Critic 更新", color: "bg-green-100 text-green-700" },
};

function CriticAdvantageVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateCriticAdvantageSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "critic-role";
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["critic-role"];

          return (
            <div className="space-y-4">
              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Critic & Advantage 计算
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      V(s) 估计 → TD Error → GAE → PPO 策略更新
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* critic-role */}
              {phase === "critic-role" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Critic 的角色</h4>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-sky-100 border border-sky-200 rounded-lg px-4 py-3 text-center">
                        <div className="text-xs text-sky-600">状态 s_t</div>
                        <div className="text-[10px] text-gray-500 mt-1">prompt + 前 t 个 token</div>
                      </div>
                      <span className="text-gray-400 text-lg">→</span>
                      <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg px-6 py-3 text-center">
                        <div className="text-sm font-bold text-indigo-700">Critic</div>
                        <div className="text-[10px] text-indigo-500">Value Network</div>
                      </div>
                      <span className="text-gray-400 text-lg">→</span>
                      <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-3 text-center">
                        <div className="text-xs text-green-600">V(s_t)</div>
                        <div className="text-[10px] text-gray-500 mt-1">预期总奖励</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-w-md text-center">
                      对于 T={variables?.T as number} 个 token 位置，Critic 输出 {variables?.T as number} 个标量价值
                    </div>
                  </div>
                </div>
              )}

              {/* value-compute */}
              {phase === "value-compute" && (() => {
                const values = (variables?.values as number[]) ?? [];
                const positions = (variables?.tokenPositions as number[]) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Critic 价值输出</h4>
                    <div className="flex flex-col items-center gap-3">
                      {/* Token positions with values */}
                      <div className="flex gap-2">
                        {positions.map((pos: number, i: number) => (
                          <div key={pos} className="flex flex-col items-center gap-1">
                            <span className="w-12 h-8 bg-sky-200 text-sky-800 rounded flex items-center justify-center text-xs font-mono">
                              t={pos}
                            </span>
                            <span className="text-gray-400 text-xs">↓</span>
                            <span className="w-12 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-mono font-bold">
                              {values[i]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        V(s) = [{values.join(", ")}]
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 w-full">
                        值从 0.6 递增到 0.9，表示 Critic 认为越接近末尾，获得正奖励的可能性越大。
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* reward-signal */}
              {phase === "reward-signal" && (() => {
                const rewards = (variables?.rewards as number[]) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">稀疏奖励信号</h4>
                    <div className="flex gap-2 justify-center mb-4">
                      {rewards.map((r: number, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className="w-12 h-8 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs font-mono">
                            t={i}
                          </span>
                          <span
                            className={`w-12 h-8 rounded flex items-center justify-center text-xs font-mono font-bold ${
                              r > 0
                                ? "bg-amber-400 text-white shadow-md"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                      <span className="font-bold">稀疏奖励问题：</span>
                      只有最后一个 token 位置有非零奖励 (r=1.0)。
                      前面 4 个位置奖励全为 0，但它们对最终结果同样重要。
                      GAE 的作用就是将末尾的奖励信号传播回每个位置。
                    </div>
                  </div>
                );
              })()}

              {/* td-error */}
              {phase === "td-error" && (() => {
                const tdDetails = (variables?.tdDetails as unknown as Array<{
                  t: number; r_t: number; V_t: number; V_next: number; delta: number;
                }>) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">TD Error 计算</h4>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs font-mono text-orange-800 mb-4">
                      {"delta_t = r_t + gamma * V(s_{t+1}) - V(s_t)"} &nbsp;&nbsp; (gamma={variables?.gamma as number}, V(T)=0)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-orange-100">
                            <th className="px-3 py-2 text-left text-orange-800 font-semibold border-b border-orange-200">t</th>
                            <th className="px-3 py-2 text-right text-orange-800 font-semibold border-b border-orange-200">r_t</th>
                            <th className="px-3 py-2 text-right text-orange-800 font-semibold border-b border-orange-200">V(s_t)</th>
                            <th className="px-3 py-2 text-right text-orange-800 font-semibold border-b border-orange-200">{"V(s_{t+1})"}</th>
                            <th className="px-3 py-2 text-right text-orange-800 font-semibold border-b border-orange-200">delta_t</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tdDetails.map((row) => (
                            <tr key={row.t} className="border-b border-orange-100 hover:bg-orange-50">
                              <td className="px-3 py-2 font-mono font-bold text-gray-700">{row.t}</td>
                              <td className={`px-3 py-2 text-right font-mono ${row.r_t > 0 ? "text-amber-600 font-bold" : "text-gray-400"}`}>
                                {row.r_t}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-blue-600">{row.V_t}</td>
                              <td className="px-3 py-2 text-right font-mono text-blue-400">{row.V_next}</td>
                              <td className={`px-3 py-2 text-right font-mono font-bold ${
                                row.delta > 0 ? "text-green-600" : row.delta < 0 ? "text-red-600" : "text-gray-500"
                              }`}>
                                {row.delta > 0 ? "+" : ""}{row.delta}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500">
                      所有 delta 均为正值，说明序列整体表现优于 Critic 的预期。
                    </div>
                  </div>
                );
              })()}

              {/* gae */}
              {phase === "gae" && (() => {
                const gaeDetails = (variables?.gaeDetails as unknown as Array<{
                  t: number; delta_t: number; A_next: number; A_t: number;
                }>) ?? [];
                const advantages = (variables?.advantages as number[]) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">GAE 后向递推</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs font-mono text-purple-800 mb-4">
                      {"A_t = delta_t + gamma * lambda * A_{t+1}"} &nbsp;&nbsp; (gamma={variables?.gamma as number}, lambda={variables?.lambda as number})
                    </div>

                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-purple-100">
                            <th className="px-3 py-2 text-left text-purple-800 font-semibold border-b border-purple-200">计算顺序</th>
                            <th className="px-3 py-2 text-left text-purple-800 font-semibold border-b border-purple-200">t</th>
                            <th className="px-3 py-2 text-right text-purple-800 font-semibold border-b border-purple-200">delta_t</th>
                            <th className="px-3 py-2 text-right text-purple-800 font-semibold border-b border-purple-200">{"A_{t+1}"}</th>
                            <th className="px-3 py-2 text-right text-purple-800 font-semibold border-b border-purple-200">A_t</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gaeDetails.map((row, idx) => (
                            <tr key={row.t} className="border-b border-purple-100 hover:bg-purple-50">
                              <td className="px-3 py-2 text-gray-400 text-center">{idx + 1}</td>
                              <td className="px-3 py-2 font-mono font-bold text-gray-700">{row.t}</td>
                              <td className="px-3 py-2 text-right font-mono text-orange-600">{row.delta_t}</td>
                              <td className="px-3 py-2 text-right font-mono text-purple-400">
                                {row.t === (variables?.T as number) - 1 ? "0 (末尾)" : row.A_next}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-purple-700">
                                {row.A_t}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Advantage bar chart */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Advantage 分布</div>
                      <div className="space-y-1.5">
                        {advantages.map((a: number, i: number) => {
                          const maxA = Math.max(...advantages);
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500 w-6 text-right">t={i}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full transition-all"
                                  style={{ width: `${(a / maxA) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-purple-700 w-14 text-right font-bold">
                                {a}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-2">
                        越靠前的 token，累积的 advantage 越大（因为它影响了整个后续序列）。
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ppo-clip */}
              {phase === "ppo-clip" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">PPO Clip 策略损失</h4>

                  {/* Formula */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="text-sm font-mono text-red-800 text-center mb-2">
                      {variables?.formula as string}
                    </div>
                    <div className="text-xs font-mono text-red-600 text-center">
                      {variables?.ratioFormula as string}
                    </div>
                  </div>

                  {/* Clipping explanation */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-green-700 mb-1">A &gt; 0 (好动作)</div>
                      <div className="text-[11px] text-gray-600">
                        r 被裁剪在 [1-eps, 1+eps] 内
                      </div>
                      <div className="text-[11px] text-green-600 mt-1">
                        r 最大只能到 1+{variables?.epsilon as number} = {1 + (variables?.epsilon as number)}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        防止过度利用好动作
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-red-700 mb-1">A &lt; 0 (坏动作)</div>
                      <div className="text-[11px] text-gray-600">
                        r 被裁剪在 [1-eps, 1+eps] 内
                      </div>
                      <div className="text-[11px] text-red-600 mt-1">
                        r 最小只能到 1-{variables?.epsilon as number} = {1 - (variables?.epsilon as number)}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        防止过度惩罚坏动作
                      </div>
                    </div>
                  </div>

                  {/* Visual clipping range */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-700 mb-3">Clip 区间可视化 (eps={variables?.epsilon as number})</div>
                    <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
                      {/* Clip region */}
                      <div
                        className="absolute h-full bg-blue-200"
                        style={{ left: "30%", width: "40%" }}
                      />
                      {/* Center line */}
                      <div className="absolute h-full w-px bg-blue-600" style={{ left: "50%" }} />
                      {/* Labels */}
                      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-gray-500">
                        <span>0</span>
                        <span className="absolute text-blue-600 font-bold" style={{ left: "28%", bottom: "-16px" }}>
                          {1 - (variables?.epsilon as number)}
                        </span>
                        <span className="absolute text-blue-800 font-bold" style={{ left: "48%", bottom: "-16px" }}>
                          1.0
                        </span>
                        <span className="absolute text-blue-600 font-bold" style={{ left: "68%", bottom: "-16px" }}>
                          {1 + (variables?.epsilon as number)}
                        </span>
                        <span>2.0</span>
                      </div>
                    </div>
                    <div className="mt-5 text-[11px] text-gray-500 text-center">
                      蓝色区域 = 允许的策略更新范围 [{1 - (variables?.epsilon as number)}, {1 + (variables?.epsilon as number)}]
                    </div>
                  </div>
                </div>
              )}

              {/* critic-update */}
              {phase === "critic-update" && (() => {
                const values = (variables?.values as number[]) ?? [];
                const advantages = (variables?.advantages as number[]) ?? [];
                const vTargets = (variables?.vTargets as number[]) ?? [];

                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Critic 更新</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs font-mono text-green-800 mb-4">
                      Value Loss = E[(V_pred - V_target)^2] &nbsp;&nbsp; V_target = A_t + V_old(s_t)
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-green-100">
                            <th className="px-3 py-2 text-left text-green-800 font-semibold border-b border-green-200">t</th>
                            <th className="px-3 py-2 text-right text-green-800 font-semibold border-b border-green-200">V_pred</th>
                            <th className="px-3 py-2 text-right text-green-800 font-semibold border-b border-green-200">A_t</th>
                            <th className="px-3 py-2 text-right text-green-800 font-semibold border-b border-green-200">V_target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.map((v: number, i: number) => (
                            <tr key={i} className="border-b border-green-100 hover:bg-green-50">
                              <td className="px-3 py-2 font-mono font-bold text-gray-700">{i}</td>
                              <td className="px-3 py-2 text-right font-mono text-blue-600">{v}</td>
                              <td className="px-3 py-2 text-right font-mono text-purple-600">{advantages[i]}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-green-700">{vTargets[i]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Critic 通过最小化 MSE 来提升价值估计的准确性
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
                <Link to="/drl/30033" className="text-xs text-blue-600 hover:underline">
                  Actor & Rollout →
                </Link>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default CriticAdvantageVisualizer;
