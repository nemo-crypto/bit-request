import { buildSync } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// The published code is bundled by Father. Resolve the same extensionless imports
// for Node's regression runner while keeping real third-party modules shared.
export function loadSource(relativePath) {
  const directory = mkdtempSync(fileURLToPath(new URL('.compiled-', import.meta.url)));
  const filename = join(directory, 'source.cjs');
  const require = createRequire(import.meta.url);
  try {
    const result = buildSync({
      entryPoints: [fileURLToPath(new URL(relativePath, import.meta.url))],
      bundle: true, platform: 'node', format: 'cjs', packages: 'external',
      write: false, logLevel: 'silent',
    });
    writeFileSync(filename, result.outputFiles[0].text);
    return require(filename);
  } finally {
    delete require.cache[filename];
    rmSync(directory, { recursive: true, force: true });
  }
}
