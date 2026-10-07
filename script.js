/* =========================================================
   ESP32 CONNECTION
========================================================= */

const ESP32_IP = "http://YOUR_ESP32_IP";


/* =========================================================
   ESP32 COMMUNICATION
========================================================= */

async function sendToESP32(endpoint) {

    try {

        const response = await fetch(`${ESP32_IP}${endpoint}`);

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        const data = await response.text();

        console.log("ESP32 RESPONSE:", data);

        return data;

    } catch (error) {

        console.error("ESP32 CONNECTION ERROR:", error);

        return null;

    }

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    const clock = document.getElementById("clock");

    if (clock) {

        clock.textContent = `${hours}:${minutes}:${seconds}`;

    }

}

setInterval(updateClock, 1000);

updateClock();


/* =========================================================
   FULLSCREEN + AUTOMATIC LANDSCAPE
========================================================= */

let websiteFullscreen = false;


/* =========================================================
   FORCE LANDSCAPE
========================================================= */

async function forceLandscape() {

    if (
        screen.orientation &&
        screen.orientation.lock
    ) {

        try {

            await screen.orientation.lock("landscape");

            console.log(
                "LANDSCAPE LOCK: ACTIVE"
            );

            return true;

        } catch (error) {

            console.log(
                "Landscape lock rejected by browser."
            );

            return false;

        }

    }

    console.log(
        "Screen Orientation API not supported."
    );

    return false;

}


/* =========================================================
   ENTER WEBSITE FULLSCREEN
========================================================= */

async function enterWebsiteFullscreen() {

    try {

        /* ENTER FULLSCREEN */

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

            console.log(
                "FULLSCREEN: ACTIVE"
            );

        }

        websiteFullscreen = true;


        /*
           Small delay allows fullscreen to become active
           before requesting landscape.
        */

        setTimeout(
            async function () {

                await forceLandscape();

            },
            300
        );


        console.log(
            "WHOLE WEBSITE FULLSCREEN: ACTIVE"
        );


    } catch (error) {

        console.log(
            "Fullscreen requires a user interaction."
        );

    }

}


/* =========================================================
   FIRST TOUCH ON MOBILE
========================================================= */

document.addEventListener(
    "touchend",
    function () {

        enterWebsiteFullscreen();

    },
    {
        once: true
    }
);


/* =========================================================
   FIRST CLICK ON LAPTOP / DESKTOP
========================================================= */

document.addEventListener(
    "click",
    function () {

        enterWebsiteFullscreen();

    },
    {
        once: true
    }
);


/* =========================================================
   MANUAL FULLSCREEN
========================================================= */

function toggleFullscreen() {

    if (!document.fullscreenElement) {

        enterWebsiteFullscreen();

    } else {

        document.exitFullscreen();

    }

}


/* =========================================================
   FULLSCREEN STATE
========================================================= */

document.addEventListener(
    "fullscreenchange",
    function () {

        if (document.fullscreenElement) {

            websiteFullscreen = true;

            console.log(
                "FULLSCREEN: ON"
            );


            setTimeout(
                async function () {

                    await forceLandscape();

                },
                300
            );


        } else {

            websiteFullscreen = false;

            console.log(
                "FULLSCREEN: OFF"
            );

        }

    }
);


/* =========================================================
   MODE NAVIGATION
========================================================= */

function openMode(mode) {

    const mainDashboard =
        document.getElementById("mainDashboard");

    const jogPage =
        document.getElementById("jogPage");

    const mdiPage =
        document.getElementById("mdiPage");
        

    const automaticPage =
        document.getElementById("automaticPage");

    const diagnosticsPage =
        document.getElementById("diagnosticsPage");


    /*
       Hide every page first.
    */

    if (mainDashboard) {

        mainDashboard.style.display = "none";

    }


    if (jogPage) {

        jogPage.style.display = "none";

    }


    if (mdiPage) {

        mdiPage.style.display = "none";

    }

    if (automaticPage) {

    automaticPage.style.display = "none";

}

    if (optimizationPage) {

    optimizationPage.style.display = "none";

}

 /* =====================================================
   JOG
===================================================== */

if (mode === "jog") {

    if (jogPage) {
        jogPage.style.display = "block";
    }

    sendToESP32(
        "/api/mode?mode=JOG"
    );

    console.log(
        "JOG CONTROL opened"
    );

    return;
}


/* =====================================================
   MDI
===================================================== */

if (mode === "mdi") {

    if (mdiPage) {
        mdiPage.style.display = "block";
    }

    sendToESP32(
        "/api/mode?mode=MDI"
    );

    console.log(
        "MDI CONTROL opened"
    );

    return;
}


/* =====================================================
   AUTOMATIC
===================================================== */


if (mode === "automatic") {

    if (automaticPage) {

        automaticPage.style.display = "block";

        sendToESP32(
            "/api/mode?mode=AUTOMATIC"
        );

        console.log(
            "AUTOMATIC CONTROL opened"
        );

        return;
    }

    if (mainDashboard) {
        mainDashboard.style.display = "block";
    }

    console.log(
        "AUTOMATIC PAGE NOT FOUND"
    );

    return;
}



/* =====================================================
   OPTIMIZATION
===================================================== */

if (mode === "optimization") {

    if (optimizationPage) {

        optimizationPage.style.display = "block";

        sendToESP32(
            "/api/mode?mode=OPTIMIZATION"
        );

        console.log(
            "OPTIMIZATION opened"
        );

        return;

    }

    if (mainDashboard) {

        mainDashboard.style.display = "block";

    }

    console.log(
        "OPTIMIZATION PAGE NOT FOUND"
    );

    return;

}
/* =====================================================
   DIAGNOSTICS
===================================================== */

if (mode === "diagnostics") {

    if (diagnosticsPage) {

        diagnosticsPage.style.display = "block";

        sendToESP32(
            "/api/mode?mode=DIAGNOSTICS"
        );

        console.log(
            "SENSOR DIAGNOSTICS opened"
        );

        return;
    }

    if (mainDashboard) {
        mainDashboard.style.display = "block";
    }

    console.log(
        "DIAGNOSTICS PAGE NOT FOUND"
    );

    return;
}


    /* =====================================================
       OTHER MODES
    ===================================================== */

    if (mainDashboard) {

        mainDashboard.style.display = "block";

    }

    console.log(
        "Mode not implemented yet:",
        mode
    );

}

/* =========================================================
   AUTOMATIC SELECTIONS
========================================================= */

function automaticBottleSelectionChanged() {

    const selection =
        document.getElementById(
            "automaticBottleSelection"
        );

    if (!selection) {
        return;
    }

    const selectedValue = selection.value;

    console.log(
        "BOTTLES TO FILL:",
        selectedValue
    );

}


/* =========================================================
   BOTTLE FILLING PERCENTAGE
========================================================= */

function automaticFillSelectionChanged() {

    const selection =
        document.getElementById(
            "automaticFillSelection"
        );

    if (!selection) {
        return;
    }

    const selectedValue = selection.value;

    console.log(
        "BOTTLE FILLING PERCENTAGE:",
        selectedValue + "%"
    );

}


/* =========================================================
   BACK TO MAIN DASHBOARD
========================================================= */

function backToMain() {

    const mainDashboard =
        document.getElementById("mainDashboard");

    const jogPage =
        document.getElementById("jogPage");

    const mdiPage =
        document.getElementById("mdiPage");

    const automaticPage =
    document.getElementById("automaticPage");

    const optimizationPage =
    document.getElementById("optimizationPage");

    const diagnosticsPage =
    document.getElementById("diagnosticsPage");


    if (jogPage) {

        jogPage.style.display = "none";

    }


    if (mdiPage) {

        mdiPage.style.display = "none";

    }

    if (automaticPage) {

    automaticPage.style.display = "none";

    }
     if (optimizationPage) {

    optimizationPage.style.display = "none";

    }

    if (diagnosticsPage) {
        diagnosticsPage.style.display = "none";
    }


    if (mainDashboard) {

        mainDashboard.style.display = "block";

    }


    /*
       Tell ESP32 to stop everything
       and return to JOG/home state.
    */

    sendToESP32(
        "/api/mode?mode=JOG"
    );

}


/* =========================================================
   JOG STATE
========================================================= */

const jogState = {

    hydraulicPump: false,

    ttMotor: false,

    pneumaticPump1: false,

    pneumaticPump2: false,


    servo1: "CLOSE",

    servo2: "CLOSE",


    stepper1Direction: "FORWARD",

    stepper2Direction: "FORWARD",

    stepper3Direction: "FORWARD",


    stepper1Moving: false,

    stepper2Moving: false,

    stepper3Moving: false

};


/* =========================================================
   JOG DEVICE MAPS
========================================================= */

const relayMap = {

    hydraulicPump: "HYDRAULIC",

    ttMotor: "TT",

    pneumaticPump1: "PNEUMATIC1",

    pneumaticPump2: "PNEUMATIC2"

};


const servoMap = {

    servo1: "SERVO1",

    servo2: "SERVO2"

};


/* =========================================================
   JOG ACTUATORS
========================================================= */

async function startActuator(
    actuator,
    button
) {

    if (!button) return;


    jogState[actuator] = true;

    button.classList.add("active");


    const device =
        relayMap[actuator];


    if (!device) return;


    await sendToESP32(
        `/api/jog?device=${device}&action=START`
    );

}


async function stopActuator(
    actuator,
    button
) {

    if (!button) return;


    jogState[actuator] = false;

    button.classList.remove("active");


    const device =
        relayMap[actuator];


    if (!device) return;


    await sendToESP32(
        `/api/jog?device=${device}&action=STOP`
    );

}


/* =========================================================
   JOG SERVOS
========================================================= */

async function toggleServo(
    servo,
    button
) {

    if (!button) return;


    const device =
        servoMap[servo];


    if (!device) return;


    if (
        jogState[servo] === "CLOSE"
    ) {

        jogState[servo] = "OPEN";

        button.classList.add("active");

    } else {

        jogState[servo] = "CLOSE";

        button.classList.remove("active");

    }


    await sendToESP32(
        `/api/jog?device=${device}&action=TOGGLE`
    );

}


/* =========================================================
   JOG STEPPERS
========================================================= */

function toggleStepperDirection(stepper, button) {

    if (!button) return;

    const stateKey = `stepper${stepper}Direction`;

    // Toggle direction
    if (jogState[stateKey] === "FORWARD") {

        jogState[stateKey] = "REVERSE";

        button.textContent = "REVERSE";
        button.classList.add("active");

    } else {

        jogState[stateKey] = "FORWARD";

        button.textContent = "FORWARD";
        button.classList.remove("active");
    }

    console.log(
        `STEPPER ${stepper} DIRECTION:`,
        jogState[stateKey]
    );

    // Send the ACTUAL direction to ESP32
    sendToESP32(
        `/api/jog-stepper?stepper=${stepper}&action=DIRECTION&direction=${jogState[stateKey]}`
    );
}




async function startStepper(
    stepper,
    button
) {

    if (!button) return;


    jogState[
        `stepper${stepper}Moving`
    ] = true;


    button.classList.add(
        "active"
    );


    await sendToESP32(
        `/api/jog-stepper?stepper=${stepper}&action=START`
    );

}


async function stopStepper(
    stepper,
    button
) {

    if (!button) return;


    jogState[
        `stepper${stepper}Moving`
    ] = false;


    button.classList.remove(
        "active"
    );


    await sendToESP32(
        `/api/jog-stepper?stepper=${stepper}&action=STOP`
    );

}


/* =========================================================
   JOG CONTROL INITIALIZATION
========================================================= */

function initializeJogControls() {

    console.log(
        "JOG controls initialized."
    );

}


/* =========================================================
   MDI CONTROL
========================================================= */

let mdiRunning = false;
let mdiActiveButton = null;
let mdiExecutionStarted = false;


/* =========================================================
   MDI COMMANDS
========================================================= */

const mdiCommands = {

    LOAD_BOTTLE:
        "LOAD_BOTTLE",

    FILL_BOTTLE:
        "FILL_BOTTLE",

    LOAD_CAP:
        "LOAD_CAP",

    TIGHT_CAP:
        "TIGHT_CAP",

    HOME_PLATFORM_1:
        "HOME_PLATFORM_1",

    HOME_PLATFORM_2:
        "HOME_PLATFORM_2",

    HOME_TIGHTENING:
        "HOME_TIGHTENING",

    MOVE_FILLING_SECTION:
        "MOVE_FILLING_SECTION",

    MOVE_TIGHTENING_SECTION:
        "MOVE_TIGHTENING_SECTION",

    MOVE_LOADING_SECTION:
        "MOVE_LOADING_SECTION",

    MOVE_STORAGE_PLATFORM:
        "MOVE_STORAGE_PLATFORM"

};


/* =========================================================
   SEND MDI COMMAND
========================================================= */

async function sendMDICommand(
    command,
    button
) {

    /*
       Another MDI command is already running.
    */

    if (mdiRunning) {

        return;

    }


    if (!button) {

        return;

    }


    /*
       Mark command as running.
    */

    mdiRunning = true;

    mdiActiveButton =
        button;


    /*
       Active button becomes RED.
    */

    button.classList.add(
        "active"
    );


    /*
       Disable every MDI button.
    */

    document
        .querySelectorAll(
            ".mdi-action"
        )
        .forEach(
            btn => {

                btn.disabled = true;

            }
        );


    try {

        const response =
            await fetch(
                `${ESP32_IP}/api/mdi?command=${encodeURIComponent(command)}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.text();


        console.log(
            "MDI RESPONSE:",
            result
        );


        /*
           ESP32 must return STARTED
           when command begins.
        */

       if (result.trim() === "STARTED") {

        console.log(
        "MDI STARTED:",
        command
        );

         mdiExecutionStarted = false;

         checkMDIStatus();

         } else {

            console.error(
                "MDI WAS NOT STARTED:",
                result
            );


            finishMDI();

        }


    } catch (error) {

        console.error(
            "MDI ERROR:",
            error
        );


        finishMDI();

    }

}


/* =========================================================
   CHECK MDI EXECUTION STATUS
========================================================= */

async function checkMDIStatus() {

    if (!mdiRunning) {

        return;

    }


    try {

        const response =
            await fetch(
                `${ESP32_IP}/api/mdi-status`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const status =
            (
                await response.text()
            ).trim();


        console.log(
            "MDI STATUS:",
            status
        );


        /*
           COMMAND FINISHED
        */

        if (status === "RUNNING") {

    mdiExecutionStarted = true;

    console.log(
        "MDI EXECUTION IS RUNNING"
    );

    setTimeout(
        checkMDIStatus,
        200
    );

    return;
}

if (
    mdiExecutionStarted &&
    (
        status === "DONE" ||
        status === "IDLE"
    )
) {

    finishMDI();

    return;
}


        /*
           COMMAND STILL RUNNING
        */

        if (
            status === "RUNNING"
        ) {

            setTimeout(
                checkMDIStatus,
                200
            );

            return;

        }


        /*
           ESP32 REPORTED ERROR
        */

        if (
            status === "ERROR"
        ) {

            console.error(
                "MDI EXECUTION ERROR"
            );


            finishMDI();

            return;

        }


        /*
           UNKNOWN STATUS
        */

        setTimeout(
            checkMDIStatus,
            300
        );


    } catch (error) {

        console.error(
            "MDI STATUS ERROR:",
            error
        );


        /*
           Do NOT unlock buttons because
           of a temporary connection problem.
        */

        setTimeout(
            checkMDIStatus,
            500
        );

    }

}


/* =========================================================
   FINISH MDI COMMAND
========================================================= */

function finishMDI() {

    if (mdiActiveButton) {

        mdiActiveButton.classList.remove(
            "active"
        );

    }


    /*
       Enable all MDI buttons.
    */

    document
        .querySelectorAll(
            ".mdi-action"
        )
        .forEach(
            btn => {

                btn.disabled = false;

            }
        );


   mdiActiveButton = null;
   mdiRunning = false;
   mdiExecutionStarted = false; 


    console.log(
        "MDI FINISHED"
    );

}


/* =========================================================
   MDI BUTTON INITIALIZATION
========================================================= */

function initializeMDIControls() {

    document.querySelectorAll(".mdi-action").forEach(button => {

        button.addEventListener("pointerdown", function(event) {

            event.preventDefault();

            if (button.disabled) {
                return;
            }

            const onclickCode = button.getAttribute("onclick");

            if (!onclickCode) {
                return;
            }

            const match = onclickCode.match(
                /executeMDICommand\('([^']+)'/
            );

            if (!match) {
                return;
            }

            const command = match[1];

            executeMDICommand(command, button);

        }, { passive: false });

    });

    console.log("MDI controls initialized.");

}


/* =========================================================
   HTML MDI BUTTON FUNCTION
========================================================= */

function executeMDICommand(
    command,
    button
) {

    sendMDICommand(
        command,
        button
    );

}


/* =========================================================
   AUTOMATIC CONTROL
========================================================= */


/* =========================================================
   AUTOMATIC STATE
========================================================= */

let automaticRunning = false;
let automaticPaused = false;


/* =========================================================
   AUTOMATIC START
========================================================= */

function automaticStart() {

    automaticRunning = true;
    automaticPaused = false;


    const startButton =
        document.getElementById(
            "automaticStartBtn"
        );

    const pauseButton =
        document.getElementById(
            "automaticPauseBtn"
        );


    if (startButton) {

        startButton.classList.add(
            "active"
        );

    }


    if (pauseButton) {

        pauseButton.classList.remove(
            "active"
        );

        pauseButton.textContent = "PAUSE";

    }


    /*
       Put ESP32 into AUTOMATIC mode.
    */

    sendToESP32(
        "/api/mode?mode=AUTOMATIC"
    );


    console.log(
        "AUTOMATIC START"
    );

}


/* =========================================================
   AUTOMATIC PAUSE / RESUME
========================================================= */

function automaticPause() {

    if (!automaticRunning) {

        return;

    }


    const pauseButton =
        document.getElementById(
            "automaticPauseBtn"
        );


    /* =====================================================
       PAUSE
    ===================================================== */

    if (!automaticPaused) {

        automaticPaused = true;


        if (pauseButton) {

            pauseButton.classList.add(
                "active"
            );

            pauseButton.textContent =
                "RESUME";

        }


        console.log(
            "AUTOMATIC PAUSED"
        );


        return;

    }


    /* =====================================================
       RESUME
    ===================================================== */

    automaticPaused = false;


    if (pauseButton) {

        pauseButton.classList.remove(
            "active"
        );

        pauseButton.textContent =
            "PAUSE";

    }


    console.log(
        "AUTOMATIC RESUMED"
    );

}


/* =========================================================
   AUTOMATIC RESTART
========================================================= */

function automaticRestart() {

    automaticRunning = true;
    automaticPaused = false;


    const startButton =
        document.getElementById(
            "automaticStartBtn"
        );

    const pauseButton =
        document.getElementById(
            "automaticPauseBtn"
        );


    if (startButton) {

        startButton.classList.add(
            "active"
        );

    }


    if (pauseButton) {

        pauseButton.classList.remove(
            "active"
        );

        pauseButton.textContent =
            "PAUSE";

    }


    /*
       Re-enter AUTOMATIC mode.

       Actual machine sequence restart will
       be implemented in the ESP32 firmware.
    */

    sendToESP32(
        "/api/mode?mode=AUTOMATIC"
    );


    console.log(
        "AUTOMATIC RESTART"
    );

}


/* =========================================================
   AUTOMATIC WATER MONITOR
========================================================= */

function updateAutomaticWater(percent) {

    const value =
        document.getElementById(
            "automaticWaterValue"
        );

    const led =
        document.getElementById(
            "automaticWaterLed"
        );


    if (!value || !led) {

        return;

    }


    value.textContent =
        percent + " %";


    if (percent < 10) {

        led.classList.add("red");

    } else {

        led.classList.remove("red");

    }


    updateAutomaticBuzzer();

}


/* =========================================================
   AUTOMATIC CONVEYOR BOTTLE MONITOR
========================================================= */

function updateAutomaticConveyor(count) {

    const value =
        document.getElementById(
            "automaticConveyorValue"
        );

    const led =
        document.getElementById(
            "automaticConveyorLed"
        );


    if (!value || !led) {

        return;

    }


    if (count <= 0) {

        value.textContent =
            "NO BOTTLES";

        led.classList.add("red");

    } else {

        value.textContent =
            count + " BOTTLES";

        led.classList.remove("red");

    }


    updateAutomaticBuzzer();

}


/* =========================================================
   AUTOMATIC STORAGE MONITOR
========================================================= */

function updateAutomaticStorage(count) {

    const value =
        document.getElementById(
            "automaticStorageValue"
        );

    const led =
        document.getElementById(
            "automaticStorageLed"
        );


    if (!value || !led) {

        return;

    }


    if (count <= 0) {

        value.textContent =
            "NO BOTTLES";

    } else if (count >= 7) {

        value.textContent =
            "STORAGE FILLED";

    } else {

        value.textContent =
            count + " BOTTLES";

    }


    if (count >= 7) {

        led.classList.add("red");

    } else {

        led.classList.remove("red");

    }


    updateAutomaticBuzzer();

}


/* =========================================================
   AUTOMATIC CAPS MONITOR
========================================================= */

function updateAutomaticCaps(present) {

    const value =
        document.getElementById(
            "automaticCapsValue"
        );

    const led =
        document.getElementById(
            "automaticCapsLed"
        );


    if (!value || !led) {

        return;

    }


    if (present) {

        value.textContent =
            "PRESENT";

        led.classList.remove("red");

    } else {

        value.textContent =
            "NOT PRESENT";

        led.classList.add("red");

    }


    updateAutomaticBuzzer();

}


/* =========================================================
   AUTOMATIC BUZZER INDICATOR
========================================================= */

function updateAutomaticBuzzer() {

    const waterLed =
        document.getElementById(
            "automaticWaterLed"
        );

    const conveyorLed =
        document.getElementById(
            "automaticConveyorLed"
        );

    const storageLed =
        document.getElementById(
            "automaticStorageLed"
        );

    const capsLed =
        document.getElementById(
            "automaticCapsLed"
        );

    const buzzerLed =
        document.getElementById(
            "automaticBuzzerLed"
        );

    const buzzerText =
        document.getElementById(
            "automaticBuzzerText"
        );


    if (
        !waterLed ||
        !conveyorLed ||
        !storageLed ||
        !capsLed ||
        !buzzerLed ||
        !buzzerText
    ) {

        return;

    }


    const alarm =
        waterLed.classList.contains("red") ||
        conveyorLed.classList.contains("red") ||
        storageLed.classList.contains("red") ||
        capsLed.classList.contains("red");


    if (alarm) {

        buzzerLed.classList.add(
            "active"
        );

        buzzerText.textContent =
            "BUZZER ON";

    } else {

        buzzerLed.classList.remove(
            "active"
        );

        buzzerText.textContent =
            "BUZZER OFF";

    }

}


/* =========================================================
   SENSOR DIAGNOSTICS
========================================================= */


/* =========================================================
   UPDATE IR SENSOR
========================================================= */

function updateDiagnosticIR(
    sensorNumber,
    detected
) {

    const card =
        document.getElementById(
            `ir${sensorNumber}DiagnosticCard`
        );

    const status =
        document.getElementById(
            `ir${sensorNumber}DiagnosticStatus`
        );

    if (!card || !status) {
        return;
    }


    if (detected) {

        card.classList.add("red");

        status.textContent =
            "DETECTED";

    } else {

        card.classList.remove("red");

        status.textContent =
            "NOT DETECTED";

    }

}


/* =========================================================
   UPDATE LIMIT SWITCH
========================================================= */

function updateDiagnosticLimitSwitch(
    closed
) {

    const card =
        document.getElementById(
            "limitSwitchDiagnosticCard"
        );

    const status =
        document.getElementById(
            "limitSwitchDiagnosticStatus"
        );

    if (!card || !status) {
        return;
    }


    if (closed) {

        card.classList.add("red");

        status.textContent =
            "CLOSED";

    } else {

        card.classList.remove("red");

        status.textContent =
            "OPEN";

    }

}


/* =========================================================
   UPDATE ULTRASONIC SENSOR
========================================================= */

function updateDiagnosticUltrasonic(
    sensorNumber,
    distance
) {

    const distanceElement =
        document.getElementById(
            `ultrasonic${sensorNumber}DiagnosticDistance`
        );

    if (!distanceElement) {
        return;
    }


    const numericDistance =
        Number(distance);


    if (
        Number.isFinite(numericDistance) &&
        numericDistance > 0
    ) {

        distanceElement.textContent =
            `${numericDistance.toFixed(1)} cm`;

    } else {

        distanceElement.textContent =
            "0.0 cm";

    }

}


/* =========================================================
   FETCH SENSOR DATA
========================================================= */

async function updateSensorDiagnostics() {

    try {

        const response =
            await fetch(
                `${ESP32_IP}/api/sensor-diagnostics`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /* ---------------------------------------------
           IR SENSORS
        --------------------------------------------- */

        updateDiagnosticIR(
            1,
            data.ir1
        );

        updateDiagnosticIR(
            2,
            data.ir2
        );

        updateDiagnosticIR(
            3,
            data.ir3
        );

        updateDiagnosticIR(
            4,
            data.ir4
        );

        updateDiagnosticIR(
            5,
            data.ir5
        );

        updateDiagnosticIR(
            6,
            data.ir6
        );


        /* ---------------------------------------------
           LIMIT SWITCH
        --------------------------------------------- */

        updateDiagnosticLimitSwitch(
            data.limitSwitch
        );


        /* ---------------------------------------------
           ULTRASONIC SENSORS
        --------------------------------------------- */

        updateDiagnosticUltrasonic(
            1,
            data.ultrasonic1
        );

        updateDiagnosticUltrasonic(
            2,
            data.ultrasonic2
        );


    } catch (error) {

        console.error(
            "SENSOR DIAGNOSTICS ERROR:",
            error
        );

    }

}

function validateOptimizationInput(input) {

    let value = input.value;

    // Maximum 3 decimal places
    if (value.includes(".")) {
        const parts = value.split(".");

        if (parts[1].length > 3) {
            input.value =
                parts[0] + "." + parts[1].substring(0, 3);
        }
    }

    // Maximum 10 seconds
    if (Number(input.value) > 20) {
        input.value = "20";
    }

    // Minimum 0 seconds
    if (Number(input.value) < 0) {
        input.value = "0";
    }
}


/* =========================================================
   DIAGNOSTICS UPDATE LOOP
========================================================= */

setInterval(
    updateSensorDiagnostics,
    500
);

updateSensorDiagnostics();

// =========================================================
// INITIALIZATION
// =========================================================

initializeJogControls();
initializeMDIControls();

