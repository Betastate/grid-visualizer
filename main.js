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
    scrollSpeed: 0.02,
    scrollMargin: 30,
    mouseWheelStrength: 0.02
}
const images = {
    grass: {
        name: "grass",
        transitions: "water",
        url: "img/grass.png",
        subImages: {
            "grass-straight-left": {
                url: "img/grass-straight-left.png"
            },
            "grass-straight-right": {
                url: "img/grass-straight-right.png"
            },
            "grass-bump-left": {
                url: "img/grass-bump-left.png"
            },
            "grass-bump-right": {
                url: "img/grass-bump-right.png"
            },
            "grass-edge-left": {
                url: "img/grass-edge-left.png"
            },
            "grass-edge-right": {
                url: "img/grass-edge-right.png"
            },
        }
    },
    water: {
        name: "water",
        transitions: "rock",
        url: "img/water.png",
        subImages: {
            "water-straight-left": {
                url: "img/water-straight-left.png"
            },
            "water-straight-right": {
                url: "img/water-straight-right.png"
            },
            "water-bump-left": {
                url: "img/water-bump-left.png"
            },
            "water-bump-right": {
                url: "img/water-bump-right.png"
            },
            "water-edge-left": {
                url: "img/water-edge-left.png"
            },
            "water-edge-right": {
                url: "img/water-edge-right.png"
            },
        }
    },
    rock: {
        name: "rock",
        transitions: "grass",
        url: "img/rock.png",
        subImages: {
            "rock-straight-left": {
                url: "img/rock-straight-left.png"
            },
            "rock-straight-right": {
                url: "img/rock-straight-right.png"
            },
            "rock-bump-left": {
                url: "img/rock-bump-left.png"
            },
            "rock-bump-right": {
                url: "img/rock-bump-right.png"
            },
            "rock-edge-left": {
                url: "img/rock-edge-left.png"
            },
            "rock-edge-right": {
                url: "img/rock-edge-right.png"
            },
        }
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




    //Draw top subImages:
    if (grid[y] && grid[y - 1] && grid[y - 1][x]?.name === transitions) {

        if (grid[y][x - 1]?.name !== transitions && grid[y - 1][x - 1]?.name === transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-straight-left`].img, drawPosX - 1, drawPosY - 1, (settings.cellSize / 2 + 1), (settings.cellSize / 8) + 1);
        }
        else if (grid[y][x - 1]?.name !== transitions && grid[y - 1][x - 1]?.name !== transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-bump-left`].img, drawPosX - 1, drawPosY - 1, (settings.cellSize / 2 + 1), (settings.cellSize / 8) + 1);
        }
        else if (grid[y][x - 1]?.name === transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-edge-left`].img, drawPosX - 1, drawPosY - 1, (settings.cellSize / 2 + 1), (settings.cellSize / 8) + 1);

        }

        if (grid[y][x + 1]?.name !== transitions && grid[y - 1][x + 1]?.name === transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-straight-right`].img, drawPosX + (settings.cellSize / 2), drawPosY - 1, (settings.cellSize / 2) + ``, (settings.cellSize / 8) + 1);
        }
        else if (grid[y][x + 1]?.name !== transitions && grid[y - 1][x + 1]?.name !== transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-bump-right`].img, drawPosX + (settings.cellSize / 2), drawPosY - 1, (settings.cellSize / 2) + ``, (settings.cellSize / 8) + 1);
        }
        else if (grid[y][x + 1]?.name === transitions) {
            ctx.drawImage(grid[y][x].subImages[`${name}-edge-right`].img, drawPosX + (settings.cellSize / 2), drawPosY - 1, (settings.cellSize / 2) + ``, (settings.cellSize / 8) + 1);
        }
    }

    //Draw right subimages:
    if (grid[y] && grid[y - 1] && grid[y + 1] && grid[y][x + 1]?.name === transitions) {

        if (grid[y - 1][x]?.name !== transitions && grid[y - 1][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-left`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY - 1 + (settings.cellSize * (4 / 16)), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 90);
        }
        else if (grid[y - 1][x]?.name !== transitions && grid[y - 1][x + 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-left`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY - 1 + (settings.cellSize * (4 / 16)), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 90);
        }
        else if (grid[y - 1][x]?.name === transitions && grid[y][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-left`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY - 1 + (settings.cellSize * (5 / 16)), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 90);
        }

        if (grid[y + 1][x]?.name !== transitions && grid[y + 1][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-right`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY - 3 + (settings.cellSize * (12 / 16)), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 90);
        }
        else if (grid[y + 1][x]?.name !== transitions && grid[y + 1][x + 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-right`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY + (settings.cellSize * (12 / 16)), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 90);
        }
        else if (grid[y + 1][x]?.name === transitions && grid[y][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-right`].img, drawPosX + (settings.cellSize * (15 / 16)), drawPosY + (settings.cellSize * (12 / 16)), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 90);
        }
    }

    //Draw bottom subimages:
    if (grid[y] && grid[y + 1] && grid[y + 1][x]?.name === transitions) {

        if (grid[y][x + 1]?.name !== transitions && grid[y + 1][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-left`].img, drawPosX + ((3 / 4) * settings.cellSize), drawPosY + ((15 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 180)
        }
        else if (grid[y][x + 1]?.name !== transitions && grid[y + 1][x + 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-left`].img, drawPosX + ((3 / 4) * settings.cellSize), drawPosY + ((15 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 180)
        }
        else if (grid[y][x + 1]?.name === transitions && grid[y][x + 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-left`].img, drawPosX + ((11 / 16) * settings.cellSize), drawPosY + ((15 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 180)
        }

        if (grid[y][x - 1]?.name !== transitions && grid[y + 1][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-right`].img, drawPosX + (settings.cellSize / 4), drawPosY + ((15 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 180)
        }
        else if (grid[y][x - 1]?.name !== transitions && grid[y + 1][x - 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-right`].img, drawPosX + (settings.cellSize / 4), drawPosY + ((15 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 180)
        }
        else if (grid[y][x - 1]?.name === transitions && grid[y][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-right`].img, drawPosX + ((1 / 4) * settings.cellSize), drawPosY + ((15 / 16) * settings.cellSize), (settings.cellSize / 2 + 1), (settings.cellSize / 8) + 1, 180)
        }
    }

    //Draw left subimages:
    if (grid[y] && grid[y - 1] && grid[y + 1] && grid[y][x - 1]?.name === transitions) {

        if (grid[y + 1][x]?.name !== transitions && grid[y + 1][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-left`].img, drawPosX, drawPosY + ((3 / 4) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 270);
        }
        else if (grid[y + 1][x]?.name !== transitions && grid[y + 1][x - 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-left`].img, drawPosX, drawPosY + ((13 / 16) * settings.cellSize), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 270);
        }
        else if (grid[y + 1][x]?.name === transitions && grid[y][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-left`].img, drawPosX - 1, drawPosY - 1 + (settings.cellSize * (11 / 16)), ((settings.cellSize / 2) + 1), (settings.cellSize / 8) + 1, 270);
        }

        if (grid[y - 1][x]?.name !== transitions && grid[y - 1][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-straight-right`].img, drawPosX - 1, drawPosY - 1 + ((2 / 8) * settings.cellSize), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 270);
        }
        else if (grid[y - 1][x]?.name !== transitions && grid[y - 1][x - 1]?.name !== transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-bump-right`].img, drawPosX, drawPosY + ((3 / 16) * settings.cellSize), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 270);
        }
        else if (grid[y - 1][x]?.name === transitions && grid[y][x - 1]?.name === transitions) {
            drawRotatedImage(ctx, grid[y][x].subImages[`${name}-edge-right`].img, drawPosX, drawPosY + ((5.25 / 16) * settings.cellSize), ((settings.cellSize / 2) + 4), (settings.cellSize / 8) + 2, 270);
        }
    }


}

function drawRotatedImage(ctx, image, x, y, width, height, degrees) {
    // Convert degrees to radians
    const radians = (Math.PI / 180) * degrees;

    // Save the current state of the canvas
    ctx.save();

    // Translate to the center of the image
    const centerX = x;
    const centerY = y;
    ctx.translate(centerX, centerY);

    // Rotate the canvas
    ctx.rotate(radians);

    // Draw the image, adjusting for the translation
    ctx.drawImage(image, -width / 2, -height / 2, width, height);

    // Restore the canvas to its original state
    ctx.restore();
}