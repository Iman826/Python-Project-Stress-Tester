# 🧠 Python Project Stress Tester

A web-based stress level prediction tool that uses health and lifestyle data to estimate a user's stress level on a scale of 1–9. The project combines a Python/Flask backend with a dynamic HTML/CSS/JavaScript frontend survey interface.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Usage](#usage)
  - [Web Interface](#web-interface)
  - [CLI Mode](#cli-mode)
- [How It Works](#how-it-works)
- [Dataset](#dataset)
- [API Endpoints](#api-endpoints)

---

## Overview

The Stress Tester collects personal health metrics through an interactive survey (gender, age, occupation, sleep duration, physical activity, BMI category, and blood pressure) and returns a predicted stress level. The project has two modes:

- **Web App** — A polished survey UI served by Flask, which calls a prediction endpoint and displays the result.
- **CLI Mode** — A terminal-based interactive predictor powered by a trained `RandomForestClassifier` from scikit-learn.

---

## Features

- 🎯 Step-by-step survey with progress bar and animated transitions
- 🔮 Real-time stress level prediction via REST API
- 📊 Pie chart visualization of stress probability distribution
- 🤖 ML model (Random Forest) trained on real sleep/health data for CLI mode
- ✅ 5-fold cross-validation accuracy reporting
- 🔁 Multi-user support — test multiple profiles in one session

---

## Screenshots

Main Page

![Main](previews/preview-0)

Question 1

![Q1](previews/preview-1)

Question 2

![Q2](previews/preview-2)

Question 3

![Q3](previews/preview-3)

Question 4

![Q4](previews/preview-4)

Question 5

![Q5](previews/preview-5)

Question 6

![Q6](previews/preview-6)

Question 7

![Q7](previews/preview-7)

Result Page

![Result](previews/preview-8)


---

## Project Structure

```
Python-Project-Stress-Tester-main/
│
├── server.py                  # Flask backend — serves the app and handles predictions
├── interactive_predict.py     # CLI mode — ML-powered interactive predictor
├── sleep_health_data.csv      # Dataset: sleep & lifestyle health records
│
├── index.html                 # Main survey page
├── script.js                  # Survey logic — question flow, answer collection, API calls
├── script_pie_logic.js        # Pie chart rendering for prediction probabilities
├── style.css                  # Main stylesheet (survey UI)
└── style_pie.css              # Stylesheet for pie chart result screen
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3, Flask, Flask-CORS         |
| ML Model  | scikit-learn (RandomForestClassifier, LabelEncoder) |
| Data      | pandas                              |
| Frontend  | HTML5, CSS3, Vanilla JavaScript     |
| Icons     | Font Awesome 6                      |
| Fonts     | Google Fonts (Outfit)               |

---

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/Python-Project-Stress-Tester.git
   cd Python-Project-Stress-Tester
   ```

2. Install required Python packages:
   ```bash
   pip install flask flask-cors pandas scikit-learn
   ```

### Running the App

**Start the Flask server:**
```bash
python server.py
```

The server will start on `http://127.0.0.1:5500`.

Open your browser and navigate to:
```
http://127.0.0.1:5500
```

---

## Usage

### Web Interface

1. Click **Start Survey** on the landing screen.
2. Answer each question using the radio buttons or text inputs:
   - Gender
   - Age
   - Occupation
   - Sleep duration (hours/night)
   - Physical activity (minutes/day)
   - BMI Category
   - Blood Pressure (e.g., `120/80`)
3. Click **Next** to advance through questions.
4. After the final question, your **Stress Level (1–9)** and a probability pie chart are displayed.
5. Click **Submit Another Response** to start over.

### CLI Mode

Run the interactive ML predictor directly in the terminal:

```bash
python interactive_predict.py
```

The model will train on `sleep_health_data.csv`, report cross-validation accuracy, then prompt you to enter health metrics interactively. Output example:

```
5-Fold CV Accuracy: 87.3% ± 2.1%
Model trained and ready for predictions!

--- Stress Tester ---
Gender (Male/Female): Male
Age: 30
...

==========================================
CALCULATED STRESS LEVEL: 6/10
==========================================
```

---

## How It Works

### Web API (server.py)

The `/predict` endpoint uses a rule-based scoring model:

| Factor           | Condition               | Score Added |
|------------------|-------------------------|-------------|
| Sleep Duration   | < 5 hours               | +4          |
|                  | 5–6 hours               | +3          |
|                  | 6–7 hours               | +2          |
| BMI Category     | Obese                   | +3          |
|                  | Overweight              | +2          |
| Physical Activity| < 30 min/day            | +2          |
| Base Score       | Always                  | +1          |

The final score is clamped between 1 and 9.

### CLI Model (interactive_predict.py)

Uses a **Random Forest Classifier** (100 estimators) trained on the bundled sleep health dataset. Categorical features (Gender, Occupation, BMI Category) are encoded with `LabelEncoder`. Blood pressure is split into systolic and diastolic components as separate numeric features.

---

## Dataset

`sleep_health_data.csv` contains health records with the following columns:

| Column                  | Description                          |
|-------------------------|--------------------------------------|
| Person ID               | Unique identifier                    |
| Gender                  | Male / Female                        |
| Age                     | Integer age                          |
| Occupation              | Job title                            |
| Sleep Duration          | Hours of sleep per night             |
| Quality of Sleep        | Subjective sleep quality score       |
| Physical Activity Level | Minutes of activity per day          |
| Stress Level            | Target variable (1–9 scale)          |
| BMI Category            | Normal / Overweight / Obese          |
| Blood Pressure          | Systolic/Diastolic (e.g., 126/83)   |

---

## API Endpoints

| Method | Endpoint     | Description                              |
|--------|--------------|------------------------------------------|
| GET    | `/`          | Serves the main `index.html` page        |
| GET    | `/questions` | Returns the list of survey questions (JSON) |
| POST   | `/predict`   | Accepts user answers, returns stress level and probabilities |

**POST `/predict` — Request Body Example:**
```json
{
  "Sleep Duration": 6.0,
  "BMI Category": "Overweight",
  "Physical Activity Level": 25
}
```

**Response Example:**
```json
{
  "stress_level": 6,
  "probabilities": { "1": 0.06, "2": 0.06, ... },
  "message": "Prediction successful"
}
```
