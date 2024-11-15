let canvas, ctx;

let grid = []
let cameraPos = { x: 0, y: 0 }
const settings = {
    windowSizePixels: null,
    windowSizeMap: null,
    blockSizeScreen: null,
    blockSizeMap: null,
    cellSize: 256,
    mapSize: {
        x: 100,
        y: 100,
    }
}
const images = {
    grass: {
        url: "img/grass.png"
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

window.addEventListener("resize", Resize);

function Resize() {
    settings.windowSizePixels = {
        width: window.innerWidth / settings.cellSize,
        height: window.innerHeight / settings.cellSize
    }
    settings.blockSizeScreen = {
        width: settings.cellSize / window.innerWidth,
        height: settings.cellSize / window.innerHeight
    }
    settings.windowSizeMap = {
        width: (1 / settings.blockSizeScreen.width) / settings.mapSize.x,
        height: (1 / settings.blockSizeScreen.height) / settings.mapSize.y
    }



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
    Resize();
    setInterval(update, 10);
    draw();
}

function update() {

}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (let y = 0; y < grid.length; y++) {
        const posY = (y - (grid.length / 2)) / settings.mapSize.y;
        for (let x = 0; x < grid[y].length; x++) {
            const posX = (x - (grid[y].length / 2)) / settings.mapSize.x;
            if (posX < cameraPos.x - (settings.windowSizeMap.width / 2) - (1 / settings.mapSize.x) ||
                posX > cameraPos.x + (settings.windowSizeMap.width / 2) + (1 / settings.mapSize.x) || posY < cameraPos.y - (settings.windowSizeMap.height / 2) - (1 / settings.mapSize.y) ||
                posY > cameraPos.y + (settings.windowSizeMap.height / 2) + (1 / settings.mapSize.y)) {
                continue;
            }

            const blockScreenPos = {
                x: (window.innerWidth / 2) + ((posX / (settings.windowSizeMap.width / 2)) * (window.innerWidth / 2)), y: (window.innerHeight / 2) + ((posY / (settings.windowSizeMap.height / 2)) * (window.innerHeight / 2))
            }

            ctx.drawImage(grid[y][x].image, blockScreenPos.x - (settings.cellSize / 2) - 1, blockScreenPos.y - (settings.cellSize / 2) - 1, settings.cellSize + 2, settings.cellSize + 2);
        }
    }

    window.requestAnimationFrame(draw);
}