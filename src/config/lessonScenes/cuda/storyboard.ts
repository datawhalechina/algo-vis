import type { GuidedLessonBlueprint } from "../../guidedLessonTypes.ts";
import type {
  EntityStatus,
  LessonSceneEntity,
  LessonSceneFrame,
  LessonSceneSpec,
  LessonSceneTransfer,
  SceneDatum,
  SceneValue,
} from "../../lessonSceneTypes.ts";

type SupportedCudaScene = Extract<
  LessonSceneSpec,
  { kind: "array" | "matrix" | "pipeline" }
>;
type SupportedCudaKind = SupportedCudaScene["kind"];

export interface CudaSceneEntityDefinition extends LessonSceneEntity {
  initialValue: SceneValue;
}

export interface CudaTransferDefinition {
  from: string;
  to: string;
  payload?: SceneValue;
  label?: string;
}

export interface CudaStoryboardStep {
  title: string;
  sourceEntityIds: string[];
  targetEntityIds: string[];
  values: Record<string, SceneValue>;
  result: string;
  explanation: string;
  inputEntityIds?: string[];
  outputEntityIds?: string[];
  metricEntityIds?: string[];
  transfers?: CudaTransferDefinition[];
  statuses?: Record<string, EntityStatus>;
  expression?: string;
  debugEntityId?: string;
  debugEntityIds?: string[];
}

interface CudaStoryboardDefinitionBase {
  ariaLabel: string;
  entities: CudaSceneEntityDefinition[];
  formulaEntityIds: string[][];
  steps: CudaStoryboardStep[];
}

export type CudaStoryboardDefinition = {
  [K in SupportedCudaKind]: CudaStoryboardDefinitionBase & {
    kind: K;
    layout: Extract<SupportedCudaScene, { kind: K }>["layout"];
  };
}[SupportedCudaKind];

interface ResolvedTransfer {
  from: string;
  to: string;
  payload?: SceneValue;
  label?: string;
}

function routesForStep(step: CudaStoryboardStep): ResolvedTransfer[] {
  const inPlaceEntityIds = step.sourceEntityIds.filter((id) =>
    step.targetEntityIds.includes(id),
  );
  if (inPlaceEntityIds.length > 0) {
    throw new Error(
      `${step.title}: in-place updates require an explicit pre-operation snapshot entity and explicit transfers`,
    );
  }

  if (step.transfers) return step.transfers;

  if (step.sourceEntityIds.length > 1 && step.targetEntityIds.length > 1) {
    throw new Error(
      `${step.title}: many-to-many routes require explicit transfers`,
    );
  }

  const routeCount = Math.max(step.sourceEntityIds.length, step.targetEntityIds.length);
  return Array.from({ length: routeCount }, (_, index) => ({
    from: step.sourceEntityIds[index % step.sourceEntityIds.length],
    to: step.targetEntityIds[index % step.targetEntityIds.length],
  }));
}

function transferPayload(value: SceneValue): SceneValue {
  return value;
}

function createDatum(
  entityId: string,
  values: Record<string, SceneValue>,
  entitiesById: Map<string, LessonSceneEntity>,
): SceneDatum {
  const entity = entitiesById.get(entityId);
  if (!entity) throw new Error(`Unknown CUDA scene entity: ${entityId}`);
  return {
    entityId,
    label: entity.label,
    value: values[entityId],
    ...(entity.unit ? { unit: entity.unit } : {}),
  };
}

function createDebugAssertion(
  entityId: string,
  values: Record<string, SceneValue>,
  entitiesById: Map<string, LessonSceneEntity>,
) {
  const entity = entitiesById.get(entityId);
  if (!entity) throw new Error(`Unknown CUDA debug entity: ${entityId}`);
  const value = values[entityId];
  return {
    label: `核对 ${entity.label}`,
    entityId,
    operator: "eq" as const,
    expected: value,
  };
}

export function createCudaStoryboardScene(
  blueprint: GuidedLessonBlueprint,
  definition: CudaStoryboardDefinition,
): LessonSceneSpec {
  if (definition.steps.length !== blueprint.flow.length) {
    throw new Error(
      `CUDA ${blueprint.id}: ${definition.steps.length} scene steps do not match ${blueprint.flow.length} flow joints`,
    );
  }
  if (definition.formulaEntityIds.length !== blueprint.symbols.length) {
    throw new Error(`CUDA ${blueprint.id}: formula binding count does not match symbols`);
  }

  for (const step of definition.steps) {
    const changedIds = Object.keys(step.values);
    const undeclaredChanges = changedIds.filter((id) => !step.targetEntityIds.includes(id));
    if (undeclaredChanges.length > 0) {
      throw new Error(
        `${step.title}: values may only update declared targets (${undeclaredChanges.join(", ")})`,
      );
    }
    const missingValues = step.targetEntityIds.filter((id) => !(id in step.values));
    if (missingValues.length > 0) {
      throw new Error(
        `${step.title}: every target needs a post-operation value (${missingValues.join(", ")})`,
      );
    }
  }

  const entities: LessonSceneEntity[] = definition.entities.map((entity) => ({
    id: entity.id,
    label: entity.label,
    role: entity.role,
    ...(entity.groupId ? { groupId: entity.groupId } : {}),
    ...(entity.unit ? { unit: entity.unit } : {}),
  }));
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const routesByStep = definition.steps.map(routesForStep);
  for (const [index, step] of definition.steps.entries()) {
    const routes = routesByStep[index];
    const declaredRouteSources = new Set([
      ...step.sourceEntityIds,
      ...step.targetEntityIds,
    ]);
    const undeclaredSources = routes
      .map(({ from }) => from)
      .filter((id) => !declaredRouteSources.has(id));
    const undeclaredTargets = routes
      .map(({ to }) => to)
      .filter((id) => !step.targetEntityIds.includes(id));
    const unroutedSources = step.sourceEntityIds.filter((id) =>
      !routes.some(({ from }) => from === id),
    );
    const unroutedTargets = step.targetEntityIds.filter((id) =>
      !routes.some(({ to }) => to === id),
    );
    if (
      undeclaredSources.length > 0
      || undeclaredTargets.length > 0
      || unroutedSources.length > 0
      || unroutedTargets.length > 0
    ) {
      throw new Error(`${step.title}: transfers must cover every declared source and target`);
    }
  }
  const edgeIdByRoute = new Map<string, string>();

  for (const routes of routesByStep) {
    for (const route of routes) {
      const routeKey = `${route.from}\u0000${route.to}`;
      if (!edgeIdByRoute.has(routeKey)) {
        edgeIdByRoute.set(routeKey, `edge-${edgeIdByRoute.size}`);
      }
    }
  }

  const connections = [...edgeIdByRoute.entries()].map(([routeKey, id]) => {
    const [from, to] = routeKey.split("\u0000");
    return { id, from, to };
  });
  const values: Record<string, SceneValue> = Object.fromEntries(
    definition.entities.map((entity) => [entity.id, entity.initialValue]),
  );
  const completedEntityIds = new Set<string>();

  const framesByJointId = Object.fromEntries(
    blueprint.flow.map((joint, index): [string, LessonSceneFrame] => {
      const step = definition.steps[index];
      const beforeSnapshot = { ...values };
      Object.assign(values, step.values);
      const snapshot = { ...values };
      const routes = routesByStep[index];
      const activeEntityIds = new Set([
        ...step.sourceEntityIds,
        ...step.targetEntityIds,
      ]);
      const entityStates = Object.fromEntries(entities.map((entity) => {
        let status: EntityStatus = completedEntityIds.has(entity.id) ? "complete" : "waiting";
        if (activeEntityIds.has(entity.id)) status = "active";
        if (step.statuses?.[entity.id]) status = step.statuses[entity.id];
        const changedTarget = step.targetEntityIds.includes(entity.id)
          && JSON.stringify(beforeSnapshot[entity.id]) !== JSON.stringify(snapshot[entity.id]);
        return [entity.id, {
          value: snapshot[entity.id],
          ...(changedTarget ? { previousValue: beforeSnapshot[entity.id] } : {}),
          status,
          visible: true,
        }];
      }));
      const inputIds = step.inputEntityIds ?? step.sourceEntityIds;
      const outputIds = step.outputEntityIds ?? step.targetEntityIds;
      if (step.sourceEntityIds.some((id) => !inputIds.includes(id))) {
        throw new Error(`${step.title}: every source must be exposed as an input`);
      }
      if (step.targetEntityIds.some((id) => !outputIds.includes(id))) {
        throw new Error(`${step.title}: every target must be exposed as an output`);
      }
      const inputs = inputIds
        .map((id) => createDatum(id, beforeSnapshot, entitiesById));
      const outputs = outputIds
        .map((id) => createDatum(id, snapshot, entitiesById));
      const metrics = (step.metricEntityIds ?? [])
        .map((id) => createDatum(id, snapshot, entitiesById));
      const transfers: LessonSceneTransfer[] = routes.map((route, routeIndex) => {
        const payload = route.payload ?? transferPayload(beforeSnapshot[route.from]);
        const sourceValue = JSON.stringify(payload) === JSON.stringify(snapshot[route.from])
          ? snapshot[route.from]
          : beforeSnapshot[route.from];
        return {
          id: `transfer-${index}-${routeIndex}`,
          from: route.from,
          to: route.to,
          sourceValue: transferPayload(sourceValue),
          payload,
          label: route.label
            ?? `${entitiesById.get(route.from)?.label ?? route.from} -> ${entitiesById.get(route.to)?.label ?? route.to}`,
        };
      });
      const visibleConnectionIds = routes.map((route) =>
        edgeIdByRoute.get(`${route.from}\u0000${route.to}`) as string,
      );
      const debugEntityIds = step.debugEntityIds
        ?? (step.debugEntityId ? [step.debugEntityId] : outputIds);

      for (const id of step.targetEntityIds) completedEntityIds.add(id);

      return [joint.id, {
        jointId: joint.id,
        title: step.title,
        inputs,
        operation: {
          label: joint.label,
          sourceEntityIds: step.sourceEntityIds,
          targetEntityIds: step.targetEntityIds,
          ...(step.expression ? { expression: step.expression } : {}),
        },
        outputs,
        entityStates,
        visibleConnectionIds,
        transfers,
        metrics,
        result: step.result,
        explanation: step.explanation,
        debugAssertions: debugEntityIds.map((entityId) =>
          createDebugAssertion(entityId, snapshot, entitiesById)),
      }];
    }),
  );

  const base = {
    lessonId: blueprint.id,
    ariaLabel: definition.ariaLabel,
    entities,
    connections,
    formulaBindings: blueprint.symbols.map(({ symbol }, index) => ({
      symbol,
      entityIds: definition.formulaEntityIds[index],
    })),
    framesByJointId,
  };

  switch (definition.kind) {
    case "array":
      return { ...base, kind: "array", layout: definition.layout };
    case "matrix":
      return { ...base, kind: "matrix", layout: definition.layout };
    case "pipeline":
      return { ...base, kind: "pipeline", layout: definition.layout };
  }
}
