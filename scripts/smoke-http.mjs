#!/usr/bin/env node
/** HTTP smoke test — dev server must be running on 127.0.0.1:5180 */
const BASE = 'http://127.0.0.1:5180';
const PATHS = ['/', '/src/main.ts', '/assets/meta.json'];

let failed = 0;
for (const path of PATHS) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.ok) {
      console.log(`  ✓ ${path} → ${res.status}`);
    } else {
      console.error(`  ✗ ${path} → ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ ${path} → ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} smoke check(s) failed. Start the dev server: npm run dev\n`);
  process.exit(1);
}
console.log('\nAll smoke checks passed.\n');
