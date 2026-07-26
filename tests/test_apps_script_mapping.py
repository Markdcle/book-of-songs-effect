# -*- coding: utf-8 -*-
"""Run the Apps Script row-mapping behavior test under Node."""

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
result = subprocess.run(
    [
        "node",
        str(ROOT / "website" / "tests" / "test_apps_script_mapping.mjs"),
        str(ROOT / "apps-script" / "Code.gs"),
    ],
    check=False,
    capture_output=True,
    text=True,
    encoding="utf-8",
)
if result.stdout:
    print(result.stdout, end="")
if result.stderr:
    print(result.stderr, end="")
raise SystemExit(result.returncode)
