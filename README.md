# 🧠 BehaviourCheck

### Behavioral Analysis and Anomaly Detection

**BehaviourCheck** is an individual student project that combines handwritten digit recognition with experimental behavioral analysis through an interactive drawing canvas.

The project was developed by adapting an MNIST handwritten digit-recognition example and extending it with a web interface and behavioral metrics. It explores how users interact with a drawing canvas, in addition to recognizing the digits they draw.

## ✨ Features

- ✍️ **Interactive Drawing Canvas** — Draw handwritten digits directly on the website.
- 🤖 **Handwritten Digit Recognition** — Predicts the digit using a trained MNIST machine learning model.
- 📊 **Prediction Confidence** — Displays the model's confidence for its digit prediction.
- ⏱️ **Behavioral Metrics** — Examines available interaction patterns, such as drawing duration.
- 📈 **Deviation Score** — Compares observed interaction patterns against a baseline to indicate differences.
- 🖥️ **Web Dashboard** — Displays digit predictions and behavioral analysis results in one interface.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Frontend structure |
| CSS | Interface styling |
| JavaScript | Canvas interaction and frontend logic |
| Python | Backend development |
| FastAPI | API development |
| TensorFlow/Keras | Machine learning |
| MNIST | Handwritten digit recognition dataset |

## 📁 Project Structure

```text
BehaviourCheck/
├── Backend/
│   ├── main.py
│   └── behaviourcheck_mnist.keras
├── Frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python installed on your computer
- A modern web browser
- Git, if you want to clone the repository

### 1. Clone the Repository


```bash
git clone https://github.com/niyati19-dev/BehaviourCheck.git
cd BehaviourCheck
```

### 2. Install Backend Dependencies

Open a terminal in the project directory and run:

```bash
cd Backend
python -m pip install fastapi uvicorn tensorflow numpy pillow
```

Install any additional packages required by `main.py` if they are not included above.

### 3. Start the Backend

From the `Backend` directory, run:

```bash
python -m uvicorn main:app --reload
```

The backend should be available at:

`http://127.0.0.1:8000`

To view the API documentation, open:

`http://127.0.0.1:8000/docs`

### 4. Launch the Frontend

Open `Frontend/index.html` in your browser using VS Code Live Server or another local web server.

Ensure that:
- The backend server is running.
- The frontend API URL matches the backend address.
- Any required backend dependencies are installed.

## 🎯 Project Objective

The objective of BehaviourCheck is to demonstrate how handwritten digit recognition can be combined with interaction metrics to explore behavioral patterns through a simple web application.

## 🔮 Future Improvements

- Improve behavioral baseline comparison.
- Add clearer visualizations for behavioral metrics.
- Improve the analysis dashboard.
- Evaluate the consistency of behavioral measurements across different sessions.

## 👩‍💻 Developer

**Niyati Thakur**

This project was independently developed as part of my Information Technology learning journey. It builds upon an MNIST digit-recognition example and extends it into a web-based prototype for exploring behavioral interaction metrics.

## ⚠️ Disclaimer

BehaviourCheck is an educational prototype. Its behavioral metrics and deviation score are experimental and are not scientifically validated measures of deception, dishonesty, or a person's mental state.

Prediction confidence represents the machine learning model's confidence in its digit prediction; it does not measure the reliability of behavioral analysis.

---

⭐ Thank you for visiting BehaviourCheck!
