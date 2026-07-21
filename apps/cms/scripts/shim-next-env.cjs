/**
 * Payload's loadEnv does `import x from '@next/env'` but @next/env (Next 16)
 * only exposes named exports under tsx/CJS interop. Patch default before Payload loads.
 */
const Module = require('module');

const originalLoad = Module._load;
Module._load = function patchedLoad(request, _parent, _isMain) {
  const exported = originalLoad.apply(this, arguments);
  if (
    exported &&
    typeof exported === 'object' &&
    typeof request === 'string' &&
    (request === '@next/env' || request.endsWith('/@next/env') || request.endsWith('\\@next/env'))
  ) {
    if (!exported.default && typeof exported.loadEnvConfig === 'function') {
      exported.default = exported;
    }
  }
  return exported;
};
