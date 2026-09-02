import assert from "node:assert/strict";
import test from "node:test";

import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import type {
  LessonSceneFrame,
  LessonSceneSpec,
  SceneValue,
} from "../src/config/lessonSceneTypes.ts";
import { getConceptLessonScene } from "../src/config/lessonScenes/concepts/index.ts";

const HTTP_TLS_LESSON_ID = 40018;

function httpTlsScene(): LessonSceneSpec {
  const scene = getConceptLessonScene(HTTP_TLS_LESSON_ID);
  assert.ok(scene, "missing HTTP/TLS concept scene");
  return scene;
}

function httpTlsFrames(): LessonSceneFrame[] {
  const blueprint = conceptLessonBlueprints.find(
    ({ id }) => id === HTTP_TLS_LESSON_ID,
  );
  assert.ok(blueprint, "missing HTTP/TLS concept blueprint");

  const scene = httpTlsScene();
  return blueprint.flow.map(({ id }) => scene.framesByJointId[id]);
}

function numericState(frame: LessonSceneFrame, entityId: string): number {
  const value = frame.entityStates[entityId]?.value;
  assert.equal(typeof value, "number", `${entityId} must be numeric`);
  return value;
}

function datumIds(frame: LessonSceneFrame, key: "inputs" | "outputs"): string[] {
  return frame[key].map(({ entityId }) => entityId);
}

test("40018 exposes the 20ms request path and 30ms server/first-byte subdurations", () => {
  const scene = httpTlsScene();
  const [, , sendRequest, receiveFirstByte] = httpTlsFrames();

  assert.deepEqual(
    scene.entities
      .filter(({ id }) => [
        "request-send-duration",
        "server-first-byte-duration",
      ].includes(id))
      .map(({ id, label, unit }) => ({ id, label, unit })),
    [
      {
        id: "request-send-duration",
        label: "请求发送与传播耗时",
        unit: "ms",
      },
      {
        id: "server-first-byte-duration",
        label: "服务端处理与首字节返回耗时",
        unit: "ms",
      },
    ],
  );
  assert.equal(numericState(sendRequest, "request-send-duration"), 20);
  assert.equal(numericState(sendRequest, "server-first-byte-duration"), 30);
  assert.equal(sendRequest.entityStates["request-send-duration"].visible, true);
  assert.equal(sendRequest.entityStates["server-first-byte-duration"].visible, true);
  assert.equal(numericState(sendRequest, "request-time"), 50);
  assert.equal(numericState(receiveFirstByte, "request-time"), 50);
});

test("40018 derives every cumulative timestamp from visible frame inputs", () => {
  const [connect, tls, sendRequest, receiveFirstByte] = httpTlsFrames();

  assert.deepEqual(datumIds(connect, "inputs"), ["dns-time", "connect-time"]);
  assert.deepEqual(datumIds(connect, "outputs"), ["connection-ready"]);
  assert.equal(
    numericState(connect, "connection-ready"),
    numericState(connect, "dns-time") + numericState(connect, "connect-time"),
  );
  assert.deepEqual(
    [numericState(connect, "dns-time"), numericState(connect, "connect-time")],
    [15, 25],
  );

  assert.deepEqual(datumIds(tls, "inputs"), ["connection-ready", "tls-time"]);
  assert.deepEqual(datumIds(tls, "outputs"), ["tls-ready"]);
  assert.equal(
    numericState(tls, "tls-ready"),
    numericState(tls, "connection-ready") + numericState(tls, "tls-time"),
  );

  assert.deepEqual(datumIds(sendRequest, "inputs"), [
    "tls-ready",
    "request-send-duration",
    "server-first-byte-duration",
  ]);
  assert.deepEqual(datumIds(sendRequest, "outputs"), [
    "request-sent",
    "request-time",
  ]);
  assert.equal(
    numericState(sendRequest, "request-sent"),
    numericState(sendRequest, "tls-ready")
      + numericState(sendRequest, "request-send-duration"),
  );
  assert.equal(
    numericState(sendRequest, "request-time"),
    numericState(sendRequest, "request-send-duration")
      + numericState(sendRequest, "server-first-byte-duration"),
  );

  assert.deepEqual(datumIds(receiveFirstByte, "inputs"), [
    "request-sent",
    "server-first-byte-duration",
    "dns-time",
    "connect-time",
    "tls-time",
    "request-time",
  ]);
  assert.deepEqual(datumIds(receiveFirstByte, "outputs"), ["first-byte-time"]);
  assert.equal(
    numericState(receiveFirstByte, "first-byte-time"),
    numericState(receiveFirstByte, "request-sent")
      + numericState(receiveFirstByte, "server-first-byte-duration"),
  );
  assert.equal(
    numericState(receiveFirstByte, "first-byte-time"),
    numericState(receiveFirstByte, "dns-time")
      + numericState(receiveFirstByte, "connect-time")
      + numericState(receiveFirstByte, "tls-time")
      + numericState(receiveFirstByte, "request-time"),
  );
  assert.deepEqual(
    [
      numericState(connect, "connection-ready"),
      numericState(tls, "tls-ready"),
      numericState(sendRequest, "request-sent"),
      numericState(receiveFirstByte, "first-byte-time"),
    ],
    [40, 70, 90, 120],
  );

  for (const frame of [connect, tls, sendRequest, receiveFirstByte]) {
    assert.ok(frame.operation.expression, `${frame.jointId} must show its arithmetic`);
    assert.deepEqual(datumIds(frame, "inputs"), frame.operation.sourceEntityIds);
    assert.deepEqual(datumIds(frame, "outputs"), frame.operation.targetEntityIds);
  }
});

test("40018 transfer payloads always equal their source state", () => {
  const scene = httpTlsScene();

  for (const frame of httpTlsFrames()) {
    for (const transfer of frame.transfers) {
      const sourceValue: SceneValue | undefined =
        frame.entityStates[transfer.from]?.value;
      assert.deepEqual(
        transfer.payload,
        sourceValue,
        `${frame.jointId}/${transfer.id} must carry ${transfer.from}'s value`,
      );
      assert.ok(frame.operation.sourceEntityIds.includes(transfer.from));
      assert.ok(frame.operation.targetEntityIds.includes(transfer.to));
      assert.ok(
        frame.visibleConnectionIds.some((connectionId) => {
          const connection = scene.connections.find(({ id }) => id === connectionId);
          return connection?.from === transfer.from && connection.to === transfer.to;
        }),
      );
    }
  }
});
