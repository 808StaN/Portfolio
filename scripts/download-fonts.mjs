import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

const destination = new URL('../public/fonts/satoshi-variable.woff2', import.meta.url);

// Fetch from Fontshare rather than redistribute Satoshi in this public repo.
if (!existsSync(destination)) {
  const source = 'https://cdn.fontshare.com/wf/NWBQYJIM7GCZ5XWD7D26ARB3VDY55ZRT/K63EV2KZIGKLE7RANQ2U42S6SVHU5RJ7/X6XYTKIVDUW7GZTZPZNN4EUM5KH54KHF.woff2';
  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Satoshi download failed: HTTP ${response.status}`);

  const font = Buffer.from(await response.arrayBuffer());
  if (font.toString('ascii', 0, 4) !== 'wOF2') {
    throw new Error('Fontshare did not return a WOFF2 font. See public/fonts/README.md.');
  }

  await writeFile(destination, font);
  console.log('Downloaded Satoshi from Fontshare for local self-hosting.');
}
