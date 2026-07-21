#!/usr/bin/env node
/**
 * Prefer Cursor/VS Code integrated terminals (Tasks).
 * Fallback: macOS Terminal.app windows with --external.
 *
 * Usage:
 *   npm run dev              # inside Cursor → triggers Cmd+Shift+B (split IDE panels)
 *   npm run dev -- --external  # force Terminal.app windows
 *   npm run dev:core         # campus + api only
 *
 * Manual: Cmd+Shift+P → Tasks: Run Task → "Arvilio: dev (split terminals)"
 */
const { execFileSync, spawn } = require('node:child_process');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const args = process.argv.slice(2);
const coreOnly = args.includes('--core');
const forceExternal = args.includes('--external');

const ALL = [
  { title: 'api', script: 'dev:api' },
  { title: 'campus', script: 'dev:campus' },
  { title: 'platform', script: 'dev:platform' },
  { title: 'hub', script: 'dev:hub' },
  { title: 'cms', script: 'dev:cms' },
];
const CORE = [
  { title: 'api', script: 'dev:api' },
  { title: 'campus', script: 'dev:campus' },
];
const apps = coreOnly ? CORE : ALL;

function isInsideCursorOrVsCode() {
  return (
    process.env.TERM_PROGRAM === 'vscode' ||
    Boolean(process.env.VSCODE_INJECTION) ||
    Boolean(process.env.VSCODE_PID) ||
    Boolean(process.env.CURSOR_TRACE_ID)
  );
}

function triggerCursorBuildTask() {
  // Default build task = "Arvilio: dev (split terminals)" or core variant
  // Cmd+Shift+B inside Cursor opens dedicated IDE terminal panels.
  const keystroke = coreOnly
    ? // No separate default for core — open Run Task palette with filter
      null
    : 'b';

  if (keystroke) {
    const script = `
tell application "Cursor" to activate
delay 0.25
tell application "System Events"
  keystroke "b" using {command down, shift down}
end tell
`;
    execFileSync('osascript', ['-e', script], { stdio: 'inherit' });
    console.log('Triggered Cursor Build Task → split integrated terminals.');
    console.log('If nothing opened: Cmd+Shift+P → Tasks: Run Task → "Arvilio: dev (split terminals)"');
    return true;
  }

  const taskLabel = coreOnly
    ? 'Arvilio: dev core (split terminals)'
    : 'Arvilio: dev (split terminals)';
  const script = `
tell application "Cursor" to activate
delay 0.25
tell application "System Events"
  keystroke "p" using {command down, shift down}
  delay 0.35
  keystroke "task ${taskLabel}"
  delay 0.45
  key code 36
end tell
`;
  execFileSync('osascript', ['-e', script], { stdio: 'inherit' });
  console.log(`Requested Cursor task: ${taskLabel}`);
  return true;
}

function openMacTerminal(title, npmScript) {
  const shellCmd = [
    `cd ${JSON.stringify(root)}`,
    `printf '\\033]0;Arvilio ${title}\\007'`,
    `echo "━━━ Arvilio ${title} ━━━"`,
    `npm run ${npmScript}`,
  ].join(' && ');

  const appleScript = `
tell application "Terminal"
  activate
  do script ${JSON.stringify(shellCmd)}
end tell
`;
  execFileSync('osascript', ['-e', appleScript], { stdio: 'inherit' });
}

function runExternal() {
  if (process.platform === 'darwin') {
    console.log(
      `Opening ${apps.length} Terminal.app window(s): ${apps.map((a) => a.title).join(', ')}…`,
    );
    for (const app of apps) openMacTerminal(app.title, app.script);
    console.log('\nTip: for terminals inside Cursor, run without --external (or Cmd+Shift+B).');
    return;
  }

  console.log('Launching with colored prefixes in this terminal…');
  const concurrentlyBin = require('node:path').join(
    require('node:path').dirname(require.resolve('concurrently/package.json')),
    'dist/bin/concurrently.js',
  );
  const names = apps.map((a) => a.title).join(',');
  spawn(
    process.execPath,
    [concurrentlyBin, '-k', '-n', names, '-c', 'blue,green,magenta,cyan,yellow', '--pad-prefix', ...apps.map((a) => `npm run ${a.script}`)],
    { stdio: 'inherit', cwd: root },
  ).on('exit', (code) => process.exit(code ?? 0));
}

function main() {
  if (forceExternal) {
    runExternal();
    return;
  }

  if (process.platform === 'darwin' && isInsideCursorOrVsCode()) {
    try {
      triggerCursorBuildTask();
      process.exit(0);
    } catch (err) {
      console.warn('Could not trigger Cursor UI (Accessibility permission?).');
      console.warn(String(err && err.message ? err.message : err));
      console.log(`
Open split terminals inside Cursor manually:
  Cmd+Shift+B
  or Cmd+Shift+P → Tasks: Run Task → "Arvilio: ${coreOnly ? 'dev core (split terminals)' : 'dev (split terminals)'}"

Or force external windows:
  npm run ${coreOnly ? 'dev:core' : 'dev'} -- --external
`);
      process.exit(1);
    }
  }

  // Outside Cursor: external windows on macOS, concurrently elsewhere
  if (process.platform === 'darwin') {
    console.log('Not inside Cursor — opening Terminal.app windows.');
    console.log('For IDE panels: run `npm run dev` from a Cursor terminal, or Cmd+Shift+B.\n');
  }
  runExternal();
}

main();
