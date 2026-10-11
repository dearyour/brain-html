import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets/runtime');
const modulesRoot = path.resolve(process.argv[2] ?? path.join(root, '../..'));
const require = createRequire(path.join(modulesRoot, 'package.json'));
const esbuild = require('esbuild');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
await fs.mkdir(path.join(root, 'assets/dist'), { recursive: true });
const result = await esbuild.build({
  entryPoints: [path.join(source, 'entry.tsx')], bundle: true, minify: true,
  outfile: path.join(root, 'assets/dist/runtime.js'), format: 'iife', platform: 'browser',
  jsx: 'automatic', target: ['es2020'], metafile: true, legalComments: 'eof',
  nodePaths: [path.join(modulesRoot, 'node_modules')],
  alias: { '@': source, 'next/dynamic': path.join(source, 'adapters/dynamic.tsx'), 'next/link': path.join(source, 'adapters/link.tsx') },
  define: { 'process.env.NODE_ENV': '"production"' },
});
const css = await fs.readFile(path.join(source, 'app/globals.css'), 'utf8');
const extra = await fs.readFile(path.join(source, 'studio.css'), 'utf8');
const theme = require('tailwindcss/loadConfig')(path.join(source, 'tailwind.config.ts'));
theme.content = [path.join(source, '**/*.{ts,tsx}')];
const compiled = await postcss([tailwind(theme)]).process(css + '\n' + extra, { from: undefined });
await fs.writeFile(path.join(root, 'assets/dist/styles.css'), compiled.css);
const packages = new Set(Object.keys(result.metafile.inputs).flatMap(p => {
  const match = p.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/); return match ? [match[1]] : [];
}));
const notices = [];
for (const pkg of [...packages].sort()) {
  const dir = path.join(modulesRoot, 'node_modules', pkg);
  const entries = await fs.readdir(dir);
  const license = entries.find(n => /^licen[sc]e(?:\.|$)/i.test(n));
  if (license) notices.push(`===== ${pkg} =====\n${await fs.readFile(path.join(dir, license), 'utf8')}`);
}
await fs.writeFile(path.join(root, 'assets/licenses/dependencies.txt'), notices.join('\n\n'));
const versions = Object.fromEntries(await Promise.all(['react','react-dom','d3-force','lucide-react','zod','esbuild','tailwindcss','postcss'].map(async p => [p, JSON.parse(await fs.readFile(path.join(modulesRoot, 'node_modules', p, 'package.json'), 'utf8')).version])));
await fs.writeFile(path.join(root, 'references/build-info.json'), JSON.stringify({ packages: [...packages].sort(), versions }, null, 2) + '\n');
console.log(`Built ${Object.keys(result.metafile.inputs).length} modules. Runtime and CSS are fully embedded by render.py.`);
