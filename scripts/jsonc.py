"""Helpers for Shopify JSONC files (header /* */ comment, inline // comments)."""
import json, re

def _strip(raw):
    raw = re.sub(r'/\*.*?\*/', '', raw, count=1, flags=re.S)
    return re.sub(r'^\s*//.*$', '', raw, flags=re.M)

def parse(p):
    return json.loads(_strip(open(p, encoding='utf-8').read()))

def set_top_key(p, key, obj):
    """Insert or replace a top-level key, keeping the rest of the text (and comments) untouched."""
    raw = open(p, encoding='utf-8').read()
    body = json.dumps(obj, indent=2, ensure_ascii=False).replace('\n', '\n  ')
    entry = f'  "{key}": {body}'
    pat = re.compile(r'^  "' + re.escape(key) + r'": \{.*?^  \}', re.S | re.M)
    if pat.search(raw):
        raw = pat.sub(lambda m: entry, raw, count=1)
    else:
        start = raw.index('{', raw.index('*/') + 2 if raw.lstrip().startswith('/*') else 0)
        raw = raw[:start + 1] + '\n' + entry + ',' + raw[start + 1:]
    open(p, 'w', encoding='utf-8').write(raw)
    parse(p)  # validate
