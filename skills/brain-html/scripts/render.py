#!/usr/bin/env python3
"""Emit a portable, offline HTML using the extracted Command Center renderers."""
import argparse
import copy
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODES = ('brain', 'doctor', 'funnel', 'adpilot', 'personas')


def merge(left, right):
    out = copy.deepcopy(left)
    for key, value in right.items():
        out[key] = merge(out[key], value) if isinstance(value, dict) and isinstance(out.get(key), dict) else value
    return out


def validate(data):
    if data.get('theme', 'mono') not in ('mono', 'dark', 'midnight', 'ember', 'mono-light'):
        raise ValueError('theme must be mono, dark, midnight, ember, or mono-light')
    pillars = data.get('brain', {}).get('pillars', [])
    ids = [p.get('id', f'dept-{i}') for i, p in enumerate(pillars)]
    if len(set(ids)) != len(ids):
        raise ValueError('brain.pillars IDs must be unique')
    for pillar in pillars:
        if not pillar.get('name') or not isinstance(pillar.get('agents', []), list):
            raise ValueError('Each brain pillar needs name and agents[]')
        for agent in pillar.get('agents', []):
            if not (isinstance(agent, str) and agent or isinstance(agent, dict) and agent.get('name')):
                raise ValueError('Each agent needs a non-empty name')
    doctor = data.get('doctor', {})
    for axis in doctor.get('axes', []):
        for field in ('score', 'roster', 'freshness', 'sop'):
            if not isinstance(axis.get(field), (int, float)) or not 0 <= axis[field] <= 100:
                raise ValueError(f'doctor.axes[].{field} must be 0..100')
    if doctor.get('health') is not None and not 0 <= doctor['health'] <= 100:
        raise ValueError('doctor.health must be null or 0..100')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--mode', choices=MODES, default='brain')
    p.add_argument('--sections', default='', help='Optional supporting modes, comma-separated')
    p.add_argument('--showcase', action='store_true', help='Show all five style choices and working previews')
    p.add_argument('--title', help='Page title')
    p.add_argument('--theme', choices=('mono', 'dark', 'midnight', 'ember', 'mono-light'))
    p.add_argument('--data', type=Path, help='JSON config. Supplied data is never silently mixed with samples.')
    p.add_argument('--sample', action='store_true', help='Explicitly merge supplied partial JSON onto labeled sample data')
    p.add_argument('--output', required=True, type=Path)
    args = p.parse_args()
    if args.output.exists():
        p.error(f'Refusing to overwrite existing output: {args.output}')
    sections = list(dict.fromkeys(x.strip() for x in args.sections.split(',') if x.strip()))
    if any(x not in MODES for x in sections):
        p.error('--sections must contain only ' + ', '.join(MODES))
    defaults = json.loads((ROOT / 'assets/examples/sample-data.json').read_text())
    if args.data:
        supplied = json.loads(args.data.read_text())
        if not isinstance(supplied, dict):
            p.error('--data must contain a JSON object')
        base = defaults if args.sample else {'title': args.mode.upper(), 'theme': 'mono', 'sample': False, 'brain': {'pillars': []}}
        data = merge(base, supplied)
        if args.sample:
            data['sample'] = True
    else:
        data = defaults
    data.update(mode=args.mode, sections=sections, showcase=args.showcase)
    if args.title:
        data['title'] = args.title
    elif not args.data:
        data['title'] = {'brain': 'G-BRAIN', 'doctor': '닥터', 'personas': '페르소나'}.get(args.mode, args.mode.upper())
    if args.theme:
        data['theme'] = args.theme
    try:
        validate(data)
    except (ValueError, TypeError, KeyError) as error:
        p.error(str(error))
    # Escaping < blocks </script> breakouts from user-authored content. React
    # escapes display text; style/script resources are trusted local build assets.
    config = json.dumps(data, ensure_ascii=False).replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    js = (ROOT / 'assets/dist/runtime.js').read_text()
    js = re.sub(r'</script', r'<\\/script', js, flags=re.I)
    css = (ROOT / 'assets/dist/styles.css').read_text()
    notices = '\n\n'.join(p.read_text() for p in sorted((ROOT / 'assets/licenses').glob('*.txt')))
    document = f'''<!doctype html>
<html lang="ko" data-theme="{html.escape(data.get('theme', 'mono'), quote=True)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="generator" content="brain-html — Command Center visualization extraction">
<title>{html.escape(data.get('title', 'BRAIN / HTML'))}</title>
<style>{css}</style></head><body>
<div id="root"></div><noscript>이 시각화에는 JavaScript가 필요합니다.</noscript>
<script type="application/json" id="brain-html-config">{config}</script>
<script>{js}</script>
<template id="brain-html-licenses">{html.escape(notices)}</template>
</body></html>'''
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive create also protects against a file appearing during generation.
    with args.output.open('x') as output:
        output.write(document)
    print(f'Created {args.output.resolve()} ({len(document.encode()):,} bytes), mode={args.mode}, sample={bool(data.get("sample"))}')


if __name__ == '__main__':
    main()
