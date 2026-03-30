import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import {
  generateAutoregressiveSteps,
  AutoregressiveState,
  CompletedGenStep,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const PROBLEM_ID = 10011;

interface AutoregressiveInput extends ProblemInput {
  prompt: string;
  vocab: string;
  maxNewTokens: number;
  temperature: number;
  seed: number;
}

const DEFAULT_PROMPT = "the cat";
const DEFAULT_VOCAB = "sat,on,the,mat,cat,dog,<EOS>";
const DEFAULT_MAX = 5;
const DEFAULT_TEMP = 1.0;
const DEFAULT_SEED = 42;

function parseTokens(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseVocab(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getHeatColor(prob: number, maxProb: number): string {
  const ratio = maxProb > 0 ? Math.min(prob / maxProb, 1) : 0;
  const hue = 220 - ratio * 180;
  return `hsl(${hue}, 70%, ${88 - ratio * 30}%)`;
}

function getTextColor(prob: number, maxProb: number): string {
  return maxProb > 0 && prob / maxProb > 0.55 ? "#fff" : "#1e293b";
}

// ── 阶段名称 & 颜色 ──────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string; icon: string }> = {
  init:     { label: "初始化",     color: "gray",   icon: "⬜" },
  feed:     { label: "① 输入序列",  color: "blue",   icon: "📥" },
  logits:   { label: "② 模型前向",  color: "violet", icon: "🧠" },
  softmax:  { label: "③ Softmax",  color: "amber",  icon: "📊" },
  select:   { label: "④ 采样选词",  color: "orange", icon: "🎯" },
  append:   { label: "⑤ 自回归反馈", color: "cyan",  icon: "🔄" },
  complete: { label: "⑤ 生成完成",  color: "emerald", icon: "✅" },
};

// 当前阶段在管道中的索引（用于判断"已完成"）
const PHASE_ORDER = ["init", "feed", "logits", "softmax", "select", "append", "complete"];

function phaseIndex(phase: string): number {
  return PHASE_ORDER.indexOf(phase);
}

// ── 子组件 ──────────────────────────────────────────────────────

/** 单个 token 徽章 */
function TokenBadge({
  tok,
  variant = "default",
}: {
  tok: string;
  variant?: "prompt" | "generated" | "active" | "eos" | "default";
}) {
  const styles = {
    prompt:    "bg-blue-100 border-blue-300 text-blue-800",
    generated: "bg-cyan-100 border-cyan-300 text-cyan-800",
    active:    "bg-amber-400 border-amber-500 text-white shadow-md scale-110",
    eos:       "bg-red-100 border-red-300 text-red-700",
    default:   "bg-gray-100 border-gray-300 text-gray-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-sm font-mono font-semibold border transition-all ${styles[variant]}`}
    >
      {tok}
    </span>
  );
}

/** 管道步骤框 */
function PipelineStep({
  num,
  label,
  active,
  done,
  children,
}: {
  num: string;
  label: string;
  active: boolean;
  done: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-all duration-200 ${
        active
          ? "border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200"
          : done
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
            active
              ? "bg-blue-500 text-white"
              : done
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-400 border border-gray-300"
          }`}
        >
          {done && !active ? "✓" : num}
        </span>
        <span
          className={`text-xs font-semibold ${
            active ? "text-blue-700" : done ? "text-emerald-700" : "text-gray-400"
          }`}
        >
          {label}
        </span>
      </div>
      {children && <div className="ml-7">{children}</div>}
    </div>
  );
}

/** 两步之间的箭头 */
function PipelineArrow({ active }: { active: boolean }) {
  return (
    <div
      className={`text-center text-lg leading-none transition-all ${
        active ? "text-blue-400" : "text-gray-200"
      }`}
    >
      ↓
    </div>
  );
}

/** 自回归链：历史已完成步骤 */
function AutoregressiveChain({
  completedSteps,
  promptLen,
  currentGenStep,
  phase,
}: {
  completedSteps: CompletedGenStep[];
  promptLen: number;
  currentGenStep: number;
  phase: string;
}) {
  if (completedSteps.length === 0 && phase === "init") return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">
        自回归链（每步输出成为下一步输入）
      </h4>

      <div className="space-y-2">
        {completedSteps.map((cs) => (
          <div key={cs.genStep} className="flex items-start gap-2 text-xs">
            {/* 步骤标签 */}
            <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
              Step {cs.genStep}
            </span>

            {/* 输入序列 */}
            <div className="flex flex-wrap gap-1 items-center">
              {cs.inputTokens.map((tok, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded font-mono border ${
                    i < promptLen
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-cyan-50 border-cyan-200 text-cyan-700"
                  }`}
                >
                  {tok}
                </span>
              ))}
            </div>

            {/* 箭头 + 输出 */}
            <span className="shrink-0 text-gray-400">→LM→</span>
            <span
              className={`shrink-0 px-2 py-0.5 rounded font-mono border font-semibold ${
                cs.selectedToken === "<EOS>"
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-amber-100 border-amber-300 text-amber-800"
              }`}
            >
              {cs.selectedToken}
            </span>
            <span className="shrink-0 text-gray-400 text-[10px]">
              p={cs.prob.toFixed(3)}
            </span>

            {/* 反馈符号 */}
            {cs.genStep < completedSteps.length || phase === "append" ? (
              <span className="shrink-0 text-cyan-500 text-[10px]">↩ 追加</span>
            ) : null}
          </div>
        ))}

        {/* 当前正在进行的步骤（未完成） */}
        {!["init", "complete"].includes(phase) && currentGenStep > completedSteps.length && (
          <div className="flex items-center gap-2 text-xs opacity-60">
            <span className="shrink-0 px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-mono border border-blue-200">
              Step {currentGenStep}
            </span>
            <span className="text-gray-400 italic">进行中…</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                PHASE_META[phase]
                  ? `bg-${PHASE_META[phase].color}-100 text-${PHASE_META[phase].color}-700`
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {PHASE_META[phase]?.label ?? phase}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────

function AutoregressiveVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<AutoregressiveInput, Record<string, never>>
      config={{
        defaultInput: {
          prompt: DEFAULT_PROMPT,
          vocab: DEFAULT_VOCAB,
          maxNewTokens: DEFAULT_MAX,
          temperature: DEFAULT_TEMP,
          seed: DEFAULT_SEED,
        },

        algorithm: (input) => {
          const promptTokens = parseTokens(
            typeof input.prompt === "string" ? input.prompt : DEFAULT_PROMPT
          );
          const vocab = parseVocab(
            typeof input.vocab === "string" ? input.vocab : DEFAULT_VOCAB
          );
          const maxNewTokens =
            typeof input.maxNewTokens === "number"
              ? Math.min(Math.max(input.maxNewTokens, 1), 10)
              : DEFAULT_MAX;
          const temperature =
            typeof input.temperature === "number"
              ? Math.max(input.temperature, 0.01)
              : DEFAULT_TEMP;
          const seed =
            typeof input.seed === "number" ? input.seed : DEFAULT_SEED;
          return generateAutoregressiveSteps(
            promptTokens,
            vocab,
            maxNewTokens,
            temperature,
            seed
          );
        },

        inputTypes: [
          { type: "string", key: "prompt", label: "Prompt（空格分隔）" },
          { type: "string", key: "vocab", label: "词表（逗号分隔）" },
          { type: "number", key: "maxNewTokens", label: "最大生成步数" },
          { type: "number", key: "temperature", label: "温度 T" },
          { type: "number", key: "seed", label: "随机种子" },
        ],
        inputFields: [
          { type: "string", key: "prompt", label: "Prompt（空格分隔）", placeholder: DEFAULT_PROMPT },
          { type: "string", key: "vocab", label: "词表（逗号分隔，含 <EOS>）", placeholder: DEFAULT_VOCAB },
          { type: "number", key: "maxNewTokens", label: "最大生成步数", placeholder: String(DEFAULT_MAX) },
          { type: "number", key: "temperature", label: "温度 T", placeholder: String(DEFAULT_TEMP) },
          { type: "number", key: "seed", label: "随机种子", placeholder: String(DEFAULT_SEED) },
        ],
        testCases: [
          {
            label: "示例（T=1.0）",
            value: { prompt: DEFAULT_PROMPT, vocab: DEFAULT_VOCAB, maxNewTokens: DEFAULT_MAX, temperature: DEFAULT_TEMP, seed: DEFAULT_SEED },
          },
          {
            label: "高温（T=2.0，多样）",
            value: { prompt: "the", vocab: "cat,sat,on,mat,dog,ran,fast,<EOS>", maxNewTokens: 6, temperature: 2.0, seed: 7 },
          },
          {
            label: "低温（T=0.1，保守）",
            value: { prompt: "the cat sat", vocab: "on,the,mat,a,floor,rug,<EOS>", maxNewTokens: 4, temperature: 0.1, seed: 99 },
          },
        ],

        render: ({ variables }) => {
          const state = variables as unknown as AutoregressiveState | undefined;
          const phase           = state?.phase ?? "init";
          const genStep         = state?.genStep ?? 0;
          const tokens          = state?.tokens ?? [];
          const inputTokensForStep = state?.inputTokensForStep ?? [];
          const promptLen       = state?.promptLen ?? 0;
          const vocab           = state?.vocab ?? [];
          const logits          = state?.logits ?? [];
          const probs           = state?.probs ?? [];
          const selectedIdx     = state?.selectedIdx ?? -1;
          const selectedToken   = state?.selectedToken ?? "";
          const temperature     = state?.temperature ?? 1.0;
          const maxNewTokens    = state?.maxNewTokens ?? 5;
          const completedSteps  = (state?.completedSteps ?? []) as CompletedGenStep[];
          const finished        = state?.finished ?? false;
          const maxProb         = probs.length > 0 ? Math.max(...probs) : 1;

          const curPhaseIdx = phaseIndex(phase);

          // 管道各步是否 active / done
          // done 跨循环保持：当前循环已过该步，或至少有一个历史循环完成过
          const isPipeActive = (p: string) => phase === p;
          const isPipeDone = (p: string) => {
            if (phase === p) return false; // active 优先
            if (curPhaseIdx > phaseIndex(p)) return true; // 当前循环已过
            // 上一循环已完成过（phaseIndex > 0 排除 init）
            if (completedSteps.length > 0 && phaseIndex(p) > 0) return true;
            return false;
          };

          // 阶段介于哪两步之间（用于箭头高亮）
          const isArrowActive = (from: string, to: string) =>
            phase === to || (isPipeDone(from) && !isPipeDone(to));

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      自回归生成过程（Autoregressive Generation）
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="x_{t+1} \sim p_\theta(\cdot \mid x_1, \ldots, x_t)" />
                    </div>
                  </div>

                  {/* 当前阶段 badge */}
                  {phase !== "init" && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400">
                        第 {genStep} / {maxNewTokens} 步
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700`}
                      >
                        {PHASE_META[phase]?.icon} {PHASE_META[phase]?.label ?? phase}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ 自回归管道 ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-800">
                    自回归生成管道
                  </h4>
                  {phase === "init" && (
                    <span className="text-xs text-gray-400">点击"下一步"开始</span>
                  )}
                </div>

                <div className="flex gap-4">
                  {/* 左侧：管道步骤 */}
                  <div className="flex-1 space-y-1">

                    {/* ① feed */}
                    <PipelineStep
                      num="1"
                      label="输入序列 → 模型"
                      active={isPipeActive("feed")}
                      done={isPipeDone("feed")}
                    >
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(isPipeActive("feed") ? inputTokensForStep : phase === "init" ? inputTokensForStep : inputTokensForStep).map(
                          (tok, i) => (
                            <TokenBadge
                              key={i}
                              tok={tok}
                              variant={i < promptLen ? "prompt" : "generated"}
                            />
                          )
                        )}
                      </div>
                    </PipelineStep>

                    <PipelineArrow active={isArrowActive("feed", "logits")} />

                    {/* ② logits */}
                    <PipelineStep
                      num="2"
                      label="语言模型 LM(θ) → logits"
                      active={isPipeActive("logits")}
                      done={isPipeDone("logits")}
                    >
                      {isPipeActive("logits") && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {vocab.slice(0, 5).map((tok, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-violet-50 border border-violet-200 rounded text-[11px] font-mono text-violet-700"
                            >
                              {tok}: {(logits[i] ?? 0).toFixed(2)}
                            </span>
                          ))}
                          {vocab.length > 5 && (
                            <span className="text-[11px] text-gray-400">…+{vocab.length - 5}</span>
                          )}
                        </div>
                      )}
                    </PipelineStep>

                    <PipelineArrow active={isArrowActive("logits", "softmax")} />

                    {/* ③ softmax */}
                    <PipelineStep
                      num="3"
                      label={`Softmax(z / T)，T = ${temperature}`}
                      active={isPipeActive("softmax")}
                      done={isPipeDone("softmax")}
                    >
                      {["softmax", "select", "append", "complete"].includes(phase) && probs.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {vocab.map((tok, i) => {
                            const p = probs[i] ?? 0;
                            const bg = getHeatColor(p, maxProb);
                            const tc = getTextColor(p, maxProb);
                            const isSelected = i === selectedIdx && ["select", "append", "complete"].includes(phase);
                            return (
                              <div
                                key={i}
                                className={`rounded border px-2 py-1 transition-all ${
                                  isSelected
                                    ? "ring-2 ring-amber-400 border-amber-400 scale-105 shadow"
                                    : "border-gray-100"
                                }`}
                                style={{ backgroundColor: bg, color: tc }}
                              >
                                <div className="text-[11px] font-mono font-semibold truncate">{tok}</div>
                                <div className="text-[10px] font-mono">{p.toFixed(4)}</div>
                                <div
                                  className="mt-0.5 h-0.5 rounded-full"
                                  style={{
                                    width: `${Math.min((p / maxProb) * 100, 100)}%`,
                                    backgroundColor: tc === "#fff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {isPipeActive("softmax") && (
                        <div className="mt-2 text-[11px] text-violet-600 bg-violet-50 rounded p-2 border border-violet-100">
                          <BlockMath math={`p_i = \\frac{e^{z_i / ${temperature}}}{\\sum_j e^{z_j / ${temperature}}}`} />
                        </div>
                      )}
                    </PipelineStep>

                    <PipelineArrow active={isArrowActive("softmax", "select")} />

                    {/* ④ select */}
                    <PipelineStep
                      num="4"
                      label="采样选词（argmax）"
                      active={isPipeActive("select")}
                      done={isPipeDone("select")}
                    >
                      {["select", "append", "complete"].includes(phase) && selectedToken && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">选中：</span>
                          <TokenBadge tok={selectedToken} variant={selectedToken === "<EOS>" ? "eos" : "active"} />
                          <span className="text-xs text-gray-400">
                            p = {(probs[selectedIdx] ?? 0).toFixed(4)}
                          </span>
                          {selectedToken === "<EOS>" && (
                            <span className="text-xs text-red-600 font-semibold">← 停止生成</span>
                          )}
                        </div>
                      )}
                    </PipelineStep>

                    <PipelineArrow active={isArrowActive("select", "append") || isArrowActive("select", "complete")} />

                    {/* ⑤ append + 自回归反馈 */}
                    <PipelineStep
                      num="5"
                      label="追加 → 自回归反馈（成为下一步输入）"
                      active={isPipeActive("append") || isPipeActive("complete")}
                      done={false}
                    >
                      {["append", "complete"].includes(phase) && (
                        <div className="mt-1 space-y-2">
                          <div className="flex flex-wrap gap-1 items-center">
                            {tokens.map((tok, i) => (
                              <TokenBadge
                                key={i}
                                tok={tok}
                                variant={
                                  tok === "<EOS>"
                                    ? "eos"
                                    : i === tokens.length - 1
                                    ? "active"
                                    : i < promptLen
                                    ? "prompt"
                                    : "generated"
                                }
                              />
                            ))}
                          </div>
                          {!finished && (
                            <div className="text-[11px] text-cyan-600 bg-cyan-50 border border-cyan-200 rounded px-2 py-1">
                              ↩ 以上序列作为第 {genStep + 1} 步的输入，完成一次自回归循环
                            </div>
                          )}
                          {finished && (
                            <div className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                              ✅ 生成结束{selectedToken === "<EOS>" ? "（遇到 &lt;EOS&gt;）" : "（达到最大步数）"}
                            </div>
                          )}
                        </div>
                      )}
                    </PipelineStep>
                  </div>

                  {/* 右侧：自回归反馈箭头（可视化循环） */}
                  <div className="hidden sm:flex flex-col items-center w-10 relative">
                    <div className="text-[10px] text-blue-400 font-semibold text-center leading-tight mb-1">
                      自<br />回<br />归<br />反<br />馈
                    </div>
                    <div
                      className={`flex-1 border-r-2 transition-all ${
                        ["append"].includes(phase)
                          ? "border-cyan-400 border-dashed"
                          : "border-gray-200 border-dashed"
                      }`}
                    />
                    <div
                      className={`text-lg transition-all ${
                        ["append"].includes(phase) ? "text-cyan-400" : "text-gray-200"
                      }`}
                    >
                      ↑
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ 自回归链（历史） ═══ */}
              <AutoregressiveChain
                completedSteps={completedSteps}
                promptLen={promptLen}
                currentGenStep={genStep}
                phase={phase}
              />

              {/* ═══ 进度条 ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">生成进度</h4>
                  <span className="text-xs text-gray-400">
                    {completedSteps.length} / {maxNewTokens} 步完成
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: maxNewTokens }).map((_, i) => {
                    const cs = completedSteps[i];
                    const isCurrent = i === genStep - 1 && !cs;
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-8 rounded text-[11px] flex items-center justify-center font-mono border transition-all ${
                          cs
                            ? cs.selectedToken === "<EOS>"
                              ? "bg-red-100 border-red-300 text-red-700 font-semibold"
                              : "bg-cyan-100 border-cyan-300 text-cyan-800 font-semibold"
                            : isCurrent
                            ? "bg-blue-100 border-blue-400 text-blue-600 animate-pulse font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        {cs ? cs.selectedToken : isCurrent ? "…" : String(i + 1)}
                      </div>
                    );
                  })}
                </div>

                {/* 当前子步骤进度 */}
                {genStep > 0 && (
                  <div className="mt-3 flex items-center gap-1 flex-wrap">
                    {["feed", "logits", "softmax", "select", "append"].map((p, idx, arr) => {
                      const realPhase = finished && p === "append" ? "complete" : p;
                      const isActive = phase === realPhase || (finished && p === "append" && phase === "complete");
                      const isDone = phaseIndex(phase) > phaseIndex(p);
                      return (
                        <div key={p} className="flex items-center gap-1">
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              isActive
                                ? "bg-blue-600 text-white shadow"
                                : isDone
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {PHASE_META[p]?.label ?? p}
                          </span>
                          {idx < arr.length - 1 && (
                            <span className="text-gray-300 text-xs">→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 完成结果 */}
              {finished && phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    生成完成 ✓
                  </h4>
                  <p className="text-xs text-emerald-700 mb-2">
                    最终序列（{tokens.length} 个 token）：
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tokens.map((tok, i) => (
                      <TokenBadge
                        key={i}
                        tok={tok}
                        variant={
                          tok === "<EOS>" ? "eos" : i < promptLen ? "prompt" : "generated"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-emerald-600 mt-3">
                    自回归共循环 {completedSteps.length} 次：每步输出的 token 追加到上下文，成为下一步的输入。
                  </p>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default AutoregressiveVisualizer;
