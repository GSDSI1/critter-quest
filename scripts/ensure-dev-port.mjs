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
if (pids.length) execSync('sleep 0.5');

let remaining = portPids();
for (const pid of remaining) {
  try {
    process.kill(Number(pid), 'SIGKILL');
    console.log(`Force-stopped stubborn process on :${PORT} (pid ${pid})`);
  } catch { /* already gone */ }
}
if (remaining.length) execSync('sleep 0.2');

remaining = portPids();
if (remaining.length) {
  console.error(`\nPort ${PORT} is still in use (pids: ${remaining.join(', ')}).`);
  console.error(`Run: kill -9 ${remaining.join(' ')}\n`);
  process.exit(1);
}
