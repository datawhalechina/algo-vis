export type MathSegmentType = "text" | "inline-math" | "block-math";

export interface MathSegment {
  type: MathSegmentType;
  value: string;
}

const MATH_PATTERN =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<!\\)\$(?!\$)([^\n$]+?)(?<!\\)\$(?!\$)/g;

function normalizeText(value: string): string {
  return value.replace(/\\\$/g, "$");
}

/** Split rich text into plain text and KaTeX-ready segments. */
export function parseMathSegments(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(MATH_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ type: "text", value: normalizeText(text.slice(cursor, index)) });
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      segments.push({ type: "block-math", value: (match[1] ?? match[2]).trim() });
    } else {
      segments.push({ type: "inline-math", value: (match[3] ?? match[4]).trim() });
    }

    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", value: normalizeText(text.slice(cursor)) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: normalizeText(text) }];
}
