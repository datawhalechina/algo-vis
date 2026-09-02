import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

import { aiLessonBlueprints } from "../src/config/aiLessonBlueprints/index.ts";
import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import { cudaLessonBlueprints } from "../src/config/cudaLessonBlueprints/index.ts";

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function collectDataIds(directory: string): number[] {
  const ids = new Set<number>();
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts" && file !== "data.ts");

  for (const file of files) {
    const path = join(directory, file);
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
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

  return [...ids].sort((a, b) => a - b);
}

function collectRegistryIds(file: string, registryName: string): number[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const ids: number[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === registryName
      && node.initializer
      && ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const property of node.initializer.properties) {
        if (ts.isPropertyAssignment(property) && ts.isNumericLiteral(property.name)) {
          ids.push(Number(property.name.text));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return ids.sort((a, b) => a - b);
}

function assertSameIds(actual: number[], expected: number[], label: string) {
  assert.deepEqual(actual, expected, `${label} contains data without a visual lesson`);
}

test("every project data item resolves to a dedicated or guided visualization", () => {
  const algorithmIds = collectDataIds("src/data");
  const algorithmRegistryIds = collectRegistryIds("src/problems/index.ts", "visualizerRegistry")
    .filter((id) => algorithmIds.includes(id));
  assertSameIds(algorithmRegistryIds, algorithmIds, "algorithm registry");

  const aiIds = collectDataIds("src/dataai");
  const aiVisualIds = new Set([
    ...collectRegistryIds("src/problemsai/index.ts", "aiVisualizerRegistry"),
    ...aiLessonBlueprints.map((lesson) => lesson.id),
  ]);
  assertSameIds([...aiVisualIds].sort((a, b) => a - b), aiIds, "AI registry");

  const cudaIds = collectDataIds("src/datacuda");
  const cudaVisualIds = [101, ...cudaLessonBlueprints.map((lesson) => lesson.id)]
    .sort((a, b) => a - b);
  assertSameIds(cudaVisualIds, cudaIds, "CUDA registry");

  const drlIds = collectDataIds("src/datadrl");
  assertSameIds(
    Array.from({ length: 36 }, (_, index) => 30001 + index),
    drlIds,
    "DRL guided lessons",
  );

  assert.equal(conceptLessonBlueprints.length, 36);
});

test("every DRL route uses the guided renderer with directly addressable flow joints", () => {
  const registrySource = readFileSync("src/problemsdrl/index.ts", "utf8");
  const registryIds = collectRegistryIds("src/problemsdrl/index.ts", "drlVisualizerRegistry");

  assert.deepEqual(registryIds, [], "dedicated routes must not bypass the guided lesson contract");
  assert.match(registrySource, /GuidedDRLLessonVisualizer/);
});

test("normal routes contain no unfinished placeholder copy", () => {
  const routeSources = walk("src")
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  for (const phrase of ["待实现", "正在开发中", "敬请期待", "暂不可用", "暂未实现"]) {
    assert.equal(routeSources.includes(phrase), false, `remove unfinished copy: ${phrase}`);
  }
});
