import { VisualizationStep } from "@/types";

export interface FeatureMap {
  rows: number;
  cols: number;
  /** values[r][c] 表示该位置的特征值（单通道，用于可视化） */
  values: number[][];
}

export interface ROI {
  id: number;
  /** 在特征图坐标系下的坐标 */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PooledCell {
  binRow: number;
  binCol: number;
  srcX1: number;
  srcY1: number;
  srcX2: number;
  srcY2: number;
  maxVal: number;
}

function roiPoolOneBin(
  values: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const rows = values.length;
  const cols = values[0].length;
  let maxVal = -Infinity;
  const r1 = Math.max(0, Math.floor(y1));
  const r2 = Math.min(rows - 1, Math.ceil(y2) - 1);
  const c1 = Math.max(0, Math.floor(x1));
  const c2 = Math.min(cols - 1, Math.ceil(x2) - 1);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (values[r][c] > maxVal) maxVal = values[r][c];
    }
  }
  return maxVal === -Infinity ? 0 : maxVal;
}

export function generateROIPoolingSteps(
  featureMap: FeatureMap,
  rois: ROI[],
  poolH: number,
  poolW: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化：特征图 ${featureMap.rows}×${featureMap.cols}，共 ${rois.length} 个 ROI，目标池化尺寸 ${poolH}×${poolW}`,
    data: { featureMap, rois, poolH, poolW },
    variables: { phase: "init" },
  });

  const allPooled: { roiId: number; cells: PooledCell[] }[] = [];

  for (const roi of rois) {
    const roiW = roi.x2 - roi.x1;
    const roiH = roi.y2 - roi.y1;
    const binW = roiW / poolW;
    const binH = roiH / poolH;

    steps.push({
      id: stepId++,
      description: `处理 ROI #${roi.id}：坐标 (${roi.x1},${roi.y1})→(${roi.x2},${roi.y2})，划分为 ${poolH}×${poolW} 个网格`,
      data: { featureMap, rois, activeRoi: roi, poolH, poolW },
      variables: { phase: "roi_start", activeRoiId: roi.id },
    });

    const cells: PooledCell[] = [];

    for (let ph = 0; ph < poolH; ph++) {
      for (let pw = 0; pw < poolW; pw++) {
        const bx1 = roi.x1 + pw * binW;
        const by1 = roi.y1 + ph * binH;
        const bx2 = bx1 + binW;
        const by2 = by1 + binH;
        const maxVal = roiPoolOneBin(featureMap.values, bx1, by1, bx2, by2);

        cells.push({
          binRow: ph,
          binCol: pw,
          srcX1: bx1,
          srcY1: by1,
          srcX2: bx2,
          srcY2: by2,
          maxVal,
        });

        steps.push({
          id: stepId++,
          description: `ROI #${roi.id} — 网格[${ph}][${pw}]：区域 (${bx1.toFixed(1)},${by1.toFixed(1)})→(${bx2.toFixed(1)},${by2.toFixed(1)})，最大值 = ${maxVal.toFixed(2)}`,
          data: {
            featureMap,
            rois,
            activeRoi: roi,
            activeBin: { ph, pw, bx1, by1, bx2, by2 },
            cells: [...cells],
            poolH,
            poolW,
          },
          variables: {
            phase: "bin_pool",
            activeRoiId: roi.id,
            activeBinRow: ph,
            activeBinCol: pw,
            maxVal,
          },
        });
      }
    }

    allPooled.push({ roiId: roi.id, cells });

    steps.push({
      id: stepId++,
      description: `ROI #${roi.id} 池化完成，输出 ${poolH}×${poolW} 特征`,
      data: { featureMap, rois, activeRoi: roi, cells, allPooled: [...allPooled], poolH, poolW },
      variables: { phase: "roi_done", activeRoiId: roi.id },
    });
  }

  steps.push({
    id: stepId++,
    description: `ROI Pooling 完成！所有 ${rois.length} 个 ROI 均输出 ${poolH}×${poolW} 固定尺寸特征`,
    data: { featureMap, rois, allPooled, poolH, poolW },
    variables: { phase: "done", finished: true },
  });

  return steps;
}
