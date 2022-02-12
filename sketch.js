const HEIGHT = 600;
const WIDTH = 800;
const MAP_WIDTH = 600;


const shallowWaterDepth = 0.01;

let seedInput, redrawMapButton, randomizeSeedCheckbox, ridgesSlider, waterLevelSlider;
let seed = 42;
const zoom = 0.02;

let elevationMap;

function ridgeNoise(nx, ny) {
    return 2 * (0.5 - abs(0.5 - noise(nx, ny)));
}

function generateElevationMap() {
    console.log('Generating elevation map.')

    if (randomizeSeedCheckbox.checked()) {
        seed = random(0, 1000);
        seedInput.value(seed);
    } else {
        seed = seedInput.value();
    }
    noiseSeed(seed);

    let maxHeight = 0;
    let minHeight = 0;

    elevationMap = new Array(MAP_WIDTH);

    for (let x = 0; x < MAP_WIDTH; x++) {
        elevationMap[x] = new Array(HEIGHT);
    }

    for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {

            const zoomX = x;
            const zoomY = y;

            const nx = x / MAP_WIDTH - 0.5;
            const ny = y / HEIGHT - 0.5;


            // Perlin noise
            let perlinNoiseValue = noise(x * zoom, y * zoom);


            let ridgeNoiseValue = ridgeNoise(x * zoom, y * zoom);

            const factor = 1 - ridgesSlider.value();

            let elevation = factor * perlinNoiseValue + (1-factor)* ridgeNoiseValue;
            // elevation = Math.pow(elevation, 3);
            // let elevation = ridgeNoise(nx, ny);

            // Cone
            // const topLimit = (-sqrt(nx*nx + ny*ny) / sqrt(0.5) + 0.5) * 2;

            // "Rounded" Cone
            // const topLimit = sqrt((-sqrt(nx*nx + ny*ny) / sqrt(0.5) + 0.5) * 2);

            // Dome
            const topLimit = -4 * Math.pow(nx, 2) -4 * Math.pow(ny, 2) + 1;

            elevation = Math.pow(elevation, 5);
            elevation = elevation * topLimit;

            if (elevation > maxHeight) {
                maxHeight = elevation;
            }

            if (elevation < minHeight) {
                minHeight = elevation;
            }

            elevationMap[x][y] = elevation;
        }
    }

    console.log('maxElevation', maxHeight)
    console.log('minElevation', minHeight)

    for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            let elevation = elevationMap[x][y];
            elevationMap[x][y] = elevation / maxHeight;
        }
    }

}

function getBiomeColor(e) {
    const waterLevel = waterLevelSlider.value();

    if (e < waterLevel-shallowWaterDepth) return '#345daf';
    else if (e < waterLevel) return '#3b8ac4';
    else if (e < 0.25) return '#92D19C';
    else if (e < 0.45) return '#739979';
    else if (e < 0.7) return '#E4D6BF';
    else return '#FFFFFF';
}

function drawMap() {
    background(220);

    console.log('Drawing map.')

    for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            const elevation = elevationMap[x][y];
            stroke(getBiomeColor(elevation))
            point(x, y);
        }
    }
}


function setup() {
    createCanvas(WIDTH, HEIGHT);

    randomizeSeedCheckbox = createCheckbox('Randomize seed', true);
    randomizeSeedCheckbox.position(MAP_WIDTH + 20, 40);

    seedInput = createInput();
    seedInput.position(MAP_WIDTH + 20, 60);

    const ridgesLabel = createElement('span', 'Ridges');
    ridgesLabel.position(MAP_WIDTH + 20, 90);
    ridgesSlider = createSlider(0, 1, 0.15, 0.01);
    ridgesSlider.position(MAP_WIDTH + 20, 110);



    const waterLevelLabel = createElement('span', 'Water level');
    waterLevelLabel.position(MAP_WIDTH + 20, 130);
    waterLevelSlider = createSlider(0, 1, 0.05, 0.01);
    waterLevelSlider.position(MAP_WIDTH + 20, 150);
    // ridgesSlider.style('width', '80px');

    redrawMapButton = createButton('Redraw');
    redrawMapButton.position(MAP_WIDTH + 20, 180);
    redrawMapButton.mousePressed(() => {
        generateElevationMap();
        drawMap();
    });


    generateElevationMap();
    drawMap();
}



function draw() {
}
