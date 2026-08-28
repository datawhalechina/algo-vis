import { useParams } from "react-router-dom";
import { getConceptLessonBlueprint } from "@/config/conceptLessonBlueprints";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedConceptLessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  return (
    <GuidedLessonVisualizer
      blueprint={getConceptLessonBlueprint(Number(id))}
      sectionLabel="核心概念推演"
    />
  );
}
