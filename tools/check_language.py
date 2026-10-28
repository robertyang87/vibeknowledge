#!/usr/bin/env python3
"""Fail if Chinese characters appear outside the allowed copy locations.

Rule: this repository is English-only. The only exception is a video's
own audience-facing copy (narration, on-screen text, captions, titles,
publishing copy), which must live in scripts/ or episodes/<episode>/copy/.

Usage: python3 tools/check_language.py [root]
Exit code 0 means clean, 1 means a violation was found.
"""

import pathlib
import re
import sys

CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
SKIP_DIRS = {".git", "__pycache__", "node_modules"}
BINARY_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".mov", ".mp3",
    ".wav", ".zip", ".pdf", ".ico", ".ttf", ".otf", ".woff", ".woff2",
}


def submodule_roots(root: pathlib.Path) -> list:
    """Paths declared in .gitmodules; their content is upstream code."""
    config = root / ".gitmodules"
    roots = []
    if config.is_file():
        for line in config.read_text(encoding="utf-8").splitlines():
            match = re.match(r"\s*path\s*=\s*(.+)", line)
            if match:
                roots.append(pathlib.PurePosixPath(match.group(1).strip()).parts)
    return roots


def is_copy_location(path: pathlib.Path) -> bool:
    parts = path.parts
    if parts and parts[0] == "scripts":
        return True
    return len(parts) >= 3 and parts[0] == "episodes" and parts[2] == "copy"


def main() -> int:
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    upstreams = submodule_roots(root)
    violations = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if any(rel.parts[: len(up)] == up for up in upstreams):
            continue
        if path.suffix.lower() in BINARY_SUFFIXES:
            continue
        if is_copy_location(rel):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(text.splitlines(), start=1):
            if CJK.search(line):
                violations.append(f"{rel}:{number}: {line.strip()[:80]}")
    if violations:
        print("Chinese characters found outside the allowed copy locations:")
        for item in violations:
            print(" ", item)
        print("Move the text into scripts/ or episodes/<episode>/copy/, or translate it.")
        return 1
    print("Clean: no Chinese characters outside the allowed copy locations.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
