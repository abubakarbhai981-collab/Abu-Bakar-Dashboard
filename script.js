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
   BACK TO MAIN DASHBOARD
========================================================= */

function backToMain() {

    const mainDashboard =
        document.getElementById("mainDashboard");

    const jogPage =
        document.getElementById("jogPage");

    const mdiPage =
        document.getElementById("mdiPage");


    if (jogPage) {

        jogPage.style.display = "none";

    }


    if (mdiPage) {

        mdiPage.style.display = "none";

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

async function setStepperDirection(
    stepper,
    direction,
    button
) {

    if (!button) return;


    jogState[
        `stepper${stepper}Direction`
    ] = direction;


    const buttons =
        document.querySelectorAll(
            `.stepper${stepper}-direction`
        );


    buttons.forEach(
        btn => {

            btn.classList.remove(
                "active"
            );

        }
    );


    button.classList.add(
        "active"
    );


    await sendToESP32(
        `/api/jog-stepper?stepper=${stepper}&action=DIRECTION&direction=${direction}`
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

        if (
            result.trim() === "STARTED"
        ) {

            console.log(
                "MDI STARTED:",
                command
            );


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

        if (
            status === "DONE" ||
            status === "IDLE"
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


    console.log(
        "MDI FINISHED"
    );

}


/* =========================================================
   MDI BUTTON INITIALIZATION
========================================================= */

function initializeMDIControls() {

    /*
       Your HTML already uses:

       onclick="executeMDICommand('LOAD_BOTTLE', this)"

       Therefore we do NOT add another click
       handler here.
    */

    console.log(
        "MDI controls initialized."
    );

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
   INITIALIZATION
========================================================= */

initializeJogControls();

initializeMDIControls();