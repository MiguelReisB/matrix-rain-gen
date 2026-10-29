import io
import os
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

# Constants for the file paths and settings
BASE_DIR = Path(__file__).resolve().parent
URL = (BASE_DIR / "rain.html").resolve().as_uri()
OUTPUT = BASE_DIR / "matrixRain.webp"

WIDTH, HEIGHT = 900, 600          # Must be equal to the canvas width and height in rain.html and script.js
SEED = 4                          # Change the value here for a whole differente generated character rain
WORKERS = os.cpu_count() or 4     # Number of parallel processes to use (Consumes some RAM)
CLIP = {"x": 0, "y": 0, "width": WIDTH, "height": HEIGHT}


def capture_range(args):
    """Capture the frames [start, end] in a separate browser (chromium)."""
    start, end = args
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT}) 
        page.goto(f"{URL}?seed={SEED}")
        out = []
        for q in range(start, end):
            page.evaluate("q => writeFrame(q)", q)
            png = page.screenshot(omit_background=True, clip=CLIP)
            out.append((q, png))
        browser.close()
    return out


if __name__ == "__main__":        # Mandatory for Windows, but also good practice for Linux and MacOS
    t0 = time.perf_counter()

    # Finds the total number of frames and the FPS of the animation
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": WIDTH, "height": HEIGHT})
        pg.goto(f"{URL}?seed={SEED}")
        total = int(pg.evaluate("FRAMES_TOTAL"))
        fps = int(pg.evaluate("FPS"))
        b.close()

    # Divides the total number of frames into ranges for each worker process
    passo = -(-total // WORKERS)
    faixas = [(i, min(i + passo, total)) for i in range(0, total, passo)]

    with ProcessPoolExecutor(len(faixas)) as ex:
        resultados = [item for lote in ex.map(capture_range, faixas) for item in lote]

    resultados.sort(key=lambda r: r[0])
    frames = [Image.open(io.BytesIO(png)).convert("RGBA") for _, png in resultados]
    print(f"captura: {time.perf_counter() - t0:.0f}s") # Just shows the time it took to capture the frames

    t1 = time.perf_counter()
    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=round(1000 / fps), # Duration of each frame in milliseconds
        loop=0, # Always repeat
        lossless=False, 
        quality=90, # General quality of the webp (0-100, higher is better)
        alpha_quality=100, # Preserves the alpha channel quality (smooth edges of the characters)
        method=4, # 0 - fastest (less compression), 6 - slowest (more compression)
        exact=False, # False dispose the information the invisible pixels, True keeps the information of the invisible pixels (which is not necessary for this case)
    )
    print(f"codificação: {time.perf_counter() - t1:.0f}s") # And here the time it took to encode the frames into a webp