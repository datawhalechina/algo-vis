import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateVerlOverviewSteps } from "./algorithm";
import { Link } from "react-router-dom";

type EmptyInput = ProblemInput;

const VERL_LINK = "https://github.com/volcengine/verl";

/** 组件定义 */
const COMPONENTS = [
  { id: "controller", label: "Single-Controller", desc: "统一调度", color: "bg-gray-700", textColor: "text-white", x: 50, y: 8 },
  { id: "actor", label: "Actor", desc: "策略模型", color: "bg-blue-500", textColor: "text-white", x: 20, y: 38 },
  { id: "rollout", label: "Rollout", desc: "vLLM/SGLang", color: "bg-indigo-500", textColor: "text-white", x: 50, y: 38 },
  { id: "reference", label: "Reference", desc: "参考模型", color: "bg-purple-500", textColor: "text-white", x: 80, y: 38 },
  { id: "critic", label: "Critic", desc: "价值网络", color: "bg-amber-500", textColor: "text-white", x: 20, y: 68 },
  { id: "reward", label: "Reward", desc: "奖励模块", color: "bg-rose-500", textColor: "text-white", x: 80, y: 68 },
] as const;

/** 连线定义 */
const ARROWS = [
  { id: "controller-to-actor", from: "controller", to: "actor", label: "dispatch" },
  { id: "controller-to-reference", from: "controller", to: "reference", label: "ref log_prob" },
  { id: "controller-to-reward", from: "controller", to: "reward", label: "reward" },
  { id: "controller-to-critic", from: "controller", to: "critic", label: "values" },
  { id: "actor-to-rollout", from: "actor", to: "rollout", label: "generate" },
  { id: "critic-to-controller", from: "critic", to: "controller", label: "advantages" },
] as const;

const PHASE_INFO: Record<string, { label: string; color: string }> = {
  input: { label: "输入阶段", color: "bg-gray-100 text-gray-700" },
  components: { label: "组件总览", color: "bg-blue-100 text-blue-700" },
  rollout: { label: "① Rollout 生成", color: "bg-indigo-100 text-indigo-700" },
  evaluate: { label: "② 评估阶段", color: "bg-purple-100 text-purple-700" },
  advantage: { label: "③ 优势计算", color: "bg-amber-100 text-amber-700" },
  update: { label: "④ 模型更新", color: "bg-emerald-100 text-emerald-700" },
  output: { label: "训练完成", color: "bg-green-100 text-green-700" },
};

function VerlOverviewVisualizer() {
  return (
    <ConfigurableVisualizer<EmptyInput, Record<string, never>>
      config={{
        defaultInput: {},
        algorithm: () => generateVerlOverviewSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认演示", value: {} }],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "input";
          const activeComponents = (variables?.activeComponents as string[]) ?? [];
          const activeArrows = (variables?.activeArrows as string[]) ?? [];
          const phaseInfo = PHASE_INFO[phase] ?? PHASE_INFO.input;

          return (
            <div className="space-y-4">
              {/* verl 链接 + 阶段标签 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">verl 框架全景</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Prompts + Pretrained LLM → <span className="font-mono">verl PPO Loop</span> → Trained Policy
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                </div>
              </div>

              {/* 架构图 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="relative" style={{ height: 420 }}>
                  {/* 输入区域 */}
                  <div
                    className={`absolute transition-all duration-500 ${
                      phase === "input" ? "opacity-100 scale-100" : "opacity-60 scale-95"
                    }`}
                    style={{ left: "2%", top: 0, width: "30%" }}
                  >
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-slate-600">输入</div>
                      <div className="text-[11px] text-slate-500 mt-1">Prompts + Pretrained LLM</div>
                    </div>
                  </div>

                  {/* 输出区域 */}
                  <div
                    className={`absolute transition-all duration-500 ${
                      phase === "output" ? "opacity-100 scale-100 ring-2 ring-green-400" : "opacity-60 scale-95"
                    }`}
                    style={{ right: "2%", top: 0, width: "30%" }}
                  >
                    <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-green-700">输出</div>
                      <div className="text-[11px] text-green-600 mt-1">Trained Policy</div>
                    </div>
                  </div>

                  {/* 组件 */}
                  {COMPONENTS.map((comp) => {
                    const isActive = activeComponents.includes(comp.id);
                    return (
                      <div
                        key={comp.id}
                        className={`absolute transition-all duration-500 ${
                          phase === "input"
                            ? "opacity-30 scale-90"
                            : isActive
                            ? "opacity-100 scale-100 shadow-lg"
                            : "opacity-40 scale-95"
                        }`}
                        style={{
                          left: `${comp.x}%`,
                          top: `${comp.y}%`,
                          transform: "translate(-50%, 0)",
                        }}
                      >
                        <div
                          className={`${comp.color} ${comp.textColor} rounded-xl px-5 py-3 text-center min-w-[120px] ${
                            isActive ? "ring-2 ring-offset-2 ring-blue-400" : ""
                          }`}
                        >
                          <div className="text-sm font-bold">{comp.label}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">{comp.desc}</div>
                          {comp.id !== "controller" && (
                            <Link
                              to={`/drl/${
                                comp.id === "actor" || comp.id === "rollout"
                                  ? 30033
                                  : comp.id === "critic"
                                  ? 30034
                                  : comp.id === "reward"
                                  ? 30035
                                  : 30031
                              }`}
                              className="text-[9px] underline opacity-70 hover:opacity-100 mt-1 block"
                            >
                              详细 →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 数据流箭头 (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {ARROWS.map((arrow) => {
                      const from = COMPONENTS.find((c) => c.id === arrow.from);
                      const to = COMPONENTS.find((c) => c.id === arrow.to);
                      if (!from || !to) return null;
                      const isActive = activeArrows.includes(arrow.id);
                      const x1 = from.x;
                      const y1 = from.y + 8;
                      const x2 = to.x;
                      const y2 = to.y;
                      return (
                        <g key={arrow.id}>
                          <line
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke={isActive ? "#3b82f6" : "#d1d5db"}
                            strokeWidth={isActive ? 2.5 : 1}
                            strokeDasharray={isActive ? "none" : "6 4"}
                            className="transition-all duration-500"
                          />
                          {isActive && (
                            <text
                              x={`${(x1 + x2) / 2}%`}
                              y={`${(y1 + y2) / 2 - 1}%`}
                              textAnchor="middle"
                              className="text-[9px] fill-blue-600 font-medium"
                            >
                              {arrow.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* PPO 循环标注 */}
                  {phase !== "input" && (
                    <div
                      className="absolute border-2 border-dashed border-blue-200 rounded-2xl transition-all duration-500"
                      style={{ left: "5%", top: "25%", width: "90%", height: "60%" }}
                    >
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] text-blue-400 font-medium">
                        verl PPO Training Loop
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 章节导航 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">章节导航</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 30031, label: "Single-Controller", color: "bg-gray-50 hover:bg-gray-100 text-gray-700" },
                    { id: 30032, label: "PPO 训练循环", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
                    { id: 30033, label: "Actor & Rollout", color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700" },
                    { id: 30034, label: "Critic & Advantage", color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
                    { id: 30035, label: "Reward 模块", color: "bg-rose-50 hover:bg-rose-100 text-rose-700" },
                    { id: 30036, label: "HybridEngine", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
                  ].map((nav) => (
                    <Link
                      key={nav.id}
                      to={`/drl/${nav.id}`}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${nav.color} border border-gray-200`}
                    >
                      #{nav.id} {nav.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 流程步骤 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">训练流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "input", label: "输入" },
                    { id: "rollout", label: "① 生成" },
                    { id: "evaluate", label: "② 评估" },
                    { id: "advantage", label: "③ 优势" },
                    { id: "update", label: "④ 更新" },
                    { id: "output", label: "输出" },
                  ].map((step, idx, arr) => {
                    const order = ["input", "components", "rollout", "evaluate", "advantage", "update", "output"];
                    const currentIdx = order.indexOf(phase);
                    const stepIdx = order.indexOf(step.id);
                    const isDone = currentIdx >= stepIdx;
                    const isCurrent = step.id === phase || (phase === "components" && step.id === "input");
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            isCurrent
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

              {/* verl 链接 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  verl 项目地址：
                  <a href={VERL_LINK} target="_blank" rel="noopener noreferrer" className="underline font-medium ml-1">
                    {VERL_LINK}
                  </a>
                </p>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default VerlOverviewVisualizer;
