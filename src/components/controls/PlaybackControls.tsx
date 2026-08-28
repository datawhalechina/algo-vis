import { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepSelect: (step: number) => void;
  stepLabels?: string[];
}

function PlaybackControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onStepSelect,
  stepLabels,
}: PlaybackControlsProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLButtonElement>(null);
  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  useEffect(() => {
    const timeline = timelineRef.current;
    const current = currentStepRef.current;
    if (!timeline || !current) return;

    timeline.scrollTo({
      left: current.offsetLeft - timeline.clientWidth / 2 + current.clientWidth / 2,
      behavior: "smooth",
    });
  }, [currentStep]);

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-3 sm:px-5">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* 左侧：步骤信息 */}
        <div className="flex items-center gap-3 min-w-0 xl:min-w-[200px]">
          <span className="text-sm font-semibold text-gray-700">
            步骤 {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
            <div
              className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 中间：播放控制按钮 */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onReset}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="重置"
          >
            <RotateCcw size={18} className="text-gray-700" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="上一步"
          >
            <SkipBack size={18} className="text-gray-700" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={currentStep === totalSteps - 1 && !isPlaying}
            className="p-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="下一步"
          >
            <SkipForward size={18} className="text-gray-700" />
          </button>
        </div>

        {/* 右侧：速度控制 */}
        <div className="flex items-center justify-center gap-2 xl:min-w-[200px]">
          <Gauge size={18} className="text-gray-600" />
          <div className="flex gap-1">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSpeedChange(option.value)}
                className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                  speed === option.value
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
        role="list"
        aria-label="可视化步骤"
        data-testid="step-timeline"
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCurrent = index === currentStep;
          const isComplete = index < currentStep;
          return (
            <button
              key={index}
              ref={isCurrent ? currentStepRef : undefined}
              type="button"
              onClick={() => onStepSelect(index)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`跳转到步骤 ${index + 1}${stepLabels?.[index] ? `：${stepLabels[index]}` : ""}`}
              className={`group flex min-w-[2.5rem] max-w-[11rem] items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isCurrent
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : isComplete
                  ? "border-emerald-200 bg-white text-emerald-700"
                  : "border-gray-200 bg-white/80 text-gray-500 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-current text-[10px] font-bold">
                {index + 1}
              </span>
              {stepLabels?.[index] && (
                <span className="truncate font-medium">{stepLabels[index]}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PlaybackControls;
