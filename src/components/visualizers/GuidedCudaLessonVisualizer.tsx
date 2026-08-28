import { useParams } from "react-router-dom";
import { getCudaLessonBlueprint } from "@/config/cudaLessonBlueprints";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedCudaLessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  return (
    <GuidedLessonVisualizer
      blueprint={getCudaLessonBlueprint(Number(id))}
      sectionLabel="CUDA 交互讲解"
    />
  );
}
