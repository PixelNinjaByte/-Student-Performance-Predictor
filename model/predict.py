from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "artifacts" / "student_score_model.joblib"

REQUIRED_FIELDS = [
    "hours_studied",
    "previous_score",
    "attendance",
    "sleep_hours",
    "sample_papers_practiced",
]


def load_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {MODEL_PATH}. Train the model first."
        )
    return joblib.load(MODEL_PATH)


def parse_input() -> dict:
    if len(sys.argv) < 2:
        raise ValueError("Prediction input JSON is required.")

    payload = json.loads(sys.argv[1])
    missing_fields = [field for field in REQUIRED_FIELDS if field not in payload]
    if missing_fields:
        missing = ", ".join(missing_fields)
        raise ValueError(f"Missing required fields: {missing}")

    return payload


def main() -> None:
    payload = parse_input()
    bundle = load_model_bundle()

    dataframe = pd.DataFrame([[payload[field] for field in REQUIRED_FIELDS]], columns=REQUIRED_FIELDS)
    prediction = bundle["model"].predict(dataframe)[0]

    response = {
        "predicted_score": round(float(prediction), 2),
        "features_used": REQUIRED_FIELDS,
    }
    print(json.dumps(response))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pragma: no cover - CLI error path
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)
