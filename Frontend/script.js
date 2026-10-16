
/* =========================================================
   BEHAVIOURCHECK
   Complete JavaScript
   Dynamic Baseline Comparison
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const durationEl = document.getElementById("duration");
const strokesEl = document.getElementById("strokes");
const pausesEl = document.getElementById("pauses");
const pathLengthEl = document.getElementById("pathLength");
const speedEl = document.getElementById("speed");
const correctionsEl = document.getElementById("corrections");

const predictedDigitEl =
    document.getElementById("predictedDigit");

const confidenceEl =
    document.getElementById("confidence");

const confidenceProgress =
    document.getElementById("confidenceProgress");

const deviationScoreEl =
    document.getElementById("deviationScore");

const scoreProgress =
    document.getElementById("scoreProgress");

const scoreLabel =
    document.getElementById("scoreLabel");

const scoreCircle =
    document.querySelector(".score-circle");

const clearBtn =
    document.getElementById("clearBtn");

const analyzeBtn =
    document.getElementById("analyzeBtn");


/* =========================================================
   BASELINE VALUES
   =========================================================
   These are reference values used for comparison.
   Change them later if you have real baseline data.
   ========================================================= */

const BASELINE = {
    duration: 3.0,
    speed: 300,
    pauses: 1,
    corrections: 2
};


/* =========================================================
   BASELINE ELEMENTS
   ========================================================= */

const durationComparison =
    document.getElementById("durationComparison");

const speedComparison =
    document.getElementById("speedComparison");

const pausesComparison =
    document.getElementById("pausesComparison");

const correctionsComparison =
    document.getElementById("correctionsComparison");


const durationBaselineBar =
    document.getElementById("durationBaselineBar");

const speedBaselineBar =
    document.getElementById("speedBaselineBar");

const pausesBaselineBar =
    document.getElementById("pausesBaselineBar");

const correctionsBaselineBar =
    document.getElementById("correctionsBaselineBar");


/* =========================================================
   DRAWING VARIABLES
   ========================================================= */

let drawing = false;

let startTime = null;

let strokeCount = 0;

let pauseCount = 0;

let pathLength = 0;

let corrections = 0;

let lastX = 0;

let lastY = 0;

let totalDrawingTime = 0;

let pauseTimer = null;


/* =========================================================
   CANVAS SETUP
   ========================================================= */

canvas.style.backgroundColor = "#000000";

canvas.style.cursor = "crosshair";

canvas.style.touchAction = "none";

ctx.lineWidth = 15;

ctx.lineCap = "round";

ctx.lineJoin = "round";

ctx.strokeStyle = "#ffffff";


/* =========================================================
   GET POSITION
   ========================================================= */

function getPosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;

    return {
        x:
            (event.clientX - rect.left)
            * scaleX,

        y:
            (event.clientY - rect.top)
            * scaleY
    };
}


/* =========================================================
   PAUSE TIMER
   ========================================================= */

function startPauseTimer() {

    clearTimeout(pauseTimer);

    pauseTimer = setTimeout(function () {

        if (drawing) {

            pauseCount++;

            pausesEl.textContent =
                pauseCount;
        }

    }, 500);
}


/* =========================================================
   START DRAWING
   ========================================================= */

canvas.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        drawing = true;

        if (canvas.setPointerCapture) {

            canvas.setPointerCapture(
                event.pointerId
            );
        }

        const position =
            getPosition(event);

        lastX = position.x;

        lastY = position.y;


        if (startTime === null) {

            startTime = Date.now();
        }


        strokeCount++;

        strokesEl.textContent =
            strokeCount;

        startPauseTimer();
    }
);


/* =========================================================
   DRAW
   ========================================================= */

canvas.addEventListener(
    "pointermove",
    function (event) {

        event.preventDefault();

        if (!drawing) {
            return;
        }

        const position =
            getPosition(event);

        const x = position.x;

        const y = position.y;

        const dx =
            x - lastX;

        const dy =
            y - lastY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance < 1) {
            return;
        }


        ctx.beginPath();

        ctx.moveTo(
            lastX,
            lastY
        );

        ctx.lineTo(
            x,
            y
        );

        ctx.stroke();


        pathLength += distance;

        lastX = x;

        lastY = y;


        pathLengthEl.textContent =
            Math.round(pathLength)
            + " px";

        startPauseTimer();
    }
);


/* =========================================================
   STOP DRAWING
   ========================================================= */

canvas.addEventListener(
    "pointerup",
    function (event) {

        drawing = false;

        clearTimeout(pauseTimer);


        if (
            canvas.hasPointerCapture &&
            canvas.hasPointerCapture(
                event.pointerId
            )
        ) {

            canvas.releasePointerCapture(
                event.pointerId
            );
        }


        if (startTime !== null) {

            totalDrawingTime =
                (
                    Date.now()
                    - startTime
                ) / 1000;

            durationEl.textContent =
                totalDrawingTime.toFixed(2)
                + " s";
        }
    }
);


/* =========================================================
   POINTER CANCEL
   ========================================================= */

canvas.addEventListener(
    "pointercancel",
    function () {

        drawing = false;

        clearTimeout(pauseTimer);
    }
);


/* =========================================================
   UPDATE CONFIDENCE
   ========================================================= */

function updateConfidence(value) {

    const confidence =
        Number(value);

    if (!Number.isFinite(confidence)) {
        return;
    }

    const safeConfidence =
        Math.max(
            0,
            Math.min(
                100,
                confidence
            )
        );

    confidenceEl.textContent =
        safeConfidence.toFixed(1) + "%";

    if (confidenceProgress) {

        confidenceProgress.style.width =
            safeConfidence + "%";
    }
}


/* =========================================================
   UPDATE DEVIATION SCORE
   ========================================================= */

function updateDeviationScore(value) {

    const score =
        Number(value);

    if (!Number.isFinite(score)) {

        console.error(
            "Invalid deviation score:",
            value
        );

        return;
    }

    const safeScore =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );

    const roundedScore =
        Math.round(safeScore);


    deviationScoreEl.textContent =
        roundedScore;


    if (scoreCircle) {

        const degrees =
            safeScore * 3.6;

        scoreCircle.style.background =
            `
            conic-gradient(
                var(--accent) 0deg,
                var(--accent-2) ${degrees}deg,
                #172c43 ${degrees}deg,
                #172c43 360deg
            )
            `;
    }


    if (scoreProgress) {

        scoreProgress.style.width =
            safeScore + "%";
    }


    if (scoreLabel) {

        if (safeScore < 30) {

            scoreLabel.textContent =
                "Low Behavioral Deviation";

        }

        else if (safeScore < 60) {

            scoreLabel.textContent =
                "Medium Behavioral Deviation";

        }

        else {

            scoreLabel.textContent =
                "High Behavioral Deviation";
        }
    }
}


/* =========================================================
   CALCULATE BASELINE DIFFERENCE
   ========================================================= */

function calculateDifference(current, baseline) {

    if (
        !Number.isFinite(current) ||
        !Number.isFinite(baseline) ||
        baseline <= 0
    ) {

        return 0;
    }

    return (
        (current - baseline)
        / baseline
    ) * 100;
}


/* =========================================================
   UPDATE BASELINE BAR
   ========================================================= */

function updateBaselineBar(element, difference) {

    if (!element) {
        return;
    }


    /*
       0% difference = small bar
       Larger difference = larger bar

       Maximum visual difference is 100%.
    */

    const visualValue =
        Math.min(
            100,
            Math.max(
                5,
                Math.abs(difference)
            )
        );


    element.style.width =
        visualValue + "%";
}


/* =========================================================
   UPDATE BASELINE COMPARISON
   ========================================================= */

function updateBaselineComparison() {

    const currentDuration =
        totalDrawingTime;

    const currentSpeed =
        totalDrawingTime > 0
            ? pathLength / totalDrawingTime
            : 0;

    const currentPauses =
        pauseCount;

    const currentCorrections =
        corrections;


    /* =====================================================
       CALCULATE DIFFERENCES
       ===================================================== */

    const durationDifference =
        calculateDifference(
            currentDuration,
            BASELINE.duration
        );

    const speedDifference =
        calculateDifference(
            currentSpeed,
            BASELINE.speed
        );

    const pausesDifference =
        calculateDifference(
            currentPauses,
            BASELINE.pauses
        );

    const correctionsDifference =
        calculateDifference(
            currentCorrections,
            BASELINE.corrections
        );


    /* =====================================================
       UPDATE TEXT
       ===================================================== */

    if (durationComparison) {

        durationComparison.textContent =
            formatDifference(
                durationDifference
            );
    }


    if (speedComparison) {

        speedComparison.textContent =
            formatDifference(
                speedDifference
            );
    }


    if (pausesComparison) {

        pausesComparison.textContent =
            formatDifference(
                pausesDifference
            );
    }


    if (correctionsComparison) {

        correctionsComparison.textContent =
            formatDifference(
                correctionsDifference
            );
    }


    /* =====================================================
       UPDATE BARS
       ===================================================== */

    updateBaselineBar(
        durationBaselineBar,
        durationDifference
    );

    updateBaselineBar(
        speedBaselineBar,
        speedDifference
    );

    updateBaselineBar(
        pausesBaselineBar,
        pausesDifference
    );

    updateBaselineBar(
        correctionsBaselineBar,
        correctionsDifference
    );


    console.log(
        "Baseline comparison:",
        {
            duration: durationDifference,
            speed: speedDifference,
            pauses: pausesDifference,
            corrections: correctionsDifference
        }
    );
}


/* =========================================================
   FORMAT DIFFERENCE
   ========================================================= */

function formatDifference(value) {

    if (!Number.isFinite(value)) {
        return "0%";
    }

    const rounded =
        Math.round(value);

    if (rounded > 0) {

        return "+" + rounded + "%";
    }

    return rounded + "%";
}


/* =========================================================
   RESET BASELINE COMPARISON
   ========================================================= */

function resetBaselineComparison() {

    if (durationComparison) {
        durationComparison.textContent = "0%";
    }

    if (speedComparison) {
        speedComparison.textContent = "0%";
    }

    if (pausesComparison) {
        pausesComparison.textContent = "0%";
    }

    if (correctionsComparison) {
        correctionsComparison.textContent = "0%";
    }


    if (durationBaselineBar) {
        durationBaselineBar.style.width = "0%";
    }

    if (speedBaselineBar) {
        speedBaselineBar.style.width = "0%";
    }

    if (pausesBaselineBar) {
        pausesBaselineBar.style.width = "0%";
    }

    if (correctionsBaselineBar) {
        correctionsBaselineBar.style.width = "0%";
    }
}


/* =========================================================
   CLEAR BUTTON
   ========================================================= */

clearBtn.addEventListener(
    "click",
    function () {

        clearTimeout(pauseTimer);


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        drawing = false;

        startTime = null;

        strokeCount = 0;

        pauseCount = 0;

        pathLength = 0;

        corrections = 0;

        lastX = 0;

        lastY = 0;

        totalDrawingTime = 0;


        durationEl.textContent =
            "0 s";

        strokesEl.textContent =
            "0";

        pausesEl.textContent =
            "0";

        pathLengthEl.textContent =
            "0 px";

        speedEl.textContent =
            "0 px/s";

        correctionsEl.textContent =
            "0";


        predictedDigitEl.textContent =
            "-";

        confidenceEl.textContent =
            "-";


        if (confidenceProgress) {

            confidenceProgress.style.width =
                "0%";
        }


        updateDeviationScore(0);

        resetBaselineComparison();


        if (scoreLabel) {

            scoreLabel.textContent =
                "Waiting for analysis";
        }
    }
);


/* =========================================================
   ANALYZE BUTTON
   ========================================================= */

analyzeBtn.addEventListener(
    "click",
    async function () {


        if (
            startTime === null ||
            pathLength === 0
        ) {

            alert(
                "Please draw the digit first."
            );

            return;
        }


        if (analyzeBtn.disabled) {
            return;
        }


        /* =================================================
           FINAL DURATION
           ================================================= */

        totalDrawingTime =
            (
                Date.now()
                - startTime
            ) / 1000;


        durationEl.textContent =
            totalDrawingTime.toFixed(2)
            + " s";


        /* =================================================
           SPEED
           ================================================= */

        let currentSpeed = 0;

        if (totalDrawingTime > 0) {

            currentSpeed =
                pathLength /
                totalDrawingTime;

            speedEl.textContent =
                currentSpeed.toFixed(2)
                + " px/s";
        }


        /* =================================================
           UPDATE BASELINE
           ================================================= */

        updateBaselineComparison();


        /* =================================================
           IMAGE
           ================================================= */

        const imageData =
            canvas.toDataURL(
                "image/png"
            );


        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "Analyzing...";


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/predict",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                image:
                                    imageData,

                                duration:
                                    totalDrawingTime,

                                strokes:
                                    strokeCount,

                                pauses:
                                    pauseCount,

                                path_length:
                                    pathLength,

                                corrections:
                                    corrections
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server error: "
                    + response.status
                );
            }


            const result =
                await response.json();


            console.log(
                "BehaviourCheck result:",
                result
            );


            /* =================================================
               PREDICTION
               ================================================= */

            if (
                result.predicted_digit
                !== undefined &&
                result.predicted_digit
                !== null
            ) {

                predictedDigitEl.textContent =
                    result.predicted_digit;
            }


            /* =================================================
               CONFIDENCE
               ================================================= */

            if (
                result.confidence
                !== undefined &&
                result.confidence
                !== null
            ) {

                updateConfidence(
                    result.confidence
                );
            }


            /* =================================================
               DEVIATION SCORE
               ================================================= */

            if (
                result.deviation_score
                !== undefined &&
                result.deviation_score
                !== null
            ) {

                updateDeviationScore(
                    result.deviation_score
                );
            }

            else {

                console.error(
                    "Backend response does not contain deviation_score",
                    result
                );

                if (scoreLabel) {

                    scoreLabel.textContent =
                        "Score unavailable";
                }
            }


        }

        catch (error) {

            console.error(
                "Analysis error:",
                error
            );

            alert(
                "Backend se connection nahi ho raha."
            );
        }


        finally {

            analyzeBtn.disabled =
                false;

            analyzeBtn.textContent =
                "Analyze Behavior";
        }

    }
);


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateDeviationScore(0);

resetBaselineComparison();


if (confidenceProgress) {

    confidenceProgress.style.width =
        "0%";
}


console.log(
    "BehaviourCheck loaded successfully"
);
