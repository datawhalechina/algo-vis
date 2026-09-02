import { useParams } from "react-router-dom";
import { getCudaLessonBlueprint } from "@/config/cudaLessonBlueprints";
import { getCudaLessonScene } from "@/config/lessonScenes/cuda";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedCudaLessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  return (
    <GuidedLessonVisualizer
      blueprint={getCudaLessonBlueprint(Number(id))}
      scene={getCudaLessonScene(Number(id))}
      sectionLabel="CUDA 交互讲解"
    />
  );
}
