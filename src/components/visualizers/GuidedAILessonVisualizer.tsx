import { useParams } from "react-router-dom";
import { getAiLessonBlueprint } from "@/config/aiLessonBlueprints";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedAILessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  return (
    <GuidedLessonVisualizer
      blueprint={getAiLessonBlueprint(Number(id))}
      sectionLabel="AI 交互讲解"
    />
  );
}
