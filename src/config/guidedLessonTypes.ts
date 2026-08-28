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

export interface GuidedLessonBlueprint {
  id: number;
  title: string;
  intuition: string;
  formula: string;
  symbols: LessonSymbol[];
  flow: string[];
  misconception: string;
  debugTip: string;
  takeaway: string;
}

export interface GuidedLessonStep {
  phase: GuidedLessonPhase;
  title: string;
  description: string;
  formula?: string;
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
      title: `推演 ${index + 1}：${joint}`,
      description: `当前只关注“${joint}”这一关节，观察它接收什么，以及会把什么交给下一步。`,
      formula: lesson.formula,
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
