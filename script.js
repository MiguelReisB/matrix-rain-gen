const WIDTH = 900, HEIGHT = 600; // Must be equal to the canvas size in rain.html and capture.py
const FONT_SIZE = 33, PATH_SIZE = 14; // Font-size (no shit, Sherlock) and the number of characters in a path (the "tail" of the rain)
const COLOR = '30, 144, 255'; // RGB color of the rain (in this case, DodgerBlue)
const CHARACTERS = 'アイウエオカキクケコサシスセソ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]'; // Characters used in the rain (you can change them to whatever you want)

const FPS = 25; // You can tell what this does, right?
const SECONDS_RAIN = 10; // Duration of the rain in seconds
const SECONDS_EMPTY = 0.1; // The time the canvas is empty after the rain ends (to avoid a sudden cut)
const FRAMES_RAIN = FPS * SECONDS_RAIN;
const FRAMES_TOTAL = Math.round(FRAMES_RAIN + FPS * SECONDS_EMPTY);

// Seed for the random number generator, can be set via URL parameter (e.g., ?seed=123)
const SEED = Number(new URLSearchParams(location.search).get('seed') ?? 1);
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
const rngSchedule = mulberry32(SEED);

// Get the canvas context and calculate the number of columns and lines based on the font size
const ctx = document.getElementById('c').getContext('2d');
const columns = Math.floor(WIDTH / FONT_SIZE);
const lines = Math.floor(HEIGHT / FONT_SIZE);

// Calculate the velocity of the rain and the number of frames needed for a character to traverse the screen
const velForFrame = 20 / FPS;
const framesForChar = Math.ceil((lines + PATH_SIZE) / velForFrame);

// Generate the schedule for when each column of rain starts, based on the random number generator
const cron = Array.from({ length: columns }, () => {
    const starts = [];
    let t = 1 + Math.floor(rngSchedule() * FPS * 4);
    while (t + framesForChar <= FRAMES_RAIN) {
        starts.push(t);
        t += framesForChar + Math.floor(rngSchedule() * FPS * 1.7);
    }
    return starts;
});

// Function to draw a single frame of the rain animation
function writeFrame(q) {

    const rngChars = mulberry32(SEED * 100003 + q);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.font = `${FONT_SIZE}px monospace`;
    cron.forEach((starts, i) => {
        const x = i * FONT_SIZE + FONT_SIZE / 2;
        starts.forEach((start) => {                 
            if (q < start) return;
            const head = (q - start) * velForFrame;
            if (head - PATH_SIZE > lines) return;
            for (let k = 0; k < PATH_SIZE; k++) {
                const y = (head - k) * FONT_SIZE;
                if (y < 0 || y > HEIGHT) continue;
                const alpha = k === 0 ? 0.95 : Math.max(0, 0.55 - (k / PATH_SIZE) * 0.55);
                if (alpha <= 0) continue;
                ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
                ctx.fillText(CHARACTERS[Math.floor(rngChars() * CHARACTERS.length)], x, y);
            }
        });
    });
}

// Expose the constants and the writeFrame function to the global window object for use in other scripts
window.FRAMES_TOTAL = FRAMES_TOTAL;
window.FPS = FPS;
window.writeFrame = writeFrame;