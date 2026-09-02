import type { GuidedLessonBlueprint } from "../../guidedLessonTypes.ts";
import type {
  EntityRole,
  EntityStatus,
  LessonSceneFrame,
  LessonSceneKind,
  LessonSceneSpec,
  SceneDebugAssertion,
  SceneValue,
} from "../../lessonSceneTypes.ts";

export const CONCEPT_LESSON_IDS = [
  40001, 40002, 40003, 40004, 40005, 40006,
  40007, 40008, 40009, 40010, 40011, 40012,
  40013, 40014, 40015, 40016, 40017, 40018,
  40019, 40020, 40021, 40022, 40023, 40024,
  40025, 40026, 40027, 40028, 40029, 40030,
  40031, 40032, 40033, 40034, 40035, 40036,
] as const;

export type ConceptLessonId = (typeof CONCEPT_LESSON_IDS)[number];

export interface ConceptEntityProfile {
  id: string;
  label: string;
  role: EntityRole;
  initialValue: SceneValue;
  visibleFrom: number;
  group?: string;
  unit?: string;
  position?: { x: number; y: number };
}

export interface ConceptConnectionProfile {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface ConceptTransferProfile {
  id: string;
  from: string;
  to: string;
  payload: SceneValue;
  label: string;
}

export interface ConceptCheckProfile {
  entityId: string;
  expected: SceneValue;
  label: string;
  operator?: SceneDebugAssertion["operator"];
}

export interface ConceptFrameProfile {
  sourceEntityIds: string[];
  targetEntityIds: string[];
  values: Record<string, SceneValue>;
  visibleConnectionIds: string[];
  transfers: ConceptTransferProfile[];
  result: string;
  check: ConceptCheckProfile;
  checks?: ConceptCheckProfile[];
  inputEntityIds?: string[];
  outputEntityIds?: string[];
  metricEntityIds?: string[];
  expression?: string;
  visibility?: Record<string, boolean>;
  positions?: Record<string, { x: number; y: number }>;
}

export interface ConceptSceneProfile {
  kind: LessonSceneKind;
  entities: ConceptEntityProfile[];
  connections: ConceptConnectionProfile[];
  formulaBindings: Record<string, string[]>;
  frames: ConceptFrameProfile[];
  explanations: string[];
  orientation?: "horizontal" | "vertical";
  yDomain?: [number, number];
}

export type ConceptSceneProfileTable = Partial<
  Record<ConceptLessonId, ConceptSceneProfile>
>;

export function entity(
  id: string,
  label: string,
  role: EntityRole,
  initialValue: SceneValue,
  visibleFrom = 0,
  group?: string,
  unit?: string,
): ConceptEntityProfile {
  return { id, label, role, initialValue, visibleFrom, group, unit };
}

export function connection(
  id: string,
  from: string,
  to: string,
  label?: string,
): ConceptConnectionProfile {
  return { id, from, to, label };
}

export function transfer(
  id: string,
  from: string,
  to: string,
  payload: ConceptTransferProfile["payload"],
  label: string,
): ConceptTransferProfile {
  return { id, from, to, payload, label };
}

export function check(
  entityId: string,
  expected: SceneValue,
  label: string,
  operator: SceneDebugAssertion["operator"] = "eq",
): ConceptCheckProfile {
  return { entityId, expected, label, operator };
}

function cloneValue<T extends SceneValue>(value: T): T {
  return structuredClone(value);
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && new Set(left).size === left.length
    && new Set(right).size === right.length
    && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function assertProfile(
  blueprint: GuidedLessonBlueprint,
  profile: ConceptSceneProfile,
): void {
  if (profile.entities.length < 2) {
    throw new Error(`Concept lesson ${blueprint.id} needs at least two entities`);
  }
  if (profile.frames.length !== blueprint.flow.length
    || profile.explanations.length !== blueprint.flow.length) {
    throw new Error(`Concept lesson ${blueprint.id} needs one semantic frame per flow joint`);
  }

  const entityIds = profile.entities.map(({ id }) => id);
  const entityIdSet = new Set(entityIds);
  const connectionIds = profile.connections.map(({ id }) => id);
  const connectionIdSet = new Set(connectionIds);
  if (entityIdSet.size !== entityIds.length || entityIds.some((id) => !id.trim())) {
    throw new Error(`Concept lesson ${blueprint.id} has invalid semantic entity IDs`);
  }
  if (connectionIdSet.size !== connectionIds.length) {
    throw new Error(`Concept lesson ${blueprint.id} has duplicate connection IDs`);
  }
  if (!sameSet(Object.keys(profile.formulaBindings), blueprint.symbols.map(({ symbol }) => symbol))) {
    throw new Error(`Concept lesson ${blueprint.id} needs an explicit binding for every symbol`);
  }
  for (const [symbol, ids] of Object.entries(profile.formulaBindings)) {
    if (ids.length === 0 || ids.some((id) => !entityIdSet.has(id))) {
      throw new Error(`Concept lesson ${blueprint.id} has an invalid ${symbol} binding`);
    }
  }
  for (const candidate of profile.connections) {
    if (!entityIdSet.has(candidate.from) || !entityIdSet.has(candidate.to)) {
      throw new Error(`Concept lesson ${blueprint.id} has an invalid ${candidate.id} connection`);
    }
  }
  profile.frames.forEach((frame, frameIndex) => {
    const referencedIds = [
      ...frame.sourceEntityIds,
      ...frame.targetEntityIds,
      ...Object.keys(frame.values),
      ...Object.keys(frame.visibility ?? {}),
      ...Object.keys(frame.positions ?? {}),
      ...(frame.inputEntityIds ?? []),
      ...(frame.outputEntityIds ?? []),
      ...(frame.metricEntityIds ?? []),
      frame.check.entityId,
      ...(frame.checks ?? []).map(({ entityId }) => entityId),
    ];
    if (frame.sourceEntityIds.length === 0 || frame.targetEntityIds.length === 0
      || referencedIds.some((id) => !entityIdSet.has(id))) {
      throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} has invalid causal entities`);
    }
    if (frame.visibleConnectionIds.some((id) => !connectionIdSet.has(id))) {
      throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} has invalid topology`);
    }
    for (const movement of frame.transfers) {
      if (!entityIdSet.has(movement.from) || !entityIdSet.has(movement.to)) {
        throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} has an invalid transfer`);
      }
      const hasVisiblePath = frame.visibleConnectionIds.some((id) => {
        const edge = profile.connections.find((candidate) => candidate.id === id);
        return edge?.from === movement.from && edge.to === movement.to;
      });
      if (!hasVisiblePath) {
        throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} hides a transfer path`);
      }
    }
  });
}

function createLayout(
  profile: ConceptSceneProfile,
): LessonSceneSpec["layout"] {
  const entityIds = profile.entities.map(({ id }) => id);
  const groups = [...new Set(profile.entities.map(({ group }) => group ?? "状态"))];
  switch (profile.kind) {
    case "array":
      return {
        orientation: profile.orientation ?? "horizontal",
        groups: groups.map((group) => ({
          id: `group-${group}`,
          label: group,
          entityIds: profile.entities
            .filter((candidate) => (candidate.group ?? "状态") === group)
            .map(({ id }) => id),
        })),
      };
    case "matrix": {
      const columns = Math.ceil(Math.sqrt(entityIds.length));
      const rows = Math.ceil(entityIds.length / columns);
      if (rows * columns !== entityIds.length) {
        throw new Error("Concept matrix profiles must form a complete rectangle");
      }
      return {
        rows,
        columns,
        cellEntityIds: Array.from({ length: rows }, (_, index) =>
          entityIds.slice(index * columns, (index + 1) * columns)),
      };
    }
    case "graph":
      return {
        nodeEntityIds: entityIds,
        positions: Object.fromEntries(profile.entities.map((candidate, index) => {
          const angle = (Math.PI * 2 * index) / profile.entities.length - Math.PI / 2;
          return [candidate.id, candidate.position ?? {
            x: Number((0.5 + Math.cos(angle) * 0.36).toFixed(3)),
            y: Number((0.5 + Math.sin(angle) * 0.36).toFixed(3)),
          }];
        })),
      };
    case "sequence":
      return {
        trackIds: groups,
        trackByEntityId: Object.fromEntries(
          profile.entities.map(({ id, group }) => [id, group ?? "状态"]),
        ),
        orderedEntityIds: entityIds,
      };
    case "pipeline":
      return {
        laneIds: groups,
        laneByEntityId: Object.fromEntries(
          profile.entities.map(({ id, group }) => [id, group ?? "状态"]),
        ),
        stageEntityIds: entityIds,
      };
    case "distribution":
      return {
        categoryEntityIds: entityIds,
        xLabel: "候选状态",
        yLabel: "相对值",
        yDomain: profile.yDomain ?? [0, 1],
      };
  }
}

function datum(
  entityById: Map<string, ConceptEntityProfile>,
  values: Record<string, SceneValue>,
  entityId: string,
) {
  const candidate = entityById.get(entityId);
  if (!candidate) throw new Error(`Unknown concept entity ${entityId}`);
  return {
    entityId,
    label: candidate.label,
    value: cloneValue(values[entityId]),
    unit: candidate.unit,
  };
}

function debugAssertion(candidate: ConceptCheckProfile): SceneDebugAssertion {
  return {
    label: candidate.label,
    entityId: candidate.entityId,
    operator: candidate.operator ?? "eq",
    expected: cloneValue(candidate.expected),
  };
}

export function createConceptLessonScene(
  blueprint: GuidedLessonBlueprint,
  profile: ConceptSceneProfile,
): LessonSceneSpec {
  assertProfile(blueprint, profile);
  const entityById = new Map(profile.entities.map((candidate) => [candidate.id, candidate]));
  const values = Object.fromEntries(
    profile.entities.map(({ id, initialValue }) => [id, cloneValue(initialValue)]),
  );
  const positions: Record<string, { x: number; y: number } | undefined> = {};
  const visibility = Object.fromEntries(profile.entities.map(({ id }) => [id, false]));

  const framesByJointId = Object.fromEntries(
    blueprint.flow.map((joint, frameIndex): [string, LessonSceneFrame] => {
      const frame = profile.frames[frameIndex];
      for (const candidate of profile.entities) {
        if (frameIndex >= candidate.visibleFrom) {
          visibility[candidate.id] = true;
        }
      }
      Object.assign(visibility, frame.visibility);
      const inputValues = structuredClone(values);
      const sourceIds = frame.inputEntityIds ?? frame.sourceEntityIds;
      const targetIds = frame.outputEntityIds ?? frame.targetEntityIds;
      for (const [id, nextValue] of Object.entries(frame.values)) {
        values[id] = cloneValue(nextValue);
      }
      for (const [id, nextPosition] of Object.entries(frame.positions ?? {})) {
        positions[id] = nextPosition;
      }
      const referenced = [...frame.sourceEntityIds, ...frame.targetEntityIds];
      if (referenced.some((id) => !visibility[id])) {
        throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} operates on a hidden entity`);
      }
      for (const movement of frame.transfers) {
        const sourceSnapshots = [inputValues[movement.from], values[movement.from]];
        if (!sourceSnapshots.some((value) =>
          JSON.stringify(movement.payload) === JSON.stringify(value))) {
          throw new Error(`Concept lesson ${blueprint.id} frame ${frameIndex} transfer payload differs from source`);
        }
      }
      return [joint.id, {
        jointId: joint.id,
        title: joint.label,
        inputs: sourceIds.map((id) => datum(entityById, inputValues, id)),
        operation: {
          label: joint.label,
          sourceEntityIds: [...frame.sourceEntityIds],
          targetEntityIds: [...frame.targetEntityIds],
          expression: frame.expression,
        },
        outputs: targetIds.map((id) => datum(entityById, values, id)),
        entityStates: Object.fromEntries(profile.entities.map((candidate) => {
          let status: EntityStatus = "waiting";
          if (frame.sourceEntityIds.includes(candidate.id)
            || frame.targetEntityIds.includes(candidate.id)) status = "active";
          else if (visibility[candidate.id] && frameIndex > candidate.visibleFrom) status = "complete";
          return [candidate.id, {
            value: cloneValue(values[candidate.id]),
            ...(targetIds.includes(candidate.id)
              && Object.prototype.hasOwnProperty.call(frame.values, candidate.id)
              && JSON.stringify(inputValues[candidate.id]) !== JSON.stringify(values[candidate.id])
              ? { previousValue: cloneValue(inputValues[candidate.id]) }
              : {}),
            status,
            visible: visibility[candidate.id],
            ...(positions[candidate.id] ? { position: positions[candidate.id] } : {}),
          }];
        })),
        visibleConnectionIds: [...frame.visibleConnectionIds],
        transfers: frame.transfers.map((movement) => ({
          ...movement,
          sourceValue: cloneValue(
            JSON.stringify(movement.payload) === JSON.stringify(values[movement.from])
              ? values[movement.from]
              : inputValues[movement.from],
          ),
          payload: cloneValue(movement.payload),
        })),
        metrics: (frame.metricEntityIds ?? []).map((id) => datum(entityById, values, id)),
        result: frame.result,
        explanation: profile.explanations[frameIndex],
        debugAssertions: [frame.check, ...(frame.checks ?? [])].map(debugAssertion),
      }];
    }),
  );

  const base = {
    lessonId: blueprint.id,
    ariaLabel: `${blueprint.title}的逐步因果场景`,
    entities: profile.entities.map(({ id, label, role, group, unit }) => ({
      id,
      label,
      role,
      groupId: group,
      unit,
    })),
    connections: profile.connections.map((candidate) => ({ ...candidate })),
    formulaBindings: blueprint.symbols.map(({ symbol }) => ({
      symbol,
      entityIds: [...profile.formulaBindings[symbol]],
    })),
    framesByJointId,
  };
  const layout = createLayout(profile);

  switch (profile.kind) {
    case "array": return { ...base, kind: "array", layout: layout as Extract<LessonSceneSpec, { kind: "array" }>["layout"] };
    case "matrix": return { ...base, kind: "matrix", layout: layout as Extract<LessonSceneSpec, { kind: "matrix" }>["layout"] };
    case "graph": return { ...base, kind: "graph", layout: layout as Extract<LessonSceneSpec, { kind: "graph" }>["layout"] };
    case "sequence": return { ...base, kind: "sequence", layout: layout as Extract<LessonSceneSpec, { kind: "sequence" }>["layout"] };
    case "pipeline": return { ...base, kind: "pipeline", layout: layout as Extract<LessonSceneSpec, { kind: "pipeline" }>["layout"] };
    case "distribution": return { ...base, kind: "distribution", layout: layout as Extract<LessonSceneSpec, { kind: "distribution" }>["layout"] };
  }
}
