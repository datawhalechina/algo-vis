import { useParams } from "react-router-dom";
import { getAiLessonBlueprint } from "@/config/aiLessonBlueprints";
import { getAiLessonScene } from "@/config/lessonScenes/ai";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedAILessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  return (
    <GuidedLessonVisualizer
      blueprint={getAiLessonBlueprint(Number(id))}
      scene={getAiLessonScene(Number(id))}
      sectionLabel="AI 交互讲解"
    />
  );
}
