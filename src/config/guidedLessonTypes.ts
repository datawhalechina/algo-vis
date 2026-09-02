export type GuidedLessonPhase =
  | "intuition"
  | "symbols"
  | "formula"
  | "transition"
  | "reflection"
  | "debug"
  | "summary";

export interface LessonSymbol {
  symbol: string;
  meaning: string;
}

export interface LessonFlowJoint {
  id: string;
  label: string;
}

export interface GuidedLessonBlueprint {
  id: number;
  title: string;
  intuition: string;
  formula: string;
  symbols: LessonSymbol[];
  flow: LessonFlowJoint[];
  misconception: string;
  debugTip: string;
  takeaway: string;
}

export interface GuidedLessonStep {
  phase: GuidedLessonPhase;
  title: string;
  description: string;
  formula?: string;
  activeJointId?: string;
  activeFlowIndex?: number;
  finished?: boolean;
}

export function createGuidedLessonSteps(
  lesson: GuidedLessonBlueprint | undefined,
): GuidedLessonStep[] {
  if (!lesson) return [];

  return [
    {
      phase: "intuition",
      title: "先建立直觉",
      description: lesson.intuition,
      activeFlowIndex: 0,
    },
    {
      phase: "symbols",
      title: "认识公式符号",
      description: "先确认每个量代表什么，再观察它们如何组合。",
      activeFlowIndex: 0,
    },
    {
      phase: "formula",
      title: "拆解核心公式",
      description: "把公式中的输入、变换与输出逐项对应到下方流程。",
      formula: lesson.formula,
      activeFlowIndex: 0,
    },
    ...lesson.flow.map((joint, index) => ({
      phase: "transition" as const,
      title: `推演 ${index + 1}：${joint.label}`,
      description: `当前只关注“${joint.label}”这一关节，观察它接收什么，以及会把什么交给下一步。`,
      formula: lesson.formula,
      activeJointId: joint.id,
      activeFlowIndex: index,
    })),
    {
      phase: "reflection",
      title: "识别常见误区",
      description: lesson.misconception,
      activeFlowIndex: lesson.flow.length - 1,
    },
    {
      phase: "debug",
      title: "按顺序调试",
      description: lesson.debugTip,
      activeFlowIndex: lesson.flow.length - 1,
    },
    {
      phase: "summary",
      title: "一句话带走",
      description: lesson.takeaway,
      formula: lesson.formula,
      activeFlowIndex: lesson.flow.length - 1,
      finished: true,
    },
  ];
}

export function resolveSceneJointId(
  phase: GuidedLessonPhase,
  activeJointId: string | undefined,
  flow: LessonFlowJoint[],
): string | undefined {
  if (flow.length === 0) return undefined;
  if (phase === "transition") return activeJointId;
  if (phase === "reflection" || phase === "debug" || phase === "summary") {
    return flow[flow.length - 1].id;
  }
  return undefined;
}

export interface GuidedLessonSeed extends Omit<GuidedLessonBlueprint, "flow"> {
  flow: Array<string | LessonFlowJoint>;
  flowIds?: string[];
}

const FLOW_TERMS: Array<[RegExp, string]> = [
  [/输入|读取|取出|采样/, "read-input"],
  [/写入|输出|生成|得到|形成/, "write-output"],
  [/共享|shared/i, "shared-memory"],
  [/同步|屏障|边界/, "synchronize"],
  [/归约|合并|汇总|聚合|累加/, "aggregate"],
  [/计算|乘加|更新|变换/, "compute"],
  [/比较|判断|选择|筛选/, "select"],
  [/概率|分布|softmax/i, "distribution"],
  [/梯度|反传|优化/, "optimize"],
  [/节点|邻居|消息|图/, "graph-message"],
  [/token|序列|时间|轨迹/i, "sequence"],
  [/矩阵|窗口|卷积|特征/, "matrix"],
  [/缓存|内存|队列|流水/, "pipeline"],
  [/编码|解码/, "encode-decode"],
];

function stableLabelHash(label: string): string {
  let hash = 2166136261;
  for (const character of label) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 5);
}

export function createSemanticJointId(label: string): string {
  const terms = FLOW_TERMS
    .filter(([pattern]) => pattern.test(label))
    .map(([, term]) => term)
    .slice(0, 2);
  const prefix = terms.length > 0 ? terms.join("-") : "transform";
  return `${prefix}-${stableLabelHash(label)}`;
}

export function normalizeGuidedLessonBlueprint<T extends GuidedLessonSeed>(
  lesson: T,
): Omit<T, "flow" | "flowIds"> & GuidedLessonBlueprint {
  const normalizedFlow = lesson.flow.map((joint, index) => {
    if (typeof joint !== "string") return joint;
    return {
      id: lesson.flowIds?.[index] ?? createSemanticJointId(joint),
      label: joint,
    };
  });
  const normalized = { ...lesson, flow: normalizedFlow };
  delete normalized.flowIds;
  return normalized;
}
