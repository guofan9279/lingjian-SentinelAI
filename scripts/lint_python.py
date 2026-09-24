from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
python_files = [path for path in root.rglob('*.py') if '.venv' not in path.parts and '__pycache__' not in path.parts]

failures: list[str] = []
for path in python_files:
    text = path.read_text(encoding='utf-8')
    if '\t' in text:
        failures.append(f'{path}: contains tabs')
    for index, line in enumerate(text.splitlines(), start=1):
        if line.rstrip() != line:
            failures.append(f'{path}:{index}: trailing whitespace')

if failures:
    print('\n'.join(failures))
    sys.exit(1)

print(f'Python lint passed for {len(python_files)} files.')
