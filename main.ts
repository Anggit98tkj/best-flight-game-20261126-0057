// Valley Wing entry program (Node 22, standard library only): copies game/ and
// screenshots/ from beside this file to $MAKEFUN_OUTPUT_DIR (default /output) and
// writes /output/dossier.json with buildDossier from ./vendor/makefun-game.ts.
// Run it from any working directory; it never reads the process cwd for paths.
// Paths resolve relative to this script, never relative to the process cwd:
// MAKEFUN_BOT_DIR wins when set, otherwise the directory containing main.ts.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = process.env.MAKEFUN_BOT_DIR
  ? process.env.MAKEFUN_BOT_DIR
  : fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
