import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, MoveRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { MathText } from "@/components/MathText";
import type {
  LessonSceneEntity,
  LessonSceneFrame,
  LessonSceneConnection,
  LessonSceneSpec,
  SceneEntityState,
  SceneValue,
} from "@/config/lessonSceneTypes";
import { evaluateDebugAssertion } from "@/config/lessonSceneTypes";

interface AnimatedLessonSceneProps {
  spec: LessonSceneSpec;
  jointId?: string;
  jointIds: readonly string[];
  isPlaying: boolean;
  showDebug?: boolean;
}

function displayValue(value: SceneValue | undefined): string {
  if (value === undefined) return "-";
  if (Array.isArray(value)) return `[${value.map(displayValue).join(", ")}]`;
  return String(value);
}

function stateClass(state: SceneEntityState): string {
  switch (state.status) {
    case "active": return "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-200";
    case "complete": return "border-emerald-500 bg-emerald-50 text-emerald-950";
    case "blocked": return "border-gray-400 bg-gray-100 text-gray-500";
    case "warning": return "border-amber-500 bg-amber-50 text-amber-950";
    default: return "border-gray-200 bg-white text-gray-700";
  }
}

function statusLabel(status: SceneEntityState["status"]): string {
  return {
    waiting: "等待",
    active: "处理中",
    complete: "已完成",
    blocked: "阻塞",
    warning: "需检查",
  }[status];
}

function statusMarker(status: SceneEntityState["status"]): string {
  return {
    waiting: "待",
    active: "算",
    complete: "成",
    blocked: "阻",
    warning: "查",
  }[status];
}

function EntityCard({
  entity,
  state,
  compact = false,
  fill = false,
  duration,
}: {
  entity: LessonSceneEntity;
  state: SceneEntityState;
  compact?: boolean;
  fill?: boolean;
  duration: number;
}) {
  if (!state.visible) return null;
  const changed = state.previousValue !== undefined
    && displayValue(state.previousValue) !== displayValue(state.value);
  const valueLabel = changed
    ? `${displayValue(state.previousValue)} 变为 ${displayValue(state.value)}`
    : displayValue(state.value);

  return (
    <motion.div
      data-scene-entity={entity.id}
      data-entity-value={displayValue(state.value)}
      data-entity-previous-value={state.previousValue === undefined
        ? undefined
        : displayValue(state.previousValue)}
      data-entity-status={state.status}
      data-status-marker={statusMarker(state.status)}
      data-motion-duration={duration}
      data-entity-position={state.position ? `${state.position.x},${state.position.y}` : undefined}
      aria-label={`${entity.label}：${valueLabel}，${statusLabel(state.status)}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: state.visible ? 1 : 0.15 }}
      transition={{ duration }}
      style={{ transitionDuration: `${duration}s` }}
      className={`relative flex min-h-20 min-w-0 flex-col justify-between border p-3 pr-7 shadow-sm after:absolute after:right-1.5 after:top-1 after:text-[9px] after:font-bold after:opacity-60 after:content-[attr(data-status-marker)] ${stateClass(state)} ${compact ? "min-h-16" : ""} ${fill ? "h-full overflow-auto" : ""}`}
    >
      <span data-scene-label className="break-words text-xs font-semibold leading-4">
        {entity.label}
      </span>
      <span className="mt-2 flex min-w-0 flex-wrap items-center gap-1 font-mono text-sm font-bold sm:text-base">
        {changed && (
          <span className="break-all text-[11px] font-medium text-gray-500 line-through">
            {displayValue(state.previousValue)}{entity.unit ?? ""}
          </span>
        )}
        {changed && <span className="text-blue-600" aria-hidden="true">→</span>}
        <motion.span
          key={displayValue(state.value)}
          initial={{ opacity: changed ? 0.25 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration }}
          className="break-all"
        >
          {displayValue(state.value)}{entity.unit ?? ""}
        </motion.span>
      </span>
    </motion.div>
  );
}

function ArrayScene({ spec, frame, duration }: SceneRendererProps) {
  const groups = spec.kind === "array"
    ? spec.layout.groups.map((group) => ({
      ...group,
      entityIds: group.entityIds.filter((id) => frame.entityStates[id].visible),
    })).filter(({ entityIds }) => entityIds.length > 0)
    : [];
  return (
    <div data-scene-scroll-container className="h-full space-y-3 overflow-auto p-3">
      {groups.map((group) => (
        <section
          key={group.id}
          data-scene-group={group.id}
          className="grid gap-2 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start"
        >
          <p className="pt-1 text-[11px] font-bold leading-4 text-gray-500">{group.label}</p>
          <div
            className="grid min-w-0 gap-2"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(6.5rem, 100%), 1fr))" }}
          >
            {group.entityIds.map((id) => (
              <EntityCard key={id} entity={entityById(spec, id)} state={frame.entityStates[id]} compact duration={duration} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MatrixScene({ spec, frame, duration }: SceneRendererProps) {
  const matrix = spec.kind === "matrix" ? spec.layout.cellEntityIds : [];
  return (
    <div data-scene-scroll-container className="flex h-full items-center justify-center overflow-auto px-2 py-6">
      <div className="grid min-w-[18rem] gap-2" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length ?? 1}, minmax(4rem, 1fr))` }}>
        {matrix.flat().map((id) => (
          <EntityCard key={id} entity={entityById(spec, id)} state={frame.entityStates[id]} compact duration={duration} />
        ))}
      </div>
    </div>
  );
}

function GraphScene({ spec, frame, duration }: SceneRendererProps) {
  if (spec.kind !== "graph") return null;
  const visibleNodeIds = spec.layout.nodeEntityIds.filter(
    (id) => frame.entityStates[id].visible,
  );
  const nodeWidth = 144;
  const nodeHeight = 112;
  const nodeGap = 16;
  const padding = 32;
  const layoutSnapshots = [
    spec.layout.positions,
    ...Object.values(spec.framesByJointId).map((candidateFrame) =>
      Object.fromEntries(spec.layout.nodeEntityIds.map((id) => [
        id,
        candidateFrame.entityStates[id].position ?? spec.layout.positions[id],
      ]))),
  ];
  let coordinateScale = 640;
  for (const positions of layoutSnapshots) {
    for (let left = 0; left < spec.layout.nodeEntityIds.length; left += 1) {
      for (let right = left + 1; right < spec.layout.nodeEntityIds.length; right += 1) {
        const a = positions[spec.layout.nodeEntityIds[left]];
        const b = positions[spec.layout.nodeEntityIds[right]];
        const deltaX = Math.abs(a.x - b.x);
        const deltaY = Math.abs(a.y - b.y);
        const horizontalScale = deltaX > 0 ? (nodeWidth + nodeGap) / deltaX : Infinity;
        const verticalScale = deltaY > 0 ? (nodeHeight + nodeGap) / deltaY : Infinity;
        const pairScale = Math.min(horizontalScale, verticalScale);
        if (Number.isFinite(pairScale)) coordinateScale = Math.max(coordinateScale, pairScale);
      }
    }
  }
  coordinateScale = Math.ceil(coordinateScale);
  const canvasSize = coordinateScale + padding * 2 + Math.max(nodeWidth, nodeHeight);

  return (
    <div
      data-graph-layout="normalized"
      className="relative"
      style={{ width: canvasSize, height: canvasSize }}
    >
      {visibleNodeIds.map((id) => {
        const state = frame.entityStates[id];
        const position = state.position ?? spec.layout.positions[id];
        return (
          <div
            key={id}
            className="absolute h-28 w-36 min-w-0"
            style={{
              left: padding + nodeWidth / 2 + position.x * coordinateScale,
              top: padding + nodeHeight / 2 + position.y * coordinateScale,
              transform: "translate(-50%, -50%)",
            }}
          >
            <EntityCard entity={entityById(spec, id)} state={{ ...state, position }} compact fill duration={duration} />
          </div>
        );
      })}
    </div>
  );
}

function SequenceScene({ spec, frame, duration }: SceneRendererProps) {
  if (spec.kind !== "sequence") return null;
  return (
    <div data-scene-scroll-container className="h-full space-y-4 overflow-auto px-2 py-5">
      {spec.layout.trackIds.map((track) => {
        const ids = spec.layout.orderedEntityIds.filter((id) => spec.layout.trackByEntityId[id] === track);
        return (
          <div key={track} className="grid min-w-[26rem] grid-cols-[5rem_1fr] items-center gap-3">
            <span className="text-xs font-bold text-gray-500">{track}</span>
            <div className="flex gap-2">
              {ids.map((id) => (
                <div key={id} className="w-32 flex-none">
                  <EntityCard entity={entityById(spec, id)} state={frame.entityStates[id]} compact duration={duration} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PipelineScene({ spec, frame, duration }: SceneRendererProps) {
  if (spec.kind !== "pipeline") return null;
  return (
    <div data-scene-scroll-container className="h-full space-y-4 overflow-auto px-2 py-5">
      {spec.layout.laneIds.map((lane) => {
        const ids = spec.layout.stageEntityIds.filter((id) => spec.layout.laneByEntityId[id] === lane);
        return (
          <div key={lane} className="grid min-w-[28rem] grid-cols-[5rem_1fr] items-center gap-3">
            <span className="text-xs font-bold text-gray-500">{lane}</span>
            <div className="flex items-center gap-2">
              {ids.map((id) => (
                <div key={id} className="w-32 flex-none">
                  <EntityCard entity={entityById(spec, id)} state={frame.entityStates[id]} compact duration={duration} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DistributionScene({ spec, frame, duration }: SceneRendererProps) {
  if (spec.kind !== "distribution") return null;
  const [minimum, maximum] = spec.layout.yDomain;
  return (
    <div data-scene-scroll-container className="flex h-full items-end justify-center gap-3 overflow-x-auto px-3 pb-6 pt-10">
      {spec.layout.categoryEntityIds.map((id) => {
        const entity = entityById(spec, id);
        const state = frame.entityStates[id];
        if (!state.visible) return null;
        const numeric = typeof state.value === "number" ? state.value : minimum;
        const previousNumeric = typeof state.previousValue === "number"
          ? state.previousValue
          : undefined;
        const ratio = Math.max(0.08, Math.min(1, (numeric - minimum) / (maximum - minimum)));
        const previousRatio = previousNumeric === undefined
          ? 0
          : Math.max(0.08, Math.min(1, (previousNumeric - minimum) / (maximum - minimum)));
        const changed = previousNumeric !== undefined && previousNumeric !== numeric;
        return (
          <div
            key={id}
            data-scene-entity={id}
            data-entity-value={displayValue(state.value)}
            data-entity-previous-value={state.previousValue === undefined
              ? undefined
              : displayValue(state.previousValue)}
            data-entity-status={state.status}
            data-status-marker={statusMarker(state.status)}
            aria-label={`${entity.label}：${changed ? `${previousNumeric} 变为 ` : ""}${displayValue(state.value)}，${statusLabel(state.status)}`}
            className="relative flex w-20 flex-none flex-col items-center justify-end gap-2 after:absolute after:right-0 after:top-0 after:text-[9px] after:font-bold after:opacity-60 after:content-[attr(data-status-marker)]"
          >
            <span className="font-mono text-xs font-bold text-gray-700">
              {changed && <span className="mr-1 font-normal text-gray-400 line-through">{previousNumeric}</span>}
              {changed && <span className="mr-1 text-blue-600">→</span>}
              {displayValue(state.value)}
            </span>
            <motion.div
              initial={{ height: `${previousRatio * 11}rem` }}
              animate={{ height: `${ratio * 11}rem` }}
              transition={{ duration }}
              className={`w-full border ${stateClass(state)}`}
            />
            <span data-scene-label className="min-h-8 break-words text-center text-[11px] font-medium leading-4 text-gray-600">{entity.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface SceneRendererProps {
  spec: LessonSceneSpec;
  frame: LessonSceneFrame;
  duration: number;
}

function createPreparationFrame(
  spec: LessonSceneSpec,
  firstJointId: string | undefined,
): LessonSceneFrame | undefined {
  const firstFrame = firstJointId ? spec.framesByJointId[firstJointId] : undefined;
  if (!firstFrame) return undefined;

  const inputValues = new Map(firstFrame.inputs.map(({ entityId, value }) => [entityId, value]));
  const entityRoles = new Map(spec.entities.map(({ id, role }) => [id, role]));
  const targetIds = new Set(firstFrame.operation.targetEntityIds);
  const entityStates = Object.fromEntries(
    Object.entries(firstFrame.entityStates).map(([id, state]) => [id, {
      ...state,
      previousValue: undefined,
      value: inputValues.has(id)
        ? inputValues.get(id)
        : targetIds.has(id)
        ? undefined
        : entityRoles.get(id) === "input" || entityRoles.get(id) === "control"
        ? state.value
        : undefined,
      status: "waiting" as const,
    }]),
  );
  const inputs = firstFrame.operation.sourceEntityIds.flatMap((entityId) => {
    const entity = spec.entities.find((candidate) => candidate.id === entityId);
    const value = entityStates[entityId]?.value;
    if (!entity || value === undefined) return [];
    return [{ entityId, label: entity.label, value, unit: entity.unit }];
  });

  return {
    jointId: "preparation",
    title: "计算前准备",
    inputs,
    operation: {
      label: "输入与初始状态就位",
      sourceEntityIds: firstFrame.operation.sourceEntityIds,
      targetEntityIds: firstFrame.operation.targetEntityIds,
    },
    outputs: [],
    entityStates,
    visibleConnectionIds: [],
    transfers: [],
    metrics: [],
    result: "尚未执行第一个计算关节。",
    explanation: "输入、参数与待写入位置已经就位；选择关节 1 后再观察第一次状态变化。",
    debugAssertions: [],
  };
}

function entityById(spec: LessonSceneSpec, id: string): LessonSceneEntity {
  const entity = spec.entities.find((candidate) => candidate.id === id);
  if (!entity) throw new Error(`Unknown scene entity: ${id}`);
  return entity;
}

function VisualScene(props: SceneRendererProps) {
  switch (props.spec.kind) {
    case "array": return <ArrayScene {...props} />;
    case "matrix": return <MatrixScene {...props} />;
    case "graph": return <GraphScene {...props} />;
    case "sequence": return <SequenceScene {...props} />;
    case "pipeline": return <PipelineScene {...props} />;
    case "distribution": return <DistributionScene {...props} />;
  }
}

function DatumList({ title, items }: { title: string; items: LessonSceneFrame["inputs"] }) {
  const uniqueItems = uniqueDatumItems(items);
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase text-gray-500">{title}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {uniqueItems.length > 0 ? uniqueItems.map((item) => (
          <span key={`${item.entityId}-${item.label}`} className="max-w-full break-words border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
            {item.label}: <strong className="font-mono">{displayValue(item.value)}</strong>
          </span>
        )) : <span className="text-xs text-gray-400">本帧无新增写出</span>}
      </div>
    </div>
  );
}

type RouteLaneBaseProps = {
  spec: LessonSceneSpec;
  isPlaying: boolean;
  reduceMotion: boolean;
  index: number;
};

type RouteLaneProps = RouteLaneBaseProps & ({
  kind: "transfer";
  transfer: LessonSceneFrame["transfers"][number];
} | {
  kind: "dependency";
  frame: LessonSceneFrame;
  connection: LessonSceneConnection;
});

function RouteLane(props: RouteLaneProps) {
  const { spec, isPlaying, reduceMotion, index } = props;
  const isTransfer = props.kind === "transfer";
  const route = isTransfer ? props.transfer : props.connection;
  const source = entityById(spec, route.from);
  const target = entityById(spec, route.to);
  const sourceValue = isTransfer
    ? displayValue(props.transfer.sourceValue)
    : displayValue(props.frame.entityStates[route.from].value);
  const targetValue = isTransfer
    ? displayValue(props.transfer.payload)
    : displayValue(props.frame.entityStates[route.to].value);
  const routeLabel = route.label ?? "依赖";
  const markerId = `route-arrow-${props.kind}-${route.id}`;
  const color = isTransfer ? "#2563eb" : "#047857";

  return (
    <div
      data-route-lane={route.id}
      data-route-kind={props.kind}
      data-transfer-lane={isTransfer ? route.id : undefined}
      data-dependency-lane={isTransfer ? undefined : route.id}
      data-scene-transfer-line={isTransfer ? route.id : undefined}
      data-scene-connection-line={isTransfer ? undefined : route.id}
      data-transfer-source-value={isTransfer ? sourceValue : undefined}
      data-transfer-payload={isTransfer ? targetValue : undefined}
      aria-label={isTransfer
        ? `${source.label} 的源快照 ${sourceValue}，${routeLabel}，搬运 ${targetValue} 到 ${target.label}`
        : `${source.label} 到 ${target.label} 的依赖：${routeLabel}`}
      className={`min-w-0 border px-3 py-2 text-xs ${isTransfer
        ? "border-blue-100 bg-blue-50 text-blue-950"
        : "border-emerald-100 bg-emerald-50 text-emerald-950"}`}
    >
      <p data-route-label className={`mb-1 break-words text-[10px] font-bold leading-4 ${isTransfer ? "text-blue-800" : "text-emerald-800"}`}>
        {index + 1}. {routeLabel}
      </p>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] items-center gap-2">
        <span data-transfer-source-label className="min-w-0 text-left">
          <span className="block break-words font-semibold leading-4" title={source.label}>{source.label}</span>
          <span className={`block break-all font-mono text-[10px] ${isTransfer ? "text-blue-700" : "text-emerald-700"}`} title={sourceValue}>
            {isTransfer ? "源快照" : "当前值"} {sourceValue}
          </span>
        </span>
        <span className="relative h-6" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker id={markerId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={color} />
              </marker>
            </defs>
            <line
              data-route-path={route.id}
              data-route-from={route.from}
              data-route-to={route.to}
              data-transfer-path={isTransfer ? route.id : undefined}
              data-transfer-from={isTransfer ? route.from : undefined}
              data-transfer-to={isTransfer ? route.to : undefined}
              data-dependency-path={isTransfer ? undefined : route.id}
              data-connection-id={route.id}
              x1="2"
              y1="12"
              x2="68"
              y2="12"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="4 4"
              markerEnd={`url(#${markerId})`}
            />
            <motion.circle
              r="4"
              fill={color}
              initial={{ cx: 2, cy: 12 }}
              animate={{ cx: 60, cy: 12 }}
              transition={{
                duration: reduceMotion ? 0 : 0.75,
                delay: reduceMotion ? 0 : index * 0.08,
                repeat: isPlaying && !reduceMotion ? Infinity : 0,
                repeatDelay: 0.2,
              }}
            />
          </svg>
        </span>
        <span data-transfer-target-label className="min-w-0 text-right">
          <span className="block break-words font-semibold leading-4" title={target.label}>{target.label}</span>
          <span className={`block break-all font-mono text-[10px] ${isTransfer ? "text-blue-700" : "text-emerald-700"}`} title={targetValue}>
            {isTransfer ? "搬运" : "影响"} {targetValue}
          </span>
        </span>
      </div>
    </div>
  );
}

function uniqueDatumItems(items: LessonSceneFrame["inputs"]): LessonSceneFrame["inputs"] {
  const seen = new Set<string>();
  return items.filter(({ entityId }) => {
    if (seen.has(entityId)) return false;
    seen.add(entityId);
    return true;
  });
}

function describeData(items: LessonSceneFrame["inputs"]): string {
  const uniqueItems = uniqueDatumItems(items);
  if (uniqueItems.length === 0) return "无";
  return uniqueItems.map((item) => `${item.label}：${displayValue(item.value)}`).join("；");
}

export function AnimatedLessonScene({
  spec,
  jointId,
  jointIds,
  isPlaying,
  showDebug = false,
}: AnimatedLessonSceneProps) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);
  const renderedJointId = jointId ?? "preparation";
  const frame = useMemo(
    () => jointId
      ? spec.framesByJointId[jointId]
      : createPreparationFrame(spec, jointIds[0]),
    [jointId, jointIds, spec],
  );
  const frameIndex = jointId ? jointIds.indexOf(jointId) : -1;
  const duration = reduceMotion ? 0 : 0.38;
  const visibleAssertions = showDebug
    ? frame?.debugAssertions ?? []
    : frame?.debugAssertions.slice(0, 1) ?? [];
  const transferPairs = new Set(
    frame?.transfers.map(({ from, to }) => `${from}->${to}`) ?? [],
  );
  const dependencyConnections = frame?.visibleConnectionIds.flatMap((connectionId) => {
    const connection = spec.connections.find(({ id }) => id === connectionId);
    if (!connection || transferPairs.has(`${connection.from}->${connection.to}`)) return [];
    return [connection];
  }) ?? [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const animationFrame = requestAnimationFrame(() => {
      const currentFrame = canvas.querySelector<HTMLElement>(
        `[data-scene-frame="${CSS.escape(renderedJointId)}"]`,
      );
      const preferredId = frame.operation.targetEntityIds.find((id) =>
        currentFrame?.querySelector(`[data-scene-entity="${CSS.escape(id)}"]`))
        ?? frame.operation.sourceEntityIds.find((id) =>
          currentFrame?.querySelector(`[data-scene-entity="${CSS.escape(id)}"]`));
      if (!preferredId) return;
      const entity = currentFrame?.querySelector<HTMLElement>(
        `[data-scene-entity="${CSS.escape(preferredId)}"]`,
      );
      const scroller = entity?.closest<HTMLElement>("[data-scene-scroll-container]");
      if (!entity || !scroller) return;
      const entityBox = entity.getBoundingClientRect();
      const scrollerBox = scroller.getBoundingClientRect();
      const outsideViewport = entityBox.left < scrollerBox.left
        || entityBox.right > scrollerBox.right
        || entityBox.top < scrollerBox.top
        || entityBox.bottom > scrollerBox.bottom;
      if (outsideViewport) {
        entity.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: reduceMotion ? "auto" : "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [frame, reduceMotion, renderedJointId]);

  if (!frame) {
    return (
      <div role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        当前动画帧不存在，请返回课程目录后重试。
      </div>
    );
  }

  return (
    <section data-testid="animated-lesson-scene" data-scene-kind={spec.kind} aria-label={spec.ariaLabel} className="overflow-hidden border border-gray-200 bg-gray-50">
      <div className="flex h-20 flex-wrap items-start justify-between gap-3 overflow-y-auto border-b border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-blue-700">逐帧运行</p>
          <h4 className="mt-1 text-sm font-bold text-gray-950 sm:text-base">{frame.title}</h4>
        </div>
        <span className="border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-600">
          {frameIndex >= 0 ? `${frameIndex + 1} / ${jointIds.length}` : `准备 / ${jointIds.length}`}
        </span>
      </div>

      <div className="grid gap-px border-b border-gray-200 bg-gray-200 sm:grid-cols-[1fr_auto_1fr]">
        <div className="h-24 overflow-auto bg-white p-3"><DatumList title="当前输入" items={frame.inputs} /></div>
        <div className="flex h-24 min-w-0 items-center gap-2 overflow-auto bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          <MoveRight size={17} className="flex-none" aria-hidden="true" />
          <div className="min-w-0 space-y-1">
            <p className="break-words">{frame.operation.label}</p>
            {frame.operation.expression && (
              <span data-testid="frame-operation-expression" className="block max-w-full overflow-x-auto text-xs font-normal">
                <MathText text={`$${frame.operation.expression}$`} compact />
              </span>
            )}
          </div>
        </div>
        <div className="h-24 overflow-auto bg-white p-3"><DatumList title="当前输出" items={frame.outputs} /></div>
      </div>

      <div ref={canvasRef} data-testid="scene-canvas" className="relative h-80 overflow-hidden bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]">
        <div data-scene-scroll-container data-scene-primary-scroll className="h-full overflow-auto">
          <div data-scene-frame={renderedJointId}>
            <VisualScene spec={spec} frame={frame} duration={duration} />
          </div>
        </div>
      </div>

      <div className="h-72 overflow-y-auto border-t border-gray-200 bg-white px-4 py-3">
          <p className="mb-2 text-[11px] font-bold uppercase text-gray-500">本帧数据流与依赖</p>
          {frame.transfers.length > 0 || dependencyConnections.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {frame.transfers.map((transfer, index) => (
                <RouteLane
                  key={`${renderedJointId}-${transfer.id}`}
                  kind="transfer"
                  spec={spec}
                  transfer={transfer}
                  isPlaying={isPlaying}
                  reduceMotion={Boolean(reduceMotion)}
                  index={index}
                />
              ))}
              {dependencyConnections.map((connection, index) => (
                <RouteLane
                  key={`${renderedJointId}-${connection.id}`}
                  kind="dependency"
                  spec={spec}
                  frame={frame}
                  connection={connection}
                  isPlaying={isPlaying}
                  reduceMotion={Boolean(reduceMotion)}
                  index={frame.transfers.length + index}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">本帧只更新本地状态，没有跨实体搬运。</p>
          )}
      </div>

      <div className="grid h-32 gap-3 overflow-y-auto border-t border-gray-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{frame.result}</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">{frame.explanation}</p>
        </div>
        <div
          data-testid={showDebug ? "lesson-debug-checks" : "frame-debug-checks"}
          className={`min-w-0 space-y-1 border p-3 text-xs ${
            showDebug
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-sky-200 bg-sky-50 text-sky-950"
          }`}
        >
          <p className="font-bold">{showDebug ? "调试检查单" : "本帧核对"}</p>
          {visibleAssertions.map((assertion) => {
                const state = frame.entityStates[assertion.entityId];
                const passed = evaluateDebugAssertion(assertion, state);
                return (
                  <p key={`${frame.jointId}-${assertion.entityId}-${assertion.label}`} data-debug-joint-id={frame.jointId} className="flex min-w-0 items-start gap-2">
                    {passed
                      ? <CheckCircle2 size={14} className="mt-0.5 flex-none text-emerald-700" aria-hidden="true" />
                      : <AlertCircle size={14} className="mt-0.5 flex-none text-red-700" aria-hidden="true" />}
                    <span className="min-w-0 break-words">{assertion.label}：实际 {displayValue(state.value)}；预期 {displayValue(assertion.expected)}；{passed ? "通过" : "未通过"}</span>
                  </p>
                );
              })}
        </div>
      </div>

      <div className="sr-only">
        <table data-testid="scene-data-table">
          <caption>{frame.title} 当前数据</caption>
          <thead><tr><th>类别</th><th>当前数据</th></tr></thead>
          <tbody>
            <tr><td>输入</td><td>{describeData(frame.inputs)}</td></tr>
            <tr>
              <td>运算</td>
              <td>{frame.operation.label}：{frame.operation.expression ?? "执行"}</td>
            </tr>
            <tr><td>输出</td><td>{describeData(frame.outputs)}</td></tr>
            {frame.metrics.length > 0 && (
              <tr><td>指标</td><td>{describeData(frame.metrics)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
