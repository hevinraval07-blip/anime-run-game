/* =====================================================
   ANIME RUN
   Japanese Railway Endless Runner
===================================================== */


/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =====================================================
   DOM
===================================================== */

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

const pauseButton =
    document.getElementById("pauseButton");

const resumeButton =
    document.getElementById("resumeButton");

const pauseRestartButton =
    document.getElementById("pauseRestartButton");

const scoreElement =
    document.getElementById("score");

const coinsElement =
    document.getElementById("coins");

const speedElement =
    document.getElementById("speed");

const finalScore =
    document.getElementById("finalScore");

const finalCoins =
    document.getElementById("finalCoins");

const finalBest =
    document.getElementById("finalBest");

const startBestScore =
    document.getElementById("startBestScore");


/* =====================================================
   GAME VARIABLES
===================================================== */

let gameRunning = false;
let gamePaused = false;

let score = 0;
let coins = 0;

let bestScore =
    Number(localStorage.getItem("animeRunBest")) || 0;

let gameSpeed = 7;

let selectedCharacter = "sakura";

let animationId = 0;

let lastTime = 0;

let spawnTimer = 0;

let coinTimer = 0;

let backgroundOffset = 0;

let trackOffset = 0;

let cityOffset = 0;

let trainOffset = 0;


/* =====================================================
   PLAYER
===================================================== */

const player = {

    lane: 1,

    x: 0,

    y: 0,

    width: 58,

    height: 90,

    targetX: 0,

    jumpY: 0,

    velocityY: 0,

    jumping: false,

    runningFrame: 0
};


/* =====================================================
   LANE SYSTEM
===================================================== */

function getLaneX(lane) {

    const center = W / 2;

    const spread =
        Math.min(W * 0.22, 230);

    if (lane === 0) {
        return center - spread;
    }

    if (lane === 2) {
        return center + spread;
    }

    return center;
}


/* =====================================================
   START POSITION
===================================================== */

function resetPlayer() {

    player.lane = 1;

    player.x = getLaneX(1);

    player.targetX = player.x;

    player.jumpY = 0;

    player.velocityY = 0;

    player.jumping = false;

    player.runningFrame = 0;
}


/* =====================================================
   OBJECTS
===================================================== */

let obstacles = [];
let coinObjects = [];
let particles = [];
let clouds = [];
let buildings = [];
let cherryBlossoms = [];
let signs = [];
let trains = [];


/* =====================================================
   RANDOM
===================================================== */

function random(min, max) {

    return Math.random() * (max - min) + min;
}


/* =====================================================
   INITIAL BACKGROUND
===================================================== */

function createBackground() {

    clouds = [];
    buildings = [];
    cherryBlossoms = [];
    signs = [];
    trains = [];

    for (let i = 0; i < 10; i++) {

        clouds.push({

            x: random(-100, W + 100),

            y: random(60, H * 0.3),

            width: random(80, 190),

            speed: random(0.08, 0.2)

        });
    }


    for (let i = 0; i < 20; i++) {

        buildings.push({

            x: i * 150 + random(-30, 30),

            width: random(100, 170),

            height: random(100, 260),

            color:
                [
                    "#ffd5d9",
                    "#c7d9f7",
                    "#d8c8ee",
                    "#ffe9bd",
                    "#c6eadc"
                ][i % 5],

            windows:
                Math.floor(random(3, 7))

        });
    }


    for (let i = 0; i < 50; i++) {

        cherryBlossoms.push({

            x: random(0, W),

            y: random(0, H * 0.7),

            size: random(3, 7),

            speed: random(0.3, 1.2),

            rotation: random(0, Math.PI * 2)

        });
    }


    for (let i = 0; i < 6; i++) {

        signs.push({

            x: random(0, W),

            y: random(H * 0.28, H * 0.48),

            speed: random(0.2, 0.5),

            text:
                ["東京", "東京駅", "渋谷", "新宿", "秋葉原", "浅草"]
                [i]

        });
    }


    for (let i = 0; i < 2; i++) {

        trains.push({

            x: i * 700 + 400,

            y: H * 0.43,

            width: 360,

            speed: random(0.25, 0.45),

            color:
                i === 0
                    ? "#f7f7f7"
                    : "#d9eff5"

        });
    }
}


/* =====================================================
   SKY
===================================================== */

function drawSky() {

    const sky = ctx.createLinearGradient(
        0,
        0,
        0,
        H * 0.65
    );

    sky.addColorStop(0, "#70c7f5");

    sky.addColorStop(
        0.55,
        "#aee7f7"
    );

    sky.addColorStop(
        1,
        "#ffd6dc"
    );

    ctx.fillStyle = sky;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* Sun */

    const sunX = W * 0.78;
    const sunY = H * 0.18;

    const glow =
        ctx.createRadialGradient(
            sunX,
            sunY,
            10,
            sunX,
            sunY,
            100
        );

    glow.addColorStop(
        0,
        "rgba(255,255,220,0.9)"
    );

    glow.addColorStop(
        1,
        "rgba(255,220,180,0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        sunX,
        sunY,
        100,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#fff3b0";

    ctx.beginPath();

    ctx.arc(
        sunX,
        sunY,
        34,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =====================================================
   CLOUDS
===================================================== */

function drawClouds(dt) {

    ctx.save();

    clouds.forEach(cloud => {

        cloud.x -= cloud.speed * gameSpeed * dt;

        if (cloud.x < -cloud.width - 50) {

            cloud.x =
                W + random(50, 250);

            cloud.y =
                random(50, H * 0.25);
        }


        ctx.fillStyle =
            "rgba(255,255,255,0.75)";


        ctx.beginPath();

        ctx.arc(
            cloud.x,
            cloud.y,
            cloud.width * 0.18,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.width * 0.18,
            cloud.y - 12,
            cloud.width * 0.23,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.width * 0.42,
            cloud.y,
            cloud.width * 0.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    ctx.restore();
}


/* =====================================================
   CITY
===================================================== */

function drawCity(dt) {

    cityOffset += gameSpeed * dt * 0.12;


    /* distant mountain */

    ctx.fillStyle = "#7c9cc4";

    ctx.beginPath();

    ctx.moveTo(0, H * 0.43);

    ctx.lineTo(W * 0.18, H * 0.25);

    ctx.lineTo(W * 0.35, H * 0.43);

    ctx.lineTo(W * 0.5, H * 0.28);

    ctx.lineTo(W * 0.7, H * 0.43);

    ctx.lineTo(W * 0.86, H * 0.3);

    ctx.lineTo(W, H * 0.43);

    ctx.closePath();

    ctx.fill();


    buildings.forEach((building, index) => {

        let x =
            building.x -
            cityOffset %
            (W + 250);

        if (x < -200) {
            x += W + 250;
        }

        const baseY =
            H * 0.52;

        const topY =
            baseY -
            building.height *
            0.55;


        /* Building */

        ctx.fillStyle =
            building.color;

        ctx.fillRect(
            x,
            topY,
            building.width,
            building.height
        );


        /* Roof */

        ctx.fillStyle =
            "rgba(60,50,80,0.35)";

        ctx.fillRect(
            x,
            topY,
            building.width,
            8
        );


        /* Windows */

        const rows = 4;

        const cols =
            building.windows;

        for (let r = 0; r < rows; r++) {

            for (let c = 0; c < cols; c++) {

                const wx =
                    x +
                    12 +
                    c *
                    ((building.width - 25) /
                    cols);

                const wy =
                    topY +
                    25 +
                    r * 35;

                ctx.fillStyle =
                    (r + c + index) % 3 === 0
                        ? "#fff1a8"
                        : "#8bb7d9";

                ctx.fillRect(
                    wx,
                    wy,
                    12,
                    18
                );
            }
        }


        /* Japanese rooftop */

        if (index % 4 === 0) {

            ctx.fillStyle =
                "#44404f";

            ctx.fillRect(
                x + building.width * 0.25,
                topY - 30,
                8,
                30
            );

            ctx.fillRect(
                x + building.width * 0.7,
                topY - 20,
                6,
                20
            );
        }
    });


    /* Tokyo Tower style silhouette */

    const towerX = W * 0.13;

    ctx.strokeStyle = "#d84f63";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        towerX - 25,
        H * 0.5
    );

    ctx.lineTo(
        towerX,
        H * 0.25
    );

    ctx.lineTo(
        towerX + 25,
        H * 0.5
    );

    ctx.stroke();

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        towerX - 16,
        H * 0.4
    );

    ctx.lineTo(
        towerX + 16,
        H * 0.4
    );

    ctx.moveTo(
        towerX - 9,
        H * 0.33
    );

    ctx.lineTo(
        towerX + 9,
        H * 0.33
    );

    ctx.stroke();
}


/* =====================================================
   TRAINS
===================================================== */

function drawTrains(dt) {

    trains.forEach(train => {

        train.x -=
            train.speed *
            gameSpeed *
            dt *
            2;


        if (train.x < -train.width - 100) {

            train.x =
                W +
                random(100, 500);
        }


        const y = train.y;


        /* Train body */

        ctx.fillStyle =
            train.color;

        ctx.fillRect(
            train.x,
            y,
            train.width,
            65
        );


        /* Roof */

        ctx.fillStyle =
            "#596172";

        ctx.fillRect(
            train.x - 5,
            y - 7,
            train.width + 10,
            8
        );


        /* Windows */

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            ctx.fillStyle =
                "#4c78a1";

            ctx.fillRect(
                train.x + 25 + i * 65,
                y + 14,
                45,
                25
            );
        }


        /* Doors */

        ctx.strokeStyle =
            "#b7bcc8";

        for (
            let i = 0;
            i < 2;
            i++
        ) {

            ctx.strokeRect(
                train.x + 100 + i * 120,
                y + 8,
                38,
                52
            );
        }


        /* Front light */

        ctx.fillStyle =
            "#fff5a5";

        ctx.beginPath();

        ctx.arc(
            train.x + 20,
            y + 45,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });
}


/* =====================================================
   SIGNS
===================================================== */

function drawSigns(dt) {

    signs.forEach(sign => {

        sign.x -=
            sign.speed *
            gameSpeed *
            dt *
            2;

        if (sign.x < -100) {

            sign.x =
                W + random(100, 500);
        }


        ctx.fillStyle =
            "#65475d";

        ctx.fillRect(
            sign.x,
            sign.y,
            5,
            100
        );


        ctx.fillStyle =
            "#f5d3d7";

        ctx.fillRect(
            sign.x - 25,
            sign.y - 45,
            80,
            48
        );


        ctx.strokeStyle =
            "#9b5a6b";

        ctx.lineWidth = 3;

        ctx.strokeRect(
            sign.x - 25,
            sign.y - 45,
            80,
            48
        );


        ctx.fillStyle =
            "#542e48";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            sign.text,
            sign.x + 15,
            sign.y - 13
        );

    });
}


/* =====================================================
   CHERRY BLOSSOMS
===================================================== */

function drawCherryBlossoms(dt) {

    cherryBlossoms.forEach(petal => {

        petal.y +=
            petal.speed *
            gameSpeed *
            dt;

        petal.x -=
            0.4 *
            gameSpeed *
            dt;

        petal.rotation += 0.02;


        if (petal.y > H + 20) {

            petal.y =
                random(-100, 0);

            petal.x =
                random(0, W);
        }


        ctx.save();

        ctx.translate(
            petal.x,
            petal.y
        );

        ctx.rotate(
            petal.rotation
        );

        ctx.fillStyle =
            "rgba(255,157,191,0.85)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            petal.size,
            petal.size * 0.55,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    });
}


/* =====================================================
   RAILWAY
===================================================== */

function drawRailway(dt) {

    const horizon =
        H * 0.50;

    const bottom =
        H;

    /* Grass */

    ctx.fillStyle =
        "#5b9c69";

    ctx.fillRect(
        0,
        horizon,
        W,
        H - horizon
    );


    /* Track area */

    const center =
        W / 2;

    const topWidth =
        W * 0.12;

    const bottomWidth =
        W * 0.92;


    ctx.fillStyle =
        "#777681";

    ctx.beginPath();

    ctx.moveTo(
        center - topWidth / 2,
        horizon
    );

    ctx.lineTo(
        center + topWidth / 2,
        horizon
    );

    ctx.lineTo(
        center + bottomWidth / 2,
        bottom
    );

    ctx.lineTo(
        center - bottomWidth / 2,
        bottom
    );

    ctx.closePath();

    ctx.fill();


    /* Railway sleepers */

    trackOffset +=
        gameSpeed *
        dt;

    const spacing = 55;

    for (
        let y = horizon + (trackOffset % spacing);
        y < H + spacing;
        y += spacing
    ) {

        const progress =
            (y - horizon) /
            (H - horizon);

        const width =
            topWidth +
            (bottomWidth - topWidth) *
            progress;

        ctx.fillStyle =
            "#554e55";

        ctx.fillRect(
            center - width / 2,
            y,
            width,
            8 + progress * 12
        );
    }


    /* Rails */

    ctx.strokeStyle =
        "#d5d6dc";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        center - topWidth * 0.3,
        horizon
    );

    ctx.lineTo(
        center - bottomWidth * 0.38,
        bottom
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        center + topWidth * 0.3,
        horizon
    );

    ctx.lineTo(
        center + bottomWidth * 0.38,
        bottom
    );

    ctx.stroke();


    /* 3 lane separators */

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 2;

    for (
        let lane = 1;
        lane < 3;
        lane++
    ) {

        const topX =
            center -
            topWidth / 2 +
            (topWidth / 3) * lane;

        const bottomX =
            center -
            bottomWidth / 2 +
            (bottomWidth / 3) * lane;

        ctx.beginPath();

        ctx.moveTo(
            topX,
            horizon
        );

        ctx.lineTo(
            bottomX,
            bottom
        );

        ctx.stroke();
    }
}


/* =====================================================
   PLAYER DRAWING
===================================================== */

function drawPlayer() {

    const baseY =
        H * 0.76;

    const x =
        player.x;

    const y =
        baseY -
        player.height -
        player.jumpY;


    player.runningFrame +=
        0.15 *
        gameSpeed;


    const frame =
        Math.sin(
            player.runningFrame
        );


    ctx.save();

    ctx.translate(
        x,
        y
    );


    /* shadow */

    ctx.fillStyle =
        "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        player.height + 12,
        32,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* legs */

    const legMove =
        frame * 9;

    ctx.strokeStyle =
        selectedCharacter === "ren"
            ? "#382035"
            : "#24233a";

    ctx.lineWidth = 9;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        -12,
        62
    );

    ctx.lineTo(
        -17 + legMove,
        88
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        12,
        62
    );

    ctx.lineTo(
        17 - legMove,
        88
    );

    ctx.stroke();


    /* shoes */

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.ellipse(
        -18 + legMove,
        89,
        14,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
        18 - legMove,
        89,
        14,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* body */

    let bodyColor =
        "#ff5797";

    if (selectedCharacter === "akira") {
        bodyColor = "#27334d";
    }

    if (selectedCharacter === "yuki") {
        bodyColor = "#72aee5";
    }

    if (selectedCharacter === "ren") {
        bodyColor = "#6d2d47";
    }

    ctx.fillStyle =
        bodyColor;

    ctx.beginPath();

    ctx.roundRect(
        -27,
        35,
        54,
        45,
        15
    );

    ctx.fill();


    /* arms */

    ctx.strokeStyle =
        bodyColor;

    ctx.lineWidth = 9;

    ctx.beginPath();

    ctx.moveTo(
        -23,
        43
    );

    ctx.lineTo(
        -36,
        60 - frame * 5
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        23,
        43
    );

    ctx.lineTo(
        36,
        60 + frame * 5
    );

    ctx.stroke();


    /* neck */

    ctx.fillStyle =
        "#f2b99d";

    ctx.fillRect(
        -7,
        25,
        14,
        15
    );


    /* face */

    ctx.fillStyle =
        "#ffd0b2";

    ctx.beginPath();

    ctx.arc(
        0,
        18,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* hair */

    let hairColor =
        "#642e58";

    if (selectedCharacter === "akira") {
        hairColor = "#151827";
    }

    if (selectedCharacter === "yuki") {
        hairColor = "#eef8ff";
    }

    if (selectedCharacter === "ren") {
        hairColor = "#b62d38";
    }

    ctx.fillStyle =
        hairColor;

    ctx.beginPath();

    ctx.moveTo(
        -27,
        13
    );

    ctx.quadraticCurveTo(
        -22,
        -22,
        0,
        -17
    );

    ctx.quadraticCurveTo(
        25,
        -22,
        28,
        12
    );

    ctx.lineTo(
        20,
        2
    );

    ctx.lineTo(
        12,
        13
    );

    ctx.lineTo(
        5,
        0
    );

    ctx.lineTo(
        -5,
        13
    );

    ctx.lineTo(
        -15,
        0
    );

    ctx.lineTo(
        -23,
        14
    );

    ctx.closePath();

    ctx.fill();


    /* eyes */

    ctx.fillStyle =
        "#29213c";

    ctx.beginPath();

    ctx.ellipse(
        -9,
        18,
        4,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
        9,
        18,
        4,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* eye shine */

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        -8,
        16,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        10,
        16,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Sakura accessory */

    if (selectedCharacter === "sakura") {

        ctx.fillStyle =
            "#ff78ad";

        ctx.beginPath();

        ctx.arc(
            20,
            -3,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* Fire accessory */

    if (selectedCharacter === "ren") {

        ctx.fillStyle =
            "#ff9c3d";

        ctx.beginPath();

        ctx.moveTo(
            0,
            -30
        );

        ctx.lineTo(
            8,
            -12
        );

        ctx.lineTo(
            0,
            -16
        );

        ctx.lineTo(
            -7,
            -12
        );

        ctx.closePath();

        ctx.fill();
    }


    ctx.restore();
}


/* =====================================================
   OBSTACLE
===================================================== */

function spawnObstacle() {

    const lane =
        Math.floor(
            Math.random() * 3
        );

    obstacles.push({

        lane: lane,

        y: H * 0.54,

        width: 48,

        height: 50,

        type:
            Math.random() > 0.5
                ? "cone"
                : "crate"

    });
}


/* =====================================================
   DRAW OBSTACLES
===================================================== */

function drawObstacles(dt) {

    obstacles.forEach(obstacle => {

        obstacle.y +=
            gameSpeed *
            dt *
            60;


        const x =
            getLaneX(
                obstacle.lane
            );


        const progress =
            Math.min(
                1,
                (obstacle.y - H * 0.5) /
                (H * 0.5)
            );


        const scale =
            0.45 +
            progress * 0.9;


        ctx.save();

        ctx.translate(
            x,
            obstacle.y
        );

        ctx.scale(
            scale,
            scale
        );


        if (obstacle.type === "cone") {

            /* cone */

            ctx.fillStyle =
                "#f28a3c";

            ctx.beginPath();

            ctx.moveTo(
                0,
                -30
            );

            ctx.lineTo(
                -22,
                28
            );

            ctx.lineTo(
                22,
                28
            );

            ctx.closePath();

            ctx.fill();


            ctx.fillStyle =
                "#fff2dd";

            ctx.fillRect(
                -14,
                0,
                28,
                8
            );


            ctx.fillStyle =
                "#efefef";

            ctx.fillRect(
                -27,
                27,
                54,
                7
            );

        } else {

            /* crate */

            ctx.fillStyle =
                "#9c5b35";

            ctx.fillRect(
                -28,
                -28,
                56,
                56
            );


            ctx.strokeStyle =
                "#633820";

            ctx.lineWidth = 5;

            ctx.strokeRect(
                -28,
                -28,
                56,
                56
            );


            ctx.beginPath();

            ctx.moveTo(
                -24,
                -24
            );

            ctx.lineTo(
                24,
                24
            );

            ctx.moveTo(
                24,
                -24
            );

            ctx.lineTo(
                -24,
                24
            );

            ctx.stroke();
        }


        ctx.restore();

    });


    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.y < H + 100
        );
}


/* =====================================================
   COINS
===================================================== */

function spawnCoin() {

    const lane =
        Math.floor(
            Math.random() * 3
        );

    coinObjects.push({

        lane: lane,

        y: H * 0.54,

        rotation: 0

    });
}


function drawCoins(dt) {

    coinObjects.forEach(coin => {

        coin.y +=
            gameSpeed *
            dt *
            60;

        coin.rotation +=
            0.12 *
            gameSpeed;


        const x =
            getLaneX(
                coin.lane
            );


        const progress =
            Math.min(
                1,
                (coin.y - H * 0.5) /
                (H * 0.5)
            );


        const scale =
            0.5 +
            progress * 0.8;


        ctx.save();

        ctx.translate(
            x,
            coin.y
        );

        ctx.scale(
            scale,
            scale
        );


        ctx.rotate(
            Math.sin(
                coin.rotation
            ) * 0.5
        );


        /* coin */

        ctx.fillStyle =
            "#ffd447";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            16,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#fff0a0";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#d88c1f";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "¥",
            0,
            1
        );


        ctx.restore();

    });


    coinObjects =
        coinObjects.filter(
            coin =>
                coin.y < H + 100
        );
}


/* =====================================================
   PARTICLES
===================================================== */

function createParticle(
    x,
    y,
    color = "#ff8fbd"
) {

    particles.push({

        x: x,

        y: y,

        vx: random(-2, 2),

        vy: random(-4, -1),

        life: 1,

        size: random(3, 7),

        color: color

    });
}


function updateParticles(dt) {

    particles.forEach(p => {

        p.x +=
            p.vx *
            60 *
            dt;

        p.y +=
            p.vy *
            60 *
            dt;

        p.vy +=
            5 *
            dt;

        p.life -=
            dt * 2;

    });


    particles =
        particles.filter(
            p =>
                p.life > 0
        );
}


function drawParticles() {

    particles.forEach(p => {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life
            );

        ctx.fillStyle =
            p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    ctx.globalAlpha = 1;
}


/* =====================================================
   COLLISION
===================================================== */

function checkCollisions() {

    const playerX =
        player.x;

    const playerY =
        H * 0.76 -
        player.height -
        player.jumpY;


    /* obstacle collision */

    for (const obstacle of obstacles) {

        const ox =
            getLaneX(
                obstacle.lane
            );

        const oy =
            obstacle.y;


        const distanceX =
            Math.abs(
                playerX - ox
            );

        const distanceY =
            Math.abs(
                playerY + 45 - oy
            );


        if (
            distanceX < 38 &&
            distanceY < 55
        ) {

            if (player.jumpY < 45) {

                gameOver();

                return;
            }
        }
    }


    /* coin collision */

    for (
        let i = coinObjects.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coinObjects[i];

        const cx =
            getLaneX(
                coin.lane
            );


        const distanceX =
            Math.abs(
                playerX - cx
            );

        const distanceY =
            Math.abs(
                playerY + 45 -
                coin.y
            );


        if (
            distanceX < 42 &&
            distanceY < 55
        ) {

            coins++;

            score += 25;

            for (
                let j = 0;
                j < 8;
                j++
            ) {

                createParticle(
                    cx,
                    coin.y,
                    "#ffd447"
                );
            }

            coinObjects.splice(
                i,
                1
            );

            updateHUD();
        }
    }
}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function moveLeft() {

    if (!gameRunning || gamePaused)
        return;

    if (player.lane > 0) {

        player.lane--;

        player.targetX =
            getLaneX(
                player.lane
            );
    }
}


function moveRight() {

    if (!gameRunning || gamePaused)
        return;

    if (player.lane < 2) {

        player.lane++;

        player.targetX =
            getLaneX(
                player.lane
            );
    }
}


function jump() {

    if (
        !gameRunning ||
        gamePaused ||
        player.jumping
    ) {
        return;
    }

    player.jumping = true;

    player.velocityY = 750;

    createParticle(
        player.x,
        H * 0.76,
        "#ffffff"
    );
}


/* =====================================================
   UPDATE PLAYER
===================================================== */

function updatePlayer(dt) {

    /* lane movement */

    player.x +=
        (
            player.targetX -
            player.x
        ) *
        Math.min(
            1,
            dt * 12
        );


    /* jump */

    if (player.jumping) {

        player.jumpY +=
            player.velocityY *
            dt;

        player.velocityY -=
            1800 *
            dt;


        if (
            player.jumpY <= 0
        ) {

            player.jumpY = 0;

            player.velocityY = 0;

            player.jumping = false;
        }
    }
}


/* =====================================================
   GAME SPEED
===================================================== */

function updateGameSpeed() {

    gameSpeed =
        Math.min(
            15,
            7 +
            score / 800
        );
}


/* =====================================================
   SPAWNING
===================================================== */

function updateSpawning(dt) {

    spawnTimer += dt;

    coinTimer += dt;


    const obstacleInterval =
        Math.max(
            0.55,
            1.25 -
            score / 6000
        );


    if (
        spawnTimer >
        obstacleInterval
    ) {

        spawnTimer = 0;

        spawnObstacle();
    }


    if (
        coinTimer >
        0.7
    ) {

        coinTimer = 0;

        spawnCoin();
    }
}


/* =====================================================
   SCORE
===================================================== */

function updateScore(dt) {

    score +=
        dt *
        gameSpeed *
        1.5;

    updateGameSpeed();

    updateHUD();
}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    scoreElement.textContent =
        Math.floor(score);

    coinsElement.textContent =
        coins;

    speedElement.textContent =
        (gameSpeed / 7).toFixed(1);
}


/* =====================================================
   DRAW EVERYTHING
===================================================== */

function drawGame(dt) {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    drawSky();

    drawClouds(dt);

    drawCity(dt);

    drawTrains(dt);

    drawSigns(dt);

    drawCherryBlossoms(dt);

    drawRailway(dt);

    drawCoins(dt);

    drawObstacles(dt);

    drawPlayer();

    drawParticles();
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }


    const dt =
        Math.min(
            0.033,
            (timestamp - lastTime) /
            1000
        );


    lastTime =
        timestamp;


    if (!gamePaused) {

        updatePlayer(dt);

        updateSpawning(dt);

        updateScore(dt);

        drawGame(dt);

        checkCollisions();

        updateParticles(dt);

    }


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    score = 0;

    coins = 0;

    gameSpeed = 7;

    spawnTimer = 0;

    coinTimer = 0;

    obstacles = [];

    coinObjects = [];

    particles = [];

    gamePaused = false;

    gameRunning = true;

    resetPlayer();

    createBackground();

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );

    updateHUD();

    lastTime =
        performance.now();

    cancelAnimationFrame(
        animationId
    );

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =====================================================
   GAME OVER
===================================================== */

function gameOver() {

    if (!gameRunning)
        return;


    gameRunning = false;

    gamePaused = false;


    const final =
        Math.floor(score);


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


    startBestScore.textContent =
        bestScore;


    gameOverScreen.classList.remove(
        "hidden"
    );


    /* explosion particles */

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        createParticle(
            player.x,
            H * 0.7,
            "#ff6b9e"
        );
    }
}


/* =====================================================
   PAUSE
===================================================== */

function togglePause() {

    if (!gameRunning)
        return;


    gamePaused =
        !gamePaused;


    if (gamePaused) {

        pauseScreen.classList.remove(
            "hidden"
        );

        pauseButton.textContent =
            "▶";

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        pauseButton.textContent =
            "⏸";

        lastTime =
            performance.now();
    }
}


/* =====================================================
   MAIN MENU
===================================================== */

function showMenu() {

    gameRunning = false;

    gamePaused = false;

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


/* =====================================================
   CHARACTER SELECTION
===================================================== */

const characterCards =
    document.querySelectorAll(
        ".character-card"
    );


characterCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            characterCards.forEach(
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


/* =====================================================
   BUTTONS
===================================================== */

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


pauseButton.addEventListener(
    "click",
    togglePause
);


resumeButton.addEventListener(
    "click",
    togglePause
);


/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            moveLeft();
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            event.preventDefault();

            moveRight();
        }


        if (
            event.key === "ArrowUp" ||
            event.key === " "
        ) {

            event.preventDefault();

            jump();
        }


        if (
            event.key === "Escape"
        ) {

            event.preventDefault();

            togglePause();
        }

    }
);


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document
    .getElementById("leftButton")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            moveLeft();
        }
    );


document
    .getElementById("rightButton")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            moveRight();
        }
    );


document
    .getElementById("jumpButton")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            jump();
        }
    );


/* =====================================================
   SWIPE CONTROLS
===================================================== */

let touchStartX = 0;
let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.touches[0];

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
    event => {

        const touch =
            event.changedTouches[0];

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

            if (dx > 40) {

                moveRight();

            } else if (dx < -40) {

                moveLeft();
            }

        } else {

            if (dy < -40) {

                jump();
            }
        }

    },
    {
        passive: true
    }
);


/* =====================================================
   INITIAL
===================================================== */

startBestScore.textContent =
    bestScore;

createBackground();

resetPlayer();