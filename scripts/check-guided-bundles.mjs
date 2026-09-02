import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
const entries = {
  ai: "src/components/visualizers/GuidedAILessonVisualizer.tsx",
  cuda: "src/components/visualizers/GuidedCudaLessonVisualizer.tsx",
  drl: "src/components/visualizers/GuidedDRLLessonVisualizer.tsx",
  concepts: "src/components/visualizers/GuidedConceptLessonVisualizer.tsx",
};

function projectChunks(entryKey) {
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key) || key === "index.html" || key.startsWith("_vendor-")) return;
    const chunk = manifest[key];
    assert.ok(chunk, `manifest entry is missing: ${key}`);
    seen.add(key);
    for (const imported of chunk.imports ?? []) visit(imported);
    for (const imported of chunk.dynamicImports ?? []) visit(imported);
  };
  visit(entryKey);
  return seen;
}

for (const [domain, entryKey] of Object.entries(entries)) {
  assert.ok(manifest[entryKey]?.isDynamicEntry, `${domain}: guided visualizer is not lazy loaded`);
  const chunks = projectChunks(entryKey);
  const foreignDomains = Object.entries(entries)
    .filter(([other]) => other !== domain)
    .map(([, key]) => key)
    .filter((key) => chunks.has(key));
  assert.deepEqual(foreignDomains, [], `${domain}: imports another guided domain`);

  const gzipBytes = [...chunks].reduce((total, key) => {
    const file = manifest[key].file;
    return total + gzipSync(readFileSync(`dist/${file}`)).byteLength;
  }, 0);
  assert.ok(gzipBytes <= 100 * 1024, `${domain}: ${gzipBytes} gzip bytes exceeds 100 KiB`);
  console.log(`${domain}: ${(gzipBytes / 1024).toFixed(1)} KiB gzip`);
}
