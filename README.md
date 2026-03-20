# Student Performance Predictor

A machine learning web application that predicts student marks based on study habits and other academic factors.

## Overview

This project combines a React frontend, a Node.js backend, and a Python machine learning model to deliver real-time performance predictions through a simple web interface.

## Features

- Predict student marks using a trained machine learning model
- React-based frontend for user interaction
- Node.js and Express backend for handling requests
- Real-time prediction workflow between the UI and model layer

## Tech Stack

- React.js
- Node.js
- Express.js
- Python
- Scikit-learn

## Demo

Add screenshots or a short demo GIF here.
img src="demo.png" alt="Demo of the Student Performance Predictor" />

## How to Run

The current project structure includes `frontend/`, `backend/`, and a working Python ML module in `model/`.

### Train the ML Model

1. Install Python dependencies:

   ```bash
   pip install -r model/requirements.txt
   ```

2. Train the model from the project root:

   ```bash
   python model/train_model.py
   ```

3. Trained files will be created here:

   ```text
   model/artifacts/student_score_model.joblib
   model/artifacts/metrics.json
   ```

4. The training dataset used by the script is located here:

   ```text
   model/data/student_scores.csv
   ```

### Run the Node.js Backend

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

   On Windows PowerShell, if `npm` is blocked by execution policy, use:

   ```bash
   npm.cmd install
   ```

2. Make sure the trained model artifact already exists:

   ```text
   model/artifacts/student_score_model.joblib
   ```

3. Start the backend server from the `backend/` folder:

   ```bash
   node server.js
   ```

4. The API will run at:

   ```text
   http://localhost:5000
   ```

5. Available routes:

   ```text
   GET  /api/health
   POST /api/predict
   ```

6. Example prediction request body:

   ```json
   {
     "hours_studied": 6,
     "previous_score": 78,
     "attendance": 90,
     "sleep_hours": 8,
     "sample_papers_practiced": 5
   }
   ```

### Run the React Frontend

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

   On Windows PowerShell, if `npm` is blocked by execution policy, use:

   ```bash
   npm.cmd install
   ```

2. Start the React development server:

   ```bash
   npm run dev
   ```

   On Windows PowerShell, you can also use:

   ```bash
   npm.cmd run dev
   ```

3. The frontend will run at:

   ```text
   http://localhost:3000
   ```

4. By default, the app sends prediction requests to:

   ```text
   http://localhost:5000
   ```

5. To use a different backend URL, create a `.env` file in `frontend/` and set:

   ```text
   VITE_API_BASE_URL=http://localhost:5000
   ```

## Project Goal

The goal of this project is to explore how machine learning can be used in education-focused applications by estimating student performance from study-related inputs.

## Future Improvements

- Use a larger and higher-quality dataset
- Improve model accuracy with additional feature engineering
- Experiment with deep learning approaches
- Enhance the user interface and overall user experience
- Add model evaluation metrics and prediction history
