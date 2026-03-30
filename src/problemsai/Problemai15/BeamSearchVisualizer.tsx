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

// ── 子组件：场景简介（最重要的教育内容）────────────────────────────

function ProblemSceneCard({ beamWidth, vocabSize }: { beamWidth: number; vocabSize: number }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
      {/* 解决什么问题 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🎯</span>
        <h3 className="text-sm font-bold text-blue-900">束搜索解决什么问题？</h3>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed mb-3">
        AI 在生成文字时（翻译、续写、语音识别），需要<strong>一个词一个词地</strong>决策。
        每一步都有很多可选的词，选词方式不同，最终输出的句子质量差异很大。
      </p>

      {/* 两种策略对比 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div className="text-[11px] font-semibold text-gray-600 mb-1">❌ 贪心搜索（旧方法）</div>
          <div className="text-[10px] text-gray-500 leading-relaxed">
            每步只选<strong>概率最高</strong>的那个词。<br />
            快，但容易"走进死胡同"——前面的选择可能让后续的整体句子很糟糕。
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-2">
          <div className="text-[11px] font-semibold text-blue-700 mb-1">✅ 束搜索（本算法）</div>
          <div className="text-[10px] text-gray-600 leading-relaxed">
            同时保留 <strong>B={beamWidth} 条</strong>候选句子。<br />
            每步都扩展所有候选，最终选出整体得分最高的句子。
          </div>
        </div>
      </div>

      {/* 具体例子 */}
      <div className="bg-white rounded-lg border border-blue-100 p-3">
        <div className="text-[10px] text-gray-400 mb-2">📖 具体场景：AI 正在一词一词生成英文句子</div>
        <div className="flex flex-wrap items-start gap-2">
          <div className="flex flex-col gap-1">
            {[
              { color: "bg-blue-100 text-blue-700 border-blue-200", label: "路径①", seq: "the → cat → sat ..." },
              { color: "bg-violet-100 text-violet-700 border-violet-200", label: "路径②", seq: "a → cat → is ..." },
              { color: "bg-amber-100 text-amber-700 border-amber-200", label: "路径③", seq: "the → cat → on ..." },
            ].map(({ color, label, seq }) => (
              <div key={label} className={`text-[10px] px-2 py-1 rounded border font-mono ${color}`}>
                <span className="font-bold mr-1">{label}:</span>{seq}
              </div>
            ))}
          </div>
          <div className="flex items-center text-gray-300 text-lg self-center">→</div>
          <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-[10px] text-emerald-700 self-center">
            选出整体最优的一条
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mt-2">
          每一步 B={beamWidth} 条路径 × 词表{vocabSize}个词 = {beamWidth * vocabSize} 个候选，选出最优 {beamWidth} 条继续
        </div>
      </div>
    </div>
  );
}

// ── 子组件："束"是什么？────────────────────────────────────────

function BeamConceptCard({ beamWidth }: { beamWidth: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-800 mb-2">💡 "束"（Beam）是什么？</div>
      <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
        "束"就是<strong>一条正在构建中的候选句子</strong>（一条路径）。
        束宽 B={beamWidth} 意味着我们同时追踪 {beamWidth} 条这样的路径。
      </p>
      <div className="text-[10px] text-gray-400 bg-gray-50 rounded p-2 border border-gray-100">
        类比 GPS 导航：不只规划一条路，而是同时保留 {beamWidth} 条看起来最有希望的路线，
        行驶到终点再选出最优的那条。
      </div>
    </div>
  );
}

// ── 子组件：参数通俗说明 ──────────────────────────────────────────

function ParameterGuide({
  beamWidth,
  vocabSize,
  maxSteps,
  alpha,
}: {
  beamWidth: number;
  vocabSize: number;
  maxSteps: number;
  alpha: number;
}) {
  const params = [
    {
      label: "词表（vocab）",
      value: `${vocabSize} 个词`,
      tooltip: "AI 每步可选择的全部词。最后一个必须是结束符 <EOS>，表示句子结束。",
      color: "text-gray-600",
    },
    {
      label: "束宽 B",
      value: String(beamWidth),
      tooltip: `同时维护的候选句子数。B=1 退化为贪心搜索；B 越大质量越好，但计算量也越大（每步 ${beamWidth}×${vocabSize}=${beamWidth * vocabSize} 个候选）。`,
      color: "text-blue-600",
    },
    {
      label: "最大步数",
      value: `${maxSteps} 步`,
      tooltip: "最多生成几个词（即输出句子的最大长度）。遇到 <EOS> 会提前结束。",
      color: "text-gray-600",
    },
    {
      label: "长度惩罚 α",
      value: String(alpha),
      tooltip: `防止模型偏爱短句（短句的累积 log 概率往往更高）。α=0 完全不惩罚，α=1 完全按长度校正。当前 α=${alpha}：适中惩罚，鼓励生成合理长度的句子。`,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-800 mb-2">🔧 参数说明</div>
      <div className="grid grid-cols-2 gap-2">
        {params.map(({ label, value, tooltip, color }) => (
          <div key={label} className="text-[10px]">
            <div className={`font-semibold mb-0.5 ${color}`}>
              {label} = <span className="font-mono">{value}</span>
            </div>
            <div className="text-gray-400 leading-relaxed">{tooltip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 子组件：输入/输出说明 ─────────────────────────────────────────

function InputOutputCard({ vocab, beamWidth }: { vocab: string[]; beamWidth: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-800 mb-2">📥 输入 / 📤 输出</div>
      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div>
          <div className="text-blue-600 font-semibold mb-1">输入</div>
          <div className="space-y-1 text-gray-500">
            <div>• <strong>词表</strong>：可生成的词 → [{vocab.slice(0, 3).join(", ")}...]</div>
            <div>• <strong>束宽 B={beamWidth}</strong>：同时保留几条路径</div>
            <div>• <strong>语言模型</strong>（模拟）：给每个词打概率分</div>
          </div>
        </div>
        <div>
          <div className="text-emerald-600 font-semibold mb-1">输出</div>
          <div className="space-y-1 text-gray-500">
            <div>• <strong>最优句子</strong>：整体概率最高的单词序列</div>
            <div>• <strong>候选排名</strong>：所有完成的路径，按分数排序</div>
            <div>• 遇到 <strong>&lt;EOS&gt;</strong> 标记一条路径完成</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 子组件：分数通俗说明 ─────────────────────────────────────────

function ScoreExplainCard({ alpha }: { alpha: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="text-[11px] font-semibold text-amber-800 mb-1">📊 分数是什么意思？</div>
      <div className="text-[10px] text-gray-600 leading-relaxed space-y-1">
        <div>
          <strong>log 概率</strong>（log P）：模型对每个词的置信度，取对数后变成负数（越接近 0 表示概率越高）。
          把每步的 log 概率<strong>相加</strong>得到整条路径的累积分数。
        </div>
        {alpha > 0 && (
          <div>
            <strong>归一化分数</strong>：累积 log 概率 ÷ 长度惩罚因子，让长句和短句可以公平比较。
          </div>
        )}
        <div className="text-amber-700 bg-amber-100 rounded px-2 py-1 mt-1">
          例：log P = −2.3 比 log P = −5.1 好（更接近 0 = 模型更确信）
        </div>
      </div>
    </div>
  );
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
            {isGreedy ? "贪心路径（对比）" : `路径 ${idx + 1}（Beam ${idx + 1}）`}
            {isBest && <span className="ml-1 text-emerald-600">★ 最优</span>}
          </span>
        </div>
        {showScore && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400">得分</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${color.badge}`}>
              {beam.normScore.toFixed(3)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        {beam.tokens.length === 0 ? (
          <span className="text-[11px] text-gray-400 italic">（起点：空序列）</span>
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
          <span className="text-[10px] text-emerald-600 self-center font-semibold">✓ 已完成</span>
        )}
      </div>
      {showScore && (
        <div className="mt-1.5 text-[10px] text-gray-400 font-mono">
          累积 log P = {beam.logProb.toFixed(3)}
          <span className="ml-2 text-gray-300">（越接近 0 越好）</span>
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
            <th className="text-left py-1 pr-2 font-normal">来自路径</th>
            <th className="text-left py-1 pr-2 font-normal">扩展后的句子</th>
            <th className="text-right py-1 pr-2 font-normal">
              <span title="这一步选的词的置信度（越接近0越好）">当前词 log P</span>
            </th>
            <th className="text-right py-1 pr-2 font-normal">
              <span title="累积得分（越高越好）">路径总得分</span>
            </th>
            <th className="text-left py-1 font-normal">得分条</th>
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
                    路径{cand.parentBeamIdx + 1}
                  </span>
                </td>
                <td className="py-1 pr-2 font-mono">
                  <span className="text-gray-400 text-[10px]">{parentSeq.split(" ").slice(0, -1).join(" ")} </span>
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
                  {isSelected && <span className="ml-1 text-emerald-500 text-[9px]">✓ 保留</span>}
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
          共 {candidates.length} 个候选，仅展示前 12 个（按得分降序）
        </p>
      )}
      <div className="mt-2 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
        绿色高亮 = 被选中保留的路径；灰色淡化 = 被淘汰的路径
      </div>
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
              <span className={`text-[10px] w-16 shrink-0 font-semibold ${color.text}`}>
                路径{bi + 1}
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
            <span className="text-[10px] w-16 shrink-0 text-gray-400 font-semibold">贪心路径</span>
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
            <span className="ml-2 text-[10px] text-gray-400">（每步只选最高概率词）</span>
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
  const phaseInfo: Record<string, { label: string; desc: string }> = {
    init:     { label: "初始化",  desc: "从空序列出发，准备开始" },
    expand:   { label: "扩展",    desc: "每条路径尝试所有词" },
    score:    { label: "评分",    desc: "计算每个候选的累积分数" },
    prune:    { label: "剪枝",    desc: `只保留最优 ${total} 条路径` },
    complete: { label: "完成",    desc: "选出最优句子" },
  };
  const info = phaseInfo[phase] ?? { label: phase, desc: "" };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500">第 {current}/{total} 步</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
          {info.label}
        </span>
      </div>
      {info.desc && (
        <div className="text-[10px] text-gray-400 text-right">{info.desc}</div>
      )}
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
          { type: "string", key: "vocab",     label: "候选词表（逗号分隔，最后一项必须是 <EOS> 结束符）" },
          { type: "number", key: "beamWidth", label: "束宽 B：同时保留的候选路径数（1~4，1=贪心搜索）" },
          { type: "number", key: "maxSteps",  label: "最大步数：最多生成几个词（1~6）" },
          { type: "number", key: "alpha",     label: "长度惩罚 α（0=不惩罚短句，1=完全按长度校正）" },
          { type: "number", key: "seed",      label: "随机种子（改变此值可模拟不同的语言模型分布）" },
        ],

        inputFields: [
          {
            type: "string", key: "vocab",
            label: "候选词表（逗号分隔，最后一项是结束符）",
            placeholder: DEFAULT_VOCAB,
          },
          {
            type: "number", key: "beamWidth",
            label: "束宽 B（同时保留的路径数，1~4）",
            placeholder: String(DEFAULT_BEAM_WIDTH),
          },
          {
            type: "number", key: "maxSteps",
            label: "最大步数（输出最多几个词，1~6）",
            placeholder: String(DEFAULT_MAX_STEPS),
          },
          {
            type: "number", key: "alpha",
            label: "长度惩罚 α（0~1，防止模型偏爱短句）",
            placeholder: String(DEFAULT_ALPHA),
          },
          {
            type: "number", key: "seed",
            label: "随机种子（改变可得到不同示例）",
            placeholder: String(DEFAULT_SEED),
          },
        ],

        testCases: [
          {
            label: "默认（B=3，4步）",
            value: { vocab: DEFAULT_VOCAB, beamWidth: 3, maxSteps: 4, alpha: DEFAULT_ALPHA, seed: DEFAULT_SEED },
          },
          {
            label: "B=1 退化为贪心",
            value: { vocab: DEFAULT_VOCAB, beamWidth: 1, maxSteps: 4, alpha: 0, seed: DEFAULT_SEED },
          },
          {
            label: "宽束 B=4（质量更高）",
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
              {/* ═══ 核心思想 ═══ */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* ═══ 场景简介（FIRST！） ═══ */}
              <ProblemSceneCard beamWidth={beamWidth} vocabSize={vocab.length} />

              {/* ═══ "束"概念解释 ═══ */}
              <BeamConceptCard beamWidth={beamWidth} />

              {/* ═══ 输入/输出说明 ═══ */}
              <InputOutputCard vocab={vocab} beamWidth={beamWidth} />

              {/* ═══ 参数说明 ═══ */}
              <ParameterGuide
                beamWidth={beamWidth}
                vocabSize={vocab.length}
                maxSteps={maxSteps}
                alpha={alphaLenPenalty}
              />

              {/* ═══ 核心公式（可选参考） ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      核心计算公式（供参考）
                    </h3>
                    <div className="text-[10px] text-gray-500 mb-2">
                      每步从"父路径累积分"+"当前词的 log 概率"得到新分数，取最高的 B 条保留：
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                      <BlockMath math={
                        `\\hat{y}_{1:T}^{(b)} = \\operatorname{top}\\text{-}B\\left\\{\\log P(y_t \\mid y_{<t}) + \\text{score}_{t-1}^{(b)}\\right\\}`
                      } />
                    </div>
                    {alphaLenPenalty > 0 && (
                      <div className="mt-1 text-[10px] text-gray-500">
                        归一化（防止偏短）：
                        <InlineMath math={`\\tilde{s} = \\frac{\\log P}{lp(T,\\alpha)},\\quad lp(T,\\alpha)=\\frac{(5+T)^\\alpha}{6^\\alpha}`} />
                      </div>
                    )}
                  </div>
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
              </div>

              {/* ═══ 分数说明 ═══ */}
              {phase !== "init" && (
                <ScoreExplainCard alpha={alphaLenPenalty} />
              )}

              {/* ═══ 当前 Beam 状态 ═══ */}
              {beams.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    {phase === "complete" ? "最终序列排名" : `活跃路径（${beams.length} 条候选句子）`}
                  </h4>
                  {phase !== "complete" && (
                    <p className="text-[10px] text-gray-400 mb-3">
                      这是当前正在维护的 {beams.length} 条候选路径，每一条都是一个"半成品句子"
                    </p>
                  )}
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
                      ? `剪枝：从所有候选中保留最优 ${beamWidth} 条路径（绿色）`
                      : `评分：计算每个候选路径的分数`}
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-3">
                    分数 = 父路径分数 + 新词的 log P{alphaLenPenalty > 0 ? " ÷ 长度惩罚" : ""}。
                    分数越高（越接近 0），代表这条路径越有前途。
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
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    路径追踪（所有路径的当前状态）
                  </h4>
                  {greedyTokens.length > 0 && (
                    <p className="text-[11px] text-gray-400 mb-3">
                      虚线分隔的"贪心路径"是每步只选最高概率词时的结果，用于与束搜索对比。
                    </p>
                  )}
                  <BeamTreePanel
                    beams={beams}
                    greedyTokens={greedyTokens}
                  />
                </div>
              )}

              {/* ═══ 完成结果 ═══ */}
              {showFinished && finishedBeams.length > 0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                    束搜索完成 ✓ — 输出结果
                  </h4>
                  <p className="text-[11px] text-gray-500 mb-3">
                    以下是所有完成的路径，按得分从高到低排列。★ 最优就是束搜索的最终输出。
                  </p>

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

                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-blue-600 font-semibold text-base">{beamWidth}</div>
                      <div className="text-gray-500 text-[10px]">束宽 B（同时探索的路径数）</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-700 font-mono font-bold text-base">
                        {bestBeam?.normScore.toFixed(3)}
                      </div>
                      <div className="text-gray-500 text-[10px]">最优路径得分（归一化）</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-gray-700 font-semibold text-base">{finishedBeams.length}</div>
                      <div className="text-gray-500 text-[10px]">完成的路径总数</div>
                    </div>
                  </div>

                  {bestBeam && (
                    <div className="bg-white rounded-lg border border-emerald-200 p-3">
                      <div className="text-[11px] font-semibold text-emerald-700 mb-1">最终输出</div>
                      <div className="text-xs text-gray-700">
                        束搜索选出的最优句子：
                        <strong className="font-mono text-emerald-700 mx-1">{bestBeam.tokens.join(" → ")}</strong>
                        （得分 = {bestBeam.normScore.toFixed(4)}）
                      </div>
                      {greedyTokens.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          贪心搜索的结果：
                          <span className="font-mono text-gray-600 mx-1">{greedyTokens.join(" → ")}</span>
                          {bestBeam.tokens.join(",") !== greedyTokens.join(",")
                            ? "（不同！束搜索找到了更好的路径）"
                            : "（此示例中两者相同）"}
                        </div>
                      )}
                    </div>
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
