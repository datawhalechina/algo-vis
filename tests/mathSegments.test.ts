import assert from "node:assert/strict";
import test from "node:test";

import { parseMathSegments } from "../src/utils/mathSegments.ts";

test("parses inline dollar and parenthesis delimiters", () => {
  assert.deepEqual(
    parseMathSegments("价值 $V(s)$ 满足 \\(Q(s,a)\\) 的关系"),
    [
      { type: "text", value: "价值 " },
      { type: "inline-math", value: "V(s)" },
      { type: "text", value: " 满足 " },
      { type: "inline-math", value: "Q(s,a)" },
      { type: "text", value: " 的关系" },
    ],
  );
});

test("parses block dollar and bracket delimiters", () => {
  assert.deepEqual(parseMathSegments("更新为 $$Q' = Q + \\alpha\\delta$$。"), [
    { type: "text", value: "更新为 " },
    { type: "block-math", value: "Q' = Q + \\alpha\\delta" },
    { type: "text", value: "。" },
  ]);

  assert.deepEqual(parseMathSegments("\\[V^*(s)=\\max_a Q^*(s,a)\\]"), [
    { type: "block-math", value: "V^*(s)=\\max_a Q^*(s,a)" },
  ]);
});

test("keeps escaped dollars and malformed delimiters as text", () => {
  assert.deepEqual(parseMathSegments("成本是 \\$5，未闭合 $V(s)"), [
    { type: "text", value: "成本是 $5，未闭合 $V(s)" },
  ]);
});

