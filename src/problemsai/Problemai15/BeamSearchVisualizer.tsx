import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import {
  generateBeamSearchSteps,
  BeamSearchState,
  Beam,
  Candidate,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const PROBLEM_ID = 10015;

interface BeamSearchInput extends ProblemInput {
  vocab: string;
  beamWidth: number;
  maxSteps: number;
  alpha: number;
  seed: number;
}

const DEFAULT_VOCAB = "the,cat,sat,on,mat,<EOS>";
const DEFAULT_BEAM_WIDTH = 3;
const DEFAULT_MAX_STEPS = 4;
const DEFAULT_ALPHA = 0.6;
const DEFAULT_SEED = 42;

// ── 颜色工具 ──────────────────────────────────────────────────────

const BEAM_COLORS = [
  { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-400"   },
  { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-400" },
  { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-400"  },
  { bg: "bg-rose-50",   border: "border-rose-300",   text: "text-rose-700",   badge: "bg-rose-100 text-rose-700",   dot: "bg-rose-400"   },
];

function scoreToWidth(score: number, minScore: number, maxScore: number): number {
  if (maxScore === minScore) return 60;
  return Math.round(10 + ((score - minScore) / (maxScore - minScore)) * 80);
}

// ── 子组件：单条 Beam 卡片 ─────────────────────────────────────────

function BeamCard({
  beam,
  idx,
  isBest,
  isGreedy,
  showScore,
}: {
  beam: Beam;
  idx: number;
  isBest?: boolean;
  isGreedy?: boolean;
  showScore?: boolean;
}) {
  const color = isGreedy
    ? { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-600", badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" }
    : BEAM_COLORS[idx % BEAM_COLORS.length] ?? BEAM_COLORS[0]!;

  return (
    <div
      className={`rounded-lg border px-3 py-2 transition-all duration-200 ${color.bg} ${color.border} ${
        isBest ? "ring-2 ring-emerald-400 shadow-md" : "shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
          <span className={`text-[10px] font-semibold ${color.text}`}>
            {isGreedy ? "贪心（对比）" : `Beam ${idx + 1}`}
            {isBest && <span className="ml-1 text-emerald-600">★ 最优</span>}
          </span>
        </div>
        {showScore && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${color.badge}`}>
            {beam.normScore.toFixed(3)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {beam.tokens.length === 0 ? (
          <span className="text-[11px] text-gray-400 italic">（空序列）</span>
        ) : (
          beam.tokens.map((tok, i) => (
            <span
              key={i}
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
                i === beam.tokens.length - 1
                  ? `${color.badge} ${color.border} font-bold`
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              {tok}
            </span>
          ))
        )}
        {beam.isFinished && (
          <span className="text-[10px] text-emerald-600 self-center">✓EOS</span>
        )}
      </div>
      {showScore && (
        <div className="mt-1.5 text-[10px] text-gray-400 font-mono">
          log P = {beam.logProb.toFixed(3)}
        </div>
      )}
    </div>
  );
}

// ── 子组件：候选列表 ─────────────────────────────────────────────

function CandidateTable({
  candidates,
  selected,
  beams,
  beamWidth,
}: {
  candidates: Candidate[];
  selected: Candidate[];
  beams: Beam[];
  beamWidth: number;
}) {
  if (candidates.length === 0) return null;

  const selectedKeys = new Set(
    selected.map((c) => `${c.parentBeamIdx}-${c.token}`)
  );
  const scores = candidates.map((c) => c.newNormScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // 按 score 降序展示前 12 个
  const sorted = [...candidates].sort((a, b) => b.newNormScore - a.newNormScore).slice(0, 12);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left py-1 pr-2 font-normal">父 Beam</th>
            <th className="text-left py-1 pr-2 font-normal">扩展 Token</th>
            <th className="text-right py-1 pr-2 font-normal">
              <InlineMath math="\log P(\text{tok})" />
            </th>
            <th className="text-right py-1 pr-2 font-normal">累积分数</th>
            <th className="text-left py-1 font-normal">分数条</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cand, i) => {
            const key = `${cand.parentBeamIdx}-${cand.token}`;
            const isSelected = selectedKeys.has(key);
            const color = BEAM_COLORS[cand.parentBeamIdx % BEAM_COLORS.length]!;
            const parentBeam = beams[cand.parentBeamIdx];
            const parentSeq = parentBeam ? [...parentBeam.tokens, cand.token].join(" ") : cand.token;
            const w = scoreToWidth(cand.newNormScore, minScore, maxScore);
            return (
              <tr
                key={i}
                className={`border-b border-gray-50 ${
                  isSelected
                    ? "bg-emerald-50 font-semibold"
                    : i >= beamWidth
                    ? "opacity-40"
                    : ""
                }`}
              >
                <td className="py-1 pr-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${color.badge}`}>
                    B{cand.parentBeamIdx + 1}
                  </span>
                </td>
                <td className="py-1 pr-2 font-mono">
                  <span className="text-gray-500 text-[10px]">{parentSeq.split(" ").slice(0, -1).join(" ")} </span>
                  <span className={`font-bold ${isSelected ? "text-emerald-700" : "text-gray-800"}`}>
                    {cand.token}
                  </span>
                </td>
                <td className="py-1 pr-2 text-right text-gray-500 font-mono">
                  {cand.tokenLogProb.toFixed(3)}
                </td>
                <td className="py-1 pr-2 text-right font-mono">
                  <span className={isSelected ? "text-emerald-700" : "text-gray-600"}>
                    {cand.newNormScore.toFixed(3)}
                  </span>
                  {isSelected && <span className="ml-1 text-emerald-500 text-[9px]">✓</span>}
                </td>
                <td className="py-1">
                  <div className="h-3 w-24 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${
                        isSelected ? "bg-emerald-400" : "bg-blue-300"
                      }`}
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {candidates.length > 12 && (
        <p className="text-[10px] text-gray-400 mt-1">
          共 {candidates.length} 个候选，仅展示前 12 个（按分数降序）
        </p>
      )}
    </div>
  );
}

// ── 子组件：搜索树路径图 ─────────────────────────────────────────

function BeamTreePanel({
  beams,
  greedyTokens,
}: {
  beams: Beam[];
  greedyTokens: string[];
}) {
  if (beams.length === 0) return null;
  const maxLen = Math.max(...beams.map((b) => b.tokens.length), greedyTokens.length);
  if (maxLen === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="space-y-2 min-w-[300px]">
        {beams.map((beam, bi) => {
          const color = BEAM_COLORS[bi % BEAM_COLORS.length]!;
          return (
            <div key={bi} className="flex items-center gap-0">
              <span className={`text-[10px] w-14 shrink-0 font-semibold ${color.text}`}>
                B{bi + 1}
              </span>
              <div className="flex items-center gap-0">
                {beam.tokens.map((tok, ti) => (
                  <div key={ti} className="flex items-center">
                    <span
                      className={`text-[11px] font-mono px-2 py-1 rounded border ${
                        ti === beam.tokens.length - 1
                          ? `${color.badge} ${color.border} font-bold`
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      {tok}
                    </span>
                    {ti < beam.tokens.length - 1 && (
                      <span className="text-gray-300 mx-0.5 text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
              <span className={`ml-2 text-[10px] font-mono ${color.text}`}>
                ({beam.normScore.toFixed(3)})
              </span>
            </div>
          );
        })}
        {greedyTokens.length > 0 && (
          <div className="flex items-center gap-0 border-t border-dashed border-gray-200 pt-2 mt-1">
            <span className="text-[10px] w-14 shrink-0 text-gray-400 font-semibold">贪心</span>
            <div className="flex items-center gap-0">
              {greedyTokens.map((tok, ti) => (
                <div key={ti} className="flex items-center">
                  <span className="text-[11px] font-mono px-2 py-1 rounded border bg-gray-50 border-gray-200 text-gray-500">
                    {tok}
                  </span>
                  {ti < greedyTokens.length - 1 && (
                    <span className="text-gray-300 mx-0.5 text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 步骤进度条 ────────────────────────────────────────────────────

function StepProgress({
  current,
  total,
  phase,
}: {
  current: number;
  total: number;
  phase: string;
}) {
  const phaseLabel: Record<string, string> = {
    init: "初始化",
    expand: "扩展",
    score: "评分",
    prune: "剪枝",
    complete: "完成",
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500">
        步骤 {current}/{total}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
        {phaseLabel[phase] ?? phase}
      </span>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────

function BeamSearchVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<BeamSearchInput, Record<string, never>>
      config={{
        defaultInput: {
          vocab: DEFAULT_VOCAB,
          beamWidth: DEFAULT_BEAM_WIDTH,
          maxSteps: DEFAULT_MAX_STEPS,
          alpha: DEFAULT_ALPHA,
          seed: DEFAULT_SEED,
        },

        algorithm: (input) => {
          const vocab =
            typeof input.vocab === "string" && input.vocab.trim()
              ? input.vocab
              : DEFAULT_VOCAB;
          const beamWidth =
            typeof input.beamWidth === "number" ? Math.round(input.beamWidth) : DEFAULT_BEAM_WIDTH;
          const maxSteps =
            typeof input.maxSteps === "number" ? Math.round(input.maxSteps) : DEFAULT_MAX_STEPS;
          const alpha =
            typeof input.alpha === "number" ? input.alpha : DEFAULT_ALPHA;
          const seed =
            typeof input.seed === "number" ? input.seed : DEFAULT_SEED;
          return generateBeamSearchSteps(vocab, beamWidth, maxSteps, alpha, seed);
        },

        inputTypes: [
          { type: "string", key: "vocab",     label: "词表（逗号分隔，最后一项为EOS）" },
          { type: "number", key: "beamWidth", label: "束宽 B（1~4）" },
          { type: "number", key: "maxSteps",  label: "最大步数（1~6）" },
          { type: "number", key: "alpha",     label: "长度惩罚 α（0~1）" },
          { type: "number", key: "seed",      label: "随机种子" },
        ],

        inputFields: [
          { type: "string", key: "vocab",     label: "词表（逗号分隔，最后一项为EOS）", placeholder: DEFAULT_VOCAB },
          { type: "number", key: "beamWidth", label: "束宽 B（1~4）",                  placeholder: String(DEFAULT_BEAM_WIDTH) },
          { type: "number", key: "maxSteps",  label: "最大步数（1~6）",                 placeholder: String(DEFAULT_MAX_STEPS) },
          { type: "number", key: "alpha",     label: "长度惩罚 α（0~1）",              placeholder: String(DEFAULT_ALPHA) },
          { type: "number", key: "seed",      label: "随机种子",                       placeholder: String(DEFAULT_SEED) },
        ],

        testCases: [
          {
            label: "默认（B=3，4步）",
            value: { vocab: DEFAULT_VOCAB, beamWidth: 3, maxSteps: 4, alpha: DEFAULT_ALPHA, seed: DEFAULT_SEED },
          },
          {
            label: "贪心对比（B=1）",
            value: { vocab: DEFAULT_VOCAB, beamWidth: 1, maxSteps: 4, alpha: 0, seed: DEFAULT_SEED },
          },
          {
            label: "宽束（B=4，5步）",
            value: { vocab: "I,am,a,cat,dog,mat,<EOS>", beamWidth: 4, maxSteps: 5, alpha: 0.6, seed: 7 },
          },
        ],

        render: ({ variables }) => {
          const state = variables as unknown as BeamSearchState | undefined;
          const phase             = state?.phase ?? "init";
          const step              = state?.step ?? 0;
          const maxSteps          = state?.maxSteps ?? DEFAULT_MAX_STEPS;
          const beamWidth         = state?.beamWidth ?? DEFAULT_BEAM_WIDTH;
          const vocab             = state?.vocab ?? [];
          const beams             = (state?.beams ?? []) as Beam[];
          const candidates        = (state?.candidates ?? []) as Candidate[];
          const selectedCandidates = (state?.selectedCandidates ?? []) as Candidate[];
          const finishedBeams     = (state?.finishedBeams ?? []) as Beam[];
          const greedyTokens      = (state?.greedyTokens ?? []) as string[];
          const alphaLenPenalty   = state?.alphaLenPenalty ?? DEFAULT_ALPHA;

          const showCandidates  = ["score", "prune"].includes(phase);
          const showTree        = ["expand", "score", "prune", "complete"].includes(phase);
          const showFinished    = phase === "complete";

          const bestBeam = finishedBeams[0];

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900">束搜索（Beam Search）</h3>

                    {/* 核心公式 */}
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                      <BlockMath math={
                        `\\hat{y}_{1:T}^{(b)} = \\operatorname{top}\\text{-}B\\left\\{\\log P(y_t \\mid y_{<t}) + \\text{score}_{t-1}^{(b)}\\right\\}`
                      } />
                    </div>

                    {/* 长度惩罚 */}
                    <div className="mt-1 text-[11px] text-gray-500">
                      归一化分数：
                      <InlineMath math={`\\tilde{s} = \\frac{\\log P}{lp(T,\\alpha)},\\quad lp(T,\\alpha)=\\frac{(5+T)^\\alpha}{6^\\alpha}`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      α = {alphaLenPenalty}（0 = 不惩罚，1 = 完全惩罚）；词表大小 = {vocab.length}
                    </p>
                  </div>

                  {/* 参数 badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                      B = {beamWidth}
                    </span>
                    {phase !== "init" && (
                      <span className="text-[11px] text-gray-400">
                        第 {step} / {maxSteps} 步
                      </span>
                    )}
                  </div>
                </div>

                {/* 进度条 */}
                {phase !== "init" && (
                  <div className="mt-3">
                    <StepProgress current={step} total={maxSteps} phase={phase} />
                  </div>
                )}

                {/* 束搜索 vs 贪心对比说明 */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="font-semibold text-blue-700 mb-1">束搜索（本题）</div>
                    <div className="text-gray-600">同时维护 <strong>B 条</strong>路径，避免局部最优，质量更高</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <div className="font-semibold text-gray-500 mb-1">贪心搜索（对比）</div>
                    <div className="text-gray-400">每步只保留 <strong>1 条</strong>路径，速度快但容易陷入局部最优</div>
                  </div>
                </div>
              </div>

              {/* ═══ 当前 Beam 状态 ═══ */}
              {beams.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    {phase === "complete" ? "最终序列排名" : `活跃 Beam（${beams.length} 条）`}
                  </h4>
                  <div className="space-y-2">
                    {beams.map((beam, bi) => (
                      <BeamCard
                        key={bi}
                        beam={beam}
                        idx={bi}
                        isBest={phase === "complete" && bi === 0}
                        showScore={phase !== "init"}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ 候选评分（score / prune 阶段）═══ */}
              {showCandidates && candidates.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    {phase === "prune"
                      ? `候选剪枝：保留 top-${beamWidth}（绿色高亮）`
                      : `候选评分：所有扩展候选`}
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-3">
                    累积分数 ={" "}
                    <InlineMath math="\text{score}_{t-1} + \log P(y_t \mid y_{<t})" />
                    {alphaLenPenalty > 0 && (
                      <span>，除以长度惩罚 <InlineMath math="lp(T, \alpha)" /></span>
                    )}
                  </p>
                  <CandidateTable
                    candidates={candidates}
                    selected={selectedCandidates}
                    beams={beams}
                    beamWidth={beamWidth}
                  />
                </div>
              )}

              {/* ═══ 搜索树可视化 ═══ */}
              {showTree && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    搜索路径追踪
                    {greedyTokens.length > 0 && (
                      <span className="text-[11px] text-gray-400 ml-2 font-normal">
                        （虚线：贪心路径，仅供对比）
                      </span>
                    )}
                  </h4>
                  <BeamTreePanel
                    beams={beams}
                    greedyTokens={greedyTokens}
                  />
                </div>
              )}

              {/* ═══ 完成结果 ═══ */}
              {showFinished && finishedBeams.length > 0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">
                    束搜索完成 ✓ — 最终候选排名
                  </h4>

                  <div className="space-y-2 mb-4">
                    {finishedBeams.map((beam, bi) => (
                      <BeamCard
                        key={bi}
                        beam={beam}
                        idx={bi}
                        isBest={bi === 0}
                        showScore={true}
                      />
                    ))}
                    {greedyTokens.length > 0 && (
                      <BeamCard
                        beam={{ tokens: greedyTokens, logProb: 0, normScore: 0, isFinished: false }}
                        idx={99}
                        isGreedy={true}
                        showScore={false}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-blue-600 font-semibold text-base">{beamWidth}</div>
                      <div className="text-gray-500">束宽 B</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-700 font-mono font-bold text-base">
                        {bestBeam?.normScore.toFixed(3)}
                      </div>
                      <div className="text-gray-500">最优归一化分数</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-gray-700 font-semibold text-base">{finishedBeams.length}</div>
                      <div className="text-gray-500">完成序列数</div>
                    </div>
                  </div>

                  {bestBeam && (
                    <p className="text-xs text-emerald-700 mt-3">
                      最优序列：
                      <strong className="font-mono">{bestBeam.tokens.join(" → ")}</strong>
                      （归一化分数 = {bestBeam.normScore.toFixed(4)}）。
                      {greedyTokens.length > 0 && (
                        <span className="text-gray-600">
                          {" "}贪心序列：{greedyTokens.join(" → ")}。
                          束搜索通过同时探索 {beamWidth} 条路径，{" "}
                          {bestBeam.normScore !== 0 ? "找到了更优的生成结果。" : "在此示例中结果相近。"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default BeamSearchVisualizer;
