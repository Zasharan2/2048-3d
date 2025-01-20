var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

const SCREENTYPE = {
    NULL_TO_TITLE: 0.1,
    TITLE: 1,
    TITLE_TO_GAME: 1.2,
    GAME: 2
}

var gameScreen = SCREENTYPE.NULL_TO_TITLE;

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
};

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cube {
    constructor(position, size, value) {
        this.position = position;
        this.size = size;
        this.value = value;
        this.setPoints();
    }

    setPoints() {
        this.points = [new Vector2((this.position.x / this.position.z), (this.position.y / this.position.z)),
                       new Vector2((this.position.x / this.position.z) + (this.size / this.position.z), (this.position.y / this.position.z)),
                       new Vector2((this.position.x / this.position.z), (this.position.y / this.position.z) + (this.size / this.position.z)),
                       new Vector2((this.position.x / this.position.z) + (this.size / this.position.z), (this.position.y / this.position.z) + (this.size / this.position.z)),
                       new Vector2((this.position.x / (this.position.z + (this.size * zSizeFactor))), (this.position.y / (this.position.z + (this.size * zSizeFactor)))),
                       new Vector2((this.position.x / (this.position.z + (this.size * zSizeFactor))) + (this.size / (this.position.z + (this.size * zSizeFactor))), (this.position.y / (this.position.z + (this.size * zSizeFactor)))),
                       new Vector2((this.position.x / (this.position.z + (this.size * zSizeFactor))), (this.position.y / (this.position.z + (this.size * zSizeFactor))) + (this.size / (this.position.z + (this.size * zSizeFactor)))),
                       new Vector2((this.position.x / (this.position.z + (this.size * zSizeFactor))) + (this.size / (this.position.z + (this.size * zSizeFactor))), (this.position.y / (this.position.z + (this.size * zSizeFactor))) + (this.size / (this.position.z + (this.size * zSizeFactor))))
                      ];
    }
};

const COLOURS = {
    0: "rgba(105, 205, 205)",
    1: "rgba(85, 185, 185)",
    2: "rgba(65, 165, 165)",
    4: "rgba(45, 145, 145)",
    8: "rgba(25, 125, 125)",
    16: "rgba(5, 105, 105)",
    32: "rgba(0, 85, 85)",
    64: "rgba(0, 65, 65)",
    128: "rgba(0, 45, 45)",
    256: "rgba(0, 25, 25)",
    512: "rgba(0, 5, 5)",
    1024: "rgba(0, 0, 0)",
    2048: "rgba(255, 255, 255)",
}

var screenShift = 256;
var zSizeFactor = 0.01;

const KEYMODE = {
    MOVE: 0,
    PUSH: 1
}

var keyMode = KEYMODE.MOVE;

var clickSound = document.getElementById("clickSound");

var selected = new Vector3(1, 1, 0);

// 0, 0, 50
var easterEggs = [new Cube(new Vector3(-400, -400, -590), 800, 1), new Cube(new Vector3(600, -400, -590), 800, 3), new Cube(new Vector3(1600, -400, -590), 800, 5), new Cube(new Vector3(2600, -400, -590), 800, 7)];

// 72, 20, -750
var easterEgg2 = new Cube(new Vector3(71600, 19600, 9010), 800, "garfield");

var cubes = Array(4).fill().map(() => Array(4).fill().map(() => Array(4).fill(0)));
var pCubes = Array(4).fill().map(() => Array(4).fill().map(() => Array(4).fill(0)));

function setPCubesFromCubes() {
    for (var a = 0; a < 4; a++) {
        for (var b = 0; b < 4; b++) {
            for (var d = 0; d < 4; d++) {
                pCubes[a][b][d] = cubes[a][b][d];
            }
        }
    }
}
function setCubesFromPCubes() {
    for (var a = 0; a < 4; a++) {
        for (var b = 0; b < 4; b++) {
            for (var d = 0; d < 4; d++) {
                cubes[a][b][d] = pCubes[a][b][d];
            }
        }
    }
}

function addCube() {
    var tempCheck = false;
    for (var l = 0; l < 4; l++) {
        for (var m = 0; m < 4; m++) {
            for (var n = 0; n < 4; n++) {
                if (cubes[l][m][n].value == 0) {
                    tempCheck = true;
                }
            }
        }
    }
    if (tempCheck) {
        var added = false;
        var tempx, tempy, tempz;
        while (!added) {
            tempx = Math.floor(Math.random() * 4);
            tempy = Math.floor(Math.random() * 4);
            tempz = Math.floor(Math.random() * 4);
            if (cubes[tempx][tempy][tempz].value == 0) {
                cubes[tempx][tempy][tempz].value = 2;
                added = true;
            }
        }
    } else {
        // cannot add cube
    }
}

var timer = 0;
var timerThreshold = 10;

var renderShadowOrder = [0, 1, 5, 4, 0,
    1, 3, 7, 5, 1,
    6, 7, 3, 2, 6,
    0, 4, 6, 2, 0
   ];

function renderShadow(cube, shadowColour) {
    if (cube.position.z > 0) {
        for (var r = 0; r < renderShadowOrder.length; r++) {
            if (cube.position.z > 0) {
                if (r % 5 == 0) {
                    ctx.beginPath();
                    ctx.moveTo(screenShift + cube.points[renderShadowOrder[r]].x, screenShift + cube.points[renderShadowOrder[r]].y);
                }
                ctx.lineTo(screenShift + cube.points[renderShadowOrder[r]].x, screenShift + cube.points[renderShadowOrder[r]].y);
                if (r % 5 == 4) {
                    ctx.closePath();
                    ctx.fillStyle = shadowColour;
                    ctx.fill();
                }
            }
        }
    }
}

var renderFillOrder = [0, 1, 3, 2, 0];

function renderFill(cube, fillColour) {
    if (cube.position.z > 0) {
        ctx.beginPath();
        ctx.moveTo(screenShift + cube.points[0].x, screenShift + cube.points[0].y);
        for (var r = 1; r < renderFillOrder.length; r++) {
            ctx.lineTo(screenShift + cube.points[renderFillOrder[r]].x, screenShift + cube.points[renderFillOrder[r]].y);
        }
        ctx.closePath();
        ctx.fillStyle = fillColour;
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        if (typeof cube.value != "string") {
            if (cube.value == 0) {
                // do nothing
            } else if (cube.value < 10) {
                ctx.font = String(500 / cube.position.z) + "px Arial";
                ctx.fillText(cube.value, screenShift + cube.points[0].x + (240 / cube.position.z), screenShift + cube.points[0].y + (600 / cube.position.z));
            } else if (cube.value < 100) {
                ctx.font = String(500 / cube.position.z) + "px Arial";
                ctx.fillText(cube.value, screenShift + cube.points[0].x + (100 / cube.position.z), screenShift + cube.points[0].y + (600 / cube.position.z));
            } else if (cube.value < 1000) {
                ctx.font = String(400 / cube.position.z) + "px Arial";
                ctx.fillText(cube.value, screenShift + cube.points[0].x + (60 / cube.position.z), screenShift + cube.points[0].y + (550 / cube.position.z));
            } else if (cube.value < 10000) {
                ctx.font = String(300 / cube.position.z) + "px Arial";
                ctx.fillText(cube.value, screenShift + cube.points[0].x + (60 / cube.position.z), screenShift + cube.points[0].y + (530 / cube.position.z));
            }
        } else {
            if (cube.value == "garfield") {
                // ctx.drawImage(garfield, 0, 0, 164, 172, screenShift + cube.points[0].x, screenShift + cube.points[0].y, Math.abs(cube.points[3].x - cube.points[0].x), Math.abs(cube.points[3].y - cube.points[0].y));
            }
        }
    }
}

function game() {
    timer++;
    ctx.beginPath();
    ctx.fillStyle = "rgba(155, 255, 255)";
    ctx.fillRect(0, 0, 512, 512);

    // update cubes
    if (keyMode == KEYMODE.MOVE) {
        for (var k = 3; k > -1; k--) {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (keys["a"] && timer > timerThreshold) {
                        selected.x -= 1;
                        timer = 0;
                    }
                    if (keys["d"] && timer > timerThreshold) {
                        selected.x += 1;
                        timer = 0;
                    }
                    if (keys["w"] && timer > timerThreshold) {
                        selected.y -= 1;
                        timer = 0;
                    }
                    if (keys["s"] && timer > timerThreshold) {
                        selected.y += 1;
                        timer = 0;
                    }
                    if (keys["ArrowUp"] && timer > timerThreshold) {
                        selected.z -= 1;
                        timer = 0;
                    }
                    if (keys["ArrowDown"] && timer > timerThreshold) {
                        selected.z += 1;
                        timer = 0;
                    }
    
                    cubes[i][j][k].position.x += ((-400 + (i * 1000) - (selected.x * 1000)) - cubes[i][j][k].position.x) / 5
                    cubes[i][j][k].position.y += ((-400 + (j * 1000) - (selected.y * 1000)) - cubes[i][j][k].position.y) / 5
                    cubes[i][j][k].position.z += ((10 + (k * 12) + (selected.z * 12)) - cubes[i][j][k].position.z) / 5
                    
                    cubes[i][j][k].setPoints();
                }
            }
        }
    } else if (keyMode == KEYMODE.PUSH) {
        var tempMoved = false;
        if (keys["a"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 1; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    for (var k = 0; k < 4; k++) {
                        var check = false;
                        for (var i2 = (i - 1); i2 > -1; i2--) {
                            if (cubes[i2][j][k].value != 0) {
                                if (pCubes[i2][j][k].value == cubes[i][j][k].value) {
                                    cubes[i2][j][k].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i2 + 1][j][k].value = cubes[i][j][k].value;
                                    if (i != (i2 + 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[0][j][k].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                        // if (i != 3) {
                        //     cubes[i][j][k].value = cubes[i + 1][j][k].value;
                        // } else {
                        //     cubes[i][j][k].value = 0;
                        // }
                    }
                }
            }
        }
        if (keys["d"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 2; i > -1; i--) {
                for (var j = 0; j < 4; j++) {
                    for (var k = 0; k < 4; k++) {
                        var check = false;
                        for (var i2 = (i + 1); i2 < 4; i2++) {
                            if (cubes[i2][j][k].value != 0) {
                                if (pCubes[i2][j][k].value == cubes[i][j][k].value) {
                                    cubes[i2][j][k].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i2 - 1][j][k].value = cubes[i][j][k].value;
                                    if (i != (i2 - 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[3][j][k].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                    }
                }
            }
        }
        if (keys["w"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 0; i < 4; i++) {
                for (var j = 1; j < 4; j++) {
                    for (var k = 0; k < 4; k++) {
                        var check = false;
                        for (var j2 = (j - 1); j2 > -1; j2--) {
                            if (cubes[i][j2][k].value != 0) {
                                if (pCubes[i][j2][k].value == cubes[i][j][k].value) {
                                    cubes[i][j2][k].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i][j2 + 1][k].value = cubes[i][j][k].value;
                                    if (j != (j2 + 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[i][0][k].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                    }
                }
            }
        }
        if (keys["s"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 0; i < 4; i++) {
                for (var j = 2; j > -1; j--) {
                    for (var k = 0; k < 4; k++) {
                        var check = false;
                        for (var j2 = (j + 1); j2 < 4; j2++) {
                            if (cubes[i][j2][k].value != 0) {
                                if (pCubes[i][j2][k].value == cubes[i][j][k].value) {
                                    cubes[i][j2][k].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i][j2 - 1][k].value = cubes[i][j][k].value;
                                    if (j != (j2 - 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[i][3][k].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                    }
                }
            }
        }
        if (keys["ArrowDown"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    for (var k = 1; k < 4; k++) {
                        var check = false;
                        for (var k2 = (k - 1); k2 > -1; k2--) {
                            if (cubes[i][j][k2].value != 0) {
                                if (pCubes[i][j][k2].value == cubes[i][j][k].value) {
                                    cubes[i][j][k2].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i][j][k2 + 1].value = cubes[i][j][k].value;
                                    if (k != (k2 + 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[i][j][0].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                    }
                }
            }
        }
        if (keys["ArrowUp"] && timer > timerThreshold) {
            timer = 0;
            tempMoved = true;
            setPCubesFromCubes();
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    for (var k = 2; k > -1; k--) {
                        var check = false;
                        for (var k2 = (k + 1); k2 < 4; k2++) {
                            if (cubes[i][j][k2].value != 0) {
                                if (pCubes[i][j][k2].value == cubes[i][j][k].value) {
                                    cubes[i][j][k2].value *= 2;
                                    cubes[i][j][k].value = 0;
                                } else {
                                    cubes[i][j][k2 - 1].value = cubes[i][j][k].value;
                                    if (k != (k2 - 1)) {
                                        cubes[i][j][k].value = 0;
                                    }
                                }
                                check = true;
                                break;
                            }
                        }
                        if (!check) {
                            cubes[i][j][3].value = cubes[i][j][k].value;
                            cubes[i][j][k].value = 0;
                        }
                    }
                }
            }
        }

        for (var k = 3; k > -1; k--) {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    cubes[i][j][k].position.x += ((-400 + (i * 1000) - (selected.x * 1000)) - cubes[i][j][k].position.x) / 5
                    cubes[i][j][k].position.y += ((-400 + (j * 1000) - (selected.y * 1000)) - cubes[i][j][k].position.y) / 5
                    cubes[i][j][k].position.z += ((10 + (k * 12) + (selected.z * 12)) - cubes[i][j][k].position.z) / 5
                    
                    cubes[i][j][k].setPoints();
                }
            }
        }
    }

    if (tempMoved) {
        clickSound.play();
        addCube();
        addCube();
        addCube();
        addCube();
    }

    // update easter egg positions
    for (var egg = 0; egg < easterEggs.length; egg++) {
        easterEggs[egg].position.x += ((-400 + (egg * 1000) - (selected.x * 1000)) - easterEggs[egg].position.x) / 5
        easterEggs[egg].position.y += ((-400 - (selected.y * 1000)) - easterEggs[egg].position.y) / 5
        easterEggs[egg].position.z += ((-590 + (selected.z * 12)) - easterEggs[egg].position.z) / 5
        
        easterEggs[egg].setPoints();
    }

    easterEgg2.position.x += ((71600 - (selected.x * 1000)) - easterEgg2.position.x) / 5
    easterEgg2.position.y += ((19600 - (selected.y * 1000)) - easterEgg2.position.y) / 5
    easterEgg2.position.z += ((9010 + (selected.z * 12)) - easterEgg2.position.z) / 5
    
    easterEgg2.setPoints();

    if (keys[" "] && timer > timerThreshold) {
        timer = 0;
        keyMode = (keyMode + 1) % 2;
    }

    // draw cubes
    for (var k = 3; k > -1; k--) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                renderShadow(cubes[i][j][k], "rgba(55, 105, 105, 127)");
            }
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                renderFill(cubes[i][j][k], COLOURS[cubes[i][j][k].value]);
            }
        }
    }

    // draw easter eggs
    for (var egg = 0; egg < easterEggs.length; egg++) {
        renderShadow(easterEggs[egg], "rgba(55, 0, 0, 127)");
    }
    for (var egg = 0; egg < easterEggs.length; egg++) {
        renderFill(easterEggs[egg], "rgba(255, 0, 0)");
    }

    renderShadow(easterEgg2, "rgba(0, 0, 0)");
    renderFill(easterEgg2, "rgba(255, 255, 255)");

    // draw move/push status
    ctx.beginPath();
    if (keyMode == KEYMODE.MOVE) {
        ctx.fillStyle = "rgba(0, 255, 0)"
    } else if (keyMode == KEYMODE.PUSH) {
        ctx.fillStyle = "rgba(255, 0, 0)"
    }
    ctx.fillRect(0, 0, 20, 20);
    ctx.beginPath();
    ctx.fillStyle = "#000044";
    ctx.font = "20px Arial";
    if (keyMode == KEYMODE.MOVE) {
        ctx.fillText("Maneuver", 25, 17);
    } else if (keyMode == KEYMODE.PUSH) {
        ctx.fillText("Combine", 25, 17);
    }
}

function init() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            for (var k = 0; k < 4; k++) {
                cubes[i][j][k] = new Cube(new Vector3(-400 + (i * 1000), -400 + (j * 1000), 10 + (12 * k)), 800, 0);
                pCubes[i][j][k] = new Cube(new Vector3(-400 + (i * 1000), -400 + (j * 1000), 10 + (12 * k)), 800, 0);
            }
        }
    }

    addCube();
    addCube();

    setPCubesFromCubes();

    timer = 40;
}

class Button {
    constructor(x, y, w, h, tx, ty, ts, text, colour, highlightColour, clickColour, textColour, textHighlightColour, textClickColour) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tx = tx;
        this.ty = ty;
        this.ts = ts;
        this.text = text;
        this.colour = colour;
        this.highlightColour = highlightColour;
        this.clickColour = clickColour;
        this.textColour = textColour;
        this.textHighlightColour = textHighlightColour;
        this.textClickColour = textClickColour;
        this.hovering = false;
        this.clicked = false;
    }

    hover() {
        if (mouseX > this.x && mouseX < (this.x + this.w) && mouseY > this.y && mouseY < (this.y + this.h)) {
            if (mouseDown) {
                this.clicked = true;
            } else {
                this.clicked = false;
            }
            this.hovering = true;
        } else {
            this.clicked = false;
            this.hovering = false;
        }
    }

    render() {
        ctx.beginPath();
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.clickColour;
            } else {
                ctx.fillStyle = this.highlightColour;
            }
        } else {
            ctx.fillStyle = this.colour;
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.beginPath();
        ctx.font = String(this.ts) + "px Comic Sans MS";
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.textClickColour;
            } else {
                ctx.fillStyle = this.textHighlightColour;
            }
        } else {
            ctx.fillStyle = this.textColour;
        }
        ctx.fillText(this.text, this.tx, this.ty);
    }
}

var playButton;

function title() {
    // background
    ctx.beginPath();
    ctx.fillStyle = "rgba(155, 255, 255)";
    ctx.fillRect(0, 0, 512, 512);

    // title
    ctx.beginPath();
    ctx.font = "80px Comic Sans MS";
    ctx.fillStyle = "#000000";
    ctx.fillText("2048 3D", 95, 105);
    ctx.fillStyle = "#00bbbb";
    ctx.fillText("2048 3D", 90, 100);

    // credit
    ctx.beginPath();
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "#000000";
    ctx.fillText("By Zasharan2", 165, 145);
    ctx.fillStyle = "#00bbbb";
    ctx.fillText("By Zasharan2", 163, 143);

    // play button
    playButton.hover();
    playButton.render();

    if (playButton.clicked) {
        gameScreen = SCREENTYPE.TITLE_TO_GAME;
    }
}

function main() {
    switch (gameScreen) {
        case (SCREENTYPE.NULL_TO_TITLE): {
            timer = 40;
            playButton = new Button(200, 170, 120, 40, 230, 200, 30, "Play", "rgba(55, 155, 155)", "rgba(205, 255, 255)", "rgba(255, 255, 255)", "rgba(0, 55, 55)", "rgba(0, 155, 155)", "rgba(255, 255, 255)");
            gameScreen = SCREENTYPE.TITLE;
            break;
        }
        case (SCREENTYPE.TITLE): {
            title();
            break;
        }
        case (SCREENTYPE.TITLE_TO_GAME): {
            init();
            gameScreen = SCREENTYPE.GAME;
            break;
        }
        case (SCREENTYPE.GAME): {
            game();
            break;
        }
    }
    window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);
