import { $D } from "dathor-helpers";

import { GameAssets } from "../global/GameAssets";

import { IGameTexture } from "../interface/ITexture";
import { TILE_BLUEPRINTS } from "../blueprints/TileBluePrints";


export function valieDateLevel(
    level: ILevelData
) {

    const matrix = level.map;

    if (!Array.isArray(matrix) || matrix.length === 0) {
        console.log("Input is empty or not an array. Returning true.");
        return true;
    }

    const expectedSize = matrix[0].length;

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



const TILE_SIZE = 32;
const INITIAL_COLS = 60;
const INITIAL_ROWS = 16;
const PANNING_STEP = TILE_SIZE * 2;

const VIEWPORT_WIDTH_TILES = 30;
const VIEWPORT_HEIGHT_TILES = 20;
const VIEWPORT_WIDTH = VIEWPORT_WIDTH_TILES * TILE_SIZE;
const VIEWPORT_HEIGHT = VIEWPORT_HEIGHT_TILES * TILE_SIZE;

export interface ISettingsBagItem {
    x: number;
    y: number;
    action: string;
    props: { [key: string]: any };
}
export interface ISettingsSerialized {
    [key: string]: ISettingsBagItem;
}

export interface ILevelMetadata {
    name: string,
    description: string,
    tileSize: number,
    columns: number,
    rows: number
    width: number,
    height: number
}

export interface ILevelData {
    metadata: ILevelMetadata
    map: number[][],
    settings?: ISettingsSerialized
}


const mockedTileSettings: ISettingsSerialized = {
    "a2dsdsd": {
        x: 1728,
        y: 448,
        action: "tunnelExitCreator",
        props: {
            x: 1728,
            y: 448,
            destinationX: 1216 - 64,
            destinationY: 448
        },
    },
    "axdj22": {
        action: "tunnelEntranceCreator",
        x: 1216,
        y: 416,
        props: {
            x: 1216,
            y: 416,
            destinationX: 1728 - 128,
            destinationY: 448
        }

    },
    "ds0321": {
        action: "textCreator",
        x: 288,
        y: 224,
        props: {
            x: 288,
            y: 224,
            textId: "welcome_message"
        }
    },
    "a232323": {
        action: "bridgeCreator",
        x: 1056,
        y: 320,
        props: {
            x: 1056,
            y: 320,
            direction: "right",
            bridgeTileIndex: 0x01,
            wallTileIndex: 1,
        }
    },
    "ldpo02": {
        action: "doorTogglerCreator",
        x: 192,
        y: 320,
        props: {
            x: 192,
            y: 320,
            doorX: 148,
            doorY: 320,
            closedTileType: 0x03,
            openTileType: 0x00,
            durationInSeconds: 3,
        },
    }
}



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
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    paletteOptions: HTMLElement | null;
    selectedTileDisplay: HTMLElement | null;
    saveButton: HTMLElement | null;
    dimsDisplay: HTMLElement | null;
    selectedTileNameDisplay: HTMLElement | null;

    tileSettingsPanel: HTMLElement | null;
    closeSettingsButton: HTMLButtonElement | null;
    gridLinesCheckbox: HTMLInputElement | null;
    tileSizeDisplay: HTMLElement | null;
    viewportWDisplay: HTMLElement | null;
    viewportHDisplay: HTMLElement | null;

    levelMap: number[][] = [];
    selectedTileId: number | undefined;
    isDrawing = false;
    cols = INITIAL_COLS;
    rows = INITIAL_ROWS;
    viewPort = { x: 0, y: 0 };
    assets: { [key: string]: IGameTexture; } | undefined;
    gridLines: boolean;
    tileSettings: ISettingsSerialized | undefined;


    getAssets(): void {


        this.assets = {
            "solid-1": GameAssets.createTexture("tileset_1", 0, 0, 32, 32, false)!,
            "solid-2": GameAssets.createTexture("tileset_1", 64, 0, 32, 32, false)!,
            "solid-3": GameAssets.createTexture("tileset_1", 96, 0, 32, 32, false)!,
            "solid-4": GameAssets.createTexture("tileset_1", 129, 0, 32, 32, false)!,
            "bush-1": GameAssets.createTexture("bush-1", 0, 0, 32, 16, false)!,
            "bush-2": GameAssets.createTexture("bush-2", 0, 0, 63, 28, false)!,
            "platform-1": GameAssets.createTexture("platform-1", 0, 64, 32, 16, false)!,
            "stone-1": GameAssets.createTexture("tileset_1", 0, 112, 16, 16, false)!,
            "stone-2": GameAssets.createTexture("tileset_1", 16, 112, 16, 16, false)!,
            "stone-3": GameAssets.createTexture("tileset_1", 32, 112, 16, 16, false)!,
            "stone-4": GameAssets.createTexture("tileset_1", 0, 128, 16, 16, false)!,
            "ladder-1": GameAssets.createTexture("ladder-1", 48, 160, 16, 16, false)!,
            "pilar-1": GameAssets.createTexture("tileset_1", 0, 160, 16, 64, true)!,
            "bigblock-1": GameAssets.createTexture("bigblock-1", 160, 0, 64, 64, true)!
        }


    }

    constructor() {
        this.viewPort = { x: 0, y: 0 };
        this.gridLines = true;

        this.getAssets();


        this.canvas = $D.get<HTMLCanvasElement>("#design-canvas");
        this.ctx = this.canvas?.getContext("2d") || null;

        this.paletteOptions = $D.get('#palette-options');
        this.selectedTileDisplay = $D.get('#selected-tile-display');
        this.selectedTileNameDisplay = $D.get('#selected-tile-name');
        this.saveButton = $D.get('#save-button');
        this.dimsDisplay = $D.get('#dims-display');


        this.tileSettingsPanel = $D.get('#tile-settings-panel');
        this.closeSettingsButton = $D.get<HTMLButtonElement>('#close-settings-panel');

        this.gridLinesCheckbox = $D.get<HTMLInputElement>('#toggle-grid-lines');
        this.tileSizeDisplay = $D.get('#tile-size-display');
        this.viewportWDisplay = $D.get('#viewport-w-display');
        this.viewportHDisplay = $D.get('#viewport-h-display');


        if (this.canvas && this.ctx && this.paletteOptions && this.selectedTileDisplay && this.tileSettingsPanel) {
            this.initializeCanvas();
            this.initializePalette();
            this.initializeRenderingSettings();
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
            this.canvas.width = VIEWPORT_WIDTH;
            this.canvas.height = VIEWPORT_HEIGHT;

            this.levelMap = preloaded;

            this.tileSettings = mockedTileSettings;

            this.rows = this.levelMap.length;
            this.cols = this.levelMap.length > 0 ? this.levelMap[0].length : INITIAL_COLS;


            this.updateDimensionDisplay();
            this.drawGrid();
        }
    }

    /**
     * Initializes the state and event listeners for the Rendering Settings panel.
     * Assumes the following IDs exist in the HTML: 
     * #toggle-grid-lines, #tile-size-display, #viewport-w-display, #viewport-h-display
     */
    initializeRenderingSettings() {
        if (this.gridLinesCheckbox) {
            this.gridLinesCheckbox.checked = this.gridLines;

            this.gridLinesCheckbox.addEventListener('change', () => {
                this.gridLines = this.gridLinesCheckbox!.checked;
                this.drawGrid();
            });
        } else {
            console.warn("Grid lines checkbox (#toggle-grid-lines) not found.");
        }

        if (this.tileSizeDisplay) {
            this.tileSizeDisplay.textContent = `${TILE_SIZE}px`;
        }
        if (this.viewportWDisplay) {
            this.viewportWDisplay.textContent = `${VIEWPORT_WIDTH_TILES} tiles (${VIEWPORT_WIDTH}px)`;
        }
        if (this.viewportHDisplay) {
            this.viewportHDisplay.textContent = `${VIEWPORT_HEIGHT_TILES} tiles (${VIEWPORT_HEIGHT}px)`;
        }
    }

    /**
     * Finds a tile blueprint by its numerical ID.
     * @param {number} tileId - The numerical ID of the tile to retrieve.
     * @returns {ITileProps} The tile properties object, or the 'Empty' tile (ID 0) as a fallback.
     */
    getTile(tileId: number) {
        const tile = TILE_BLUEPRINTS[tileId];
        const emptyTile = TILE_BLUEPRINTS[0];
        return tile || emptyTile;
    }

    /**
     * Renders only the visible portion of the grid based on the viewport.
     */
    drawGrid() {
        if (!this.ctx) return;

        const startCol = Math.floor(this.viewPort.x / TILE_SIZE);
        const startRow = Math.floor(this.viewPort.y / TILE_SIZE);

        const offsetX = this.viewPort.x % TILE_SIZE;
        const offsetY = this.viewPort.y % TILE_SIZE;

        this.ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

        for (let r = 0; r <= VIEWPORT_HEIGHT_TILES; r++) {
            const mapRow = startRow + r;

            for (let c = 0; c <= VIEWPORT_WIDTH_TILES; c++) {
                const mapCol = startCol + c;

                const screenX = c * TILE_SIZE - offsetX;
                const screenY = r * TILE_SIZE - offsetY;

                if (mapRow >= 0 && mapRow < this.rows && mapCol >= 0 && mapCol < this.cols) {
                    const tileId = this.levelMap[mapRow][mapCol];
                    const tile = this.getTile(tileId);


                    if (tile.texture) {

                        const asset = this.assets![tile.texture];

                        if (asset) {

                            const image = asset.generatedTexture;
                            const offset = tile.offset;

                            this.ctx.drawImage(image,
                                0, 0, image.width, image.height,
                                screenX + (offset?.x || 0), screenY + (offset?.y || 0), tile.width!, tile.height!);


                        } else {
                            this.ctx.fillStyle = tile.color || "black";
                            this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        }

                    } else {

                        this.ctx.fillStyle = tile.color || "black";
                        this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    }

                    if (this.gridLines) {
                        this.ctx.strokeStyle = '#374151';
                        this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    }

                } else {
                    this.ctx.fillStyle = TILE_BLUEPRINTS[0].color || "#111827";
                    this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

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
            const newRows = Array(count).fill(0).map(() => Array(this.cols).fill(0));

            if (direction === 'up') {
                this.levelMap.unshift(...newRows);
                this.viewPort.y += count * TILE_SIZE;
            } else {
                this.levelMap.push(...newRows);
            }
            this.rows += count;
        } else if (direction === 'left' || direction === 'right') {
            const newCols = Array(count).fill(0);

            this.levelMap = this.levelMap.map(row => {
                if (direction === 'left') {
                    return [...newCols, ...row];
                } else {
                    return [...row, ...newCols];
                }
            });

            if (direction === 'left') {
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


            console.log("adding blurprint", idString,tile)


            const id = parseInt(idString);
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile-option rounded';
            tileDiv.dataset.id = id.toString();
            tileDiv.title = tile.name!;

            if (!tile.texture) {
                tileDiv.style.backgroundColor = tile.color || "black";
                if (id === 0) {
                    tileDiv.textContent = 'X';
                    tileDiv.classList.add('text-gray-600', 'text-xl', 'font-bold');
                }else{
                    tileDiv.textContent = idString;
                    tileDiv.classList.add('text-gray-600', 'text-xl', 'font-bold');
                    tileDiv.style.backgroundColor = tile.color!

                }
            } else {
                const asset = this.assets?.[tile.texture];

                if (asset) {
                    const src = asset.generatedTexture;

                    const previewCanvas = document.createElement('canvas');
                    const previewCtx = previewCanvas.getContext('2d');

                    const PREVIEW_SIZE = 32;
                    previewCanvas.width = PREVIEW_SIZE;
                    previewCanvas.height = PREVIEW_SIZE;

                    if (previewCtx) {
                        const scale = Math.min(PREVIEW_SIZE / src.width, PREVIEW_SIZE / src.height);
                        const drawW = src.width * scale;
                        const drawH = src.height * scale;
                        const drawX = (PREVIEW_SIZE - drawW) / 2;
                        const drawY = (PREVIEW_SIZE - drawH) / 2;

                        previewCtx.drawImage(
                            src,
                            0, 0, src.width, src.height,
                            drawX, drawY, drawW, drawH
                        );

                        tileDiv.append(previewCanvas);
                    }
                }
            }

            tileDiv.addEventListener('click', () => {
                this.setSelectedTile(id);

                this.hideTileSettingsPanel();
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
        const tile = this.getTile(tileId);

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

            this.selectedTileDisplay.innerHTML = '';
            if (tile.texture) {
                const asset = this.assets?.[tile.texture];
                if (asset) {
                    const previewCanvas = document.createElement('canvas');
                    previewCanvas.width = 32;
                    previewCanvas.height = 32;
                    const previewCtx = previewCanvas.getContext('2d');
                    if (previewCtx) {
                        previewCtx.drawImage(asset.generatedTexture, 0, 0, 32, 32);
                        this.selectedTileDisplay.appendChild(previewCanvas);
                    }
                }
            }
        }
    }

    /**
     * Calculates mouse position relative to the canvas.
     */
    getMousePos(event: MouseEvent) {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    /**
     * Updates the map data by translating screen click to map coordinates.
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     */
    paintTile(x: number, y: number) {
        const mapX = x + this.viewPort.x;
        const mapY = y + this.viewPort.y;

        const col = Math.floor(mapX / TILE_SIZE);
        const row = Math.floor(mapY / TILE_SIZE);

        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            if (this.levelMap[row][col] !== this.selectedTileId!) {
                this.levelMap[row][col] = this.selectedTileId!;
                this.drawGrid();
            }
        }
    }

    /**
     * Adjusts the viewport position and clamps it within the map boundaries.
     */
    handlePan(dx: number, dy: number) {
        const mapWidth = this.cols * TILE_SIZE;
        const mapHeight = this.rows * TILE_SIZE;

        const maxX = Math.max(0, mapWidth - VIEWPORT_WIDTH);
        const maxY = Math.max(0, mapHeight - VIEWPORT_HEIGHT);

        this.viewPort.x = Math.max(0, Math.min(this.viewPort.x + dx, maxX));
        this.viewPort.y = Math.max(0, Math.min(this.viewPort.y + dy, maxY));

        this.drawGrid();
    }

    /**
     * Handles keyboard input for panning the map (WASD or Arrow Keys).
     */
    handleKeyDown = (e: { key: any; preventDefault: () => void; }) => {
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
            case 'Shift':
                return;
            case '0':
                this.setSelectedTile(0);
                break;
            default:
                return;
        }

        e.preventDefault();
        this.handlePan(dx, dy);
    }

    /**
     * Hides the tile settings action panel.
     */
    hideTileSettingsPanel() {
        if (this.tileSettingsPanel) {
            this.tileSettingsPanel.classList.add('hidden');
        }
    }

    /**
     * Displays the tile settings action panel for a specific tile.
     */
    showTileSettingsPanel(settingKey: string, setting: ISettingsBagItem) {
        if (!this.tileSettingsPanel) return;

        $D.get('#settings-key')!.textContent = settingKey;
        $D.get('#settings-coords')!.textContent = `(${setting.x}, ${setting.y})`;
        $D.get('#settings-action')!.textContent = setting.action;

        const propsJson = JSON.stringify(setting.props, null, 2);
        $D.get('#settings-props')!.innerHTML = `<pre>${propsJson}</pre>`;

        this.tileSettingsPanel.classList.remove('hidden');
    }

    findTileSettingByCoordinates(mapX: number, mapY: number) {
        const worldX = Math.floor(mapX / TILE_SIZE) * TILE_SIZE;
        const worldY = Math.floor(mapY / TILE_SIZE) * TILE_SIZE;

        for (const key in this.tileSettings) {
            const setting = this.tileSettings[key];
            if (setting.x === worldX && setting.y === worldY) {
                return { key, setting };
            }
        }
        return null;
    }

    /**
     * Sets up all necessary DOM event listeners for drawing, saving, resizing, and panning.
     */
    setupEventListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            const pos = this.getMousePos(e);

            if (e.button === 0) {
                this.isDrawing = true;
                this.paintTile(pos.x, pos.y);
            } else if (e.button == 1) {
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
            e.preventDefault();
            this.hideTileSettingsPanel();

            const pos = this.getMousePos(e);
            const mapX = pos.x + this.viewPort.x;
            const mapY = pos.y + this.viewPort.y;


            const foundSetting = this.findTileSettingByCoordinates(mapX, mapY);


            if (foundSetting) {
                this.showTileSettingsPanel(foundSetting.key, foundSetting.setting);
            } else {
                console.log(`No settings found for world coordinates (${mapX}, ${mapY}).`);
            }

        });

        this.closeSettingsButton?.addEventListener('click', () => {
            this.hideTileSettingsPanel();
        });

        this.saveButton?.addEventListener('click', this.exportLevel.bind(this));

        const resizeButtons = document.querySelectorAll('.resize-control-row,.resize-control-col');
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

        window.addEventListener('keydown', this.handleKeyDown);
    }



    /**
     * Exports the level map as a JSON file for download.
     */
    exportLevel() {
        const levelData: ILevelData = {
            metadata: {
                name: 'Generated Level',
                description: `Level generated on ${new Date().toISOString()}`,
                tileSize: TILE_SIZE,
                columns: this.cols,
                rows: this.rows,
                width: this.cols * TILE_SIZE,
                height: this.rows * TILE_SIZE
            },
            map: this.levelMap,
            settings: this.tileSettings

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