#!/usr/bin/env node
/**
 * Claude Flow Hook Handler (Cross-Platform)
 * Dispatches hook events to the appropriate helper modules.
 *
 * Usage: node hook-handler.cjs <command> [args...]
 *
 * Commands:
 *   route          - Route a task to optimal agent (reads PROMPT from env/stdin)
 *   pre-bash       - Validate command safety before execution
 *   pre-edit       - Pre-edit gate (Cursor PreToolUse JSON)
 *   post-bash      - Post-bash continue signal
 *   post-edit      - Record edit outcome for learning
 *   session-restore - Restore previous session state
 *   session-end    - End session and persist state
 *
 * Cursor PreToolUse hooks require valid JSON on stdout. Human logs go to stderr.
 */

const path = require('path');
const fs = require('fs');

const helpersDir = __dirname;

// Safe require with stdout suppression - the helper modules have CLI
// sections that run unconditionally on require(), so we mute console
// during the require to prevent noisy output.
function safeRequire(modulePath) {
  try {
    if (fs.existsSync(modulePath)) {
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      try {
        const mod = require(modulePath);
        return mod;
      } finally {
        console.log = origLog;
        console.error = origError;
      }
    }
  } catch (e) {
    // silently fail
  }
  return null;
}

const router = safeRequire(path.join(helpersDir, 'router.js'));
const session = safeRequire(path.join(helpersDir, 'session.js'));
const memory = safeRequire(path.join(helpersDir, 'memory.js'));
const intelligence = safeRequire(path.join(helpersDir, 'intelligence.cjs'));

// ── Intelligence timeout protection (fixes #1530, #1531) ───────────────────
const INTELLIGENCE_TIMEOUT_MS = 3000;
function runWithTimeout(fn, label) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      process.stderr.write("[WARN] " + label + " timed out after " + INTELLIGENCE_TIMEOUT_MS + "ms, skipping\n");
      resolve(null);
    }, INTELLIGENCE_TIMEOUT_MS);
  });
  const work = Promise.resolve().then(fn).catch(() => null);
  return Promise.race([work, timeout]).then((result) => {
    clearTimeout(timer);
    return result;
  });
}

/** Emit Cursor-compatible PreToolUse allow JSON (stdout must be valid JSON only). */
function emitAllow() {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
    },
  }) + '\n');
}

/** Emit Cursor-compatible PreToolUse deny JSON. */
function emitDeny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason || 'Blocked by hook-handler',
    },
  }) + '\n');
}

/** Emit simple continue JSON for pre-edit / post-bash. */
function emitContinue(extra) {
  process.stdout.write(JSON.stringify(Object.assign({ continue: true }, extra || {})) + '\n');
}

const [,, command, ...args] = process.argv;

async function readStdin() {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => {
      process.stdin.removeAllListeners();
      process.stdin.pause();
      resolve(data);
    }, 500);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { clearTimeout(timer); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(timer); resolve(data); });
    process.stdin.resume();
  });
}

async function main() {
  const safetyTimer = setTimeout(() => {
    process.stderr.write("[WARN] Hook handler global timeout (5s), forcing exit\n");
    try { emitAllow(); } catch (_) {}
    process.exit(0);
  }, 5000);
  safetyTimer.unref();

  let stdinData = '';
  try { stdinData = await readStdin(); } catch (e) { /* ignore stdin errors */ }

  let hookInput = {};
  if (stdinData.trim()) {
    try { hookInput = JSON.parse(stdinData); } catch (e) { /* ignore parse errors */ }
  }

  const toolInput = hookInput.toolInput || hookInput.tool_input || {};
  const toolName = hookInput.toolName || hookInput.tool_name || '';

  const prompt = hookInput.prompt || hookInput.command || toolInput.command
    || process.env.PROMPT || process.env.TOOL_INPUT_command || args.join(' ') || '';

  const toolFailed = (function (hi) {
    if (!hi || typeof hi !== 'object') return false;
    const tr = hi.tool_response != null ? hi.tool_response : (hi.toolResponse != null ? hi.toolResponse : hi.result);
    if (tr == null) return false;
    if (typeof tr === 'string') return /\b(error|failed|failure|exception|not found|no such|permission denied|traceback)\b/i.test(tr);
    if (typeof tr === 'object') {
      if (tr.is_error === true || tr.isError === true || tr.success === false || tr.error != null) return true;
      const code = tr.exit_code != null ? tr.exit_code : (tr.exitCode != null ? tr.exitCode : tr.code);
      if (typeof code === 'number' && code !== 0) return true;
      if (Array.isArray(tr.content) && tr.is_error === true) return true;
    }
    return false;
  })(hookInput);

const handlers = {
  'route': () => {
    if (intelligence && intelligence.getContext) {
      try {
        const ctx = intelligence.getContext(prompt);
        if (ctx) process.stderr.write(String(ctx) + '\n');
      } catch (e) { /* non-fatal */ }
    }
    if (router && router.routeTask) {
      const result = router.routeTask(prompt);
      const output = [
        `[INFO] Routing task: ${prompt.substring(0, 80) || '(no prompt)'}`,
        '',
        '+------------------- Primary Recommendation -------------------+',
        `| Agent: ${result.agent.padEnd(53)}|`,
        `| Confidence: ${(result.confidence * 100).toFixed(1)}%${' '.repeat(44)}|`,
        `| Reason: ${(result.reason || '').substring(0, 53).padEnd(53)}|`,
        '+--------------------------------------------------------------+',
      ];
      process.stderr.write(output.join('\n') + '\n');
    } else {
      process.stderr.write('[INFO] Router not available, using default routing\n');
    }
    emitAllow();
  },

  'pre-bash': () => {
    const cmd = String(hookInput.command || toolInput.command || prompt || '').toLowerCase();
    const dangerous = ['rm -rf /', 'format c:', 'del /s /q c:\\', ':(){:|:&};:'];
    for (const d of dangerous) {
      if (cmd.includes(d)) {
        process.stderr.write(`[BLOCKED] Dangerous command detected: ${d}\n`);
        emitDeny(`Dangerous command detected: ${d}`);
        process.exitCode = 2;
        return;
      }
    }
    process.stderr.write('[OK] Command validated\n');
    emitAllow();
  },

  'pre-edit': () => {
    const file = hookInput.file_path || toolInput.file_path
      || process.env.TOOL_INPUT_file_path || args[0] || '';
    process.stderr.write(`[OK] Pre-edit allowed${file ? ': ' + file : ''}\n`);
    emitAllow();
  },

  'post-bash': () => {
    process.stderr.write('[OK] Post-bash\n');
    emitContinue();
  },

  'post-edit': () => {
    if (session && session.metric) {
      try { session.metric('edits'); } catch (e) { /* no active session */ }
    }
    if (intelligence && intelligence.recordEdit) {
      try {
        const file = hookInput.file_path || toolInput.file_path
          || process.env.TOOL_INPUT_file_path || args[0] || '';
        intelligence.recordEdit(file, !toolFailed);
      } catch (e) { /* non-fatal */ }
    }
    process.stderr.write(toolFailed ? '[LEARN] Edit FAILURE recorded\n' : '[OK] Edit recorded\n');
    emitContinue();
  },

  'session-restore': async () => {
    if (session) {
      const existing = session.restore && session.restore();
      if (!existing) {
        session.start && session.start();
      }
    } else {
      const sessionId = `session-${Date.now()}`;
      process.stderr.write(`[INFO] Restoring session: %SESSION_ID%\n\n`);
      process.stderr.write(`[OK] Session restored from %SESSION_ID%\n`);
      process.stderr.write(`New session ID: ${sessionId}\n\n`);
    }
    if (intelligence && intelligence.init) {
      const initResult = await runWithTimeout(() => intelligence.init(), 'intelligence.init()');
      if (initResult && initResult.nodes > 0) {
        process.stderr.write(`[INTELLIGENCE] Loaded ${initResult.nodes} patterns, ${initResult.edges} edges\n`);
      }
    }
    emitAllow();
  },

  'session-end': async () => {
    if (intelligence && intelligence.consolidate) {
      const consResult = await runWithTimeout(() => intelligence.consolidate(), 'intelligence.consolidate()');
      if (consResult && consResult.entries > 0) {
        process.stderr.write(`[INTELLIGENCE] Consolidated: ${consResult.entries} entries, ${consResult.edges} edges${consResult.newEntries > 0 ? `, ${consResult.newEntries} new` : ''}, PageRank recomputed\n`);
      }
    }
    if (session && session.end) {
      session.end();
    } else {
      process.stderr.write('[OK] Session ended\n');
    }
    emitContinue();
  },

  'pre-task': () => {
    if (session && session.metric) {
      try { session.metric('tasks'); } catch (e) { /* no active session */ }
    }
    if (router && router.routeTask && prompt) {
      const result = router.routeTask(prompt);
      process.stderr.write(`[INFO] Task routed to: ${result.agent} (confidence: ${result.confidence})\n`);
    } else {
      process.stderr.write('[OK] Task started\n');
    }
    emitAllow();
  },

  'post-task': () => {
    if (intelligence && intelligence.feedback) {
      try {
        intelligence.feedback(!toolFailed);
      } catch (e) { /* non-fatal */ }
    }
    process.stderr.write(toolFailed ? '[LEARN] Task FAILURE recorded\n' : '[OK] Task completed\n');
    emitContinue();
  },

  'stats': () => {
    if (intelligence && intelligence.stats) {
      intelligence.stats(args.includes('--json'));
    } else {
      process.stderr.write('[WARN] Intelligence module not available. Run session-restore first.\n');
    }
    process.stdout.write('{}\n');
  },
};

  if (command && handlers[command]) {
    try {
      await Promise.resolve(handlers[command]());
    } catch (e) {
      process.stderr.write(`[WARN] Hook ${command} encountered an error: ${e.message}\n`);
      emitAllow();
    }
  } else if (command) {
    process.stderr.write(`[OK] Hook: ${command}\n`);
    emitAllow();
  } else {
    process.stderr.write('Usage: hook-handler.cjs <route|pre-bash|pre-edit|post-bash|post-edit|session-restore|session-end|pre-task|post-task|stats>\n');
    process.stdout.write('{}\n');
  }
}

process.exitCode = 0;
main().catch((e) => {
  try {
    process.stderr.write(`[WARN] Hook handler error: ${e.message}\n`);
    emitAllow();
  } catch (_) {}
}).finally(() => {
  process.exit(typeof process.exitCode === 'number' ? process.exitCode : 0);
});
