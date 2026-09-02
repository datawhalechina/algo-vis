import type { GuidedLessonBlueprint } from "../../guidedLessonTypes.ts";
import type {
  EntityRole,
  EntityStatus,
  FormulaBinding,
  LessonSceneEntity,
  LessonSceneFrame,
  LessonSceneKind,
  LessonSceneSpec,
  SceneEntityState,
  SceneValue,
} from "../../lessonSceneTypes.ts";
import { AI_FORMULA_BINDINGS } from "./formulaBindings.ts";

export const AI_LESSON_IDS = [
  10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10080, 10081,
  10082, 10083, 10084, 10085, 10086, 10087, 10088, 10089, 10090, 10091,
  10092, 10093, 10094, 10095, 10096, 10097, 10098, 10099, 10100, 10101,
  10102, 10103, 10104, 10105, 10106, 10107, 10108, 10109, 10110,
  10111, 10112, 10113, 10114, 10115, 10116, 10117, 10118,
  10119, 10120, 10121, 10122, 10123, 10124, 10125, 10126,
  10127, 10128, 10129, 10130, 10131, 10132, 10133, 10134,
] as const;

export type AiLessonId = (typeof AI_LESSON_IDS)[number];

type AiSceneValue = SceneValue;

export interface AiSceneProfile {
  kind: LessonSceneKind;
  entityLabels: string[];
  sampleValues: AiSceneValue[];
  stepValues: AiSceneValue[];
  explanations: string[];
  unit?: string;
}

export type AiSceneProfileTable = Partial<Record<AiLessonId, AiSceneProfile>>;

type Indices = number | readonly number[];
type AiInputSnapshot = ReadonlyMap<number, AiSceneValue>;

interface AiLessonSemantics {
  targets: readonly Indices[];
  sources: readonly Indices[];
  expressions?: Readonly<Record<number, string>>;
  routes?: Readonly<Record<number, readonly { from: number; to: number }[]>>;
  writes?: Readonly<Record<number, Readonly<Record<number, AiSceneValue>>>>;
  expectedWrites?: Readonly<Record<number, Readonly<Record<number, AiSceneValue>>>>;
  deriveExpected?: Readonly<Record<
    number,
    Readonly<Record<number, (inputs: AiInputSnapshot) => AiSceneValue>>
  >>;
  connections?: readonly {
    from: number;
    to: number;
    revealAt: number;
    label?: string;
  }[];
}

// These independently authored expectations are the debug oracle. Profile values
// drive the animation; changing one without the other makes validation fail.
const EXPECTED_STEP_VALUES: Record<AiLessonId, readonly AiSceneValue[]> = {
  10072: [0, 6, 5, 5],
  10073: [3, 9, 4, 4],
  10074: [2, 5, 9, 9],
  10075: [4, 9, 6, 16],
  10076: [3, 4, 14, 14],
  10077: [4, 4, 5, 8],
  10078: [2, -1, 2, 1],
  10079: [64, 16, 28, 88],
  10080: [6, 9, 4, 5, 4],
  10081: [1, 3, 3, 2, 7],
  10082: [0.6, 0.2, 0.5, 0.46],
  10083: [0, 3, 0.54, 3],
  10084: [1, 0.42, 0.25, 0.03],
  10085: [0.73, 0.6, 0.44, 0.31],
  10086: [16, 4, 2112, 0.86],
  10087: [0.64, 0.51, 0.51, 1.15, 0.18],
  10088: [0.72, 0.72, 42, 2],
  10089: [5, 8, 0.18, 1.71, 0.63],
  10090: [0.8, 0.55, 0.62, 7],
  10091: [4, 0.81, 0.37, 0.24, 0.34],
  10092: [3, 0.68, 0.74, 17],
  10093: [1, 0.1, [0.2, 0.98], 0.35, 0.75, 0.22],
  10094: [3, 0.71, 0.67, 2.34],
  10095: [0.5, 4, 1.2, 0.7],
  10096: [1, 0.499, 2.4, 3.1, 1.049, 0.93],
  10097: [0.3, 0.61, 0.82, 0.9],
  10098: [0.58, 0.62, 3, 0.79, 0.91, 1],
  10099: [0.9, 0.25, 1, 0.0004],
  10100: [5, 10, -1.3, -1.5, 2, 1, -0.86],
  10101: [5760, 12, 80, 1.7, 1],
  10102: [1, 3, 0.41, 1.64, 0.84, 4],
  10103: [1, 0.72, 0.33, 0.06, 12, 0.81, 2],
  10104: [1, 2, 4, 0.62, 7, 6, 0.74],
  10105: [0.64, 1.3, 0.79, 0.71, 1.18],
  10106: [80, 20, 0.61, 0.83, 0.42, 0.07, 0.91],
  10107: [0.72, 0.8, 1.34, 0.57, 2, 0.88, 0.06],
  10108: [1, 0.3, 0.18, 0.76, 0.63],
  10109: [3, 0.65, 0.72, 1000, 0.8],
  10110: [3, 0.67, 0.82, 2, 0.94],
  10111: [0.9, 0.72, 0.68, 0.86],
  10112: [0.02, 0.73, 1, 0.81, 0.78],
  10113: [0.61, 4, 1, 0.74, 0.82],
  10114: [0.58, 0.8, 0.69, 0.76, 0.84],
  10115: [0.24, 0.42, 0.57, 0.71, 0.88, 0.91],
  10116: [0.78, 0.43, 0.18, 0.7, 0.89],
  10117: [0.64, 0.83, 0.37, 0.29, 0.76],
  10118: [0.92, 1, 0.74, 0.96, 0.81],
  10119: [0.18, 0.67, 0.74, 0.51],
  10120: [0.9, 0.31, 0.22, 0.18, 0.86],
  10121: [0.76, 0.4, 0.28, 0.08, 0.63],
  10122: [0.62, 0.74, 0.51, 0.87, 0.79],
  10123: [0.68, 0.81, 0.77, 0.73, 0.34],
  10124: [0.2, 0.84, 0.66, 0.18, 0.37],
  10125: [0.9, 0.68, 0.86, 0.72, 0.79],
  10126: [0.71, 0.58, 0.42, 0.76, 0.88],
  10127: [0.4, 0.6, 0.25, 0.55, 0.72],
  10128: [0.4, 0.82, 0.18, 0.36, 0.71],
  10129: [0.68, 0.82, 0.31, 0.55, 0.86, 0.77],
  10130: [0.55, 0.91, 0.8, 0.27, 0.63, 0.83],
  10131: [0.25, 0.88, 0.61, 0.73, 0.12],
  10132: [0.9, 0.48, 0.67, 0.6, 1],
  10133: [0.62, 0.71, 0.66, 0.79, 0.88],
  10134: [0.7, 0.35, 0.64, 0.28, 0.82],
};

function numberValue(value: AiSceneValue): number {
  if (typeof value !== "number") throw new Error("Expected a numeric AI scene value");
  return value;
}

function inputValue(inputs: AiInputSnapshot, index: number): AiSceneValue {
  const value = inputs.get(index);
  if (value === undefined) throw new Error(`Missing AI derivation input ${index}`);
  return value;
}

function numberInput(inputs: AiInputSnapshot, index: number): number {
  return numberValue(inputValue(inputs, index));
}

function numberVectorInput(inputs: AiInputSnapshot, index: number): number[] {
  return numberVector(inputValue(inputs, index));
}

function inputLength(inputs: AiInputSnapshot, index: number): number {
  const value = inputValue(inputs, index);
  if (!Array.isArray(value)) throw new Error(`Expected AI derivation input ${index} to be a list`);
  return value.length;
}

function numberVector(value: AiSceneValue): number[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "number")) {
    throw new Error("Expected a numeric AI scene vector");
  }
  return value as number[];
}

function roundTo(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

const AI_LESSON_SEMANTICS: Record<AiLessonId, AiLessonSemantics> = {
  10072: {
    targets: [1, 2, 3, 4],
    sources: [[0], [1, 6, 7], [2, 5, 8], [3]],
    expressions: {
      0: "X_{\\mathrm{pad}}=\\operatorname{pad}(X,0)",
      1: "n_{\\mathrm{real}}=6",
      2: "0\\cdot0+1\\cdot1+2\\cdot0+0\\cdot0+3\\cdot1+4\\cdot0+0\\cdot0+5\\cdot0+6\\cdot0+1=5",
      3: "Y_{0,0}=5",
    },
    writes: {
      1: { 2: [0, 1, 2, 0, 3, 4, 0, 5, 6] },
    },
    expectedWrites: {
      1: { 2: [0, 1, 2, 0, 3, 4, 0, 5, 6] },
    },
    deriveExpected: {
      2: {
        3: (inputs) => numberVectorInput(inputs, 2).reduce(
          (sum, value, index) => sum + value * numberVectorInput(inputs, 5)[index],
          numberInput(inputs, 8),
        ),
      },
      3: { 4: (inputs) => inputValue(inputs, 3) },
    },
  },
  10073: { targets: [1, 2, 3, 4], sources: [[5, 7], [0, 8], [1, 2, 6], [1, 2, 3, 6]] },
  10074: { targets: [1, 2, 3, 4], sources: [[0], [0, 1], [5, 6, 7, 8], [3]] },
  10075: { targets: [1, 2, 3, 4], sources: [[0, 6], [0, 6], [2], [3, 5, 8]] },
  10076: {
    targets: [1, [2, 3], 4, 9],
    sources: [[5, 12], [6, 7, 12], [1, 2, 3, 8], [4]],
    writes: { 1: { 2: 4, 3: 5 } },
    expectedWrites: { 1: { 2: 4, 3: 5 } },
    routes: {
      1: [
        { from: 6, to: 2 }, { from: 12, to: 2 },
        { from: 7, to: 3 }, { from: 12, to: 3 },
      ],
    },
    expressions: {
      2: "[3,4,5]\\cdot[1,1.5,1]=3+6+5=14",
    },
    deriveExpected: {
      2: {
        4: (inputs) => [1, 2, 3].reduce(
          (sum, index, weightIndex) =>
            sum + numberInput(inputs, index) * numberVectorInput(inputs, 8)[weightIndex],
          0,
        ),
      },
      3: { 9: (inputs) => inputValue(inputs, 4) },
    },
  },
  10077: { targets: [1, 2, 3, 4], sources: [[0, 8], [1, 8], [1, 2], [3, 6]] },
  10078: {
    targets: [1, 2, 3, 4],
    sources: [[0], [1], [0], [2, 3]],
    expressions: { 3: "\\phi(-1+2)=1" },
    deriveExpected: { 3: { 4: (inputs) => numberInput(inputs, 2) + numberInput(inputs, 3) } },
  },
  10079: {
    targets: [1, 2, [3, 5, 6], [4, 8]],
    sources: [[0], [1], [0, 2], [2, 3, 5, 6]],
    writes: { 2: { 3: 28, 5: 24, 6: 20 } },
    expectedWrites: { 2: { 3: 28, 5: 24, 6: 20 } },
    routes: {
      2: [
        { from: 2, to: 3 },
        { from: 2, to: 5 },
        { from: 0, to: 6 },
      ],
      3: [2, 3, 5, 6].flatMap((from) => [4, 8].map((to) => ({ from, to }))),
    },
    expressions: { 3: "C_Y=16+28+24+20=88" },
    deriveExpected: {
      3: {
        4: (inputs) => [2, 3, 5, 6].reduce((sum, index) => sum + numberInput(inputs, index), 0),
        8: (inputs) => [2, 3, 5, 6].reduce((sum, index) => sum + numberInput(inputs, index), 0),
      },
    },
  },
  10080: {
    targets: [1, 2, 3, 4, 5],
    sources: [[6, 7], [0, 7], [1, 2, 6], [3], [4]],
    expressions: { 0: "n_{\\mathrm{window}}=K C_{in}=3\\times2=6" },
    deriveExpected: {
      0: { 1: (inputs) => numberInput(inputs, 6) * numberInput(inputs, 7) },
    },
  },
  10081: {
    targets: [1, 2, 3, 4, 5],
    sources: [[0], [0], [1, 2], [1, 3], [3, 4, 6]],
    expressions: { 4: "r_2=r_1+(K_2-1)j_1=3+(3-1)\\times2=7" },
    deriveExpected: {
      4: {
        5: (inputs) => numberInput(inputs, 3)
          + (numberInput(inputs, 6) - 1) * numberInput(inputs, 4),
      },
    },
  },
  10082: { targets: [1, 2, 3, 0], sources: [[4], [5], [1, 2], [3]] },
  10083: { targets: [1, 2, 3, 0], sources: [[4], [5], [1, 2], [3]] },
  10084: { targets: [1, 2, 3, 0], sources: [[1], [1], [2], [3]] },
  10085: { targets: [1, 2, 3, 0], sources: [[1], [2], [1, 2, 4], [1, 3]] },
  10086: {
    targets: [[1, 2], [3, 4], [5, 6], 0],
    sources: [[7], [8, 9], [1, 2, 3, 4], [5, 6]],
    writes: {
      0: { 1: 16, 2: 16 },
      1: { 3: 4, 4: 3 },
      2: { 5: 2112, 6: 1584 },
    },
    expectedWrites: {
      0: { 1: 16, 2: 16 },
      1: { 3: 4, 4: 3 },
      2: { 5: 2112, 6: 1584 },
    },
    expressions: {
      2: "N_{LSTM}=4(16\\cdot16+16^2+16)=2112,\\quad N_{GRU}=1584",
    },
    routes: {
      1: [{ from: 8, to: 3 }, { from: 9, to: 4 }],
      2: [
        { from: 1, to: 5 },
        { from: 1, to: 6 },
        { from: 2, to: 5 },
        { from: 2, to: 6 },
        { from: 3, to: 5 },
        { from: 4, to: 6 },
      ],
    },
    deriveExpected: {
      0: {
        1: (inputs) => inputValue(inputs, 7),
        2: (inputs) => inputValue(inputs, 7),
      },
      1: {
        3: (inputs) => inputLength(inputs, 8),
        4: (inputs) => inputLength(inputs, 9),
      },
      2: {
        5: (inputs) => numberInput(inputs, 3) * (
          numberInput(inputs, 1) * numberInput(inputs, 2)
          + numberInput(inputs, 2) ** 2
          + numberInput(inputs, 2)
        ),
        6: (inputs) => numberInput(inputs, 4) * (
          numberInput(inputs, 1) * numberInput(inputs, 2)
          + numberInput(inputs, 2) ** 2
          + numberInput(inputs, 2)
        ),
      },
    },
  },
  10087: { targets: [1, 2, 3, 4, 0], sources: [[1], [2], [2], [1, 3], [4]] },
  10088: {
    targets: [1, 4, 3, 0],
    sources: [[1], [1], [2, 4], [1, 3]],
    expressions: { 2: "y_0=\\operatorname{decode}(BOS{=}1,c{=}0.72)=42" },
    deriveExpected: { 1: { 4: (inputs) => inputValue(inputs, 1) } },
  },
  10089: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [3, 4]] },
  10090: { targets: [1, 2, 3, 0], sources: [[1], [1], [2], [3]] },
  10091: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1, 2], [3], [2, 4]] },
  10092: {
    targets: [1, 2, [3, 6, 7], 4],
    sources: [[0, 5], [1], [2], [3, 8]],
    writes: { 2: { 3: 0.74, 6: 1, 7: 0.68 } },
    expectedWrites: { 2: { 3: 0.74, 6: 1, 7: 0.68 } },
  },
  10093: {
    targets: [1, 2, 3, 4, 5, 6],
    sources: [[1], [0, 7, 9], [0, 2, 10, 11], [0, 4], [4, 8], [3, 5]],
    expressions: {
      1: "f_i=10000^{-2i/d}=10000^{-2/8}=0.1",
      2: "[\\sin(pf_i),\\cos(pf_i)]=[\\sin(0.2),\\cos(0.2)]\\approx[0.20,0.98]",
    },
    deriveExpected: {
      1: {
        2: (inputs) => roundTo(
          1 / (10000 ** (2 * numberInput(inputs, 9) / numberInput(inputs, 7))),
        ),
      },
      2: {
        3: (inputs) => {
          const angle = numberInput(inputs, 0) * numberInput(inputs, 2);
          return [roundTo(Math.sin(angle)), roundTo(Math.cos(angle))];
        },
      },
    },
  },
  10094: {
    targets: [[5, 6, 7], 2, 3, [4, 8]],
    sources: [[0], [5, 6], [2], [3, 7]],
    writes: { 0: { 5: 1, 6: 1, 7: 3 }, 3: { 4: 2.34, 8: 2.34 } },
    expectedWrites: { 0: { 5: 1, 6: 1, 7: 3 }, 3: { 4: 2.34, 8: 2.34 } },
    expressions: {
      0: "Q=HW^Q,\\quad K=HW^K,\\quad V=HW^V",
      1: "QK^{\\mathsf T}/\\sqrt{d_k}=0.71",
      2: "\\operatorname{softmax}(0.71+M)=0.67",
      3: "\\operatorname{Concat}(\\mathrm{head}_1,\\mathrm{head}_2)=2.34",
    },
    routes: {
      3: [3, 7].flatMap((from) => [4, 8].map((to) => ({ from, to }))),
    },
  },
  10095: { targets: [1, 2, 3, 4], sources: [[0], [1, 6], [2], [3, 7, 8]] },
  10096: {
    targets: [1, 2, 3, 4, 5, 6],
    sources: [
      [0, 12], [0, 7, 8, 9, 10, 11], [0, 13], [0, 14],
      [4, 7, 8, 9, 10, 11], [3, 5],
    ],
    expressions: {
      1: "1\\cdot\\frac{2-1}{\\sqrt{4+0.01}}+0\\approx0.499",
      2: "H_{pre}=2+0.4=2.4",
      3: "x+\\operatorname{Sublayer}(x)=2+1.1=3.1",
      4: "H_{post}=1\\cdot\\frac{3.1-1}{\\sqrt{4+0.01}}+0\\approx1.049",
    },
    deriveExpected: {
      1: {
        2: (inputs) => roundTo(
          numberInput(inputs, 10)
            * (numberInput(inputs, 0) - numberInput(inputs, 7))
            / Math.sqrt(numberInput(inputs, 8) + numberInput(inputs, 9))
            + numberInput(inputs, 11),
          3,
        ),
      },
      2: { 3: (inputs) => numberInput(inputs, 0) + numberInput(inputs, 13) },
      3: { 4: (inputs) => numberInput(inputs, 0) + numberInput(inputs, 14) },
      4: {
        5: (inputs) => roundTo(
          numberInput(inputs, 10)
            * (numberInput(inputs, 4) - numberInput(inputs, 7))
            / Math.sqrt(numberInput(inputs, 8) + numberInput(inputs, 9))
            + numberInput(inputs, 11),
          3,
        ),
      },
    },
  },
  10097: { targets: [1, 2, 3, 4], sources: [[0], [1, 8], [2, 5], [3, 6]] },
  10098: { targets: [1, 2, 3, 4, 5, 6], sources: [[0, 8], [1], [7], [2, 3], [4], [5]] },
  10099: { targets: [1, 2, 0, 3], sources: [[1], [2], [2], [0, 3]] },
  10100: {
    targets: [1, 2, 3, 4, [5, 7], 6, 0],
    sources: [[1], [1, 5], [2], [3], [4], [7], [3, 4, 6]],
    writes: { 4: { 5: 2, 7: 2 } },
    expectedWrites: { 4: { 5: 2, 7: 2 } },
  },
  10101: {
    targets: [0, 1, 2, 3, [4, 5]],
    sources: [[8], [0], [0, 1], [1, 2, 6, 7], [3, 6, 7]],
    writes: { 4: { 4: 0.06, 5: 1 } },
    expectedWrites: { 4: { 4: 0.06, 5: 1 } },
    expressions: {
      0: "C=6\\times12\\times80=5760",
      3: "L(12,80)\\approx1.7",
      4: "\\Delta L=0.06",
    },
    routes: {
      4: [3, 6, 7].flatMap((from) => [4, 5].map((to) => ({ from, to }))),
    },
  },
  10102: {
    targets: [4, [5, 6], 7, 8, 9, 10],
    sources: [[0], [0, 1], [5, 6], [0, 1, 2, 7], [8], [9, 3]],
    writes: { 1: { 5: 2, 6: 3 } },
    expectedWrites: { 1: { 5: 2, 6: 3 } },
    routes: { 1: [{ from: 0, to: 5 }, { from: 1, to: 6 }] },
    expressions: {
      2: "\\widetilde A_{AB}/\\sqrt{2\\cdot3}\\approx0.41",
      3: "m_A+m_B+m_C=1.64",
      4: "h_A'=\\sigma(1.64W)=0.84",
    },
    deriveExpected: {
      2: {
        7: (inputs) => roundTo(
          1 / Math.sqrt(numberInput(inputs, 5) * numberInput(inputs, 6)),
        ),
      },
    },
    connections: [
      { from: 0, to: 0, revealAt: 0, label: "A 的自环" },
      { from: 0, to: 1, revealAt: 0, label: "A-B" },
      { from: 0, to: 2, revealAt: 0, label: "A-C" },
      { from: 1, to: 3, revealAt: 5, label: "B-D" },
    ],
  },
  10103: {
    targets: [1, 2, 3, 4, 5, 0, 6],
    sources: [[7, 1], [1], [7, 8, 9, 10], [3], [4], [2, 5], [0, 1]],
    expressions: {
      2: "\\mathcal L=-y_{vc}\\log p_{vc}=-\\log(0.72)\\approx0.33",
    },
    deriveExpected: {
      2: {
        3: (inputs) => roundTo(
          -numberInput(inputs, 9) * Math.log(numberInput(inputs, 10)),
        ),
      },
    },
  },
  10104: { targets: [1, 2, 3, 4, 5, 0, 1], sources: [[1], [1], [2], [2, 3], [4], [2, 3, 5], [4, 5]] },
  10105: {
    targets: [[1, 6], [2, 7], [3, 8], 4, 5],
    sources: [[0], [0, 1, 6], [2, 7], [1, 3, 6, 8], [4]],
    writes: {
      0: { 1: 0.64, 6: 0.36 },
      1: { 2: 1.3, 7: 0 },
      2: { 3: 0.79, 8: 0.21 },
    },
    expectedWrites: {
      0: { 1: 0.64, 6: 0.36 },
      1: { 2: 1.3, 7: 0 },
      2: { 3: 0.79, 8: 0.21 },
    },
    expressions: { 2: "\\alpha_{AB}+\\alpha_{AC}=0.79+0.21=1" },
    routes: {
      1: [
        { from: 0, to: 2 },
        { from: 0, to: 7 },
        { from: 1, to: 2 },
        { from: 6, to: 7 },
      ],
      2: [2, 7].flatMap((from) => [3, 8].map((to) => ({ from, to }))),
    },
    deriveExpected: {
      2: {
        3: (inputs) => roundTo(
          Math.exp(numberInput(inputs, 2))
            / (Math.exp(numberInput(inputs, 2)) + Math.exp(numberInput(inputs, 7))),
        ),
        8: (inputs) => roundTo(
          Math.exp(numberInput(inputs, 7))
            / (Math.exp(numberInput(inputs, 2)) + Math.exp(numberInput(inputs, 7))),
        ),
      },
    },
  },
  10106: {
    targets: [[1, 7], 2, 3, 4, 5, 0, 6],
    sources: [[1], [2], [1], [3], [2, 4], [5], [4, 7]],
    writes: { 0: { 1: 80, 7: 20 } },
    expectedWrites: { 0: { 1: 80, 7: 20 } },
  },
  10107: { targets: [1, 2, 3, 4, 5, 0, 6], sources: [[1], [1], [1, 2], [2, 3], [4], [3, 5], [0, 5]] },
  10108: { targets: [1, 2, 3, 4, 5], sources: [[0], [2, 5], [1, 2], [2, 3], [2, 3, 4]] },
  10109: { targets: [1, 2, 3, 4, 5], sources: [[0], [0, 1], [2], [3], [3, 4]] },
  10110: { targets: [1, 2, 3, 4, 5], sources: [[0], [0, 1], [0, 2], [3], [4]] },
  10111: {
    targets: [1, 2, 3, [4, 0]],
    sources: [[1], [1], [2], [2, 3]],
    routes: { 3: [2, 3].flatMap((from) => [4, 0].map((to) => ({ from, to }))) },
  },
  10112: {
    targets: [[1, 2], 5, 3, 4, 0],
    sources: [[1], [1, 2], [5], [2, 3, 5], [3, 4, 5]],
    writes: { 0: { 1: 0.02, 2: 0.98 } },
    expectedWrites: { 0: { 1: 0.02, 2: 0.98 } },
    expressions: { 0: "\\bar\\alpha_t=1-\\beta_t=1-0.02=0.98" },
    deriveExpected: { 0: { 2: (inputs) => roundTo(1 - numberInput(inputs, 1)) } },
  },
  10113: {
    targets: [1, [2, 6, 7, 8, 9], 3, 5, [4, 0]],
    sources: [[1], [1], [6, 7, 8, 9], [3], [3, 5, 6, 7, 8, 9]],
    writes: { 1: { 2: 4, 6: 0.61, 7: 0.61, 8: 0.61, 9: 0.61 } },
    expectedWrites: { 1: { 2: 4, 6: 0.61, 7: 0.61, 8: 0.61, 9: 0.61 } },
    expressions: { 1: "n_{\\mathrm{sampler}}=4" },
    routes: {
      4: [
        ...[6, 7, 8, 9].map((from) => ({ from, to: 4 })),
        ...[3, 5, 6, 7, 8, 9].map((from) => ({ from, to: 0 })),
      ],
    },
  },
  10114: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [2, 4]] },
  10115: { targets: [1, 2, 3, 4, 0, 5], sources: [[1], [1], [2], [2, 3], [4], [0]] },
  10116: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3, 5], [1, 4]] },
  10117: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [2, 4]] },
  10118: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [1, 2, 3, 4]] },
  10119: { targets: [1, 2, 3, 4], sources: [[0], [1], [2], [2, 3]] },
  10120: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [2, 3, 4]] },
  10121: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [4]] },
  10122: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1], [2, 3], [2, 3, 4]] },
  10123: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [3], [1, 3], [2, 3, 4]] },
  10124: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1], [2, 3], [3, 4]] },
  10125: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1, 2], [2, 3], [3, 4]] },
  10126: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1, 2], [3], [1, 4]] },
  10127: {
    targets: [[1, 2], 3, 4, 5, 0],
    sources: [[6], [2], [7], [1, 3, 4], [5]],
    writes: { 0: { 1: 0.4, 2: Math.log(0.36) } },
    expectedWrites: { 0: { 1: 0.4, 2: Math.log(0.36) } },
    expressions: {
      0: "(\\mu,\\log\\sigma^2)=\\operatorname{Encoder}(x)=(0.4,\\log 0.36)",
      1: "\\sigma=\\exp(\\tfrac12\\log 0.36)=0.6",
      3: "z=0.4+0.6\\times0.25=0.55",
    },
    deriveExpected: {
      1: { 3: (inputs) => roundTo(Math.exp(0.5 * numberInput(inputs, 2)), 6) },
      3: {
        5: (inputs) => numberInput(inputs, 1)
          + numberInput(inputs, 3) * numberInput(inputs, 4),
      },
    },
  },
  10128: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [1, 2], [3], [2, 4]] },
  10129: { targets: [1, 2, 3, 4, 0, 5], sources: [[1], [1], [1, 2], [4], [4], [0, 4]] },
  10130: { targets: [1, 2, 3, 4, 0, 5], sources: [[1], [1], [2], [2, 3], [3, 4], [0, 2]] },
  10131: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [1, 4]] },
  10132: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [3], [3, 4]] },
  10133: { targets: [1, 2, 3, 4, 0], sources: [[1], [1], [2], [2, 3], [4]] },
  10134: {
    targets: [1, 2, 3, 4, 0],
    sources: [[5], [1], [1, 2], [1, 3], [2, 3, 4]],
    expressions: {
      2: "p_\\psi(z_{t+1}\\mid z_t,a_t)=0.64",
      3: "D_{\\mathrm{KL}}(q_\\phi\\|p_\\psi)+\\lambda_{\\mathrm{pred}}L_{\\mathrm{value}}=0.28",
    },
  },
};

function indices(value: Indices): number[] {
  return typeof value === "number" ? [value] : [...value];
}

function unique(values: readonly number[]): number[] {
  return [...new Set(values)];
}

function escapedText(value: string): string {
  return value
    .replace(/×/g, "x")
    .replace(/→/g, " to ")
    .replace(/₀/g, "0")
    .replace(/ₜ/g, "t")
    .replace(/μ/g, "mu")
    .replace(/σ/g, "sigma")
    .replace(/ε/g, "epsilon")
    .replace(/β/g, "beta")
    .replace(/ψ/g, "psi")
    .replace(/[\\{}%$#&_]/g, "\\$&");
}

function displayValue(value: SceneValue | undefined): string {
  if (value === undefined) return "-";
  if (Array.isArray(value)) return `[${value.map(displayValue).join(",")}]`;
  return String(value);
}

function createFormulaBindings(
  blueprint: GuidedLessonBlueprint,
  entities: LessonSceneEntity[],
  lessonId: AiLessonId,
): FormulaBinding[] {
  const bindings = AI_FORMULA_BINDINGS[lessonId];
  const entityIds = new Set(entities.map(({ id }) => id));
  const symbols = blueprint.symbols.map(({ symbol }) => symbol);
  if (
    Object.keys(bindings).length !== symbols.length
    || symbols.some((symbol) => !(symbol in bindings))
  ) {
    throw new Error(`AI lesson ${lessonId} needs one explicit binding per formula symbol`);
  }
  return symbols.map((symbol) => {
    const ids = bindings[symbol as keyof typeof bindings] as readonly string[];
    if (ids.length === 0 || ids.some((id) => !entityIds.has(id))) {
      throw new Error(`AI lesson ${lessonId} has an invalid binding for ${symbol}`);
    }
    return { symbol, entityIds: [...ids] };
  });
}

function createEntities(
  profile: AiSceneProfile,
  semantics: AiLessonSemantics,
): LessonSceneEntity[] {
  const targetIndices = new Set(semantics.targets.flatMap(indices));
  const finalTargets = new Set(indices(semantics.targets[semantics.targets.length - 1]));
  const sourceIndices = new Set(semantics.sources.flatMap(indices));
  return profile.entityLabels.map((label, index): LessonSceneEntity => {
    let role: EntityRole = "intermediate";
    if (finalTargets.has(index)) role = "output";
    else if (!targetIndices.has(index) && sourceIndices.has(index)) role = "input";
    else if (/步长|填充|预算|掩码|阈值|层数|数量|数$|率 D|参数/.test(label)) role = "control";
    return { id: label, label, role, unit: profile.unit };
  });
}

function createLayout(
  kind: LessonSceneKind,
  entities: LessonSceneEntity[],
  values: readonly AiSceneValue[],
): LessonSceneSpec["layout"] {
  const entityIds = entities.map(({ id }) => id);
  switch (kind) {
    case "array":
      return { orientation: "horizontal", groups: [{ id: "values", label: "数值", entityIds }] };
    case "matrix": {
      const columns = 3;
      if (entityIds.length % columns !== 0) throw new Error("AI matrix entity count must be divisible by 3");
      return {
        rows: entityIds.length / columns,
        columns,
        cellEntityIds: Array.from(
          { length: entityIds.length / columns },
          (_, row) => entityIds.slice(row * columns, row * columns + columns),
        ),
      };
    }
    case "graph":
      return {
        nodeEntityIds: entityIds,
        positions: Object.fromEntries(entityIds.map((id, index) => {
          const angle = (Math.PI * 2 * index) / entityIds.length - Math.PI / 2;
          return [id, {
            x: Number((0.5 + Math.cos(angle) * 0.38).toFixed(3)),
            y: Number((0.5 + Math.sin(angle) * 0.38).toFixed(3)),
          }];
        })),
      };
    case "sequence": {
      const trackIds = ["输入与条件", "计算结果"];
      return {
        trackIds,
        trackByEntityId: Object.fromEntries(entities.map(({ id, role }) => [
          id,
          role === "input" || role === "control" ? trackIds[0] : trackIds[1],
        ])),
        orderedEntityIds: entityIds,
      };
    }
    case "pipeline": {
      const laneIds = ["输入与条件", "计算结果"];
      return {
        laneIds,
        laneByEntityId: Object.fromEntries(entities.map(({ id, role }) => [
          id,
          role === "input" || role === "control" ? laneIds[0] : laneIds[1],
        ])),
        stageEntityIds: entityIds,
      };
    }
    case "distribution": {
      const numericValues = values.filter((value): value is number => typeof value === "number");
      const maximum = Math.max(1, ...numericValues);
      const minimum = Math.min(0, ...numericValues);
      return {
        categoryEntityIds: entityIds,
        xLabel: "语义中间量",
        yLabel: "当前示例值",
        yDomain: [minimum, maximum],
      };
    }
  }
}

interface IndexedConnection {
  id: string;
  from: number;
  to: number;
  revealAt: number;
  label?: string;
}

function operationRoutes(
  semantics: AiLessonSemantics,
  stepIndex: number,
): { from: number; to: number }[] {
  const sources = unique(indices(semantics.sources[stepIndex]));
  const targets = unique(indices(semantics.targets[stepIndex]));
  const explicitRoutes = semantics.routes?.[stepIndex];
  if (explicitRoutes) return explicitRoutes.map(({ from, to }) => ({ from, to }));
  if (sources.length === 1) return targets.map((to) => ({ from: sources[0], to }));
  if (targets.length === 1) return sources.map((from) => ({ from, to: targets[0] }));
  throw new Error(`AI many-to-many step ${stepIndex} needs explicit semantic routes`);
}

function createIndexedConnections(semantics: AiLessonSemantics): IndexedConnection[] {
  const candidates: Omit<IndexedConnection, "id">[] = [
    ...semantics.sources.flatMap((_, stepIndex) =>
      operationRoutes(semantics, stepIndex).map(({ from, to }) => ({ from, to, revealAt: stepIndex })),
    ),
    ...(semantics.connections ?? []),
  ];
  const byPair = new Map<string, Omit<IndexedConnection, "id">>();
  for (const candidate of candidates) {
    const key = `${candidate.from}:${candidate.to}`;
    const existing = byPair.get(key);
    if (!existing || candidate.revealAt < existing.revealAt) byPair.set(key, candidate);
  }
  return [...byPair.values()].map((connection, index) => ({
    id: `semantic-edge-${index}`,
    ...connection,
  }));
}

function frameStates(
  entities: LessonSceneEntity[],
  values: readonly AiSceneValue[],
  valuesBeforeStep: readonly AiSceneValue[],
  sources: readonly number[],
  targets: readonly number[],
  completed: ReadonlySet<number>,
): Record<string, SceneEntityState> {
  const active = new Set([...sources, ...targets]);
  return Object.fromEntries(entities.map(({ id }, index) => {
    let status: EntityStatus = "waiting";
    if (active.has(index)) status = "active";
    else if (completed.has(index)) status = "complete";
    const changedTarget = targets.includes(index)
      && JSON.stringify(valuesBeforeStep[index]) !== JSON.stringify(values[index]);
    return [id, {
      value: values[index],
      ...(changedTarget ? { previousValue: valuesBeforeStep[index] } : {}),
      status,
      visible: true,
    }];
  }));
}

function assertProfile(
  blueprint: GuidedLessonBlueprint,
  profile: AiSceneProfile,
  semantics: AiLessonSemantics,
): void {
  const expected = EXPECTED_STEP_VALUES[blueprint.id as AiLessonId];
  if (new Set(profile.entityLabels).size !== profile.entityLabels.length) {
    throw new Error(`AI lesson ${blueprint.id} needs unique semantic entity labels`);
  }
  if (profile.entityLabels.length !== profile.sampleValues.length) {
    throw new Error(`AI lesson ${blueprint.id} needs one sample value per semantic entity`);
  }
  if (
    profile.stepValues.length !== blueprint.flow.length
    || profile.explanations.length !== blueprint.flow.length
    || semantics.targets.length !== blueprint.flow.length
    || semantics.sources.length !== blueprint.flow.length
    || expected.length !== blueprint.flow.length
  ) {
    throw new Error(`AI lesson ${blueprint.id} needs complete per-joint semantics`);
  }
  const referencedIndices = [
    ...semantics.targets.flatMap(indices),
    ...semantics.sources.flatMap(indices),
    ...Object.values(semantics.routes ?? {}).flatMap((routes) =>
      routes.flatMap(({ from, to }) => [from, to])
    ),
    ...(semantics.connections ?? []).flatMap(({ from, to }) => [from, to]),
  ];
  if (referencedIndices.some((index) => !Number.isInteger(index) || index < 0 || index >= profile.entityLabels.length)) {
    throw new Error(`AI lesson ${blueprint.id} references an unknown semantic entity`);
  }
  const hasNonFinite = (value: AiSceneValue): boolean => {
    if (Array.isArray(value)) return value.some(hasNonFinite);
    return typeof value === "number" && !Number.isFinite(value);
  };
  if ([...profile.sampleValues, ...profile.stepValues, ...expected].some(hasNonFinite)) {
    throw new Error(`AI lesson ${blueprint.id} contains a non-finite sample value`);
  }
  semantics.sources.forEach((source, stepIndex) => {
    const sources = new Set(indices(source));
    const targets = new Set(indices(semantics.targets[stepIndex]));
    const routes = operationRoutes(semantics, stepIndex);
    const routeKeys = routes.map(({ from, to }) => `${from}:${to}`);
    if (
      new Set(routeKeys).size !== routeKeys.length
      || routes.some(({ from, to }) => !sources.has(from) || !targets.has(to))
      || [...sources].some((sourceIndex) => !routes.some(({ from }) => from === sourceIndex))
      || [...targets].some((targetIndex) => !routes.some(({ to }) => to === targetIndex))
    ) {
      throw new Error(`AI lesson ${blueprint.id} step ${stepIndex} has invalid semantic routes`);
    }
  });
}

export function createAiLessonScene(
  blueprint: GuidedLessonBlueprint,
  profile: AiSceneProfile,
): LessonSceneSpec {
  const lessonId = blueprint.id as AiLessonId;
  const semantics = AI_LESSON_SEMANTICS[lessonId];
  if (!semantics) throw new Error(`Missing AI semantics for lesson ${blueprint.id}`);
  assertProfile(blueprint, profile, semantics);

  const entities = createEntities(profile, semantics);
  const indexedConnections = createIndexedConnections(semantics);
  const connections = indexedConnections.map(({ id, from, to, label }) => ({
    id,
    from: entities[from].id,
    to: entities[to].id,
    label,
  }));
  const values = [...profile.sampleValues];
  const completed = new Set<number>();
  const expectedValues = EXPECTED_STEP_VALUES[lessonId];

  const framesByJointId = Object.fromEntries(
    blueprint.flow.map((joint, stepIndex): [string, LessonSceneFrame] => {
      const sourceIndices = unique(indices(semantics.sources[stepIndex]));
      const targetIndices = unique(indices(semantics.targets[stepIndex]));
      const valuesBeforeStep = structuredClone(values);
      const routes = operationRoutes(semantics, stepIndex);
      const inputSnapshot = new Map(
        sourceIndices.map((index) => [index, valuesBeforeStep[index]]),
      );
      for (const targetIndex of targetIndices) values[targetIndex] = profile.stepValues[stepIndex];
      for (const [rawIndex, value] of Object.entries(semantics.writes?.[stepIndex] ?? {})) {
        values[Number(rawIndex)] = value;
      }

      const entityStates = frameStates(
        entities,
        values,
        valuesBeforeStep,
        sourceIndices,
        targetIndices,
        completed,
      );
      const inputs = sourceIndices.map((index) => ({
        entityId: entities[index].id,
        label: entities[index].label,
        value: valuesBeforeStep[index],
        unit: profile.unit,
      }));
      const outputs = targetIndices.map((index) => ({
        entityId: entities[index].id,
        label: entities[index].label,
        value: values[index],
        unit: profile.unit,
      }));
      const transfers = routes
        .filter(({ from, to }) => to !== from)
        .map(({ from, to }, transferIndex) => ({
          id: `transfer-${joint.id}-${from}-${to}-${transferIndex}`,
          from: entities[from].id,
          to: entities[to].id,
          sourceValue: valuesBeforeStep[from],
          payload: valuesBeforeStep[from],
          label: `${entities[from].label} 参与 ${entities[to].label}`,
        }));
      const visibleConnectionIds = indexedConnections
        .filter(({ revealAt }) => revealAt <= stepIndex)
        .map(({ id }) => id);
      const sourceExpression = sourceIndices
        .map((index) => `\\text{${escapedText(entities[index].label)}}=\\text{${escapedText(displayValue(valuesBeforeStep[index]))}}`)
        .join(",\\quad ");
      const targetExpression = targetIndices
        .map((index) => `\\text{${escapedText(entities[index].label)}}=\\text{${escapedText(displayValue(values[index]))}}`)
        .join(",\\quad ");
      const expression = semantics.expressions?.[stepIndex]
        ?? `\\left(${sourceExpression}\\right)\\xrightarrow{\\text{${escapedText(joint.label)}}}\\left(${targetExpression}\\right)`;
      const debugAssertions = targetIndices.map((index) => ({
        label: semantics.deriveExpected?.[stepIndex]?.[index]
          ? `由本帧输入复算：${entities[index].label}`
          : `课程样例基准：${entities[index].label}`,
        entityId: entities[index].id,
        operator: "eq" as const,
        expected: semantics.deriveExpected?.[stepIndex]?.[index]?.(inputSnapshot)
          ?? semantics.expectedWrites?.[stepIndex]?.[index]
          ?? expectedValues[stepIndex],
      }));
      const result = outputs
        .map(({ label, value }) => `${label} = ${displayValue(value)}`)
        .join("；");

      for (const targetIndex of targetIndices) completed.add(targetIndex);

      return [joint.id, {
        jointId: joint.id,
        title: joint.label,
        inputs,
        operation: {
          label: joint.label,
          sourceEntityIds: sourceIndices.map((index) => entities[index].id),
          targetEntityIds: targetIndices.map((index) => entities[index].id),
          expression,
        },
        outputs,
        entityStates,
        visibleConnectionIds,
        transfers,
        metrics: [],
        result,
        explanation: profile.explanations[stepIndex],
        debugAssertions,
      }];
    }),
  );

  const allValues = [
    ...profile.sampleValues,
    ...profile.stepValues,
    ...Object.values(semantics.writes ?? {}).flatMap((writes) => Object.values(writes)),
  ];
  const base = {
    lessonId: blueprint.id,
    ariaLabel: `${blueprint.title}的逐步因果计算场景`,
    entities,
    connections,
    formulaBindings: createFormulaBindings(blueprint, entities, lessonId),
    framesByJointId,
  };
  const layout = createLayout(profile.kind, entities, allValues);

  switch (profile.kind) {
    case "array": return { ...base, kind: "array", layout: layout as Extract<LessonSceneSpec, { kind: "array" }>["layout"] };
    case "matrix": return { ...base, kind: "matrix", layout: layout as Extract<LessonSceneSpec, { kind: "matrix" }>["layout"] };
    case "graph": return { ...base, kind: "graph", layout: layout as Extract<LessonSceneSpec, { kind: "graph" }>["layout"] };
    case "sequence": return { ...base, kind: "sequence", layout: layout as Extract<LessonSceneSpec, { kind: "sequence" }>["layout"] };
    case "pipeline": return { ...base, kind: "pipeline", layout: layout as Extract<LessonSceneSpec, { kind: "pipeline" }>["layout"] };
    case "distribution": return { ...base, kind: "distribution", layout: layout as Extract<LessonSceneSpec, { kind: "distribution" }>["layout"] };
  }
}
