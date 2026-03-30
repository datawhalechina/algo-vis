import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateRewardModuleSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  role: { label: "Reward 角色", color: "bg-amber-100 text-amber-700" },
  "reward-model": { label: "Reward Model", color: "bg-blue-100 text-blue-700" },
  "rule-based": { label: "Rule-based", color: "bg-green-100 text-green-700" },
  verifiable: { label: "Verifiable", color: "bg-purple-100 text-purple-700" },
  comparison: { label: "对比分析", color: "bg-indigo-100 text-indigo-700" },
  summary: { label: "总结", color: "bg-emerald-100 text-emerald-700" },
};

function RewardModuleVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateRewardModuleSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "role";
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO["role"];

          return (
            <div className="space-y-4">
              {/* 标题栏 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Reward Module</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      奖励机制：Reward Model / Rule-based / Verifiable Rewards
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* Phase: role */}
              {phase === "role" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Reward 在 RL 训练中的角色</h4>
                  <div className="flex flex-col items-center gap-3">
                    {/* Actor → Response → Reward → Score → PPO Update */}
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <div className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-md">
                        Actor
                      </div>
                      <div className="text-gray-400 text-lg">→</div>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700">
                        生成 Response
                      </div>
                      <div className="text-gray-400 text-lg">→</div>
                      <div className="bg-amber-500 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-md">
                        Reward
                      </div>
                      <div className="text-gray-400 text-lg">→</div>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700">
                        打分
                      </div>
                      <div className="text-gray-400 text-lg">→</div>
                      <div className="bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-md">
                        PPO 更新
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center max-w-lg">
                      Reward 是连接"生成质量"与"策略优化"的桥梁。Actor 生成 response 后，Reward 评估其质量并给出分数，PPO/GRPO 据此更新 Actor 的策略参数。
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-3 w-full max-w-lg">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <div className="text-xs font-semibold text-blue-700">Reward Model</div>
                        <div className="text-[10px] text-blue-500 mt-1">学习人类偏好</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-xs font-semibold text-green-700">Rule-based</div>
                        <div className="text-[10px] text-green-500 mt-1">确定性规则</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <div className="text-xs font-semibold text-purple-700">Verifiable</div>
                        <div className="text-[10px] text-purple-500 mt-1">多维度验证</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase: reward-model */}
              {phase === "reward-model" && (() => {
                const prompt = variables?.prompt as string;
                const response = variables?.response as string;
                const score = variables?.score as number;
                const trainingData = variables?.trainingData as string;
                const modelType = variables?.modelType as string;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Reward Model 打分流程</h4>
                    {/* Flow diagram */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex gap-3 items-stretch w-full max-w-xl">
                        {/* Prompt */}
                        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-[10px] font-semibold text-blue-600 mb-1">Prompt</div>
                          <div className="text-xs text-gray-700">{prompt}</div>
                        </div>
                        {/* Response */}
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-[10px] font-semibold text-green-600 mb-1">Response</div>
                          <div className="text-xs text-gray-700">{response}</div>
                        </div>
                      </div>

                      <div className="text-gray-400 text-lg">↓ 拼接输入</div>

                      {/* RM Box */}
                      <div className="bg-blue-600 text-white rounded-xl px-8 py-3 text-sm font-bold shadow-lg relative">
                        Reward Model
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
                          {modelType}
                        </div>
                      </div>

                      <div className="text-gray-400 text-lg mt-3">↓</div>

                      {/* Score */}
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-8 py-3 text-center">
                        <div className="text-[10px] text-amber-600 font-semibold">Scalar Score</div>
                        <div className="text-2xl font-bold text-amber-700">{score}</div>
                      </div>

                      {/* Training data note */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 w-full max-w-xl">
                        <div className="text-[10px] font-semibold text-gray-600 mb-1">RM 训练数据</div>
                        <div className="text-xs text-gray-500">
                          {trainingData}：标注员对同一 prompt 的多个 response 进行偏好排序（A &gt; B &gt; C），模型学习这些偏好关系来输出分数。
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: rule-based */}
              {phase === "rule-based" && (() => {
                const mathEx = variables?.mathExample as unknown as {
                  prompt: string; response: string; extracted: string; groundTruth: string; reward: number;
                };
                const codeEx = variables?.codeExample as unknown as {
                  prompt: string; response: string; testCases: number; passed: number; reward: number;
                };
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Rule-based Reward 示例</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Math example */}
                      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="text-xs font-bold text-green-700 mb-3 flex items-center gap-1">
                          <span className="bg-green-200 rounded px-2 py-0.5">数学题</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">Prompt: </span>
                            <span className="text-gray-700">{mathEx?.prompt}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">Response: </span>
                            <span className="text-gray-700">{mathEx?.response}</span>
                          </div>
                          <div className="border-t border-green-200 pt-2 mt-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-white border border-green-300 rounded px-2 py-1 font-mono text-green-700">
                                提取答案: {mathEx?.extracted}
                              </span>
                              <span className="text-gray-400">vs</span>
                              <span className="bg-white border border-green-300 rounded px-2 py-1 font-mono text-green-700">
                                Ground Truth: {mathEx?.groundTruth}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">匹配 →</span>
                              <span className="bg-green-600 text-white rounded-full px-3 py-1 text-xs font-bold">
                                Reward = {mathEx?.reward}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Code example */}
                      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1">
                          <span className="bg-blue-200 rounded px-2 py-0.5">代码题</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">Prompt: </span>
                            <span className="text-gray-700">{codeEx?.prompt}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">Response: </span>
                            <pre className="bg-white border border-blue-200 rounded p-2 mt-1 text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
                              {codeEx?.response}
                            </pre>
                          </div>
                          <div className="border-t border-blue-200 pt-2 mt-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600">沙箱执行测试用例:</span>
                              <span className="bg-white border border-blue-300 rounded px-2 py-1 font-mono text-blue-700">
                                {codeEx?.passed}/{codeEx?.testCases} passed
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">通过率 →</span>
                              <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-bold">
                                Reward = {codeEx?.reward}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: verifiable */}
              {phase === "verifiable" && (() => {
                const prompt = variables?.prompt as string;
                const dimensions = variables?.dimensions as unknown as Array<{
                  name: string; score: number; weight: number; detail: string;
                }>;
                const finalScore = variables?.finalScore as number;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Verifiable Rewards — 多维度打分</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <div className="text-[10px] font-semibold text-purple-600 mb-1">Prompt</div>
                      <div className="text-xs text-gray-700">{prompt}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {dimensions?.map((dim) => (
                        <div key={dim.name} className="border border-purple-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-700">{dim.name}</span>
                            <span className="text-xs font-mono text-gray-500">权重 {dim.weight}</span>
                          </div>
                          {/* Score bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${dim.score * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500">{dim.detail}</span>
                            <span className="text-sm font-bold text-purple-700">{dim.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Final score */}
                    <div className="bg-purple-600 text-white rounded-xl p-4 text-center">
                      <div className="text-xs font-semibold opacity-80">加权最终得分</div>
                      <div className="text-3xl font-bold mt-1">{finalScore}</div>
                      <div className="text-[10px] opacity-60 mt-1">
                        = {dimensions?.map((d) => `${d.score}*${d.weight}`).join(" + ")}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: comparison */}
              {phase === "comparison" && (() => {
                const types = variables?.types as unknown as Array<{
                  name: string; accuracy: string; useCases: string; computeCost: string;
                  scalability: string; pros: string; cons: string;
                }>;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">三种 Reward 方式对比</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="px-3 py-2 text-left text-gray-600 font-semibold">维度</th>
                            {types?.map((t) => (
                              <th key={t.name} className="px-3 py-2 text-left text-gray-800 font-bold">
                                {t.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: "accuracy", label: "准确性" },
                            { key: "useCases", label: "适用场景" },
                            { key: "computeCost", label: "计算成本" },
                            { key: "scalability", label: "可扩展性" },
                            { key: "pros", label: "优势" },
                            { key: "cons", label: "劣势" },
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 font-semibold text-gray-600">{row.label}</td>
                              {types?.map((t) => (
                                <td key={t.name} className="px-3 py-2 text-gray-700">
                                  {(t as Record<string, string>)[row.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Phase: summary */}
              {phase === "summary" && (() => {
                const recommendations = variables?.recommendations as unknown as Array<{
                  scenario: string; recommended: string;
                }>;
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">总结：何时使用哪种 Reward</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {recommendations?.map((rec) => (
                        <div key={rec.scenario} className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                          <div className="text-xs font-semibold text-gray-700 mb-1">{rec.scenario}</div>
                          <div className="text-sm font-bold text-emerald-700">{rec.recommended}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">
                        实际项目中，常混合使用多种 Reward 方式。verl 支持灵活配置不同的 Reward 函数，可以在 PPO/GRPO 训练中同时使用 RM 分数和 Rule-based 分数的加权组合。
                      </p>
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

export default RewardModuleVisualizer;
