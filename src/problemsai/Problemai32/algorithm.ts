import { VisualizationStep } from "@/types";

export interface AnchorBox {
  /** 中心点，在原图坐标系 */
  cx: number;
  cy: number;
  w: number;
  h: number;
  scale: number;
  ratio: number;
  gridRow: number;
  gridCol: number;
}

export function generateAnchorBoxSteps(
  gridH: number,
  gridW: number,
  stride: number,
  scales: number[],
  ratios: number[],
  selectedCell: { row: number; col: number }
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const imgH = gridH * stride;
  const imgW = gridW * stride;

  steps.push({
    id: stepId++,
    description: `初始化：特征图 ${gridH}×${gridW}，步长 ${stride}，对应原图 ${imgH}×${imgW}`,
    data: { gridH, gridW, stride, scales, ratios },
    variables: { phase: "init", gridH, gridW, stride, scales, ratios, imgH, imgW },
  });

  // 生成全部锚框（仅展示选中 cell 的细节）
  const allAnchors: AnchorBox[] = [];

  steps.push({
    id: stepId++,
    description: `在特征图每个位置生成 ${scales.length} 种尺度 × ${ratios.length} 种宽高比 = ${scales.length * ratios.length} 个锚框`,
    data: {},
    variables: { phase: "explain", scales, ratios, numAnchorsPerCell: scales.length * ratios.length },
  });

  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      const cx = (c + 0.5) * stride;
      const cy = (r + 0.5) * stride;
      for (const scale of scales) {
        for (const ratio of ratios) {
          const area = (stride * scale) ** 2;
          const w = Math.sqrt(area * ratio);
          const h = Math.sqrt(area / ratio);
          allAnchors.push({ cx, cy, w, h, scale, ratio, gridRow: r, gridCol: c });
        }
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `共生成 ${gridH}×${gridW}×${scales.length * ratios.length} = ${allAnchors.length} 个锚框`,
    data: { allAnchors },
    variables: { phase: "generated", allAnchors, totalAnchors: allAnchors.length, gridH, gridW, stride, scales, ratios, imgH, imgW },
  });

  // 展示选中 cell 的锚框生成过程
  const { row: sr, col: sc } = selectedCell;
  const cellAnchors: AnchorBox[] = [];
  const cx = (sc + 0.5) * stride;
  const cy = (sr + 0.5) * stride;

  steps.push({
    id: stepId++,
    description: `展示 cell (${sr}, ${sc}) 的锚框生成过程，中心点在原图坐标 (${cx}, ${cy})`,
    data: { selectedCell },
    variables: {
      phase: "cell_detail",
      selectedCell: { row: sr, col: sc },
      cx,
      cy,
      allAnchors,
      gridH, gridW, stride, scales, ratios, imgH, imgW
    },
  });

  for (const scale of scales) {
    for (const ratio of ratios) {
      const area = (stride * scale) ** 2;
      const w = Math.sqrt(area * ratio);
      const h = Math.sqrt(area / ratio);
      cellAnchors.push({ cx, cy, w, h, scale, ratio, gridRow: sr, gridCol: sc });

      steps.push({
        id: stepId++,
        description: `尺度 s=${scale}, 比率 r=${ratio}: 面积=${area.toFixed(0)}, 宽=${w.toFixed(1)}, 高=${h.toFixed(1)}`,
        data: { cellAnchors: [...cellAnchors] },
        variables: {
          phase: "anchor_detail",
          activeAnchor: { cx, cy, w, h, scale, ratio },
          cellAnchors: [...cellAnchors],
          allAnchors,
          selectedCell: { row: sr, col: sc },
          gridH, gridW, stride, scales, ratios, imgH, imgW
        },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `锚框生成完成！总计 ${allAnchors.length} 个锚框`,
    data: { allAnchors, cellAnchors },
    variables: {
      phase: "done",
      finished: true,
      allAnchors,
      cellAnchors,
      selectedCell: { row: sr, col: sc },
      gridH, gridW, stride, scales, ratios, imgH, imgW
    },
  });

  return steps;
}
