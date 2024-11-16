let canvas, ctx;

let grid = []
let cameraPos = { x: 10, y: 10 }
const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
const settings = {
    cellSize: 128,
    mapSize: {
        x: 50,
        y: 20,
    },
    scrollSpeed: 0.05,
    scrollMargin: 30,
    mouseWheelStrength: 0.15
}
const images = {
    grass: {
        url: "img/grass.png"
    },
    water: {
        url: "img/water.png"
    }
};
const imageNames = Object.keys(images);
let loadedImages = 0;

window.addEventListener("load", () => {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");


    //load images then start game
    imageNames.forEach(key => {
        const theImage = images[key];
        theImage.img = new Image();
        theImage.img.onload = () => {
            loadedImages++;
            if (loadedImages >= imageNames.length) {
                loadingDone();
            }
        }
        theImage.img.src = theImage.url;
    })

    Resize();
});


function Resize() {




    canvas.setAttribute("width", `${window.innerWidth}px`);
    canvas.setAttribute("height", `${window.innerHeight}px`);
}

function generateMap() {
    grid = new Array(settings.mapSize.y);
    for (let y = 0; y < grid.length; y += 1) {
        grid[y] = new Array(settings.mapSize.x)
        for (let x = 0; x < grid[y].length; x++) {
            grid[y][x] = { image: images[imageNames[Math.floor(Math.random() * imageNames.length)]].img }
        }
    }
}

function loadingDone() {
    generateMap();
    window.addEventListener("resize", Resize);
    window.addEventListener("mousemove", (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    })
    window.addEventListener("fullscreenchange", (e) => {
        e.preventDefault();
    })
    addEventListener("mousewheel", (e) => {
        const delta = e.deltaY;
        if (delta > 0) {
            if (settings.cellSize * (1 - settings.mouseWheelStrength) > 64) {
                settings.cellSize *= (1 - settings.mouseWheelStrength);
            }

        }
        else {
            if (settings.cellSize * (1 + settings.mouseWheelStrength) < 512) {
                settings.cellSize *= (1 + settings.mouseWheelStrength);
            }
        }
    });
    Resize();
    setInterval(update, 10);
    draw();
}

function update() {
    // Scrolling the map
    if (mousePos.x < settings.scrollMargin) {
        cameraPos.x -= settings.scrollSpeed * (128 / settings.cellSize);
    }
    else if (mousePos.x > window.innerWidth - settings.scrollMargin) {
        cameraPos.x += settings.scrollSpeed * (128 / settings.cellSize);
    }

    if (mousePos.y < settings.scrollMargin) {
        cameraPos.y -= settings.scrollSpeed * (128 / settings.cellSize);
    }
    else if (mousePos.y > window.innerHeight - settings.scrollMargin) {
        cameraPos.y += settings.scrollSpeed * (128 / settings.cellSize);
    }


}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)


    const cameraX = parseInt(cameraPos.x);
    const cameraY = parseInt(cameraPos.y);

    let iteratorStartX = cameraX - parseInt((window.innerWidth / 2) / settings.cellSize) - 5;
    let iteratorStartY = cameraY - parseInt((window.innerHeight / 2) / settings.cellSize) - 5;

    let iteratorEndX = cameraX + parseInt((window.innerWidth / 2) / settings.cellSize) + 5;
    let iteratorEndY = cameraY + parseInt((window.innerHeight / 2) / settings.cellSize) + 5;

    for (let y = iteratorStartY; y < iteratorEndY; y += 1) {
        if (!grid[y]) {
            continue;
        }
        for (let x = iteratorStartX; x < iteratorEndX; x += 1) {
            if (!grid[y][x]) {
                continue;
            }

            let drawPosX = (window.innerWidth / 2) + ((x - cameraPos.x) * settings.cellSize) - (settings.cellSize / 2);
            let drawPosY = (window.innerHeight / 2) + ((y - cameraPos.y) * settings.cellSize) - (settings.cellSize / 2);



            ctx.drawImage(grid[y][x].image, drawPosX, drawPosY, settings.cellSize + 2, settings.cellSize + 2);

        }
    }

    window.requestAnimationFrame(draw);
}