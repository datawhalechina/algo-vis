import { expect, test, type Page } from "@playwright/test";
import { aiLessonBlueprints } from "../../src/config/aiLessonBlueprints/index.ts";
import { conceptLessonBlueprints } from "../../src/config/conceptLessonBlueprints/index.ts";
import { cudaLessonBlueprints } from "../../src/config/cudaLessonBlueprints/index.ts";
import { drlLessonBlueprints } from "../../src/config/drlLessonBlueprints.ts";

const representativeRoutes = [
  "/concepts/40003",
  "/ai/10072",
  "/ai/10082",
  "/ai/10102",
  "/ai/10111",
  "/drl/30030",
] as const;

const conceptRepresentativeRoutes = [
  { route: "/concepts/40003", lessonId: 40003, kind: "array" },
  { route: "/concepts/40007", lessonId: 40007, kind: "sequence" },
  { route: "/concepts/40020", lessonId: 40020, kind: "graph" },
  { route: "/concepts/40034", lessonId: 40034, kind: "pipeline" },
] as const;

const cudaReductionJointIds = [
  "read-registers",
  "write-shared",
  "block-barrier",
  "shared-tree-reduce",
  "warp-tail",
  "write-block-sum",
  "finalize-grid-sum",
] as const;

const guidedRouteGroups = [
  {
    name: "AI",
    routes: aiLessonBlueprints.map((blueprint) => ({
      route: `/ai/${blueprint.id}`,
      lessonId: blueprint.id,
      jointIds: blueprint.flow.map(({ id }) => id),
    })),
  },
  {
    name: "CUDA",
    routes: cudaLessonBlueprints.map((blueprint) => ({
      route: `/cuda/${blueprint.id}`,
      lessonId: blueprint.id,
      jointIds: blueprint.flow.map(({ id }) => id),
    })),
  },
  {
    name: "DRL",
    routes: drlLessonBlueprints.map((blueprint) => ({
      route: `/drl/${blueprint.id}`,
      lessonId: blueprint.id,
      jointIds: blueprint.flow.map(({ id }) => id),
    })),
  },
  {
    name: "concept",
    routes: conceptLessonBlueprints.map((blueprint) => ({
      route: `/concepts/${blueprint.id}`,
      lessonId: blueprint.id,
      jointIds: blueprint.flow.map(({ id }) => id),
    })),
  },
] as const;

const guidedRoutes = guidedRouteGroups.flatMap(({ routes }) => routes);

async function expectNoPageOverflow(page: Page, context = "page", softly = false) {
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const wideElements = [document.documentElement, document.body, ...document.body.querySelectorAll<HTMLElement>("*")]
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          testId: element instanceof HTMLElement ? element.dataset.testid ?? "" : "",
          className: element instanceof HTMLElement && typeof element.className === "string"
            ? element.className.slice(0, 80)
            : "",
          right: Math.round(box.right),
          width: Math.round(box.width),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          overflowX: getComputedStyle(element).overflowX,
        };
      })
      .filter((element) =>
        element.right > viewportWidth + 1
        || element.width > viewportWidth + 1
        || element.scrollWidth > element.clientWidth + 1,
      )
      .sort((left, right) =>
        Math.max(right.right - viewportWidth, right.scrollWidth - right.clientWidth)
        - Math.max(left.right - viewportWidth, left.scrollWidth - left.clientWidth),
      )
      .slice(0, 8);
    return {
      scrollX: window.scrollX,
      scrollWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
      clientWidth: viewportWidth,
      wideElements,
    };
  });
  const assert = softly ? expect.soft : expect;
  assert(
    overflow.scrollWidth,
    `${context}: page overflows horizontally\n${JSON.stringify(overflow, null, 2)}`,
  ).toBeLessThanOrEqual(overflow.clientWidth);
}

async function semanticDomSignature(page: Page): Promise<string> {
  return page.locator("[data-scene-frame]").evaluate((frame) => JSON.stringify({
    entities: Array.from(frame.querySelectorAll("[data-scene-entity]"))
      .map((entity) => ({
        id: entity.getAttribute("data-scene-entity"),
        value: entity.getAttribute("data-entity-value"),
        previousValue: entity.getAttribute("data-entity-previous-value"),
        position: entity.getAttribute("data-entity-position"),
      })),
    connections: Array.from(frame.querySelectorAll("[data-connection-id]"))
      .map((connection) => connection.getAttribute("data-connection-id")),
    transfers: Array.from(document.querySelectorAll("[data-transfer-payload]"))
      .map((transfer) => ({
        sourceValue: transfer.getAttribute("data-transfer-source-value"),
        payload: transfer.getAttribute("data-transfer-payload"),
      })),
  }));
}

async function expectSettledFrame(page: Page, jointId: string, context = jointId) {
  await expect(
    page.locator(`[data-scene-frame="${jointId}"]`),
    `${context}: expected frame is not visible`,
  ).toBeVisible();
  await expect(
    page.locator("[data-scene-frame]"),
    `${context}: outgoing and incoming frames did not settle`,
  ).toHaveCount(1);
}

async function expectRouteLaneGeometry(page: Page, context: string) {
  const scene = page.getByTestId("animated-lesson-scene");
  const result = await scene.evaluate((element) => {
    const lanes = Array.from(element.querySelectorAll<HTMLElement>("[data-route-lane]"));
    const laneBoxes = lanes.map((lane) => ({
      id: lane.dataset.transferLane ?? "",
      box: lane.getBoundingClientRect(),
    }));
    const collisions: string[] = [];
    for (let left = 0; left < laneBoxes.length; left += 1) {
      for (let right = left + 1; right < laneBoxes.length; right += 1) {
        const a = laneBoxes[left];
        const b = laneBoxes[right];
        const overlaps = a.box.left < b.box.right - 1
          && a.box.right > b.box.left + 1
          && a.box.top < b.box.bottom - 1
          && a.box.bottom > b.box.top + 1;
        if (overlaps) collisions.push(`${a.id}/${b.id}`);
      }
    }
    const transfers = lanes.map((lane) => {
      const line = lane.querySelector<SVGLineElement>("[data-route-path]");
      const source = lane.querySelector<HTMLElement>("[data-transfer-source-label]");
      const target = lane.querySelector<HTMLElement>("[data-transfer-target-label]");
      const svg = line?.ownerSVGElement;
      if (!line || !source || !target || !svg) {
        return { id: lane.dataset.transferLane ?? "", error: "missing lane element" };
      }
      const laneBox = lane.getBoundingClientRect();
      const svgBox = svg.getBoundingClientRect();
      const sourceBox = source.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();
      const x1 = Number(line.getAttribute("x1")) + svgBox.left;
      const y1 = Number(line.getAttribute("y1")) + svgBox.top;
      const x2 = Number(line.getAttribute("x2")) + svgBox.left;
      const y2 = Number(line.getAttribute("y2")) + svgBox.top;
      return {
        id: lane.dataset.transferLane ?? "",
        fromId: line.dataset.routeFrom ?? "",
        toId: line.dataset.routeTo ?? "",
        sourceText: source.textContent?.trim() ?? "",
        targetText: target.textContent?.trim() ?? "",
        lineInsideLane: x1 >= laneBox.left && x2 <= laneBox.right
          && y1 >= laneBox.top && y2 <= laneBox.bottom,
        sourceBeforeLine: sourceBox.right <= svgBox.left + 1,
        targetAfterLine: targetBox.left >= svgBox.right - 1,
      };
    });
    return { collisions, transfers };
  });

  expect(result.transfers.length, `${context}: no transfer geometry`).toBeGreaterThan(0);
  expect(result.collisions, `${context}: transfer lanes overlap`).toEqual([]);
  for (const transfer of result.transfers) {
    expect("error" in transfer ? transfer.error : "", `${context}: ${transfer.id}`).toBe("");
    if ("error" in transfer) continue;
    expect(transfer.fromId, `${context}: lane is missing its source ID`).not.toBe("");
    expect(transfer.toId, `${context}: lane is missing its target ID`).not.toBe("");
    expect(transfer.sourceText, `${context}: lane is missing its source label`).not.toBe("");
    expect(transfer.targetText, `${context}: lane is missing its target label`).not.toBe("");
    expect(transfer.lineInsideLane, `${context}: ${transfer.id} line escapes its lane`).toBe(true);
    expect(transfer.sourceBeforeLine, `${context}: ${transfer.id} line overlaps its source label`).toBe(true);
    expect(transfer.targetAfterLine, `${context}: ${transfer.id} line overlaps its target label`).toBe(true);
  }
}

async function expectSceneLayoutIntegrity(page: Page, context = "scene", softly = false) {
  const scene = page.getByTestId("animated-lesson-scene");
  const result = await scene.evaluate((element) => {
    const frame = element.querySelector("[data-scene-frame]");
    const entities = Array.from(frame?.querySelectorAll<HTMLElement>("[data-scene-entity]") ?? [])
      .filter((entity) => {
        const style = getComputedStyle(entity);
        return style.visibility !== "hidden" && style.display !== "none";
      });
    const boxes = entities.map((entity) => ({
      id: entity.dataset.sceneEntity ?? "unknown",
      rect: entity.getBoundingClientRect(),
    }));
    const collisions: string[] = [];
    for (let left = 0; left < boxes.length; left += 1) {
      for (let right = left + 1; right < boxes.length; right += 1) {
        const a = boxes[left];
        const b = boxes[right];
        const overlaps = a.rect.left < b.rect.right - 1
          && a.rect.right > b.rect.left + 1
          && a.rect.top < b.rect.bottom - 1
          && a.rect.bottom > b.rect.top + 1;
        if (overlaps) collisions.push(`${a.id}/${b.id}`);
      }
    }
    const overflowingLabels = Array.from(
      frame?.querySelectorAll<HTMLElement>("[data-scene-label]") ?? [],
    ).filter((label) => {
      if (label.scrollWidth > label.clientWidth + 1
        || label.scrollHeight > label.clientHeight + 1) return true;
      const entity = label.closest<HTMLElement>("[data-scene-entity]");
      if (!entity) return false;
      const labelBox = label.getBoundingClientRect();
      const entityBox = entity.getBoundingClientRect();
      return labelBox.left < entityBox.left - 1
        || labelBox.right > entityBox.right + 1
        || labelBox.top < entityBox.top - 1
        || labelBox.bottom > entityBox.bottom + 1;
    }).map((label) => ({
      text: label.textContent ?? "",
      entity: label.closest<HTMLElement>("[data-scene-entity]")?.dataset.sceneEntity ?? "unknown",
      scrollWidth: label.scrollWidth,
      clientWidth: label.clientWidth,
      scrollHeight: label.scrollHeight,
      clientHeight: label.clientHeight,
    }));
    const laneBoxes = Array.from(element.querySelectorAll<HTMLElement>("[data-route-lane]"))
      .map((lane) => ({
        id: lane.dataset.routeLane ?? "unknown",
        element: lane,
        rect: lane.getBoundingClientRect(),
      }));
    const laneCollisions: string[] = [];
    for (let left = 0; left < laneBoxes.length; left += 1) {
      for (let right = left + 1; right < laneBoxes.length; right += 1) {
        const a = laneBoxes[left];
        const b = laneBoxes[right];
        const overlaps = a.rect.left < b.rect.right - 1
          && a.rect.right > b.rect.left + 1
          && a.rect.top < b.rect.bottom - 1
          && a.rect.bottom > b.rect.top + 1;
        if (overlaps) laneCollisions.push(`${a.id}/${b.id}`);
      }
    }
    const malformedRoutes = laneBoxes.flatMap(({ id, element: lane, rect: laneRect }) => {
      const path = lane.querySelector<SVGLineElement>("[data-route-path]");
      const source = lane.querySelector<HTMLElement>("[data-transfer-source-label]");
      const target = lane.querySelector<HTMLElement>("[data-transfer-target-label]");
      const label = lane.querySelector<HTMLElement>("[data-route-label]");
      const svg = path?.ownerSVGElement;
      if (!path || !source || !target || !label || !svg) return [`${id}: missing route element`];
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      if (sourceRect.right > svgRect.left + 1) return [`${id}: path overlaps source label`];
      if (targetRect.left < svgRect.right - 1) return [`${id}: path overlaps target label`];
      if (svgRect.left < laneRect.left - 1 || svgRect.right > laneRect.right + 1) {
        return [`${id}: path escapes lane`];
      }
      if (label.scrollWidth > label.clientWidth + 1) return [`${id}: operation label overflows`];
      return [];
    });
    const canvasTransferLines = element.querySelectorAll(
      '[data-testid="scene-canvas"] [data-transfer-from][data-transfer-to]',
    ).length;
    return {
      collisions,
      overflowingLabels,
      laneCollisions,
      malformedRoutes,
      canvasTransferLines,
      descendants: frame?.querySelectorAll("*").length ?? 0,
    };
  });
  const assert = softly ? expect.soft : expect;
  assert(result.collisions, `${context}: scene entities overlap`).toEqual([]);
  assert(result.overflowingLabels, `${context}: scene labels overflow their entities`).toEqual([]);
  assert(result.laneCollisions, `${context}: transfer lanes overlap`).toEqual([]);
  assert(result.malformedRoutes, `${context}: route lane geometry is malformed`).toEqual([]);
  assert(result.canvasTransferLines, `${context}: transfer lines cover the data canvas`).toBe(0);
  assert(result.descendants, `${context}: scene frame DOM descendant budget exceeded`).toBeLessThanOrEqual(300);
}

test.describe("concept lesson browser acceptance", () => {
  for (const viewport of [
    { name: "mobile-320", width: 320, height: 720 },
    { name: "mobile-390", width: 390, height: 844 },
    { name: "desktop-1440", width: 1440, height: 900 },
  ]) {
    for (const { route, lessonId, kind } of conceptRepresentativeRoutes) {
      test(`${route} ${kind} scene stays stable at ${viewport.width}px`, async ({ page }) => {
        test.setTimeout(45_000);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize(viewport);
        const blueprint = conceptLessonBlueprints.find((candidate) => candidate.id === lessonId);
        expect(blueprint, `${route}: missing concept blueprint`).toBeDefined();
        const jointIds = blueprint!.flow.map(({ id }) => id);

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.getByTestId("guided-lesson")).toHaveAttribute(
          "data-lesson-id",
          String(lessonId),
        );
        const scene = page.getByTestId("animated-lesson-scene");
        await expect(scene).toBeVisible();
        await expect(scene).toHaveAttribute("data-scene-kind", kind);
        const joints = page.locator('[data-testid^="flow-joint-"]');
        await expect(joints).toHaveCount(jointIds.length);

        const heights: Array<{ jointId: string; height: number }> = [];
        let transferJointId: string | undefined;
        for (let index = 0; index < jointIds.length; index += 1) {
          const jointId = jointIds[index];
          const context = `${route} @ ${viewport.width}px / ${jointId}`;
          await joints.nth(index).click();
          await expect(joints.nth(index), `${context}: clicked joint is not active`)
            .toHaveAttribute("aria-pressed", "true");
          await expectSettledFrame(page, jointId, context);

          const box = await scene.boundingBox();
          expect(box, `${context}: scene has no visible bounds`).not.toBeNull();
          heights.push({ jointId, height: box!.height });
          await expectSceneLayoutIntegrity(page, context, true);
          await expectNoPageOverflow(page, context, true);

          const transferRows = scene.locator("div[data-transfer-payload]");
          if (await transferRows.count() > 0) {
            await expect.soft(
              scene.locator("[data-scene-transfer-line]").first(),
              `${context}: transfer is described but no visible scene transfer line was rendered`,
            ).toBeVisible();
            transferJointId ??= jointId;
          }
        }

        const heightValues = heights.map(({ height }) => height);
        expect(
          Math.max(...heightValues) - Math.min(...heightValues),
          `${route} @ ${viewport.width}px: scene height changed across joints\n${JSON.stringify(heights, null, 2)}`,
        ).toBeLessThanOrEqual(1);
        expect(
          transferJointId,
          `${route} @ ${viewport.width}px: the complete lesson never rendered a real transfer`,
        ).toBeDefined();
      });
    }
  }

  test("concept controls keep joints, formula, and debug state synchronized", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/concepts/40003");

    const blueprint = conceptLessonBlueprints.find(({ id }) => id === 40003);
    expect(blueprint).toBeDefined();
    const jointIds = blueprint!.flow.map(({ id }) => id);
    const stage = page.getByTestId("lesson-stage");
    const liveRegion = page.getByTestId("lesson-live-region");

    await page.getByTestId("flow-joint-2").click();
    await expect(stage).toHaveAttribute("data-current-step", "5");
    await expect(stage).toHaveAttribute("data-current-phase", "transition");
    await expect(stage).toHaveAttribute("data-active-flow-index", "2");
    await expectSettledFrame(page, jointIds[2], "/concepts/40003 direct joint click");
    await expect(liveRegion).toContainText(blueprint!.flow[2].label);

    await page.getByRole("button", { name: "上一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "4");
    await expect(stage).toHaveAttribute("data-active-flow-index", "1");
    await expect(page.getByTestId("flow-joint-1")).toHaveAttribute("aria-pressed", "true");
    await expectSettledFrame(page, jointIds[1], "/concepts/40003 previous control");

    await page.getByRole("button", { name: "下一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "5");
    await expect(stage).toHaveAttribute("data-active-flow-index", "2");
    await expect(page.getByTestId("flow-joint-2")).toHaveAttribute("aria-pressed", "true");
    await expectSettledFrame(page, jointIds[2], "/concepts/40003 next control");

    await page.getByRole("button", { name: "重置到第一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "0");
    await expect(stage).toHaveAttribute("data-current-phase", "intuition");
    await expect(page.locator('[data-testid^="flow-joint-"][aria-pressed="true"]')).toHaveCount(0);
    await expectSettledFrame(page, "preparation", "/concepts/40003 reset control");

    const timeline = page.getByTestId("step-timeline");
    await timeline.getByRole("button", { name: /拆解核心公式/ }).click();
    await expect(stage).toHaveAttribute("data-current-step", "2");
    await expect(stage).toHaveAttribute("data-current-phase", "formula");
    await expectSettledFrame(page, "preparation", "/concepts/40003 formula phase");
    const formula = page.getByTestId("lesson-formula");
    await expect(formula.locator(".katex").first()).toBeVisible();
    const firstBinding = page.getByTestId("formula-bindings").locator('[data-formula-symbol="x_1"]');
    await expect(firstBinding).toBeVisible();
    await expect(firstBinding).toContainText("输入序列");
    await expect(firstBinding).toContainText("队列移出值");

    await timeline.getByRole("button", { name: /按顺序调试/ }).click();
    await expect(stage).toHaveAttribute("data-current-step", String(jointIds.length + 4));
    await expect(stage).toHaveAttribute("data-current-phase", "debug");
    await expect(page.getByTestId(`flow-joint-${jointIds.length - 1}`))
      .toHaveAttribute("aria-pressed", "true");
    await expectSettledFrame(page, jointIds.at(-1)!, "/concepts/40003 debug phase");
    const checks = page.getByTestId("lesson-debug-checks");
    await expect(checks).toBeVisible();
    await expect(checks.locator("[data-debug-joint-id]")).not.toHaveCount(0);
    expect(
      await checks.locator("[data-debug-joint-id]").evaluateAll((rows) =>
        [...new Set(rows.map((row) => row.getAttribute("data-debug-joint-id")))],
      ),
      "/concepts/40003 debug checks must resolve against the displayed final joint",
    ).toEqual([jointIds.at(-1)]);
    await expect(checks).toContainText("新栈顶为 2");
    await expect(checks).not.toContainText("未通过");
  });
});

test.describe("guided lesson scenes", () => {
  test("pre-computation phases stay in a preparation state until joint one is selected", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/concepts/40003");
    const blueprint = conceptLessonBlueprints.find(({ id }) => id === 40003);
    expect(blueprint).toBeDefined();

    const scene = page.getByTestId("animated-lesson-scene");
    const timeline = page.getByTestId("step-timeline");
    for (const name of [/先建立直觉/, /认识公式符号/, /拆解核心公式/]) {
      await timeline.getByRole("button", { name }).click();
      await expect(scene.locator('[data-scene-frame="preparation"]')).toBeVisible();
      await expect(scene.locator('[data-entity-status="complete"]')).toHaveCount(0);
      await expect(page.locator('[data-testid^="flow-joint-"][aria-pressed="true"]')).toHaveCount(0);
    }

    const preparationSignature = await semanticDomSignature(page);
    await page.getByTestId("flow-joint-0").click();
    await expectSettledFrame(page, blueprint!.flow[0].id);
    expect(await semanticDomSignature(page)).not.toBe(preparationSignature);
  });

  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test(`graph nodes keep protocol coordinates without overlap at ${viewport.width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      await page.goto("/concepts/40020");

      const blueprint = conceptLessonBlueprints.find(({ id }) => id === 40020);
      expect(blueprint).toBeDefined();
      const positionsByEntity = new Map<string, string>();
      const domCentersByEntity = new Map<string, { x: number; y: number }>();

      for (let index = 0; index < blueprint!.flow.length; index += 1) {
        const joint = page.getByTestId(`flow-joint-${index}`);
        await joint.click();
        const jointId = await joint.getAttribute("data-joint-id");
        expect(jointId).not.toBeNull();
        await expectSettledFrame(page, jointId!);

        const visiblePositions = await page.locator("[data-scene-frame] [data-scene-entity]")
          .evaluateAll((entities) => Object.fromEntries(entities.map((entity) => [
            (entity as HTMLElement).dataset.sceneEntity ?? "",
            (entity as HTMLElement).dataset.entityPosition ?? "",
          ])));
        expect(Object.keys(visiblePositions).length, `${jointId}: graph rendered no nodes`).toBeGreaterThan(0);
        const domCenters = await page.locator("[data-scene-primary-scroll]").evaluate((scroller) => {
          const scrollerBox = scroller.getBoundingClientRect();
          return Object.fromEntries(Array.from(
            scroller.querySelectorAll<HTMLElement>("[data-scene-entity]"),
          ).map((entity) => {
            const box = entity.getBoundingClientRect();
            return [entity.dataset.sceneEntity ?? "", {
              x: box.left + box.width / 2 - scrollerBox.left + scroller.scrollLeft,
              y: box.top + box.height / 2 - scrollerBox.top + scroller.scrollTop,
            }];
          }));
        });
        for (const [entityId, serializedPosition] of Object.entries(visiblePositions)) {
          const [x, y] = serializedPosition.split(",").map(Number);
          expect(Number.isFinite(x) && x >= 0 && x <= 1, `${entityId} has invalid normalized x`).toBe(true);
          expect(Number.isFinite(y) && y >= 0 && y <= 1, `${entityId} has invalid normalized y`).toBe(true);
          const previous = positionsByEntity.get(entityId);
          if (previous) expect(serializedPosition, `${entityId} moved when another node appeared`).toBe(previous);
          positionsByEntity.set(entityId, serializedPosition);
          const previousCenter = domCentersByEntity.get(entityId);
          if (previousCenter) {
            expect(domCenters[entityId].x, `${entityId} shifted horizontally when visibility changed`)
              .toBeCloseTo(previousCenter.x, 1);
            expect(domCenters[entityId].y, `${entityId} shifted vertically when visibility changed`)
              .toBeCloseTo(previousCenter.y, 1);
          }
          domCentersByEntity.set(entityId, domCenters[entityId]);
        }
        await expectSceneLayoutIntegrity(page, `graph ${viewport.width}px / ${jointId}`);
      }

      if (viewport.width < 700) {
        const scroller = page.locator("[data-scene-primary-scroll]");
        expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      }
      await expectNoPageOverflow(page, `graph ${viewport.width}px`);
    });
  }

  test("narrow transfer geometry stays inside independent source-target lanes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/concepts/40020");

    await page.getByTestId("flow-joint-0").click();
    await expectSettledFrame(page, "read-input-hwc8d");
    await expect(page.locator("[data-transfer-from][data-transfer-to]")).toHaveCount(3);
    await expect(page.getByTestId("scene-causal-focus")).toHaveCount(0);
    await expectRouteLaneGeometry(page, "320px B+ tree transfer");
  });

  test("manual and 2x playback updates keep controls, explanation, and canvas atomic", async ({ page }) => {
    await page.goto("/concepts/40003");
    const blueprint = conceptLessonBlueprints.find(({ id }) => id === 40003);
    expect(blueprint).toBeDefined();
    const stage = page.getByTestId("lesson-stage");

    await page.getByTestId("flow-joint-1").click();
    const directSnapshot = await stage.evaluate((element) => ({
      step: element.dataset.currentStep,
      pressedJoint: element.querySelector<HTMLElement>('[data-testid^="flow-joint-"][aria-pressed="true"]')?.dataset.jointId,
      frameIds: Array.from(element.querySelectorAll<HTMLElement>("[data-scene-frame]"))
        .map((frame) => frame.dataset.sceneFrame),
      explanation: element.querySelector<HTMLElement>('[data-testid="lesson-live-region"]')?.textContent ?? "",
    }));
    expect(directSnapshot.step).toBe("4");
    expect(directSnapshot.pressedJoint).toBe(blueprint!.flow[1].id);
    expect(directSnapshot.frameIds).toEqual([blueprint!.flow[1].id]);
    expect(directSnapshot.explanation).toContain(blueprint!.flow[1].label);

    await stage.evaluate((element) => {
      const records: Array<{
        step?: string;
        pressedJoint?: string;
        frameIds: Array<string | undefined>;
        explanation: string;
      }> = [];
      const capture = () => {
        if (element.dataset.currentPhase !== "transition") return;
        const pressed = element.querySelector<HTMLElement>('[data-testid^="flow-joint-"][aria-pressed="true"]');
        const frameIds = Array.from(element.querySelectorAll<HTMLElement>("[data-scene-frame]"))
          .map((frame) => frame.dataset.sceneFrame);
        const jointLabel = pressed?.textContent?.replace(/关节\s*\d+/, "").trim() ?? "";
        const explanation = element.querySelector<HTMLElement>('[data-testid="lesson-live-region"]')?.textContent ?? "";
        if (frameIds.length !== 1
          || frameIds[0] !== pressed?.dataset.jointId
          || !jointLabel
          || !explanation.includes(jointLabel)) {
          records.push({
            step: element.dataset.currentStep,
            pressedJoint: pressed?.dataset.jointId,
            frameIds,
            explanation,
          });
        }
      };
      const observer = new MutationObserver(capture);
      observer.observe(element, { attributes: true, childList: true, subtree: true });
      (window as typeof window & { __lessonSyncAudit?: { records: typeof records; observer: MutationObserver } })
        .__lessonSyncAudit = { records, observer };
      capture();
    });

    await page.getByRole("button", { name: "播放速度 2x" }).click();
    await page.getByRole("button", { name: "开始自动播放" }).click();
    await expect.poll(async () => Number(await stage.getAttribute("data-current-step"))).toBeGreaterThan(4);
    await page.getByRole("button", { name: "暂停自动播放" }).click();
    const mismatches = await page.evaluate(() => {
      const audit = (window as typeof window & {
        __lessonSyncAudit?: { records: unknown[]; observer: MutationObserver };
      }).__lessonSyncAudit;
      audit?.observer.disconnect();
      return audit?.records ?? [];
    });
    expect(mismatches).toEqual([]);
  });

  test("reduced motion disables scene, timeline scroll, and progress transitions", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLElement.prototype.scrollTo;
      const calls: ScrollBehavior[] = [];
      (window as typeof window & { __timelineScrollBehaviors?: ScrollBehavior[] })
        .__timelineScrollBehaviors = calls;
      HTMLElement.prototype.scrollTo = function scrollTo(...args: Parameters<typeof original>) {
        if (this.dataset.testid === "step-timeline") {
          const options = args[0];
          calls.push(typeof options === "object" ? options.behavior ?? "auto" : "auto");
        }
        return original.apply(this, args);
      };
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/concepts/40003");
    await page.getByTestId("flow-joint-3").click();

    await expect(page.locator("[data-motion-duration]").first()).toHaveAttribute("data-motion-duration", "0");
    await expect(page.getByTestId("lesson-progress-indicator")).toHaveCSS("transition-duration", "0s");
    expect(await page.evaluate(() => (
      window as typeof window & { __timelineScrollBehaviors?: ScrollBehavior[] }
    ).__timelineScrollBehaviors)).not.toContain("smooth");
  });

  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test(`CUDA 201 exposes seven reversible visual frames at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/cuda/201");

      const scene = page.getByTestId("animated-lesson-scene");
      await expect(scene).toBeVisible();
      await expect(page.getByTestId("lesson-formula")).toBeVisible();
      const joints = page.locator('[data-testid^="flow-joint-"]');
      await expect(joints).toHaveCount(7);

      const signatures: string[] = [];
      for (let index = 0; index < cudaReductionJointIds.length; index += 1) {
        await joints.nth(index).click();
        await expect(joints.nth(index)).toHaveAttribute("aria-pressed", "true");
        const frame = scene.locator(
          `[data-scene-frame="${cudaReductionJointIds[index]}"]`,
        );
        await expect(frame).toBeVisible();
        await expect(scene.locator("[data-scene-frame]")).toHaveCount(1);
        signatures.push(await frame.evaluate((element) =>
          Array.from(element.querySelectorAll("[data-scene-entity]"))
            .map((entity) => [
              entity.getAttribute("data-scene-entity"),
              entity.getAttribute("data-entity-value"),
              entity.getAttribute("data-entity-position"),
            ].join(":"))
            .join("|"),
        ));
        if (index === 0) {
          const register = frame.locator('[data-scene-entity="register-0"]');
          await expect(register).toHaveAttribute("data-entity-previous-value", "empty");
          await expect(register).toContainText("empty");
          await expect(register).toContainText("1");
          const transfer = scene.locator('div[data-transfer-payload="1"]').first();
          await expect(transfer).toHaveAttribute("data-transfer-source-value", "1");
          await expect(transfer).toContainText("源快照 1");
          await expect(transfer).toContainText("搬运 1");
        }
      }
      expect(new Set(signatures).size).toBe(7);

      await joints.nth(2).click();
      await expect(scene).toContainText("released");
      await joints.nth(3).click();
      await expect(page.getByTestId("frame-operation-expression").locator(".katex")).toBeVisible();
      await joints.nth(6).click();
      await expect(scene).toContainText("36");
      await joints.nth(0).click();
      await expect(joints.nth(0)).toHaveAttribute("aria-pressed", "true");
      await expectNoPageOverflow(page);
    });
  }

  test("dense CUDA reduction routes use separate readable lanes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/cuda/201");
    await page.getByTestId("flow-joint-3").click();
    await expectSettledFrame(page, "shared-tree-reduce");

    const scene = page.getByTestId("animated-lesson-scene");
    const lanes = scene.locator("[data-transfer-lane]");
    await expect(lanes).toHaveCount(12);
    await expect(scene.locator("[data-testid=scene-causal-focus]")).toHaveCount(0);
    await expectRouteLaneGeometry(page, "CUDA tree reduction");

    const separation = await scene.evaluate((element) => {
      const canvas = element.querySelector<HTMLElement>('[data-testid="scene-canvas"]');
      const lanes = Array.from(element.querySelectorAll<HTMLElement>("[data-transfer-lane]"));
      if (!canvas) return { canvasTransferLines: -1, lanesAboveCanvasBottom: ["missing-canvas"] };
      const canvasBox = canvas.getBoundingClientRect();
      return {
        canvasTransferLines: canvas.querySelectorAll("[data-transfer-from][data-transfer-to]").length,
        lanesAboveCanvasBottom: lanes
          .filter((lane) => lane.getBoundingClientRect().top < canvasBox.bottom)
          .map((lane) => lane.dataset.transferLane ?? "unknown"),
      };
    });
    expect(separation.canvasTransferLines).toBe(0);
    expect(separation.lanesAboveCanvasBottom).toEqual([]);
  });

  test("connection-only frames keep readable dependency lanes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ai/10111");
    await page.locator('[data-joint-id="transform-b2mur"]').click();
    await expectSettledFrame(page, "transform-b2mur");

    const scene = page.getByTestId("animated-lesson-scene");
    await expect(scene.locator("[data-transfer-lane]")).toHaveCount(0);
    await expect(scene.locator("[data-dependency-lane]")).toHaveCount(1);
    await expect(scene.locator("[data-dependency-path]")).toHaveCount(1);
    await expectRouteLaneGeometry(page, "connection-only AI frame");
    await expectSceneLayoutIntegrity(page, "connection-only AI frame");
  });

  test("all six scene grammars render visible semantic state", async ({ page }, testInfo) => {
    const kinds = new Set<string>();
    for (const route of representativeRoutes) {
      await page.goto(route);
      const scene = page.getByTestId("animated-lesson-scene");
      await expect(scene).toBeVisible();
      kinds.add(await scene.getAttribute("data-scene-kind") ?? "");
      await expect(scene.locator("[data-scene-entity]").first()).toBeVisible();
      await expect(scene.locator("[data-entity-value]").first()).toBeVisible();
      const joints = page.locator('[data-testid^="flow-joint-"]');
      let foundTransfer = false;
      for (let index = 0; index < await joints.count(); index += 1) {
        await joints.nth(index).click();
        const jointId = await joints.nth(index).getAttribute("data-joint-id");
        expect(jointId).not.toBeNull();
        await expectSettledFrame(page, jointId!);
        if (await scene.locator("[data-transfer-payload]").count() > 0) {
          await expect(scene.locator("[data-scene-transfer-line]").first()).toBeVisible();
          foundTransfer = true;
          break;
        }
      }
      expect(foundTransfer, `${route} should animate a real data transfer`).toBe(true);
      const slug = route.slice(1).replaceAll("/", "-");
      await testInfo.attach(`grammar-${slug}`, {
        body: await scene.screenshot(),
        contentType: "image/png",
      });
    }
    expect(kinds).toEqual(new Set(["array", "matrix", "sequence", "graph", "distribution", "pipeline"]));
  });

  test("keyboard selection retains focus and reduced motion preserves state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/cuda/201");
    const fourthJoint = page.getByTestId("flow-joint-3");
    await fourthJoint.focus();
    await fourthJoint.press("Enter");
    await expect(fourthJoint).toBeFocused();
    await expect(fourthJoint).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("animated-lesson-scene")).toContainText("26");

    const fifthJoint = page.getByTestId("flow-joint-4");
    await fifthJoint.focus();
    await fifthJoint.press("Space");
    await expect(fifthJoint).toBeFocused();
    await expectSettledFrame(page, "warp-tail");
    await expect(page.getByTestId("lesson-live-region")).toContainText("warp");

    const table = page.getByTestId("scene-data-table");
    await expect(table).toContainText("输入");
    await expect(table).toContainText("运算");
    await expect(table).toContainText("输出");
    await expect(page.locator("[data-motion-duration]").first()).toHaveAttribute(
      "data-motion-duration",
      "0",
    );
    const transitionDuration = await page.locator("[data-motion-duration]").first().evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(transitionDuration).toBe("0s");
  });

  test("playback controls keep the lesson frame and explanation synchronized", async ({ page }) => {
    await page.goto("/cuda/201");
    const stage = page.getByTestId("lesson-stage");

    await page.getByTestId("flow-joint-2").click();
    await expect(stage).toHaveAttribute("data-current-step", "5");
    await expectSettledFrame(page, "block-barrier");

    await page.getByRole("button", { name: "下一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "6");
    await expectSettledFrame(page, "shared-tree-reduce");
    await expect(page.getByTestId("flow-joint-3")).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "上一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "5");
    await expectSettledFrame(page, "block-barrier");

    await page.getByRole("button", { name: "播放速度 2x" }).click();
    await expect(page.getByRole("button", { name: "播放速度 2x" })).toHaveAttribute("aria-pressed", "true");
    const play = page.getByRole("button", { name: "开始自动播放" });
    await play.focus();
    await play.press("Enter");
    await expect(page.getByRole("button", { name: "暂停自动播放" })).toBeFocused();
    await expect.poll(async () => Number(await stage.getAttribute("data-current-step"))).toBeGreaterThan(5);
    await page.getByRole("button", { name: "暂停自动播放" }).click();

    await page.getByRole("button", { name: "重置到第一步" }).click();
    await expect(stage).toHaveAttribute("data-current-step", "0");
    await expectSettledFrame(page, "preparation");

    await page.getByRole("button", { name: "下一个 CUDA 主题" }).click();
    await expect(page).toHaveURL(/\/cuda\/202$/);
    await expect(page.getByTestId("guided-lesson")).toHaveAttribute("data-lesson-id", "202");
    await expect(page.getByTestId("lesson-stage")).toHaveAttribute("data-current-step", "0");
  });

  test("formula symbols map to scene entities and debug shows the resolved frame checks", async ({ page }) => {
    await page.goto("/cuda/201");

    await page.getByTestId("step-timeline").getByRole("button", { name: /认识公式符号/ }).click();
    const bindings = page.getByTestId("formula-bindings");
    await expect(bindings.locator('[data-formula-symbol="x_i"]')).toBeVisible();
    await expect(bindings).toContainText("x[0]");
    await expect(bindings).toContainText("S");
    await expect(bindings).toContainText("最终 S");

    await page.getByTestId("step-timeline").getByRole("button", { name: /按顺序调试/ }).click();
    const checks = page.getByTestId("lesson-debug-checks");
    await expect(checks.locator("[data-debug-joint-id]")).not.toHaveCount(0);
    await expect(checks.locator("[data-debug-joint-id]").first()).toHaveAttribute(
      "data-debug-joint-id",
      "finalize-grid-sum",
    );
    await expect(checks).toContainText("36");
  });

  test("CUDA 102 keeps its intermediate product visible and reversible", async ({ page }) => {
    await page.goto("/cuda/102");
    const joints = page.locator('[data-testid^="flow-joint-"]');

    await joints.nth(2).click();
    await expectSettledFrame(page, await joints.nth(2).getAttribute("data-joint-id") ?? "");
    await expect(page.getByTestId("frame-debug-checks")).toContainText("乘积 a*x_i");
    await expect(page.getByTestId("frame-debug-checks")).toContainText("[2, 4, 6, 8]");
    await expect(page.getByTestId("animated-lesson-scene")).toContainText("[3, 5, 7, 9]");

    await joints.nth(3).click();
    await expect(page.getByTestId("frame-debug-checks")).toContainText("输出 y");
    await joints.nth(2).click();
    await expect(page.getByTestId("frame-debug-checks")).toContainText("[2, 4, 6, 8]");
  });

  test("CUDA 201 keeps the active computation visible on a narrow canvas", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/cuda/201");
    const joints = page.locator('[data-testid^="flow-joint-"]');
    const canvas = page.getByTestId("scene-canvas");

    for (let index = 0; index < cudaReductionJointIds.length; index += 1) {
      await joints.nth(index).click();
      await expectSettledFrame(page, cudaReductionJointIds[index]);
      await expect.poll(async () => canvas.evaluate((element) => {
        const viewport = element.getBoundingClientRect();
        return Array.from(element.querySelectorAll<HTMLElement>('[data-entity-status="active"]'))
          .some((entity) => {
            const box = entity.getBoundingClientRect();
            return box.left >= viewport.left - 1 && box.right <= viewport.right + 1;
          });
      })).toBe(true);
    }
  });

  for (const viewport of [
    { name: "mobile-320", width: 320, height: 720 },
    { name: "mobile-390", width: 390, height: 844 },
    { name: "desktop-1440", width: 1440, height: 900 },
  ]) {
    for (const group of guidedRouteGroups) {
      test(`all ${group.routes.length} ${group.name} routes expose every changing frame on ${viewport.name}`, async ({ page }) => {
        test.setTimeout(420_000);
        expect(guidedRoutes).toHaveLength(156);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize(viewport);
        const browserErrors: string[] = [];
        page.on("pageerror", (error) => browserErrors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") browserErrors.push(message.text());
        });

        for (const { route, lessonId, jointIds } of group.routes) {
          const context = `${route} @ ${viewport.width}px`;
          const navigationResponse = await page.goto(route, { waitUntil: "domcontentloaded" });
          expect(navigationResponse?.status(), `${context}: navigation failed`).toBe(200);
          const lesson = page.getByTestId("guided-lesson");
          const scene = page.getByTestId("animated-lesson-scene");
          await expect(lesson, context).toHaveAttribute("data-lesson-id", String(lessonId));
          await expect(page.getByTestId("lesson-formula"), context).toBeVisible();
          await expect(page.getByTestId("lesson-formula").locator(".katex").first(), context).toBeVisible();
          const joints = page.locator('[data-testid^="flow-joint-"]');
          await expect(joints, context).toHaveCount(jointIds.length);
          await expectSettledFrame(page, "preparation", context);
          let previousSignature = await semanticDomSignature(page);

          for (let index = 0; index < jointIds.length; index += 1) {
            const jointContext = `${context} / ${jointIds[index]}`;
            await joints.nth(index).click();
            await expect(joints.nth(index), jointContext).toHaveAttribute("aria-pressed", "true");
            await expectSettledFrame(page, jointIds[index], jointContext);
            const currentSignature = await semanticDomSignature(page);
            expect(currentSignature, `${jointContext}: frame only changed prose or highlighting`)
              .not.toBe(previousSignature);
            previousSignature = currentSignature;

            const previousValues = scene.locator("[data-entity-previous-value]");
            const transferLines = scene.locator("[data-scene-transfer-line]");
            expect(
              await previousValues.count() + await transferLines.count(),
              `${jointContext}: no visible old-to-new state or data transfer`,
            ).toBeGreaterThan(0);
            await expectSceneLayoutIntegrity(page, jointContext);
          }

          await expectNoPageOverflow(page, context);
        }

        expect(browserErrors, `${group.name} ${viewport.name}: browser emitted runtime errors`).toEqual([]);
      });
    }
  }

  for (const viewport of [
    { name: "mobile", width: 320, height: 720 },
    { name: "mobile-wide", width: 390, height: 844 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`six scene grammars remain stable and legible on ${viewport.name}`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      for (const route of representativeRoutes) {
        await page.goto(route);
        const scene = page.getByTestId("animated-lesson-scene");
        await expect(scene).toBeVisible();
        const joints = page.locator('[data-testid^="flow-joint-"]');
        const jointCount = await joints.count();
        const heights: number[] = [];
        for (let index = 0; index < jointCount; index += 1) {
          const jointId = await joints.nth(index).getAttribute("data-joint-id");
          expect(jointId).not.toBeNull();
          await joints.nth(index).click();
          await expectSettledFrame(page, jointId!);
          heights.push((await scene.boundingBox())?.height ?? 0);
          await expectSceneLayoutIntegrity(page);
        }
        expect(Math.max(...heights) - Math.min(...heights), route).toBeLessThanOrEqual(1);
        const overflow = await page.evaluate(() => ({
          route: window.location.pathname,
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.body.clientWidth,
          offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
            .map((element) => ({
              tag: element.tagName,
              className: typeof element.className === "string" ? element.className : "",
              text: element.textContent?.trim().slice(0, 48) ?? "",
              right: Math.round(element.getBoundingClientRect().right),
              width: Math.round(element.getBoundingClientRect().width),
              insideScrollContainer: element.closest(".overflow-x-auto") !== null,
            }))
            .filter((element) => {
              if (element.right <= document.body.clientWidth + 1) return false;
              return !element.className.includes("overflow-x-auto")
                && !element.insideScrollContainer;
            })
            .slice(0, 10),
        }));
        expect(overflow.scrollWidth, JSON.stringify(overflow, null, 2))
          .toBeLessThanOrEqual(overflow.clientWidth);
        const slug = route.slice(1).replaceAll("/", "-");
        await testInfo.attach(`${viewport.name}-${slug}`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });
      }
    });
  }
});
