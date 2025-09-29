import { $D } from "dathor-helpers"; // Assuming this helper provides typed DOM access

import { GameAssets } from "../global/GameAssets";

import { TILE_BLUEPRINTS } from "./TileBluePrints";
import { getTileProperties } from "../utils/tileEntityHelpers";
import { IGameAsset } from "../interface/IGameAsset";
import { IGameTexture } from "../interface/ITexture";


function areRowsSameSize(matrix: any[]) {
    // 1. Handle edge cases: If the matrix is empty or null, it technically
    // doesn't violate the "same size" rule for its rows.
    if (!Array.isArray(matrix) || matrix.length === 0) {
        console.log("Input is empty or not an array. Returning true.");
        return true;
    }

    // 2. Get the expected size from the first row.
    const expectedSize = matrix[0].length;

    // 3. Iterate over the rest of the rows and check their length.
    // We use Array.prototype.every() for a concise check.
    const allSameSize = matrix.every((row, index) => {
        const isSame = row.length === expectedSize;
        if (!isSame) {
            console.error(`Row size mismatch detected!`);
            console.error(`Row 0 size: ${expectedSize}`);
            console.error(`Row ${index} size: ${row.length}`);
        }
        return isSame;
    });

    return allSameSize;
}


// Global Grid Constants
const TILE_SIZE = 32;
const INITIAL_COLS = 60;
const INITIAL_ROWS = 16;
const PANNING_STEP = TILE_SIZE * 2; // Pan by 2 tiles at a time

// Fixed Viewport Constants (What the user sees)
const VIEWPORT_WIDTH_TILES = 30;
const VIEWPORT_HEIGHT_TILES = 20;
const VIEWPORT_WIDTH = VIEWPORT_WIDTH_TILES * TILE_SIZE; // 960px
const VIEWPORT_HEIGHT = VIEWPORT_HEIGHT_TILES * TILE_SIZE; // 640px



const preloaded = [
                    [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0xa0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x02, 0x00, 0x70, 0x70, 0x90, 0x02, 0x05, 0x80, 0x00, 0x70, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0xa0, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x30, 0x00, 0x03, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x51, 0x00, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x42, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x40, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x00, 0x00, 0x00, 0x51, 0x00, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xa1, 0x42, 0x00, 0xa0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x01],
                    [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01],
                ];

export class DesignerApp {
    canvas;
    ctx;
    paletteOptions;
    selectedTileDisplay;
    saveButton;
    dimsDisplay;
    selectedTileNameDisplay;
    levelMap: number[][] = [];
    selectedTileId: number | undefined;
    isDrawing = false;
    cols = INITIAL_COLS;
    rows = INITIAL_ROWS;
    viewPort = { x: 0, y: 0 };
    assets: { [key: string]: IGameTexture; } | undefined;
    gridLines: any;





    getAssets(): void {

        // temporary setup, should be fetched from resource storage

        this.assets = {
            "solid-1": GameAssets.createTexture("tileset_1", 0, 0, 32, 32, false)!,
            "solid-2": GameAssets.createTexture("tileset_1", 64, 0, 32, 32, false)!,
            "solid-3": GameAssets.createTexture("tileset_1", 96, 0, 32, 32, false)!,
            "solid-4": GameAssets.createTexture("tileset_1", 129, 0, 32, 32, false)!,
            "bush-1": GameAssets.createTexture("bush-1", 0, 0, 32, 16, false)!,
            "bush-2": GameAssets.createTexture("bush-2", 0, 0, 63, 28, false)!,
            "platform-1": GameAssets.createTexture("tileset_1", 0, 64, 32, 16, false)!, //30               
            "stone-1": GameAssets.createTexture("tileset_1", 0, 112, 16, 16, false)!,  // 60
            "stone-2": GameAssets.createTexture("tileset_1", 16, 112, 16, 16, false)!,
            "stone-3": GameAssets.createTexture("tileset_1", 32, 112, 16, 16, false)!,
            "stone-4": GameAssets.createTexture("tileset_1", 0, 128, 16, 16, false)!,
            "ladder-1": GameAssets.createTexture("tileset_1", 48, 160, 16, 16, false)!,
            "pilar-1": GameAssets.createTexture("tileset_1", 0, 160, 16, 64, true)!,
            "bigblock-1": GameAssets.createTexture("tileset_1", 160, 0, 64, 64, true)!
        }


    }

    constructor() {
        this.viewPort = { x: 0, y: 0 };

        this.gridLines = true;

        this.getAssets();

       // this.levelMap = preloaded;

        console.log("is level array okey",areRowsSameSize(this.levelMap));

        this.canvas = $D.get<HTMLCanvasElement>("#design-canvas");
        this.ctx = this.canvas?.getContext("2d") || null;

        this.paletteOptions = $D.get('#palette-options');
        this.selectedTileDisplay = $D.get('#selected-tile-display');
        this.selectedTileNameDisplay = $D.get('#selected-tile-name');
        this.saveButton = $D.get('#save-button');
        this.dimsDisplay = $D.get('#dims-display');

        if (this.canvas && this.ctx && this.paletteOptions && this.selectedTileDisplay) {
            this.initializeCanvas();
            this.initializePalette();
            this.setSelectedTile(1);
            this.setupEventListeners();
        } else {
            console.error("Canvas or essential context/DOM elements failed to initialize. Check DOM selectors.");
        }
    }

    /**
    * Initializes canvas to a fixed viewport size and creates the initial level map.
    */
    initializeCanvas() {
        if (this.canvas && this.ctx) {
            // Set canvas element size to the fixed viewport size
            this.canvas.width = VIEWPORT_WIDTH;
            this.canvas.height = VIEWPORT_HEIGHT;





            // Initialize map array
            this.levelMap = preloaded;// Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));



            this.updateDimensionDisplay();
            this.drawGrid();
        }
    }

    /**
    * Finds a tile blueprint by its numerical ID.
    * @param {number} tileId - The numerical ID of the tile to retrieve.
    * @returns {ITileProps} The tile properties object, or the 'Empty' tile (ID 0) as a fallback.
    */
    getTile(tileId: number) {
        // FIX: Access the tile using the numerical ID directly. Fallback to ID 0 if not found.
        const tile = TILE_BLUEPRINTS[tileId];
        const emptyTile = TILE_BLUEPRINTS[0];
        return tile || emptyTile;
    }

    /**
    * Renders only the visible portion of the grid based on the viewport.
    */
    drawGrid() {
        if (!this.ctx) return;

        // 1. Calculate which tile coordinates the viewport starts at
        const startCol = Math.floor(this.viewPort.x / TILE_SIZE);
        const startRow = Math.floor(this.viewPort.y / TILE_SIZE);

        // 2. Calculate pixel offset for smooth scrolling (how much the first tile is clipped)
        const offsetX = this.viewPort.x % TILE_SIZE;
        const offsetY = this.viewPort.y % TILE_SIZE;

        this.ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        // Loop over the fixed viewport size, plus one extra tile to cover edges
        for (let r = 0; r <= VIEWPORT_HEIGHT_TILES; r++) {
            const mapRow = startRow + r;

            for (let c = 0; c <= VIEWPORT_WIDTH_TILES; c++) {
                const mapCol = startCol + c;

                // Calculate screen position relative to the viewport offset
                const screenX = c * TILE_SIZE - offsetX;
                const screenY = r * TILE_SIZE - offsetY;

                // Check if the map coordinates are valid (within the actual level map bounds)
                if (mapRow >= 0 && mapRow < this.rows && mapCol >= 0 && mapCol < this.cols) {
                    const tileId = this.levelMap[mapRow][mapCol];
                    const tile = this.getTile(tileId);


                    if (tile.texture) {

                        const asset = this.assets![tile.texture];
                        
                        if(asset){

                        
                        const image = asset.generatedTexture;

                        const offset = tile.offset;


                        
                        this.ctx.drawImage(image,
                            screenX + (offset?.x || 0), screenY + (offset?.y || 0), tile.width, tile.height);

                        }

                    } else {

                        // Draw Tile
                        this.ctx.fillStyle = tile.color || "black";
                        this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    }

                    if (this.gridLines) {
                        // Draw Grid Lines
                        this.ctx.strokeStyle = '#374151'; // Darker gray for grid lines
                        this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    }

                } else {
                    // Draw the 'Empty' tile color for areas outside the map bounds
                    this.ctx.fillStyle = TILE_BLUEPRINTS[0].color || "#111827";
                    this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    // Draw outline for out-of-bounds area
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    /**
    * Updates the dimension display element.
    */
    updateDimensionDisplay() {
        if (this.dimsDisplay) {
            this.dimsDisplay.textContent = `${this.cols} x ${this.rows}`;
        }
    }

    /**
    * Dynamically resizes the level map (grows the underlying data structure).
    */
    resizeGrid(direction: string, count: number) {
        if (count <= 0) return;

        if (direction === 'up' || direction === 'down') {
            // Create new rows filled with the empty tile ID (0)
            const newRows = Array(count).fill(0).map(() => Array(this.cols).fill(0));

            if (direction === 'up') {
                this.levelMap.unshift(...newRows);
                // Adjust viewport if resizing up so the visible area stays centered on old content
                this.viewPort.y += count * TILE_SIZE;
            } else {
                this.levelMap.push(...newRows);
            }
            this.rows += count;
        } else if (direction === 'left' || direction === 'right') {
            // New columns array filled with the empty tile ID (0)
            const newCols = Array(count).fill(0);

            this.levelMap = this.levelMap.map(row => {
                if (direction === 'left') {
                    return [...newCols, ...row];
                } else {
                    return [...row, ...newCols];
                }
            });

            if (direction === 'left') {
                // Adjust viewport if resizing left
                this.viewPort.x += count * TILE_SIZE;
            }

            this.cols += count;
        }

        this.updateDimensionDisplay();
        this.drawGrid();
    }

    /**
    * Sets up the tile selection panel UI and click handlers.
    */
    initializePalette() {
        if (!this.paletteOptions) return;

        this.paletteOptions.innerHTML = '';

        Object.entries(TILE_BLUEPRINTS).forEach(([idString, tile]) => {
            const id = parseInt(idString);
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile-option rounded';
            tileDiv.dataset.id = id.toString(); // Store the numerical ID
            tileDiv.title = tile.name!;

            if (!tile.texture) {
                // Draw color tiles directly
                tileDiv.style.backgroundColor = tile.color || "black";
            } else {
                // --- FIX APPLIED HERE ---
                // Problem: Appending asset.generatedTexture repeatedly MOVED the element.
                // Solution: Draw the asset onto a dedicated canvas for the palette preview.
                const asset = this.assets?.[tile.texture];
                
                if (asset) {
                    const src = asset.generatedTexture;

                    // Create a dedicated canvas for the preview
                    const previewCanvas = document.createElement('canvas');
                    const previewCtx = previewCanvas.getContext('2d');
                    
                    const PREVIEW_SIZE = 32;
                    previewCanvas.width = PREVIEW_SIZE;
                    previewCanvas.height = PREVIEW_SIZE;

                    if (previewCtx) {
                        // Draw the full texture onto the small canvas, scaling it to fit 32x32
                        previewCtx.drawImage(
                            src, 
                            0, 0, src.width, src.height, // Source (full asset)
                            0, 0, PREVIEW_SIZE, PREVIEW_SIZE // Destination (scaled to 32x32)
                        );
                        
                        tileDiv.append(previewCanvas);
                    }
                }
                // --- END FIX ---
            }

            tileDiv.addEventListener('click', () => {
                this.setSelectedTile(id); // Pass the numerical ID
            });

            this.paletteOptions?.appendChild(tileDiv);
        });
    }



    /**
    * Updates the selected tile ID and the palette visual state.
    * @param {number} tileId - The numerical ID of the tile to select.
    */
    setSelectedTile(tileId: number) {
        this.selectedTileId = tileId;
        const tile = this.getTile(tileId); // Get the tile properties for display

        document.querySelectorAll('.tile-option').forEach(div => {
            div.classList.remove('selected');
            const htmlDiv = div as HTMLElement;
            if (parseInt(htmlDiv.dataset.id || '-1') === tileId) {
                div.classList.add('selected');
            }
        });

        if (this.selectedTileDisplay && this.selectedTileNameDisplay) {
            this.selectedTileDisplay.style.backgroundColor = tile.color!;
            this.selectedTileNameDisplay.textContent = tile.name!;
        }
    }

    /**
    * Calculates mouse position relative to the canvas.
    */
    getMousePos(event: MouseEvent) {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();

        // Account for CSS scaling if necessary, though in our setup it's 1:1
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX, // Screen X relative to canvas
            y: (event.clientY - rect.top) * scaleY  // Screen Y relative to canvas
        };
    }

    /**
    * Updates the map data by translating screen click to map coordinates.
    * @param {number} x - Screen X position
    * @param {number} y - Screen Y position
    */
    paintTile(x: number, y: number) {
        // Convert screen coordinates to map pixel coordinates using viewport offset
        const mapX = x + this.viewPort.x;
        const mapY = y + this.viewPort.y;

        const col = Math.floor(mapX / TILE_SIZE);
        const row = Math.floor(mapY / TILE_SIZE);

        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            // Use the selected ID (number) directly
            if (this.levelMap[row][col] !== this.selectedTileId!) {
                this.levelMap[row][col] = this.selectedTileId!;
                this.drawGrid(); // Redraw only the viewport
            }
        }
    }

    /**
    * Adjusts the viewport position and clamps it within the map boundaries.
    */
    handlePan(dx: number, dy: number) {
        // Calculate total map dimensions in pixels
        const mapWidth = this.cols * TILE_SIZE;
        const mapHeight = this.rows * TILE_SIZE;

        // Determine maximum scrollable position (map size minus viewport size). 
        // If map is smaller than viewport, max scroll is 0.
        const maxX = Math.max(0, mapWidth - VIEWPORT_WIDTH);
        const maxY = Math.max(0, mapHeight - VIEWPORT_HEIGHT);

        // Update viewport position and clamp it between 0 and maxX/maxY
        this.viewPort.x = Math.max(0, Math.min(this.viewPort.x + dx, maxX));
        this.viewPort.y = Math.max(0, Math.min(this.viewPort.y + dy, maxY));

        this.drawGrid();
    }

    /**
    * Handles keyboard input for panning the map (WASD or Arrow Keys).
    */
    handleKeyDown = (e: { key: any; preventDefault: () => void; }) => {
        // Only pan if we have more map than viewport to show
        if (this.cols * TILE_SIZE <= VIEWPORT_WIDTH && this.rows * TILE_SIZE <= VIEWPORT_HEIGHT) return;

        let dx = 0;
        let dy = 0;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                dy = -PANNING_STEP;
                break;
            case 'ArrowDown':
            case 's':
                dy = PANNING_STEP;
                break;
            case 'ArrowLeft':
            case 'a':
                dx = -PANNING_STEP;
                break;
            case 'ArrowRight':
            case 'd':
                dx = PANNING_STEP;
                break;
            case 'Shift': // Ignore shift key
                return;
            case '0': // Quickly select the 'Empty' tile
                this.setSelectedTile(0);
                break;
            default:
                // Only prevent default for handled keys
                return;
        }

        e.preventDefault();
        this.handlePan(dx, dy);
    }

    /**
    * Sets up all necessary DOM event listeners for drawing, saving, resizing, and panning.
    */
    setupEventListeners() {
        if (!this.canvas) return;

        // Drawing Listeners
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.isDrawing = true;
                const pos = this.getMousePos(e);
                this.paintTile(pos.x, pos.y);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                const pos = this.getMousePos(e);
                this.paintTile(pos.x, pos.y);
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent context menu on canvas
        });

        // Save Button Listener
        this.saveButton?.addEventListener('click', this.exportLevel.bind(this));

        // Resize Button Listeners
        const resizeButtons = document.querySelectorAll('.resize-control-row button, .resize-control-col button');
        resizeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const direction = target.dataset.direction;
                const count = parseInt(target.dataset.count || '0');

                if (direction && count > 0) {
                    this.resizeGrid(direction, count);
                }
            });
        });

        // Keyboard Listener for Panning
        window.addEventListener('keydown', this.handleKeyDown);
    }

    /**
    * Exports the level map as a JSON file for download.
    */
    exportLevel() {
        const levelData = {
            metadata: {
                name: 'Generated Level',
                description: `Level generated on ${new Date().toISOString()}`,
                tileSize: TILE_SIZE,
                columns: this.cols,
                rows: this.rows,
                width: this.cols * TILE_SIZE,
                height: this.rows * TILE_SIZE
            },
            map: this.levelMap
        };

        const jsonString = JSON.stringify(levelData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'level_design.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}