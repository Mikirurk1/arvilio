const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const candidates = [
  path.join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
  path.join(root, '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
];

const source = candidates.find((candidate) => fs.existsSync(candidate));
if (!source) {
  console.warn('[copy-pdf-worker] pdfjs worker not found — skip');
  process.exit(0);
}

const targetDir = path.join(root, 'public/pdfjs');
const target = path.join(targetDir, 'pdf.worker.min.mjs');
fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);
console.log('[copy-pdf-worker] copied to public/pdfjs/pdf.worker.min.mjs');
