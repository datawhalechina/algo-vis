import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

import {
  getCudaProgressId,
  getScopedProgressStats,
} from "../src/utils/progressIds.ts";

function collectIds(directory: string): number[] {
  const ids = new Set<number>();
  const files = readdirSync(directory).filter(
    (file) => file.endsWith(".ts") && file !== "index.ts" && file !== "data.ts",
  );

  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(join(directory, file), "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node)
        && ts.isIdentifier(node.name)
        && node.name.text === "id"
        && ts.isNumericLiteral(node.initializer)
      ) {
        ids.add(Number(node.initializer.text));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  return [...ids];
}

test("CUDA progress keys never collide with algorithm problem IDs", () => {
  const algorithmIds = new Set(collectIds("src/data"));
  const cudaProgressIds = collectIds("src/datacuda").map(getCudaProgressId);

  assert.equal(new Set(cudaProgressIds).size, cudaProgressIds.length);
  assert.equal(
    cudaProgressIds.some((id) => algorithmIds.has(id)),
    false,
  );
});

test("progress summaries only count IDs from their own course area", () => {
  const stats = getScopedProgressStats(
    [1, 2, 3],
    new Set([1, 2, 10001, 30001]),
    new Set([3, 10002]),
    new Set([2, 40001]),
  );

  assert.deepEqual(stats, {
    total: 3,
    completed: 2,
    inProgress: 1,
    favorite: 1,
    completionRate: 66.67,
  });
});
