from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model

import base64
import io
import numpy as np

from PIL import Image, ImageOps


# ============================================================
# BEHAVIOURCHECK API
# ============================================================

app = FastAPI(title="BehaviourCheck API")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD MODEL
# ============================================================

model = load_model("behaviourcheck_mnist.keras")


# ============================================================
# HOME
# ============================================================

@app.get("/")
def root():
    return {
        "message": "BehaviourCheck API is running",
        "status": "success",
        "model": "loaded"
    }


# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):

    image: str
    duration: float = 0
    strokes: int = 0
    pauses: int = 0
    path_length: float = 0
    corrections: int = 0


# ============================================================
# BASELINE
# ============================================================

BASELINE = {
    "duration": 3.0,
    "speed": 300.0,
    "pauses": 1.0,
    "corrections": 1.0,
    "path_length": 850.0
}


# ============================================================
# SAFE DIFFERENCE
# ============================================================

def metric_difference(current, baseline):

    if baseline <= 0:
        return 0.0

    return abs(current - baseline) / baseline * 100.0


# ============================================================
# DEVIATION SCORE
# ============================================================

def calculate_deviation(
    duration,
    strokes,
    pauses,
    path_length,
    corrections
):

    # Current speed
    if duration > 0:
        speed = path_length / duration
    else:
        speed = 0


    # --------------------------------------------------------
    # Differences
    # --------------------------------------------------------

    duration_diff = metric_difference(
        duration,
        BASELINE["duration"]
    )

    speed_diff = metric_difference(
        speed,
        BASELINE["speed"]
    )

    path_diff = metric_difference(
        path_length,
        BASELINE["path_length"]
    )


    # --------------------------------------------------------
    # Pauses
    #
    # 0 or 1 pause is considered normal.
    # Extra pauses increase deviation.
    # --------------------------------------------------------

    if pauses <= 1:
        pauses_diff = 0
    else:
        pauses_diff = min(
            (pauses - 1) * 35,
            100
        )


    # --------------------------------------------------------
    # Corrections
    #
    # 0 or 1 correction is considered normal.
    # --------------------------------------------------------

    if corrections <= 1:
        corrections_diff = 0
    else:
        corrections_diff = min(
            (corrections - 1) * 35,
            100
        )


    # --------------------------------------------------------
    # Convert into score
    # --------------------------------------------------------

    duration_score = min(
        duration_diff * 0.10,
        20
    )

    speed_score = min(
        speed_diff * 0.08,
        20
    )

    pauses_score = min(
        pauses_diff * 0.20,
        15
    )

    corrections_score = min(
        corrections_diff * 0.20,
        15
    )

    path_score = min(
        path_diff * 0.08,
        15
    )


    # Stroke count is a small supporting factor
    if strokes <= 3:
        stroke_score = 0
    else:
        stroke_score = min(
            (strokes - 3) * 3,
            15
        )


    total = (
        duration_score
        + speed_score
        + pauses_score
        + corrections_score
        + path_score
        + stroke_score
    )


    # Keep normal drawings from jumping directly to HIGH
    total = min(total, 100)

    return round(total, 2)


# ============================================================
# MNIST IMAGE PREPROCESSING
# ============================================================

def preprocess_for_mnist(image):

    # Convert to grayscale
    image = image.convert("L")

    # Find non-black pixels
    array = np.array(image)

    mask = array > 20

    if not np.any(mask):
        return np.zeros((1, 28, 28), dtype="float32")

    # Bounding box of drawing
    ys, xs = np.where(mask)

    left = xs.min()
    right = xs.max()
    top = ys.min()
    bottom = ys.max()

    # Crop digit
    cropped = image.crop(
        (
            left,
            top,
            right + 1,
            bottom + 1
        )
    )

    # Add padding
    width, height = cropped.size

    size = max(width, height)

    padding = int(size * 0.25)

    canvas_size = size + (padding * 2)

    padded = Image.new(
        "L",
        (canvas_size, canvas_size),
        0
    )

    x = (canvas_size - width) // 2
    y = (canvas_size - height) // 2

    padded.paste(
        cropped,
        (x, y)
    )

    # Resize
    resized = padded.resize(
        (28, 28),
        Image.Resampling.LANCZOS
    )

    # Normalize
    image_array = np.array(
        resized,
        dtype="float32"
    ) / 255.0

    # Make sure shape is correct
    image_array = image_array.reshape(
        1,
        28,
        28
    )

    return image_array


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
def predict_digit(request: PredictionRequest):

    # --------------------------------------------------------
    # Decode image
    # --------------------------------------------------------

    try:

        image_data = request.image.split(",", 1)[1]

        image_bytes = base64.b64decode(
            image_data
        )

        image = Image.open(
            io.BytesIO(image_bytes)
        )

    except Exception as e:

        return {
            "error": "Invalid image",
            "details": str(e)
        }


    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    image_array = preprocess_for_mnist(
        image
    )


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(
        image_array,
        verbose=0
    )


    predicted_digit = int(
        np.argmax(prediction)
    )


    confidence = float(
        np.max(prediction) * 100
    )


    # --------------------------------------------------------
    # Deviation
    # --------------------------------------------------------

    deviation_score = calculate_deviation(

        request.duration,

        request.strokes,

        request.pauses,

        request.path_length,

        request.corrections
    )


    # --------------------------------------------------------
    # Speed
    # --------------------------------------------------------

    if request.duration > 0:

        current_speed = (
            request.path_length
            / request.duration
        )

    else:

        current_speed = 0


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "predicted_digit":
            predicted_digit,

        "confidence":
            round(
                confidence,
                2
            ),

        "deviation_score":
            deviation_score,

        "behavior": {

            "duration":
                round(
                    request.duration,
                    3
                ),

            "strokes":
                request.strokes,

            "pauses":
                request.pauses,

            "path_length":
                round(
                    request.path_length,
                    2
                ),

            "speed":
                round(
                    current_speed,
                    2
                ),

            "corrections":
                request.corrections
        },

        "baseline": BASELINE
    }