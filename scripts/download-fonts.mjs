import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

// Fontshare permits self-hosting, but not redistribution through public repos.
for (const [name, source] of [
  ['Chillax', 'https://cdn.fontshare.com/wf/ZYDQ23QUC5RIWZP2XNQDB6EQIKJAJRWI/OQWULF7QT4HTMBH6W3XY6DESOSZLWT3L/7L7IIHAKMJC3Z2MTNHMMKSRMMTKZN4OJ.woff2'],
  ['Satoshi', 'https://cdn.fontshare.com/wf/NWBQYJIM7GCZ5XWD7D26ARB3VDY55ZRT/K63EV2KZIGKLE7RANQ2U42S6SVHU5RJ7/X6XYTKIVDUW7GZTZPZNN4EUM5KH54KHF.woff2'],
]) {
  const destination = new URL(`../public/fonts/${name.toLowerCase()}-variable.woff2`, import.meta.url);
  if (existsSync(destination)) continue;

  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${name} download failed: HTTP ${response.status}`);

  const font = Buffer.from(await response.arrayBuffer());
  if (font.toString('ascii', 0, 4) !== 'wOF2') {
    throw new Error(`Fontshare did not return a WOFF2 font for ${name}: ${source}`);
  }
  await writeFile(destination, font);
  console.log(`Downloaded ${name} from Fontshare for local self-hosting.`);
}
