import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.resolve(process.argv[2] ?? process.cwd(), 'package.json'));
const ts = require('typescript');

const source = new URL('../assets/runtime/lib/memory-core.ts', import.meta.url);
const compiled = ts.transpileModule(readFileSync(source, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const module = { exports: {} };
vm.runInThisContext(`(function(exports) {${compiled}\n})`)(module.exports);
const { cameraRect } = module.exports;
const view = { w: 880, h: 600 };
// Canopy at y=54, plus node outlines; the core includes its full lower disc.
const treeBounds = { x: 195, y: 40, w: 490, h: 538 };
const state = { focusedTeam: true, coreExpanded: false, coreCenter: { x: 440, y: 530 }, treeBounds };

function onScreen(rect, bounds, viewport) {
  const scale = Math.min(viewport.w / rect.w, viewport.h / rect.h);
  const x = (viewport.w - rect.w * scale) / 2;
  const y = (viewport.h - rect.h * scale) / 2;
  return {
    left: x + (bounds.x - rect.x) * scale,
    right: x + (bounds.x + bounds.w - rect.x) * scale,
    top: y + (bounds.y - rect.y) * scale,
    bottom: y + (bounds.y + bounds.h - rect.y) * scale,
  };
}

test('selecting any tree tier retains the complete tree frame', () => {
  const viewport = { w: 1330, h: 678 };
  const full = cameraRect(view, { ...state, viewport });
  for (const y of [54, 168, 300, 456]) {
    assert.deepEqual(cameraRect(view, { ...state, viewport, selectedNodePos: { x: 215, y } }), full);
  }
});

test('inline, fullscreen, narrow and resized canvases keep the canopy clear of controls', () => {
  for (const viewport of [{ w: 1330, h: 678 }, { w: 2048, h: 1068 }, { w: 680, h: 500 }, { w: 342, h: 500 }, { w: 272, h: 500 }]) {
    // Also cover dense trees and nodes displaced outside the logical canvas.
    for (const bounds of [treeBounds, { x: -60, y: -35, w: 1000, h: 740 }]) {
      const rect = cameraRect(view, { ...state, treeBounds: bounds, viewport, selectedNodePos: { x: 440, y: 54 } });
      const screen = onScreen(rect, bounds, viewport);
      const eps = 0.001;
      assert.ok(screen.left >= 72 - eps && screen.right <= viewport.w - 72 + eps);
      assert.ok(screen.top >= (viewport.w < 600 ? 100 : 72) - eps);
      assert.ok(screen.bottom <= viewport.h - 88 + eps);
      assert.ok(Math.abs(rect.w / rect.h - view.w / view.h) < eps);
    }
  }
});

test('core and memory-note inspection still zoom independently of the tree', () => {
  const tree = cameraRect(view, state);
  const core = cameraRect(view, { ...state, coreExpanded: true });
  const note = cameraRect(view, { ...state, coreExpanded: true, memorySelectedPos: { x: 450, y: 525 } });
  assert.ok(note.w < core.w && core.w < tree.w);
});
