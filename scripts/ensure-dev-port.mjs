#!/usr/bin/env node
/** Free port 5180 before starting dev (avoids stacked background Vite instances). */
import { execSync } from 'child_process';

const PORT = 5180;

function portPids() {
  try {
    const out = execSync(`lsof -ti :${PORT}`, { encoding: 'utf8' }).trim();
    return out ? out.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
}

const pids = portPids();
for (const pid of pids) {
  try {
    process.kill(Number(pid), 'SIGTERM');
    console.log(`Stopped prior dev server on :${PORT} (pid ${pid})`);
  } catch { /* already gone */ }
}
if (pids.length) execSync('sleep 0.3');

const remaining = portPids();
if (remaining.length) {
  console.error(`\nPort ${PORT} is still in use (pids: ${remaining.join(', ')}).`);
  console.error(`Run: lsof -i :${PORT}   then stop the other process.\n`);
  process.exit(1);
}
