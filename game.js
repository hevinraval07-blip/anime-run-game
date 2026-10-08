/* =========================================================
   ANIME RUN
   JAPANESE RAILWAY 3D PERSPECTIVE RUNNER
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");


const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const menuButton =
    document.getElementById("menuButton");

const resumeButton =
    document.getElementById("resumeButton");

const pauseRestartButton =
    document.getElementById("pauseRestartButton");

const pauseButton =
    document.getElementById("pauseButton");


const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");

const jumpButton =
    document.getElementById("jumpButton");


const scoreElement =
    document.getElementById("score");

const coinsElement =
    document.getElementById("coins");

const speedElement =
    document.getElementById("speed");

const startBestScore =
    document.getElementById("startBestScore");

const finalScore =
    document.getElementById("finalScore");

const finalCoins =
    document.getElementById("finalCoins");

const finalBest =
    document.getElementById("finalBest");

const powerMessage =
    document.getElementById("powerMessage");


/* =========================================================
   CANVAS
========================================================= */

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width =
        W * dpr;

    canvas.height =
        H * dpr;

    canvas.style.width =
        W + "px";

    canvas.style.height =
        H + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning = false;
let paused = false;

let score = 0;
let coins = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "animeRunBest"
        ) || 0
    );

let speed = 0.010;
let gameSpeed = 1;

let selectedCharacter = "sakura";

let lane = 1;
let targetLane = 1;

let playerX = 0;

let playerJump = 0;
let playerVelocity = 0;

let jumping = false;

let objects = [];

let particles = [];

let roadMove = 0;

let spawnTimer = 0;

let coinTimer = 0;

let powerTimer = 0;

let shield = false;
let magnet = false;
let boost = false;

let animationId = null;

let distance = 0;


/* =========================================================
   PERSPECTIVE SETTINGS
========================================================= */

function horizonY() {
    return H * 0.50;
}

function playerGroundY() {
    return H * 0.82;
}


/*
    Lane positions are different at horizon
    and at bottom.

    This creates real road perspective.
*/

function horizonLaneX(index) {

    const spread =
        Math.min(
            W * 0.16,
            180
        );

    return (
        W / 2 +
        (index - 1) * spread
    );
}


function bottomLaneX(index) {

    const spread =
        Math.min(
            W * 0.28,
            360
        );

    return (
        W / 2 +
        (index - 1) * spread
    );
}


/* =========================================================
   3D OBJECT POSITION
========================================================= */

function perspectivePosition(
    laneIndex,
    z
) {

    z =
        Math.max(
            0,
            Math.min(
                1,
                z
            )
        );

    const hz =
        horizonY();

    const gy =
        playerGroundY();


    const hx =
        horizonLaneX(
            laneIndex
        );

    const bx =
        bottomLaneX(
            laneIndex
        );


    /*
        Ease makes the objects accelerate
        toward the player.
    */

    const depth =
        Math.pow(
            z,
            1.55
        );


    const x =
        hx +
        (bx - hx) *
        depth;


    const y =
        hz +
        (gy - hz) *
        depth;


    const scale =
        0.08 +
        1.12 *
        Math.pow(
            z,
            1.25
        );


    return {
        x,
        y,
        scale,
        depth
    };
}


/* =========================================================
   CHARACTER SELECTION
========================================================= */

document
    .querySelectorAll(
        ".character-card"
    )
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".character-card"
                    )
                    .forEach(
                        c =>
                            c.classList.remove(
                                "selected"
                            )
                    );

                card.classList.add(
                    "selected"
                );

                selectedCharacter =
                    card.dataset.character;
            }
        );

    });


/* =========================================================
   MOVEMENT
========================================================= */

function moveLeft() {

    if (
        !gameRunning ||
        paused
    ) {
        return;
    }

    if (lane > 0) {

        lane--;

        targetLane =
            lane;
    }
}


function moveRight() {

    if (
        !gameRunning ||
        paused
    ) {
        return;
    }

    if (lane < 2) {

        lane++;

        targetLane =
            lane;
    }
}


function jump() {

    if (
        !gameRunning ||
        paused
    ) {
        return;
    }

    if (!jumping) {

        jumping = true;

        playerVelocity =
            -0.050;
    }
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    e => {

        if (
            e.code === "ArrowLeft" ||
            e.code === "KeyA"
        ) {

            moveLeft();
        }


        if (
            e.code === "ArrowRight" ||
            e.code === "KeyD"
        ) {

            moveRight();
        }


        if (
            e.code === "ArrowUp" ||
            e.code === "Space"
        ) {

            e.preventDefault();

            jump();
        }


        if (
            e.code === "Escape"
        ) {

            togglePause();
        }

    }
);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

leftButton.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        moveLeft();
    }
);


rightButton.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        moveRight();
    }
);


jumpButton.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        jump();
    }
);


/* =========================================================
   SWIPE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
    "touchstart",
    e => {

        const touch =
            e.changedTouches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    e => {

        const touch =
            e.changedTouches[0];

        const dx =
            touch.clientX -
            touchStartX;

        const dy =
            touch.clientY -
            touchStartY;


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (
                Math.abs(dx) > 30
            ) {

                if (dx > 0) {
                    moveRight();
                } else {
                    moveLeft();
                }

            }

        } else {

            if (dy < -30) {
                jump();
            }

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   SKY
========================================================= */

function drawSky() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#55bff0"
    );

    gradient.addColorStop(
        0.45,
        "#9de1f4"
    );

    gradient.addColorStop(
        0.75,
        "#ffd2df"
    );

    gradient.addColorStop(
        1,
        "#ffe7e0"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


/* =========================================================
   SUN
========================================================= */

function drawSun() {

    const x =
        W * 0.78;

    const y =
        H * 0.18;

    const radius =
        Math.min(
            W,
            H
        ) * 0.07;


    const gradient =
        ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            radius
        );

    gradient.addColorStop(
        0,
        "rgba(255,250,190,.95)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,220,130,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =========================================================
   CLOUDS
========================================================= */

function drawCloud(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );

    ctx.fillStyle =
        "rgba(255,255,255,.72)";

    ctx.beginPath();

    ctx.arc(
        0,
        12,
        25,
        0,
        Math.PI * 2
    );

    ctx.arc(
        28,
        0,
        34,
        0,
        Math.PI * 2
    );

    ctx.arc(
        63,
        12,
        27,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


function drawClouds() {

    const move =
        (roadMove * 18) %
        (W + 500);

    drawCloud(
        100 - move,
        H * 0.16,
        1
    );

    drawCloud(
        500 - move * .45,
        H * 0.24,
        .7
    );

    drawCloud(
        850 - move * .7,
        H * 0.12,
        .85
    );
}


/* =========================================================
   MOUNTAINS
========================================================= */

function drawMountains() {

    const base =
        horizonY() + 30;


    ctx.fillStyle =
        "#91b9d1";

    ctx.beginPath();

    ctx.moveTo(
        0,
        base
    );

    for (
        let x = -100;
        x <= W + 200;
        x += 180
    ) {

        const peak =
            base -
            100 -
            Math.abs(
                Math.sin(
                    x * .018
                )
            ) * 130;

        ctx.lineTo(
            x + 90,
            peak
        );

        ctx.lineTo(
            x + 180,
            base
        );
    }

    ctx.lineTo(
        W,
        H
    );

    ctx.lineTo(
        0,
        H
    );

    ctx.closePath();

    ctx.fill();
}


/* =========================================================
   CITY
========================================================= */

function drawCity() {

    const base =
        horizonY() + 18;


    const cityOffset =
        -(
            roadMove * 90
        ) %
        220;


    for (
        let x =
            cityOffset - 220;
        x <
            W + 220;
        x += 110
    ) {

        const h =
            75 +
            Math.abs(
                Math.sin(
                    x * .037
                )
            ) * 170;


        ctx.fillStyle =
            x % 220 === 0
                ? "#687e9c"
                : "#7d91ab";


        ctx.fillRect(
            x,
            base - h,
            92,
            h
        );


        /* windows */

        ctx.fillStyle =
            "rgba(255,235,150,.75)";


        for (
            let wy =
                base - h + 18;

            wy <
                base - 15;

            wy += 25
        ) {

            for (
                let wx =
                    x + 12;

                wx <
                    x + 80;

                wx += 23
            ) {

                ctx.fillRect(
                    wx,
                    wy,
                    8,
                    10
                );
            }
        }
    }


    drawJapaneseSign(
        W * .15,
        base - 90
    );

    drawTokyoTower(
        W * .82,
        base
    );
}


/* =========================================================
   JAPANESE SIGN
========================================================= */

function drawJapaneseSign(
    x,
    y
) {

    ctx.save();

    ctx.fillStyle =
        "#e94c68";

    ctx.fillRect(
        x - 32,
        y - 75,
        64,
        75
    );

    ctx.fillStyle =
        "#fff4e9";

    ctx.font =
        "bold 28px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "駅",
        x,
        y - 37
    );

    ctx.restore();
}


/* =========================================================
   TOKYO TOWER
========================================================= */

function drawTokyoTower(
    x,
    y
) {

    ctx.save();

    ctx.strokeStyle =
        "#e66b72";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x - 40,
        y - 200
    );

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x + 40,
        y - 200
    );

    ctx.stroke();


    ctx.fillStyle =
        "#e66b72";

    ctx.fillRect(
        x - 29,
        y - 135,
        58,
        7
    );

    ctx.fillRect(
        x - 20,
        y - 82,
        40,
        7
    );

    ctx.fillRect(
        x - 4,
        y - 240,
        8,
        45
    );

    ctx.restore();
}


/* =========================================================
   ROAD
========================================================= */

function drawRoad() {

    const hy =
        horizonY();

    const bottom =
        H;


    /*
        Main road trapezoid
    */

    ctx.fillStyle =
        "#30343e";

    ctx.beginPath();

    ctx.moveTo(
        W * .44,
        hy
    );

    ctx.lineTo(
        W * .56,
        hy
    );

    ctx.lineTo(
        W * .98,
        bottom
    );

    ctx.lineTo(
        W * .02,
        bottom
    );

    ctx.closePath();

    ctx.fill();


    /*
        Side railway areas
    */

    ctx.fillStyle =
        "#57514e";

    ctx.beginPath();

    ctx.moveTo(
        0,
        bottom
    );

    ctx.lineTo(
        W * .02,
        bottom
    );

    ctx.lineTo(
        W * .44,
        hy
    );

    ctx.lineTo(
        0,
        hy
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        W,
        bottom
    );

    ctx.lineTo(
        W * .98,
        bottom
    );

    ctx.lineTo(
        W * .56,
        hy
    );

    ctx.lineTo(
        W,
        hy
    );

    ctx.closePath();

    ctx.fill();


    drawRoadEdges();

    drawLaneLines();

    drawSleepers();
}


/* =========================================================
   ROAD EDGES
========================================================= */

function drawRoadEdges() {

    const hy =
        horizonY();

    ctx.strokeStyle =
        "#f7d77b";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        W * .44,
        hy
    );

    ctx.lineTo(
        W * .02,
        H
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        W * .56,
        hy
    );

    ctx.lineTo(
        W * .98,
        H
    );

    ctx.stroke();
}


/* =========================================================
   LANE LINES
========================================================= */

function drawLaneLines() {

    const hy =
        horizonY();

    const gy =
        H;


    for (
        const laneIndex of [0, 1, 2]
    ) {

        const hx =
            horizonLaneX(
                laneIndex
            );

        const bx =
            bottomLaneX(
                laneIndex
            );


        if (
            laneIndex === 0 ||
            laneIndex === 2
        ) {

            continue;
        }
    }


    /*
        Two center lane dividers
    */

    ctx.strokeStyle =
        "rgba(235,235,235,.65)";

    ctx.lineWidth = 4;

    for (
        const divider of [
            0.5,
            1.5
        ]
    ) {

        const left =
            horizonLaneX(0);

        const middle =
            horizonLaneX(1);

        const right =
            horizonLaneX(2);


        let hx;
        let bx;


        if (
            divider === .5
        ) {

            hx =
                (left + middle) /
                2;

            bx =
                (
                    bottomLaneX(0) +
                    bottomLaneX(1)
                ) / 2;

        } else {

            hx =
                (middle + right) /
                2;

            bx =
                (
                    bottomLaneX(1) +
                    bottomLaneX(2)
                ) / 2;
        }


        ctx.beginPath();

        ctx.moveTo(
            hx,
            hy
        );

        ctx.lineTo(
            bx,
            gy
        );

        ctx.stroke();
    }
}


/* =========================================================
   RAILWAY SLEEPERS / ROAD MARKINGS
========================================================= */

function drawSleepers() {

    const hy =
        horizonY();


    /*
        Moving distance markers
    */

    const count = 16;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        let z =
            (
                i / count +
                roadMove * 0.035
            ) % 1;


        const p =
            perspectivePosition(
                1,
                z
            );


        const roadHalf =
            (
                W * .06 +
                W * .43 * z
            );


        ctx.strokeStyle =
            `rgba(211,188,160,${0.25 + z * .55})`;

        ctx.lineWidth =
            2 +
            z * 9;


        ctx.beginPath();

        ctx.moveTo(
            W / 2 -
            roadHalf,
            p.y
        );

        ctx.lineTo(
            W / 2 +
            roadHalf,
            p.y
        );

        ctx.stroke();
    }
}


/* =========================================================
   TRAIN
========================================================= */

function drawTrain(
    x,
    y,
    scale,
    laneIndex
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    /*
        Train body
    */

    ctx.fillStyle =
        "#eef2f5";

    ctx.fillRect(
        -48,
        -88,
        96,
        88
    );


    /*
        red stripe
    */

    ctx.fillStyle =
        "#df5365";

    ctx.fillRect(
        -52,
        -78,
        104,
        13
    );


    /*
        front window
    */

    ctx.fillStyle =
        "#57b9d8";

    ctx.fillRect(
        -30,
        -61,
        60,
        30
    );


    /*
        window shine
    */

    ctx.fillStyle =
        "rgba(255,255,255,.55)";

    ctx.fillRect(
        -25,
        -57,
        16,
        5
    );


    /*
        headlights
    */

    ctx.fillStyle =
        "#ffe47a";

    ctx.beginPath();

    ctx.arc(
        -27,
        -17,
        7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        27,
        -17,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        train bottom
    */

    ctx.fillStyle =
        "#262936";

    ctx.fillRect(
        -42,
        -6,
        84,
        10
    );


    ctx.restore();
}


/* =========================================================
   PLAYER
========================================================= */

function drawPlayer() {

    const groundY =
        playerGroundY();


    const x =
        playerX;


    const jumpHeight =
        playerJump *
        H *
        .20;


    const y =
        groundY -
        jumpHeight;


    /*
        Player shadow
    */

    ctx.save();

    const shadowScale =
        Math.max(
            .25,
            1 -
            playerJump * .7
        );


    ctx.fillStyle =
        "rgba(0,0,0,.28)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        groundY + 8,
        30 * shadowScale,
        9 * shadowScale,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();


    /*
        Player body
    */

    ctx.save();

    ctx.translate(
        x,
        y
    );


    const run =
        Math.sin(
            distance * 0.35
        ) * 9;


    /*
        Legs
    */

    let bodyColor =
        "#ff609e";


    if (
        selectedCharacter ===
        "akira"
    ) {
        bodyColor =
            "#27304e";
    }


    if (
        selectedCharacter ===
        "yuki"
    ) {
        bodyColor =
            "#70a9df";
    }


    if (
        selectedCharacter ===
        "ren"
    ) {
        bodyColor =
            "#4a203f";
    }


    ctx.strokeStyle =
        "#22243b";

    ctx.lineWidth = 9;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        -10,
        -10
    );

    ctx.lineTo(
        -15 + run,
        25
    );


    ctx.moveTo(
        10,
        -10
    );

    ctx.lineTo(
        15 - run,
        25
    );

    ctx.stroke();


    /*
        Shoes
    */

    ctx.strokeStyle =
        "#f6f6f6";

    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
        -16 + run,
        25
    );

    ctx.lineTo(
        -29 + run,
        28
    );

    ctx.moveTo(
        16 - run,
        25
    );

    ctx.lineTo(
        29 - run,
        28
    );

    ctx.stroke();


    /*
        Body
    */

    ctx.fillStyle =
        bodyColor;

    ctx.beginPath();

    ctx.roundRect(
        -23,
        -72,
        46,
        62,
        15
    );

    ctx.fill();


    /*
        Arms
    */

    ctx.strokeStyle =
        "#ffd1b7";

    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
        -20,
        -55
    );

    ctx.lineTo(
        -32 - run,
        -28
    );


    ctx.moveTo(
        20,
        -55
    );

    ctx.lineTo(
        32 + run,
        -28
    );

    ctx.stroke();


    /*
        Head
    */

    ctx.fillStyle =
        "#ffd1b7";

    ctx.beginPath();

    ctx.arc(
        0,
        -94,
        27,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Hair
    */

    let hairColor =
        "#5b2a58";


    if (
        selectedCharacter ===
        "akira"
    ) {
        hairColor =
            "#171a2c";
    }


    if (
        selectedCharacter ===
        "yuki"
    ) {
        hairColor =
            "#edf7ff";
    }


    if (
        selectedCharacter ===
        "ren"
    ) {
        hairColor =
            "#b52b35";
    }


    ctx.fillStyle =
        hairColor;


    ctx.beginPath();

    ctx.arc(
        0,
        -103,
        29,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Anime eyes
    */

    ctx.fillStyle =
        "#292238";


    ctx.beginPath();

    ctx.ellipse(
        -9,
        -91,
        4,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.ellipse(
        9,
        -91,
        4,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Sakura flower
    */

    if (
        selectedCharacter ===
        "sakura"
    ) {

        ctx.fillStyle =
            "#ffb5d4";

        ctx.beginPath();

        ctx.arc(
            25,
            -112,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    ctx.restore();
}


/* =========================================================
   COIN
========================================================= */

function drawCoin(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    /*
        coin glow
    */

    ctx.shadowColor =
        "#ffe45c";

    ctx.shadowBlur =
        15;


    ctx.fillStyle =
        "#ffd83d";

    ctx.beginPath();

    ctx.arc(
        0,
        -25,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    ctx.strokeStyle =
        "#fff1a0";

    ctx.lineWidth = 4;

    ctx.stroke();


    ctx.fillStyle =
        "#9c6800";

    ctx.font =
        "bold 16px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "¥",
        0,
        -25
    );


    ctx.restore();
}


/* =========================================================
   BARRIER
========================================================= */

function drawBarrier(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    ctx.fillStyle =
        "#e95c4d";

    ctx.fillRect(
        -38,
        -45,
        76,
        45
    );


    ctx.fillStyle =
        "#ffe269";

    ctx.fillRect(
        -38,
        -35,
        76,
        9
    );


    ctx.fillRect(
        -38,
        -12,
        76,
        9
    );


    ctx.fillStyle =
        "#9b3030";

    ctx.fillRect(
        -33,
        0,
        8,
        15
    );

    ctx.fillRect(
        25,
        0,
        8,
        15
    );


    ctx.restore();
}


/* =========================================================
   CRATE
========================================================= */

function drawCrate(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    ctx.fillStyle =
        "#a96d40";

    ctx.fillRect(
        -35,
        -52,
        70,
        52
    );


    ctx.strokeStyle =
        "#593721";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        -35,
        -52,
        70,
        52
    );


    ctx.beginPath();

    ctx.moveTo(
        -35,
        -52
    );

    ctx.lineTo(
        35,
        0
    );


    ctx.moveTo(
        35,
        -52
    );

    ctx.lineTo(
        -35,
        0
    );

    ctx.stroke();


    ctx.restore();
}


/* =========================================================
   POWER UP
========================================================= */

function drawPowerUp(
    x,
    y,
    scale,
    type
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    let color =
        "#ffe14e";

    let symbol =
        "⚡";


    if (
        type ===
        "magnet"
    ) {

        color =
            "#ef6b9d";

        symbol =
            "🧲";
    }


    if (
        type ===
        "shield"
    ) {

        color =
            "#66c7ff";

        symbol =
            "🛡";
    }


    ctx.shadowColor =
        color;

    ctx.shadowBlur =
        20;


    ctx.fillStyle =
        color;

    ctx.beginPath();

    ctx.arc(
        0,
        -35,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    ctx.font =
        "23px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        symbol,
        0,
        -35
    );


    ctx.restore();
}


/* =========================================================
   OBJECT CREATION
========================================================= */

function createObstacle() {

    /*
        Keep one lane free.
    */

    const obstacleLane =
        Math.floor(
            Math.random() * 3
        );


    const types = [
        "barrier",
        "crate",
        "train"
    ];


    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];


    objects.push({

        type,

        lane:
            obstacleLane,

        z:
            0.02,

        collected:
            false

    });
}


/* =========================================================
   COIN LINE
========================================================= */

function createCoinLine(
    laneIndex
) {

    const coinLane =
        laneIndex ??
        Math.floor(
            Math.random() * 3
        );


    const count =
        5 +
        Math.floor(
            Math.random() * 5
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        objects.push({

            type:
                "coin",

            lane:
                coinLane,

            z:
                0.08 +
                i * 0.095,

            collected:
                false
        });
    }
}


/* =========================================================
   POWER UP
========================================================= */

function createPowerUp() {

    const powers = [
        "magnet",
        "shield",
        "boost"
    ];


    objects.push({

        type:
            powers[
                Math.floor(
                    Math.random() *
                    powers.length
                )
            ],

        lane:
            Math.floor(
                Math.random() * 3
            ),

        z:
            0.03,

        collected:
            false
    });
}


/* =========================================================
   PARTICLES
========================================================= */

function particle(
    x,
    y,
    text
) {

    particles.push({

        x,

        y,

        vx:
            (
                Math.random() -
                .5
            ) * 3,

        vy:
            -(
                Math.random() *
                3
            ) - 1,

        life:
            1,

        text

    });
}


function drawParticles() {

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx;

        p.y +=
            p.vy;


        p.life -=
            .025;


        ctx.globalAlpha =
            Math.max(
                0,
                p.life
            );


        ctx.font =
            "bold 20px Arial";

        ctx.fillStyle =
            "#ffe04d";

        ctx.textAlign =
            "center";


        ctx.fillText(
            p.text,
            p.x,
            p.y
        );


        ctx.globalAlpha =
            1;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   COLLISION
========================================================= */

function checkCollision(
    obj
) {

    if (
        obj.z < 0.84 ||
        obj.z > 1.05
    ) {
        return false;
    }


    if (
        obj.lane !== lane
    ) {
        return false;
    }


    /*
        Jump over road obstacles.
    */

    if (
        jumping &&
        playerJump > .30
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   COLLECT
========================================================= */

function collectObject(
    obj
) {

    if (
        obj.collected
    ) {
        return;
    }


    obj.collected =
        true;


    const pos =
        perspectivePosition(
            obj.lane,
            obj.z
        );


    if (
        obj.type ===
        "coin"
    ) {

        coins++;

        score += 10;


        particle(
            pos.x,
            pos.y - 30,
            "+10"
        );


        return;
    }


    if (
        obj.type ===
            "magnet" ||

        obj.type ===
            "shield" ||

        obj.type ===
            "boost"
    ) {

        showPower(
            obj.type
        );


        if (
            obj.type ===
            "magnet"
        ) {

            magnet =
                true;

            powerTimer =
                8;
        }


        if (
            obj.type ===
            "shield"
        ) {

            shield =
                true;

            powerTimer =
                10;
        }


        if (
            obj.type ===
            "boost"
        ) {

            boost =
                true;

            powerTimer =
                4;
        }


        return;
    }


    /*
        Obstacle
    */

    if (
        obj.type ===
            "barrier" ||

        obj.type ===
            "crate" ||

        obj.type ===
            "train"
    ) {

        if (
            shield
        ) {

            shield =
                false;

            particle(
                playerX,
                playerGroundY() - 80,
                "🛡 BLOCKED!"
            );

            return;
        }


        gameOver();
    }
}


/* =========================================================
   POWER MESSAGE
========================================================= */

function showPower(
    type
) {

    const text = {

        magnet:
            "🧲 MAGNET!",

        shield:
            "🛡 SHIELD!",

        boost:
            "⚡ SPEED BOOST!"

    };


    powerMessage.textContent =
        text[type] ||
        "⚡ POWER UP!";


    powerMessage.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            powerMessage.classList.add(
                "hidden"
            );

        },
        1300
    );
}


/* =========================================================
   UPDATE OBJECTS
========================================================= */

function updateObjects(
    dt
) {

    for (
        let i =
            objects.length - 1;

        i >= 0;

        i--
    ) {

        const obj =
            objects[i];


        /*
            Objects move FROM HORIZON
            TOWARD PLAYER.
        */

        obj.z +=
            speed *
            dt *
            (boost ? 1.5 : 1);


        /*
            Magnet pulls coins
            toward player's lane.
        */

        if (
            obj.type ===
                "coin" &&

            magnet &&

            obj.z > .45
        ) {

            obj.lane =
                lane;
        }


        /*
            Collision near player.
        */

        if (
            !obj.collected &&
            checkCollision(obj)
        ) {

            collectObject(
                obj
            );
        }


        /*
            Remove after passing player.
        */

        if (
            obj.z > 1.18
        ) {

            objects.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   SPAWNING
========================================================= */

function spawnObjects(
    dt
) {

    spawnTimer +=
        dt;


    coinTimer +=
        dt;


    /*
        Main obstacles
    */

    if (
        spawnTimer >
        Math.max(
            0.75,
            1.35 -
            gameSpeed * .04
        )
    ) {

        spawnTimer =
            0;


        const obstacleLane =
            Math.floor(
                Math.random() * 3
            );


        const types = [
            "barrier",
            "crate",
            "train"
        ];


        const type =
            types[
                Math.floor(
                    Math.random() *
                    types.length
                )
            ];


        objects.push({

            type,

            lane:
                obstacleLane,

            z:
                0.015,

            collected:
                false
        });


        /*
            Coins in another lane.
        */

        const safeLanes =
            [0, 1, 2]
                .filter(
                    l =>
                        l !==
                        obstacleLane
                );


        const coinLane =
            safeLanes[
                Math.floor(
                    Math.random() *
                    safeLanes.length
                )
            ];


        if (
            Math.random() <
            .85
        ) {

            createCoinLine(
                coinLane
            );
        }


        /*
            Power-up
        */

        if (
            Math.random() <
            .14
        ) {

            createPowerUp();
        }
    }


    /*
        Extra coins
    */

    if (
        coinTimer >
        2.2
    ) {

        coinTimer =
            0;


        if (
            Math.random() <
            .6
        ) {

            createCoinLine();
        }
    }
}


/* =========================================================
   DRAW OBJECTS
========================================================= */

function drawObjects() {

    const visible =
        objects
            .filter(
                obj =>
                    !obj.collected &&
                    obj.z >= 0
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.z -
                    b.z
            );


    /*
        Draw far objects first.
    */

    for (
        const obj of visible
    ) {

        const pos =
            perspectivePosition(
                obj.lane,
                obj.z
            );


        if (
            obj.type ===
            "coin"
        ) {

            drawCoin(
                pos.x,
                pos.y,
                pos.scale
            );

        }


        else if (
            obj.type ===
            "barrier"
        ) {

            drawBarrier(
                pos.x,
                pos.y,
                pos.scale
            );

        }


        else if (
            obj.type ===
            "crate"
        ) {

            drawCrate(
                pos.x,
                pos.y,
                pos.scale
            );

        }


        else if (
            obj.type ===
            "train"
        ) {

            drawTrain(
                pos.x,
                pos.y,
                pos.scale,
                obj.lane
            );

        }


        else {

            drawPowerUp(
                pos.x,
                pos.y,
                pos.scale,
                obj.type
            );
        }
    }
}


/* =========================================================
   UPDATE PLAYER
========================================================= */

function updatePlayer(
    dt
) {

    /*
        Smooth lane switching.
    */

    const targetX =
        bottomLaneX(
            targetLane
        );


    playerX +=
        (
            targetX -
            playerX
        ) *
        Math.min(
            1,
            dt * 12
        );


    /*
        Jump physics.
    */

    if (jumping) {

        playerJump +=
            playerVelocity *
            dt *
            60;


        playerVelocity +=
            0.0032 *
            dt *
            60;


        if (
            playerJump <= 0
        ) {

            playerJump =
                0;

            playerVelocity =
                0;

            jumping =
                false;
        }
    }
}


/* =========================================================
   POWER TIMER
========================================================= */

function updatePower(
    dt
) {

    if (
        shield ||
        magnet ||
        boost
    ) {

        powerTimer -=
            dt;


        if (
            powerTimer <= 0
        ) {

            shield =
                false;

            magnet =
                false;

            boost =
                false;

            powerTimer =
                0;
        }
    }
}


/* =========================================================
   GAME SPEED
========================================================= */

function updateSpeed(
    dt
) {

    gameSpeed +=
        dt *
        .025;


    speed =
        .010 +
        gameSpeed *
        .0012;


    const display =
        Math.min(
            3.5,
            gameSpeed
        );


    speedElement.textContent =
        display.toFixed(1);
}


/* =========================================================
   SCORE
========================================================= */

function updateScore(
    dt
) {

    score +=
        dt *
        12;


    distance +=
        dt *
        gameSpeed;


    scoreElement.textContent =
        Math.floor(
            score
        );


    coinsElement.textContent =
        coins;
}


/* =========================================================
   ROAD MOTION
========================================================= */

function updateRoad(
    dt
) {

    roadMove +=
        dt *
        gameSpeed;
}


/* =========================================================
   GAME DRAW
========================================================= */

function drawGame() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    drawSky();

    drawSun();

    drawClouds();

    drawMountains();

    drawCity();

    drawRoad();

    drawObjects();

    drawPlayer();

    drawParticles();
}


/* =========================================================
   GAME LOOP
========================================================= */

let lastTime = 0;

function gameLoop(
    timestamp
) {

    if (
        !gameRunning
    ) {

        return;
    }


    if (
        !lastTime
    ) {

        lastTime =
            timestamp;
    }


    let dt =
        (
            timestamp -
            lastTime
        ) / 1000;


    lastTime =
        timestamp;


    dt =
        Math.min(
            dt,
            .033
        );


    if (
        !paused
    ) {

        updateRoad(
            dt
        );

        updatePlayer(
            dt
        );

        updateObjects(
            dt
        );

        spawnObjects(
            dt
        );

        updatePower(
            dt
        );

        updateSpeed(
            dt
        );

        updateScore(
            dt
        );
    }


    drawGame();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    startScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    score =
        0;

    coins =
        0;


    gameSpeed =
        1;


    speed =
        .010;


    lane =
        1;

    targetLane =
        1;


    playerX =
        bottomLaneX(
            1
        );


    playerJump =
        0;

    playerVelocity =
        0;

    jumping =
        false;


    objects =
        [];

    particles =
        [];


    spawnTimer =
        0;

    coinTimer =
        0;


    roadMove =
        0;

    distance =
        0;


    shield =
        false;

    magnet =
        false;

    boost =
        false;


    gameRunning =
        true;

    paused =
        false;


    lastTime =
        0;


    updateHUD();


    cancelAnimationFrame(
        animationId
    );


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        !gameRunning
    ) {

        return;
    }


    paused =
        !paused;


    if (
        paused
    ) {

        pauseScreen.classList.remove(
            "hidden"
        );

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        lastTime =
            0;
    }
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (
        !gameRunning
    ) {

        return;
    }


    gameRunning =
        false;


    const final =
        Math.floor(
            score
        );


    if (
        final >
        bestScore
    ) {

        bestScore =
            final;


        localStorage.setItem(
            "animeRunBest",
            bestScore
        );
    }


    finalScore.textContent =
        final;

    finalCoins.textContent =
        coins;

    finalBest.textContent =
        bestScore;


    gameOverScreen.classList.remove(
        "hidden"
    );
}


/* =========================================================
   MENU
========================================================= */

function showMenu() {

    gameRunning =
        false;

    paused =
        false;


    cancelAnimationFrame(
        animationId
    );


    gameScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    startScreen.classList.remove(
        "hidden"
    );


    startBestScore.textContent =
        bestScore;
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    scoreElement.textContent =
        Math.floor(
            score
        );

    coinsElement.textContent =
        coins;


    speedElement.textContent =
        gameSpeed.toFixed(
            1
        );


    startBestScore.textContent =
        bestScore;
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


pauseRestartButton.addEventListener(
    "click",
    startGame
);


menuButton.addEventListener(
    "click",
    showMenu
);


resumeButton.addEventListener(
    "click",
    togglePause
);


pauseButton.addEventListener(
    "click",
    togglePause
);


/* =========================================================
   INITIAL
========================================================= */

startBestScore.textContent =
    bestScore;


window.startGame =
    startGame;

window.gameOver =
    gameOver;

window.moveLeft =
    moveLeft;

window.moveRight =
    moveRight;

window.jump =
    jump;

window.togglePause =
    togglePause;