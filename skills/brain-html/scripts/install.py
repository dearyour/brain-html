#!/usr/bin/env python3
"""Copy this skill into Codex's global skill directory, without overwriting."""
import argparse
import hashlib
import os
from pathlib import Path
import shutil

SOURCE = Path(__file__).resolve().parents[1]


def manifest(root):
    return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts
            and p.name != '.DS_Store' and p.suffix != '.pyc'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination', type=Path, default=Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'skills' / 'brain-html')
    args = parser.parse_args()
    destination = args.destination.expanduser().absolute()
    if destination.exists() or destination.is_symlink():
        parser.error(f'Destination already exists; no files changed: {destination}')
    expected = manifest(SOURCE)
    shutil.copytree(SOURCE, destination, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.DS_Store'))
    actual = manifest(destination)
    if expected != actual:
        raise RuntimeError('Installation hash verification failed')
    print(f'Installed {destination}; SHA-256 verified for {len(actual)} files.')


if __name__ == '__main__':
    main()
