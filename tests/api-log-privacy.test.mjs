import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../server/index.ts", import.meta.url), "utf8");

test("API request logs retain request metadata without recording response bodies", () => {
  assert.match(source, /req\.method/);
  assert.match(source, /req\.path/);
  assert.match(source, /res\.statusCode/);
  assert.doesNotMatch(source, /capturedJsonResponse/);
  assert.doesNotMatch(source, /JSON\.stringify\(\s*(?:bodyJson|capturedJsonResponse)\s*\)/);
  assert.doesNotMatch(source, /res\.json\s*=\s*function/);
});
