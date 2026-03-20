const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const MODEL_DIR = path.join(PROJECT_ROOT, "model");
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || "python";

app.use(cors());
app.use(express.json());

const requiredFields = [
  "hours_studied",
  "previous_score",
  "attendance",
  "sleep_hours",
  "sample_papers_practiced",
];

function validatePayload(body) {
  const missingFields = requiredFields.filter((field) => body[field] === undefined);
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  const invalidFields = requiredFields.filter(
    (field) => Number.isNaN(Number(body[field]))
  );
  if (invalidFields.length > 0) {
    return `These fields must be numeric: ${invalidFields.join(", ")}`;
  }

  return null;
}

function runPythonPrediction(input) {
  return new Promise((resolve, reject) => {
    const payload = {};
    for (const field of requiredFields) {
      payload[field] = Number(input[field]);
    }

    const scriptPath = path.join(MODEL_DIR, "predict.py");
    const child = spawn(PYTHON_COMMAND, [scriptPath, JSON.stringify(payload)], {
      cwd: PROJECT_ROOT,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr.trim() ||
              stdout.trim() ||
              `Python prediction process exited with code ${code}.`
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid prediction response: ${stdout}`));
      }
    });
  });
}

app.get("/", (_req, res) => {
  res.json({
    message: "Student Performance Predictor backend is running.",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "backend",
    modelScript: "model/predict.py",
  });
});

app.post("/api/predict", async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await runPythonPrediction(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Prediction failed.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
