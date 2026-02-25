import { VisualizationStep } from "@/types";

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  id: number;
}

function computeIoU(boxA: BBox, boxB: BBox): number {
  const x1 = Math.max(boxA.x1, boxB.x1);
  const y1 = Math.max(boxA.y1, boxB.y1);
  const x2 = Math.min(boxA.x2, boxB.x2);
  const y2 = Math.min(boxA.y2, boxB.y2);

  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const interArea = interW * interH;

  const areaA = (boxA.x2 - boxA.x1) * (boxA.y2 - boxA.y1);
  const areaB = (boxB.x2 - boxB.x1) * (boxB.y2 - boxB.y1);
  const unionArea = areaA + areaB - interArea;

  if (unionArea <= 0) return 0;
  return Number((interArea / unionArea).toFixed(4));
}

export function generateNMSSteps(
  boxes: BBox[],
  iouThreshold: number,
  scoreThreshold: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (boxes.length === 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的检测框。",
      data: { boxes: [] },
      variables: { finished: true },
    });
    return steps;
  }

  let filteredBoxes = boxes.filter((b) => b.score >= scoreThreshold);
  filteredBoxes = filteredBoxes.map((b, i) => ({ ...b, id: i }));
  
  steps.push({
    id: stepId++,
    description: `初始化：${boxes.length} 个检测框，置信度阈值 ${scoreThreshold}，IoU 阈值 ${iouThreshold}`,
    data: { boxes: filteredBoxes, iouThreshold, scoreThreshold },
    variables: { totalBoxes: filteredBoxes.length, phase: "init" },
  });

  const sortedBoxes = [...filteredBoxes].sort((a, b) => b.score - a.score);
  
  steps.push({
    id: stepId++,
    description: "按置信度降序排序检测框",
    data: { boxes: sortedBoxes },
    variables: { sortedBoxes, phase: "sort" },
  });

  const selected: BBox[] = [];
  const suppressed: Set<number> = new Set();

  for (let i = 0; i < sortedBoxes.length; i++) {
    const currentBox = sortedBoxes[i];
    
    if (suppressed.has(currentBox.id)) {
      steps.push({
        id: stepId++,
        description: `框 #${currentBox.id}（置信度 ${currentBox.score.toFixed(2)}）已被抑制，跳过`,
        data: { boxes: sortedBoxes, selected: [...selected], currentBoxId: currentBox.id },
        variables: { currentBoxId: currentBox.id, skipped: true, phase: "skip" },
      });
      continue;
    }

    selected.push(currentBox);
    
    steps.push({
      id: stepId++,
      description: `选择框 #${currentBox.id}（置信度 ${currentBox.score.toFixed(2)}）作为保留框`,
      data: { boxes: sortedBoxes, selected: [...selected], currentBox },
      variables: { currentBoxId: currentBox.id, selected: [...selected], phase: "select" },
    });

    for (let j = i + 1; j < sortedBoxes.length; j++) {
      const compareBox = sortedBoxes[j];
      if (suppressed.has(compareBox.id)) continue;

      const iou = computeIoU(currentBox, compareBox);
      
      if (iou > iouThreshold) {
        suppressed.add(compareBox.id);
        steps.push({
          id: stepId++,
          description: `框 #${compareBox.id} 与框 #${currentBox.id} IoU=${iou.toFixed(3)} > ${iouThreshold}，被抑制`,
          data: {
            boxes: sortedBoxes,
            selected: [...selected],
            currentBox,
            compareBox,
            iou,
            suppressed: [...suppressed],
          },
          variables: {
            currentBoxId: currentBox.id,
            compareBoxId: compareBox.id,
            iou,
            suppressed: true,
            phase: "suppress",
          },
        });
      } else {
        steps.push({
          id: stepId++,
          description: `框 #${compareBox.id} 与框 #${currentBox.id} IoU=${iou.toFixed(3)} ≤ ${iouThreshold}，保留`,
          data: {
            boxes: sortedBoxes,
            selected: [...selected],
            currentBox,
            compareBox,
            iou,
          },
          variables: {
            currentBoxId: currentBox.id,
            compareBoxId: compareBox.id,
            iou,
            suppressed: false,
            phase: "keep",
          },
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `NMS 完成！保留 ${selected.length} 个检测框`,
    data: { boxes: sortedBoxes, selected, suppressed: [...suppressed] },
    variables: { selected, suppressedCount: suppressed.size, phase: "done", finished: true },
  });

  return steps;
}
