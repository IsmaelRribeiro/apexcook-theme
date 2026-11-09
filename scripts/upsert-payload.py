"""Writes themeFilesUpsert variables for the given theme-relative paths to stdout (JSON)."""
import json, sys
files = [{"filename": f, "body": {"type": "TEXT", "value": open('theme/' + f, encoding='utf-8').read()}} for f in sys.argv[1:]]
print(json.dumps({"files": files}, ensure_ascii=False))
