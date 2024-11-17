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
        name: "grass",
        transitions: "water",
        url: "img/grass.png",
        subImages: {
            "grass-corner": {
                url: "img/grass-corner.png"
            },
            "grass-edge": {
                url: "img/grass-edge.png"
            },
            "grass-edge-full": {
                url: "img/grass-edge-full.png"
            },
        }
    },
    water: {
        name: "water",
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
        theImage.img.onload = imageLoaded;
        theImage.img.src = theImage.url;
        //set sub images as well
        for (subImage in theImage.subImages) {

            const sb = images[key].subImages[subImage];
            sb.img = new Image();
            sb.img.onload = imageLoaded;
            sb.img.src = sb.url;
        }
    })

    Resize();
});

function imageLoaded() {
    loadedImages++;
    let subImagesCount = 0;
    for (image in images) {
        for (subImage in images[image]) {
            subImagesCount++;
        }
    }
    if (loadedImages >= imageNames.length) {
        loadingDone();
    }
}

function Resize() {




    canvas.setAttribute("width", `${window.innerWidth}px`);
    canvas.setAttribute("height", `${window.innerHeight}px`);
}

function generateMap() {
    grid = new Array(settings.mapSize.y);
    for (let y = 0; y < grid.length; y += 1) {
        grid[y] = new Array(settings.mapSize.x)
        for (let x = 0; x < grid[y].length; x++) {
            const randomImage = images[imageNames[Math.floor(Math.random() * imageNames.length)]];
            grid[y][x] = { image: randomImage.img, name: randomImage.name, subImages: randomImage.subImages, transitions: randomImage.transitions }
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
        Resize();
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

            drawSubImages(grid[y][x].subImages, x, y, drawPosX, drawPosY)

        }
    }

    window.requestAnimationFrame(draw);
}

function drawSubImages(subImages, x, y, drawPosX, drawPosY) {
    if (!subImages) {
        return;
    }

    const name = grid[y][x].name;
    const transitions = grid[y][x].transitions;


    if (grid[y - 1] && grid[y - 1][x]?.name === transitions) {
        ctx.drawImage(grid[y][x].subImages[`${name}-edge-full`].img, drawPosX - 1, drawPosY - 1, settings.cellSize + 2, (settings.cellSize / 8) + 2);
    }
    if (grid[y + 1] && grid[y + 1][x]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-full`].img, drawPosX, drawPosY + ((14 / 15) * settings.cellSize), settings.cellSize + 2, (settings.cellSize / 8), 180);

    }

    if ((grid[y - 1] && grid[y] && grid[y + 1]) && grid[y][x + 1]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-full`].img, drawPosX, drawPosY + settings.cellSize, settings.cellSize * 2, (settings.cellSize / 8), 90);
    }
    if ((grid[y - 1] && grid[y] && grid[y + 1]) && grid[y][x - 1]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-full`].img, drawPosX - ((1 / 2) * settings.cellSize), drawPosY + ((2 / 4) * settings.cellSize), settings.cellSize, (settings.cellSize / 8), 270);
    }


    return;

    //Transition to tile above
    if (grid[y - 1] && grid[y - 1][x].name === name) {
        //Tile above is the same and no transition is needed
    }
    else if (grid[y - 1] && grid[y - 1][x - 1]?.name === transitions && grid[y - 1][x]?.name === transitions && grid[y - 1][x + 1]?.name === transitions) {
        ctx.drawImage(grid[y][x].subImages[`${name}-edge-full`].img, drawPosX, drawPosY, settings.cellSize + 2, (settings.cellSize / 8));
    }
    else if ((grid[y] && grid[y - 1]) && (grid[y][x - 1]?.name === transitions) && grid[y - 1][x - 1]?.name === transitions && grid[y - 1][x]?.name === transitions) {
        ctx.drawImage(grid[y][x].subImages[`${name}-corner`].img, drawPosX, drawPosY, (settings.cellSize / 8) + 2, (settings.cellSize / 8) + 2);
    }
    else if ((grid[y] && grid[y - 1]) && (grid[y][x + 1]?.name === transitions) && grid[y - 1][x + 1]?.name === transitions && grid[y - 1][x]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-corner`].img, drawPosX + settings.cellSize - (settings.cellSize / 8), drawPosY, (settings.cellSize / 8) + 2, (settings.cellSize / 8) + 2, 90)
    }
    else if ((grid[y - 1] && grid[y]) &&
        grid[y - 1][x]?.name === transitions &&
        grid[y][x - 1]?.name !== transitions &&
        grid[y - 1][x - 1]?.name !== transitions &&
        grid[y - 1][x + 1]?.name !== transitions &&
        grid[y][x + 1]?.name !== transitions) {

        ctx.drawImage(grid[y][x].subImages[`${name}-edge`].img, drawPosX, drawPosY, settings.cellSize + 1, (settings.cellSize / 8));
    }

    //Transition to tile to the right
    if (grid[y] && grid[y][x + 1].name === name) {
        //Tile to the right is the same and no transition is needed
    }
    else if ((grid[y - 1] && grid[y] && grid[y + 1]) && grid[y - 1][x + 1]?.name === transitions && grid[y][x + 1]?.name === transitions && grid[y + 1][x + 1]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-full`].img, drawPosX, drawPosY + settings.cellSize, settings.cellSize * 2, (settings.cellSize / 8), 90);
    }
    if ((grid[y] && grid[y + 1]) && (grid[y][x + 1]?.name === transitions) && grid[y + 1][x + 1]?.name === transitions && grid[y + 1][x]?.name === transitions) {
        drawRotatedImage(ctx, grid[y][x].subImages[`${name}-corner`].img, drawPosX + ((7 / 8) * settings.cellSize), drawPosY + ((7 / 8) * settings.cellSize), (settings.cellSize / 8) + 2, (settings.cellSize / 8) + 2, 180)
    }

}

function drawRotatedImage(ctx, image, x, y, width, height, degrees) {
    // Convert degrees to radians
    const radians = (Math.PI / 180) * degrees;

    // Save the current state of the canvas
    ctx.save();

    // Translate to the center of the image
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);

    // Rotate the canvas
    ctx.rotate(radians);

    // Draw the image, adjusting for the translation
    ctx.drawImage(image, -width / 2, -height / 2, width, height);

    // Restore the canvas to its original state
    ctx.restore();
}