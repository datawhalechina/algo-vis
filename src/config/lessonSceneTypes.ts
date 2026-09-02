import type { GuidedLessonBlueprint } from "./guidedLessonTypes.ts";

export type SceneScalar = string | number | boolean;
export type SceneValue = SceneScalar | SceneScalar[] | SceneScalar[][];
export type LessonSceneKind =
  | "array"
  | "matrix"
  | "graph"
  | "sequence"
  | "pipeline"
  | "distribution";
export type EntityRole = "input" | "operator" | "intermediate" | "output" | "control";
export type EntityStatus = "waiting" | "active" | "complete" | "blocked" | "warning";

export interface LessonSceneEntity {
  id: string;
  label: string;
  role: EntityRole;
  groupId?: string;
  unit?: string;
}

export interface SceneDatum {
  entityId: string;
  label: string;
  value: SceneValue;
  unit?: string;
}

export interface SceneEntityState {
  value?: SceneValue;
  previousValue?: SceneValue;
  status: EntityStatus;
  visible: boolean;
  position?: { x: number; y: number };
}

export interface LessonSceneTransfer {
  id: string;
  from: string;
  to: string;
  sourceValue: SceneValue;
  payload: SceneValue;
  label: string;
}

export interface SceneOperation {
  label: string;
  sourceEntityIds: string[];
  targetEntityIds: string[];
  expression?: string;
}

export interface SceneDebugAssertion {
  label: string;
  entityId: string;
  operator: "eq" | "approx" | "range" | "finite" | "visible";
  expected: SceneValue;
}

export interface LessonSceneFrame {
  jointId: string;
  title: string;
  inputs: SceneDatum[];
  operation: SceneOperation;
  outputs: SceneDatum[];
  entityStates: Record<string, SceneEntityState>;
  visibleConnectionIds: string[];
  transfers: LessonSceneTransfer[];
  metrics: SceneDatum[];
  result: string;
  explanation: string;
  debugAssertions: SceneDebugAssertion[];
}

export interface LessonSceneConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface FormulaBinding {
  symbol: string;
  entityIds: string[];
}

interface LessonSceneBase<K extends LessonSceneKind, L> {
  lessonId: number;
  kind: K;
  ariaLabel: string;
  entities: LessonSceneEntity[];
  connections: LessonSceneConnection[];
  formulaBindings: FormulaBinding[];
  layout: L;
  framesByJointId: Record<string, LessonSceneFrame>;
}

export type ArraySceneSpec = LessonSceneBase<"array", {
  orientation: "horizontal" | "vertical";
  groups: Array<{ id: string; label: string; entityIds: string[] }>;
}>;
export type MatrixSceneSpec = LessonSceneBase<"matrix", {
  rows: number;
  columns: number;
  cellEntityIds: string[][];
}>;
export type GraphSceneSpec = LessonSceneBase<"graph", {
  nodeEntityIds: string[];
  positions: Record<string, { x: number; y: number }>;
}>;
export type SequenceSceneSpec = LessonSceneBase<"sequence", {
  trackIds: string[];
  trackByEntityId: Record<string, string>;
  orderedEntityIds: string[];
}>;
export type PipelineSceneSpec = LessonSceneBase<"pipeline", {
  laneIds: string[];
  laneByEntityId: Record<string, string>;
  stageEntityIds: string[];
}>;
export type DistributionSceneSpec = LessonSceneBase<"distribution", {
  categoryEntityIds: string[];
  xLabel: string;
  yLabel: string;
  yDomain: [number, number];
}>;

export type LessonSceneSpec =
  | ArraySceneSpec
  | MatrixSceneSpec
  | GraphSceneSpec
  | SequenceSceneSpec
  | PipelineSceneSpec
  | DistributionSceneSpec;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stable(nested)]),
    );
  }
  return value;
}

export function semanticSceneSignature(frame: LessonSceneFrame): string {
  const transfers = frame.transfers
    .map(({ from, to, sourceValue, payload }) => ({ from, to, sourceValue, payload }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  return JSON.stringify(stable({
    entities: Object.fromEntries(
      Object.entries(frame.entityStates).map(([id, state]) => [id, {
        value: state.value,
        previousValue: state.previousValue,
        visible: state.visible,
        position: state.position,
      }]),
    ),
    connections: [...frame.visibleConnectionIds].sort(),
    transfers,
  }));
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function evaluateDebugAssertion(
  assertion: SceneDebugAssertion,
  state: SceneEntityState | undefined,
): boolean {
  if (!state) return false;
  switch (assertion.operator) {
    case "eq":
      return sameValue(state.value, assertion.expected);
    case "approx":
      return typeof assertion.expected === "number"
        && typeof state.value === "number"
        && Math.abs(state.value - assertion.expected) <= 1e-6;
    case "range":
      return Array.isArray(assertion.expected)
        && assertion.expected.length === 2
        && typeof assertion.expected[0] === "number"
        && typeof assertion.expected[1] === "number"
        && typeof state.value === "number"
        && state.value >= assertion.expected[0]
        && state.value <= assertion.expected[1];
    case "finite":
      return typeof state.value === "number" && Number.isFinite(state.value);
    case "visible":
      return typeof assertion.expected === "boolean"
        && state.visible === assertion.expected;
  }
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && new Set(left).size === left.length
    && new Set(right).size === right.length
    && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

export function validateLessonScene(
  blueprint: GuidedLessonBlueprint,
  scene: LessonSceneSpec,
): string[] {
  const errors: string[] = [];
  const entityIds = scene.entities.map(({ id }) => id);
  const entityIdSet = new Set(entityIds);
  const connectionIds = scene.connections.map(({ id }) => id);
  const connectionIdSet = new Set(connectionIds);
  const flowIds = blueprint.flow.map(({ id }) => id);
  const frameKeys = Object.keys(scene.framesByJointId);

  if (blueprint.flow.length === 0) errors.push("flow must not be empty");
  if (flowIds.some((id) => !id.trim()) || new Set(flowIds).size !== flowIds.length) {
    errors.push("flow IDs must be nonempty and unique");
  }
  if (!sameSet(frameKeys, flowIds)) errors.push("frame keys must exactly match flow IDs");
  if (entityIds.some((id) => !id.trim()) || new Set(entityIds).size !== entityIds.length) {
    errors.push("entity IDs must be nonempty and unique");
  }
  if (connectionIds.some((id) => !id.trim()) || new Set(connectionIds).size !== connectionIds.length) {
    errors.push("connection IDs must be nonempty and unique");
  }
  for (const connection of scene.connections) {
    if (!entityIdSet.has(connection.from) || !entityIdSet.has(connection.to)) {
      errors.push(`connection ${connection.id} references an unknown entity`);
    }
  }

  const symbolIds = blueprint.symbols.map(({ symbol }) => symbol);
  const bindingSymbols = scene.formulaBindings.map(({ symbol }) => symbol);
  if (!sameSet(symbolIds, bindingSymbols) || symbolIds.some((symbol) => !symbol.trim())) {
    errors.push("formula bindings must exactly match unique blueprint symbols");
  }
  for (const binding of scene.formulaBindings) {
    if (
      binding.entityIds.length === 0
      || new Set(binding.entityIds).size !== binding.entityIds.length
      || binding.entityIds.some((id) => !entityIdSet.has(id))
    ) {
      errors.push(`formula binding ${binding.symbol} has invalid entities`);
    }
  }

  for (const key of frameKeys) {
    const frame = scene.framesByJointId[key];
    if (frame.jointId !== key) errors.push(`${key}: jointId differs from frame key`);
    if (!sameSet(Object.keys(frame.entityStates), entityIds)) {
      errors.push(`${key}: entityStates must cover every entity exactly once`);
    }
    if (frame.visibleConnectionIds.length > 72) errors.push(`${key}: too many visible connections`);
    if (frame.transfers.length > 12) errors.push(`${key}: too many transfers`);
    if (Object.values(frame.entityStates).filter(({ visible }) => visible).length > 48) {
      errors.push(`${key}: too many visible entities`);
    }
    if (
      new Set(frame.visibleConnectionIds).size !== frame.visibleConnectionIds.length
      || frame.visibleConnectionIds.some((id) => !connectionIdSet.has(id))
    ) {
      errors.push(`${key}: invalid visible connection`);
    }
    for (const id of [...frame.operation.sourceEntityIds, ...frame.operation.targetEntityIds]) {
      if (!entityIdSet.has(id) || !frame.entityStates[id]?.visible) {
        errors.push(`${key}: operation references an unknown or hidden entity`);
      }
    }
    for (const transfer of frame.transfers) {
      if (!entityIdSet.has(transfer.from) || !entityIdSet.has(transfer.to)) {
        errors.push(`${key}: transfer ${transfer.id} references an unknown entity`);
      }
      if (
        entityIdSet.has(transfer.from)
        && entityIdSet.has(transfer.to)
        && !frame.visibleConnectionIds.some((connectionId) => {
          const connection = scene.connections.find(({ id }) => id === connectionId);
          return connection?.from === transfer.from && connection.to === transfer.to;
        })
      ) {
        errors.push(`${key}: transfer ${transfer.id} has no visible connection`);
      }
      const input = frame.inputs.find(({ entityId }) => entityId === transfer.from);
      const sourceState = frame.entityStates[transfer.from];
      const sourceSnapshots = [input?.value, sourceState?.previousValue, sourceState?.value]
        .filter((value): value is SceneValue => value !== undefined);
      if (sourceSnapshots.length > 0
        && !sourceSnapshots.some((value) => sameValue(transfer.sourceValue, value))) {
        errors.push(`${key}: transfer ${transfer.id} has an invalid source snapshot`);
      }
    }
    for (const datum of frame.inputs) {
      const state = frame.entityStates[datum.entityId];
      const expectedInput = state?.previousValue ?? state?.value;
      if (!state?.visible || !sameValue(expectedInput, datum.value)) {
        errors.push(`${key}: input ${datum.entityId} differs from its pre-operation entity value`);
      }
    }
    for (const datum of [...frame.outputs, ...frame.metrics]) {
      const state = frame.entityStates[datum.entityId];
      if (!state?.visible || !sameValue(state.value, datum.value)) {
        errors.push(`${key}: datum ${datum.entityId} differs from its visible entity value`);
      }
    }
    for (const assertion of frame.debugAssertions) {
      const state = frame.entityStates[assertion.entityId];
      if (!state) {
        errors.push(`${key}: debug assertion references an unknown entity`);
        continue;
      }
      if (!evaluateDebugAssertion(assertion, state)) {
        errors.push(`${key}: ${assertion.operator} assertion does not match its entity state`);
      }
    }
    if (frame.inputs.length === 0 && frame.outputs.length === 0) {
      errors.push(`${key}: inputs and outputs cannot both be empty`);
    }
    if (frame.operation.sourceEntityIds.length === 0 || frame.operation.targetEntityIds.length === 0) {
      errors.push(`${key}: operation needs source and target entities`);
    }
    if (!frame.title.trim() || !frame.result.trim() || !frame.explanation.trim()) {
      errors.push(`${key}: missing beginner-facing explanation`);
    }
    if (frame.debugAssertions.length === 0) errors.push(`${key}: missing debug assertion`);
  }

  for (const binding of scene.formulaBindings) {
    if (!flowIds.some((frameId) =>
      binding.entityIds.some((id) => scene.framesByJointId[frameId]?.entityStates[id]?.visible))) {
      errors.push(`formula binding ${binding.symbol} is never visible`);
    }
  }

  const flowLabels = new Set(blueprint.flow.map(({ label }) => label.trim()));
  const hasNumericState = frameKeys.some((key) =>
    Object.values(scene.framesByJointId[key].entityStates).some(({ value }) => {
      if (typeof value === "number") return Number.isFinite(value);
      if (!Array.isArray(value)) return false;
      return value.flat().some((item) => typeof item === "number" && Number.isFinite(item));
    }),
  );
  if (!hasNumericState) errors.push("scene must contain at least one numeric state");
  const hasExpectedValueCheck = frameKeys.some((key) =>
    scene.framesByJointId[key].debugAssertions.some(({ operator }) => operator !== "visible"),
  );
  if (!hasExpectedValueCheck) errors.push("scene must contain at least one expected-value assertion");
  for (const key of frameKeys) {
    const frame = scene.framesByJointId[key];
    for (const state of Object.values(frame.entityStates)) {
      if (typeof state.value === "string" && flowLabels.has(state.value.trim())) {
        errors.push(`${key}: entity value copies a flow label instead of computation state`);
      }
    }
    for (const transfer of frame.transfers) {
      if (typeof transfer.payload === "string" && flowLabels.has(transfer.payload.trim())) {
        errors.push(`${key}: transfer payload copies a flow label instead of data`);
      }
    }
  }

  const orderedFrames = flowIds.map((id) => scene.framesByJointId[id]).filter(Boolean);
  for (let index = 1; index < orderedFrames.length; index += 1) {
    if (semanticSceneSignature(orderedFrames[index - 1]) === semanticSceneSignature(orderedFrames[index])) {
      errors.push(`${flowIds[index]}: adjacent frame has no semantic change`);
    }
  }

  const layoutIds = (() => {
    switch (scene.kind) {
      case "array": return scene.layout.groups.flatMap(({ entityIds: ids }) => ids);
      case "matrix": {
        if (scene.layout.rows <= 0 || scene.layout.columns <= 0
          || scene.layout.cellEntityIds.length !== scene.layout.rows
          || scene.layout.cellEntityIds.some((row) => row.length !== scene.layout.columns)) {
          errors.push("matrix shape does not match its declared dimensions");
        }
        return scene.layout.cellEntityIds.flat();
      }
      case "graph": {
        if (!sameSet(Object.keys(scene.layout.positions), scene.layout.nodeEntityIds)) {
          errors.push("graph positions must exactly cover graph nodes");
        }
        if (Object.values(scene.layout.positions).some(({ x, y }) =>
          !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1)) {
          errors.push("graph positions must be finite normalized coordinates");
        }
        return scene.layout.nodeEntityIds;
      }
      case "sequence": {
        if (!sameSet(Object.keys(scene.layout.trackByEntityId), scene.layout.orderedEntityIds)
          || new Set(scene.layout.trackIds).size !== scene.layout.trackIds.length
          || Object.values(scene.layout.trackByEntityId).some((id) => !scene.layout.trackIds.includes(id))) {
          errors.push("sequence tracks must exactly map sequence entities");
        }
        return scene.layout.orderedEntityIds;
      }
      case "pipeline": {
        if (!sameSet(Object.keys(scene.layout.laneByEntityId), scene.layout.stageEntityIds)
          || new Set(scene.layout.laneIds).size !== scene.layout.laneIds.length
          || Object.values(scene.layout.laneByEntityId).some((id) => !scene.layout.laneIds.includes(id))) {
          errors.push("pipeline lanes must exactly map pipeline entities");
        }
        return scene.layout.stageEntityIds;
      }
      case "distribution": {
        const [minimum, maximum] = scene.layout.yDomain;
        if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum >= maximum) {
          errors.push("distribution yDomain must be finite and increasing");
        }
        return scene.layout.categoryEntityIds;
      }
    }
  })();
  if (!sameSet(layoutIds, entityIds)) errors.push("layout must contain every entity exactly once");

  return errors;
}
