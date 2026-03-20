from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "student_scores.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "student_score_model.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"

FEATURE_COLUMNS = [
    "hours_studied",
    "previous_score",
    "attendance",
    "sleep_hours",
    "sample_papers_practiced",
]
TARGET_COLUMN = "final_score"


def load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    return pd.read_csv(path)


def train_model(dataframe: pd.DataFrame) -> tuple[RandomForestRegressor, dict[str, float]]:
    missing_columns = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(dataframe.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Dataset is missing required columns: {missing}")

    x = dataframe[FEATURE_COLUMNS]
    y = dataframe[TARGET_COLUMN]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        random_state=42,
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    metrics = {
        "mae": round(mean_absolute_error(y_test, predictions), 4),
        "r2_score": round(r2_score(y_test, predictions), 4),
        "training_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
    }
    return model, metrics


def save_artifacts(model: RandomForestRegressor, metrics: dict[str, float]) -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "feature_columns": FEATURE_COLUMNS,
            "target_column": TARGET_COLUMN,
        },
        MODEL_PATH,
    )
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")


def main() -> None:
    dataframe = load_dataset(DATA_PATH)
    model, metrics = train_model(dataframe)
    save_artifacts(model, metrics)

    print("Model training complete.")
    print(f"Dataset: {DATA_PATH}")
    print(f"Model artifact: {MODEL_PATH}")
    print(f"Metrics file: {METRICS_PATH}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
