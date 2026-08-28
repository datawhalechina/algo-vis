import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import katex from "katex";
import ts from "typescript";

import { parseMathSegments } from "../src/utils/mathSegments.ts";

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function getStaticMathProps(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const formulas: string[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node)
      && ts.isIdentifier(node.name)
      && node.name.text === "math"
      && node.initializer
    ) {
      if (ts.isStringLiteral(node.initializer)) {
        formulas.push(node.initializer.text);
      } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        const expression = node.initializer.expression;
        if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
          formulas.push(expression.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return formulas;
}

function getStaticFormulaProperties(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const formulas: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node)) {
      const key = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
        ? node.name.text
        : "";
      const value = node.initializer;
      if (
        (key === "symbol" || /formula$/i.test(key))
        && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
      ) {
        formulas.push(value.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return formulas;
}

function getStaticMathTextSegments(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const formulas: string[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node)
      && ts.isIdentifier(node.name)
      && node.name.text === "text"
      && node.initializer
      && ts.isStringLiteral(node.initializer)
    ) {
      formulas.push(
        ...parseMathSegments(node.initializer.text)
          .filter((segment) => segment.type !== "text")
          .map((segment) => segment.value),
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return formulas;
}

test("all static formulas in dedicated visualizers render with KaTeX", () => {
  const files = ["src/problemsai", "src/problemscuda", "src/problemsdrl"]
    .flatMap(walk)
    .filter((file) => file.endsWith(".tsx"));
  let formulaCount = 0;

  for (const file of files) {
    for (const formula of getStaticMathProps(file)) {
      formulaCount += 1;
      assert.doesNotThrow(
        () => katex.renderToString(formula, { throwOnError: true }),
        `${file}: invalid KaTeX formula ${formula}`,
      );
    }
  }

  assert.ok(formulaCount >= 80, `expected broad formula coverage, found ${formulaCount}`);
});

test("all static formula data and MathText literals render with KaTeX", () => {
  const files = walk("src").filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
  let formulaCount = 0;

  for (const file of files) {
    const formulas = [
      ...getStaticFormulaProperties(file),
      ...(file.endsWith(".tsx") ? getStaticMathTextSegments(file) : []),
    ];

    for (const formula of formulas) {
      formulaCount += 1;
      assert.doesNotThrow(
        () => katex.renderToString(formula, { throwOnError: true }),
        `${file}: invalid KaTeX formula ${formula}`,
      );
    }
  }

  assert.ok(formulaCount >= 750, `expected full formula coverage, found ${formulaCount}`);
});
