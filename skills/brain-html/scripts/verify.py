#!/usr/bin/env python3
"""Verify generator behavior and installer integrity in an isolated directory."""
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(*args, success=True):
    result = subprocess.run([sys.executable, *map(str, args)], capture_output=True, text=True)
    assert (result.returncode == 0) == success, result.stderr or result.stdout
    return result


def embedded(path):
    text = path.read_text()
    match = re.search(r'<script type="application/json" id="brain-html-config">(.*?)</script>', text, re.S)
    assert match, 'Missing data block'
    assert not re.search(r'<script[^>]+src=|<link[^>]+(?:stylesheet|https?:)', text), 'Unexpected remote runtime'
    return json.loads(match[1])


with tempfile.TemporaryDirectory(prefix='brain-html-verify-') as temporary:
    temp = Path(temporary)
    for mode in ('brain', 'doctor', 'funnel', 'adpilot', 'personas'):
        output = temp / f'{mode}.html'
        run(ROOT / 'scripts/render.py', '--mode', mode, '--output', output)
        assert embedded(output)['mode'] == mode
        assert embedded(output)['sample'] is True
    hostile = '</script><script>alert("escaped")</script>'
    payload = {'title': hostile, 'sample': False, 'brain': {'pillars': []}}
    data = temp / 'data.json'
    data.write_text(json.dumps(payload))
    output = temp / 'custom.html'
    run(ROOT / 'scripts/render.py', '--data', data, '--sections', 'doctor', '--output', output)
    decoded = embedded(output)
    assert decoded['title'] == hostile
    assert decoded['brain']['pillars'] == [] and 'personas' not in decoded, 'Samples leaked into supplied data'
    assert hostile not in output.read_text(), 'Script-breakout text was not escaped'
    before = hashlib.sha256(output.read_bytes()).hexdigest()
    run(ROOT / 'scripts/render.py', '--output', output, success=False)
    assert hashlib.sha256(output.read_bytes()).hexdigest() == before, 'Existing output changed'
    run(ROOT / 'scripts/render.py', '--sections', 'missing-mode', '--output', temp / 'invalid.html', success=False)
    destination = temp / 'global-skills' / 'brain-html'
    run(ROOT / 'scripts/install.py', '--destination', destination)
    for source in ROOT.rglob('*'):
        if source.is_file() and '__pycache__' not in source.parts and source.name != '.DS_Store' and source.suffix != '.pyc':
            target = destination / source.relative_to(ROOT)
            assert source.read_bytes() == target.read_bytes(), str(source)
    run(ROOT / 'scripts/install.py', '--destination', destination, success=False)
    assert (destination / 'SKILL.md').read_bytes() == (ROOT / 'SKILL.md').read_bytes()
print('PASS: 5 mode outputs, supplied-data isolation, JSON/script escaping, no-overwrite, install SHA-256 parity.')
