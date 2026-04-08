import { VisualizationStep } from "@/types";

export type Utterance = "你好世界" | "人工智能" | "语音识别";

export interface FrameData {
  energy: number;
  isBoundaryCandidate: boolean;
  isFinalBoundary: boolean;
  segmentId: number; // -1 = unassigned, 0+ = segment index
}

export interface Segment {
  start: number;
  end: number;
  label: string;
}

// Pre-defined energy profiles for each utterance (24 frames)
// Syllable peaks with silence gaps between them
const ENERGY_PROFILES: Record<Utterance, number[]> = {
  你好世界: [
    // 你   你     你   (gap)  好    好    好   (gap)  世    世    世   (gap)  界    界    界   (gap) tail
    0.1, 0.7, 0.9, 0.85, 0.15, 0.65, 0.88, 0.80, 0.12, 0.72, 0.92, 0.86, 0.11, 0.60, 0.82, 0.76, 0.08, 0.05, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01,
  ],
  人工智能: [
    0.08, 0.68, 0.90, 0.82, 0.13, 0.62, 0.85, 0.78, 0.10, 0.75, 0.93, 0.88, 0.14, 0.58, 0.80, 0.72, 0.09, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01,
  ],
  语音识别: [
    0.09, 0.72, 0.91, 0.84, 0.11, 0.66, 0.87, 0.82, 0.12, 0.78, 0.94, 0.89, 0.10, 0.63, 0.83, 0.75, 0.08, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01,
  ],
};

const UTTERANCE_LABELS: Record<Utterance, string[]> = {
  你好世界: ["你", "好", "世", "界"],
  人工智能: ["人", "工", "智", "能"],
  语音识别: ["语", "音", "识", "别"],
};

function findLocalMinima(energy: number[], windowSize: number = 3): number[] {
  const minima: number[] = [];
  for (let i = windowSize; i < energy.length - windowSize; i++) {
    let isMin = true;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && energy[j] <= energy[i]) {
        isMin = false;
        break;
      }
    }
    if (isMin) minima.push(i);
  }
  return minima;
}

function assignSegments(frames: FrameData[], _boundaries: number[]): FrameData[] {
  const updated = frames.map((f) => ({ ...f }));
  let segId = 0;
  let inSilence = true;
  for (let i = 0; i < updated.length; i++) {
    if (updated[i].isFinalBoundary) {
      inSilence = true;
      updated[i].segmentId = -1;
    } else if (updated[i].energy > 0.3) {
      if (inSilence) {
        segId++;
        inSilence = false;
      }
      updated[i].segmentId = segId - 1;
    } else {
      inSilence = true;
      updated[i].segmentId = -1;
    }
  }
  return updated;
}

export function generateSpeechSegmentationSteps(utterance: Utterance): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const energyProfile = ENERGY_PROFILES[utterance] ?? ENERGY_PROFILES["你好世界"];
  const syllableLabels = UTTERANCE_LABELS[utterance] ?? UTTERANCE_LABELS["你好世界"];
  const numFrames = energyProfile.length;
  const ENERGY_THRESHOLD = 0.25;

  const baseFrames: FrameData[] = energyProfile.map((energy) => ({
    energy,
    isBoundaryCandidate: false,
    isFinalBoundary: false,
    segmentId: -1,
  }));

  // Step 1: init - show continuous audio
  steps.push({
    id: id++,
    description: `初始化：输入连续语音「${utterance}」，共 ${numFrames} 帧（每帧约25ms）。连续语音中词间没有明显停顿，需通过能量分析自动定位边界。`,
    data: { utterance, frames: baseFrames },
    variables: {
      phase: "init",
      utterance,
      frames: energyProfile,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 2: energy computation (partial, then full)
  const partialEnergy12 = energyProfile.slice(0, 12);
  steps.push({
    id: id++,
    description: `计算帧能量（第1-12帧）：E_n = (1/N)Σx²(k)，即当前帧所有采样点的均方值。能量高=有声段，能量低=静音/停顿。已处理 ${partialEnergy12.length}/${numFrames} 帧。`,
    data: { frames: baseFrames.slice(0, 12) },
    variables: {
      phase: "energy",
      utterance,
      frames: partialEnergy12,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  steps.push({
    id: id++,
    description: `计算帧能量（全部${numFrames}帧完成）：峰值能量约 ${Math.max(...energyProfile).toFixed(2)}，谷值约 ${Math.min(...energyProfile).toFixed(2)}。能量轮廓清晰显示出4个有声峰和间隔静音区。`,
    data: { frames: baseFrames },
    variables: {
      phase: "energy",
      utterance,
      frames: energyProfile,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 3: local minima detection
  const minimaIndices = findLocalMinima(energyProfile, 2);
  const framesWithCandidates = baseFrames.map((f, i) => ({
    ...f,
    isBoundaryCandidate: minimaIndices.includes(i),
  }));

  steps.push({
    id: id++,
    description: `检测局部极小值：在能量序列中寻找比周围帧都小的位置，作为候选边界。共找到 ${minimaIndices.length} 个候选边界点（帧序号：${minimaIndices.slice(0, 6).join(", ")}...）。`,
    data: { frames: framesWithCandidates, candidateBoundaries: minimaIndices },
    variables: {
      phase: "minima",
      utterance,
      frames: energyProfile,
      candidateBoundaries: minimaIndices,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 4: apply threshold to filter boundaries
  const finalBoundaryIndices = minimaIndices.filter(
    (i) => energyProfile[i] < ENERGY_THRESHOLD
  );
  const framesWithFinalBoundaries = framesWithCandidates.map((f, i) => ({
    ...f,
    isFinalBoundary: finalBoundaryIndices.includes(i),
  }));

  steps.push({
    id: id++,
    description: `应用能量阈值 θ = ${ENERGY_THRESHOLD}：仅保留能量低于阈值的候选边界，过滤掉噪声伪边界。${minimaIndices.length} 个候选中保留 ${finalBoundaryIndices.length} 个真实边界（帧：${finalBoundaryIndices.join(", ")}）。`,
    data: { frames: framesWithFinalBoundaries, finalBoundaries: finalBoundaryIndices },
    variables: {
      phase: "threshold",
      utterance,
      frames: energyProfile,
      candidateBoundaries: minimaIndices,
      finalBoundaries: finalBoundaryIndices,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 5: extract segments
  const framesWithSegments = assignSegments(framesWithFinalBoundaries, finalBoundaryIndices);
  const numSegments = Math.max(...framesWithSegments.map((f) => f.segmentId)) + 1;

  // Build segment objects
  const segmentObjects: Segment[] = [];
  for (let s = 0; s < numSegments; s++) {
    const segFrames = framesWithSegments
      .map((f, i) => ({ ...f, idx: i }))
      .filter((f) => f.segmentId === s);
    if (segFrames.length > 0) {
      segmentObjects.push({
        start: segFrames[0].idx,
        end: segFrames[segFrames.length - 1].idx,
        label: `seg_${s}`,
      });
    }
  }

  steps.push({
    id: id++,
    description: `提取语音段：边界将连续帧分为 ${numSegments} 个有声段和若干静音段。每个有声段对应一个词或音节单元。`,
    data: { frames: framesWithSegments, segments: segmentObjects },
    variables: {
      phase: "segments",
      utterance,
      frames: energyProfile,
      finalBoundaries: finalBoundaryIndices,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 6: label segments
  const labeledSegments: Segment[] = segmentObjects.map((seg, i) => ({
    ...seg,
    label: syllableLabels[i] ?? `seg_${i}`,
  }));

  steps.push({
    id: id++,
    description: `标注语音段：将提取的 ${labeledSegments.length} 个语音段分别标注为「${labeledSegments.map((s) => s.label).join("」「")}」，与原始语句「${utterance}」对应。`,
    data: { segments: labeledSegments },
    variables: {
      phase: "label",
      utterance,
      frames: energyProfile,
      finalBoundaries: finalBoundaryIndices,
      energyThreshold: ENERGY_THRESHOLD,
    },
  });

  // Step 7: complete
  steps.push({
    id: id++,
    description: `分割完成！「${utterance}」被成功切分为 ${labeledSegments.length} 个语音段：${labeledSegments.map((s) => `「${s.label}」(帧${s.start}-${s.end})`).join("，")}。可作为语音识别的输入单元。`,
    data: { segments: labeledSegments, finished: true },
    variables: {
      phase: "complete",
      utterance,
      frames: energyProfile,
      finalBoundaries: finalBoundaryIndices,
      energyThreshold: ENERGY_THRESHOLD,
      finished: true,
    },
  });

  return steps;
}
