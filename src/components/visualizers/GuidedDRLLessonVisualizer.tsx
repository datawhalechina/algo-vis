import { useParams } from "react-router-dom";
import { getDrlLessonBlueprint } from "@/config/drlLessonBlueprints";
import { getDrlLessonScene } from "@/config/lessonScenes/drl";
import { GuidedLessonVisualizer } from "./GuidedLessonVisualizer";

export default function GuidedDRLLessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);
  return (
    <GuidedLessonVisualizer
      blueprint={getDrlLessonBlueprint(lessonId)}
      scene={getDrlLessonScene(lessonId)}
      sectionLabel="强化学习交互讲解"
    />
  );
}
