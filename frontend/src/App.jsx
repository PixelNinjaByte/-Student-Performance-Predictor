import { useMemo, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const initialForm = {
  hours_studied: 6,
  previous_score: 78,
  attendance: 90,
  sleep_hours: 8,
  sample_papers_practiced: 5,
};

const fieldConfig = [
  {
    name: "hours_studied",
    label: "Hours Studied",
    min: 0,
    max: 12,
    step: 0.5,
    helper: "Daily focused study time.",
    unit: "hrs",
  },
  {
    name: "previous_score",
    label: "Previous Score",
    min: 0,
    max: 100,
    step: 1,
    helper: "Latest exam score.",
    unit: "%",
  },
  {
    name: "attendance",
    label: "Attendance",
    min: 0,
    max: 100,
    step: 1,
    helper: "Class attendance rate.",
    unit: "%",
  },
  {
    name: "sleep_hours",
    label: "Sleep Hours",
    min: 0,
    max: 12,
    step: 0.5,
    helper: "Average sleep each night.",
    unit: "hrs",
  },
  {
    name: "sample_papers_practiced",
    label: "Sample Papers",
    min: 0,
    max: 20,
    step: 1,
    helper: "Practice papers completed.",
    unit: "sets",
  },
];

function getPerformanceBand(score) {
  if (score >= 85) {
    return "Excellent";
  }
  if (score >= 70) {
    return "Strong";
  }
  if (score >= 55) {
    return "Steady";
  }
  return "Needs Support";
}

function FactorMeter({ field, value }) {
  const percentage = ((value - field.min) / (field.max - field.min)) * 100;

  return (
    <div className="factor-meter">
      <div className="factor-header">
        <span>{field.label}</span>
        <strong>
          {value} {field.unit}
        </strong>
      </div>
      <div className="factor-track">
        <div className="factor-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p>{field.helper}</p>
    </div>
  );
}

function SliderField({ field, value, onChange }) {
  return (
    <label className="slider-card">
      <div className="slider-topline">
        <span className="slider-label">{field.label}</span>
        <strong className="slider-value">
          {value} {field.unit}
        </strong>
      </div>

      <input
        className="slider-input"
        type="range"
        name={field.name}
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={onChange}
      />

      <div className="slider-scale">
        <span>
          {field.min} {field.unit}
        </span>
        <span>
          {field.max} {field.unit}
        </span>
      </div>

      <input
        className="number-input"
        type="number"
        name={field.name}
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={onChange}
      />

      <span className="slider-helper">{field.helper}</span>
    </label>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readinessScore = useMemo(() => {
    const weightedScore =
      form.hours_studied * 4.5 +
      form.previous_score * 0.36 +
      form.attendance * 0.22 +
      form.sleep_hours * 3.2 +
      form.sample_papers_practiced * 1.8;

    return Math.min(100, Math.round(weightedScore));
  }, [form]);

  const displayedScore = prediction ?? readinessScore;
  const scoreBand = getPerformanceBand(displayedScore);
  const scoreAngle = Math.max(8, Math.min(100, displayedScore)) * 3.6;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Prediction failed.");
      }

      setPrediction(payload.predicted_score);
    } catch (requestError) {
      setPrediction(null);
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-grid">
        <div className="hero-copy-panel">
          <p className="eyebrow">Student Performance Predictor</p>
          <h1>See academic potential as a living visual dashboard.</h1>
          <p className="hero-text">
            Tune study habits, attendance, sleep, and practice levels to explore
            how the model estimates a student&apos;s final score.
          </p>

          <div className="hero-badges">
            <span>React interface</span>
            <span>Node API</span>
            <span>Python ML model</span>
          </div>
        </div>

        <div className="hero-score-panel">
          <div
            className="score-orbit"
            style={{
              background: `conic-gradient(#f28b29 0deg, #f2c14e ${scoreAngle}deg, rgba(16, 35, 59, 0.08) ${scoreAngle}deg 360deg)`,
            }}
          >
            <div className="score-core">
              <span className="score-caption">
                {prediction === null ? "Readiness" : "Prediction"}
              </span>
              <strong>{displayedScore}</strong>
              <span className="score-band">{scoreBand}</span>
            </div>
          </div>

          <div className="score-summary">
            <div>
              <span>Model Route</span>
              <strong>/api/predict</strong>
            </div>
            <div>
              <span>Input Factors</span>
              <strong>5 tracked signals</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{isSubmitting ? "Analyzing..." : "Ready"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="control-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Interactive Inputs</h2>
            <p>Use the sliders to shape the student profile before predicting.</p>
          </div>

          <div className="slider-grid">
            {fieldConfig.map((field) => (
              <SliderField
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Calculating..." : "Generate Prediction"}
          </button>
        </form>

        <aside className="insights-panel">
          <div className="panel-block">
            <div className="panel-heading">
              <h3>Performance Snapshot</h3>
              <span>{scoreBand}</span>
            </div>

            <div className="metric-strip">
              <div className="metric-card">
                <span>Current Score</span>
                <strong>{displayedScore}/100</strong>
              </div>
              <div className="metric-card">
                <span>Study Load</span>
                <strong>{form.hours_studied} hrs</strong>
              </div>
            </div>
          </div>

          <div className="panel-block">
            <div className="panel-heading">
              <h3>Factor Contribution</h3>
              <span>Visual breakdown</span>
            </div>

            <div className="factor-list">
              {fieldConfig.map((field) => (
                <FactorMeter key={field.name} field={field} value={form[field.name]} />
              ))}
            </div>
          </div>

          <div className="panel-block note-block">
            <div className="panel-heading">
              <h3>Connection Note</h3>
              <span>Backend required</span>
            </div>
            <p>
              Start the backend on <code>http://localhost:5000</code> so this
              interface can send prediction requests successfully.
            </p>
            {error ? <p className="error-message">{error}</p> : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
