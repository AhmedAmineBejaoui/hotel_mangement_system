import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const db = readFileSync(new URL("../server/db.ts", import.meta.url), "utf8");
const auth = readFileSync(new URL("../server/auth.ts", import.meta.url), "utf8");
const ignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");

test("application database requires DATABASE_URL", () => {
  assert.match(db, /process\.env\.DATABASE_URL/);
  assert.match(db, /if \(!connectionString\)/);
  assert.match(db, /new Client\(\{ connectionString \}\)/);
  assert.doesNotMatch(db, /password\s*:\s*["'][^"']+["']/);
});

test("session database does not use embedded fallback credentials", () => {
  assert.match(auth, /process\.env\.DATABASE_URL/);
  assert.match(auth, /if \(!connectionString\)/);
  assert.doesNotMatch(auth, /const defaultUrl\s*=/);
});

test("session signing requires a sufficiently long configured secret", () => {
  assert.match(auth, /process\.env\.SESSION_SECRET/);
  assert.match(auth, /secret\.length < 32/);
  assert.match(auth, /secret: requireSessionSecret\(\)/);
});

test("local environment files are ignored but the template is tracked", () => {
  assert.match(ignore, /^\.env$/m);
  assert.match(ignore, /^\.env\.\*$/m);
  assert.match(ignore, /^!\.env\.example$/m);
});
