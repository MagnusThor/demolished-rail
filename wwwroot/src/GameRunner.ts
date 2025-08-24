// RunWorld.ts
import { Sequence, InputHelper, DefaultAudioLoader, SceneBuilder, IEntity, ICompositeEntity } from "../../src";
import { playerBlock } from "./entities/playerBlock";
import { tileBlock } from "./entities/tileBlock";
import { WorldEntity } from "./entities/WorldEntity";
import { gameState } from "./gameState";
import { IGameEntity } from "./interface/IGameEntity";
import { ITileProps } from "./interface/ITileProps";
import { enemyBlock } from "./entities/enemyBlock";

import { collectibleBlock } from "./entities/collectibleBlock";
import { getTileXy } from "./utils/tileBlockHelpers";
import { IDynamicEntity } from "./interface/IDynamicEntity";
import { IPlayerProps } from "./interface/IPlayerProps";
import { Positioned } from "./interface/IPositioned";

export class RunWorld {
    screenCanvas: HTMLCanvasElement;
    sequence!: Sequence;
    inputHelper: InputHelper;

    private TILE_WIDTH = 32;
    private TILE_HEIGHT = 32;
    private TILE_MAP = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 1, 0, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 50, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 50, 0, 0, 1],
        [1, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 2, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 99, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 1, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 1, 0, 0, 0, 1.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 1],
        [1, 1, 0, 0, 0, 4, 4, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 50, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // The tile map for the game world
    // 0 = empty space
    // 1 = solid ground
    // 2 = ice
    // 3 = platform (elvarors)
    // 4 = collectible item
    // 50 = enemy start position
    // 99 = player start position

    constructor(target: HTMLCanvasElement, public bmp: number) {
        this.screenCanvas = target;
        this.inputHelper = new InputHelper(this.screenCanvas);

        window.addEventListener('resize', this.handleResize.bind(this));

        this.handleResize();

    }

      private handleResize = () => {
        // Read the actual size of the canvas element from the DOM.
        // This size is determined by the CSS rules you've applied.
        const actualWidth = this.screenCanvas.clientWidth;
        const actualHeight = this.screenCanvas.clientHeight;

        // Set the canvas's internal drawing buffer to match its
        // rendered size. This is the crucial step to prevent blurriness.
        this.screenCanvas.width = actualWidth;
        this.screenCanvas.height = actualHeight;

        // Update the global game state viewport to reflect the new dimensions.
        // All other game logic should read from this state.
        gameState.viewport.viewportWidth = actualWidth;
        gameState.viewport.viewportHeight = actualHeight;
    }



    

    async initializeGame(): Promise<Sequence> {
        const instance = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
        const sequence = await instance.initialize();

        // set the gameState viewport to match the screen canvas size
        gameState.viewport.viewportWidth = this.screenCanvas.width;
        gameState.viewport.viewportHeight = this.screenCanvas.height;

        gameState.player = playerBlock

        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);
        sb.durationUntilEndInMs("scene0");
        (sb.getScenes())[0]!.addEntities(...this.createWorld(sequence));
        sequence.addScenes(...sb.getScenes());
        this.sequence = sequence;
        return sequence;
    }

    createWorld(sequence: Sequence): Array<IEntity> {
        const worldWidth = this.TILE_MAP[0].length * this.TILE_WIDTH;
        const worldHeight = this.TILE_MAP.length * this.TILE_HEIGHT;

        console.log(`World dimensions: ${worldWidth}x${worldHeight}`);

        // Find initial player and enemy positions from the tile map
        let player: IGameEntity<IPlayerProps> | null = null;

        const enemies: IDynamicEntity<any>[] = [];
        const collectibles: IGameEntity<any>[] = [];

        // Loop through the tile map to create entities
        for (let row = 0; row < this.TILE_MAP.length; row++) {
            for (let col = 0; col < this.TILE_MAP[row].length; col++) {
                const tileType = this.TILE_MAP[row][col];
                const { x, y } = getTileXy(row, col);
                // Create enemies at position 50
                if (tileType === 50) {
                    const enemy = enemyBlock(x, y, this.TILE_MAP, this.TILE_WIDTH, this.TILE_HEIGHT);

                    enemy.onCreated!(enemy);
                    enemies.push(enemy);
                }
                // Create a player at position 99
                if (tileType === 99) {
                    // Create the player entity instance, configuring its props.
                    player = {
                        ...playerBlock,
                        props: {
                            position: new Positioned(x, y, this.TILE_WIDTH, this.TILE_HEIGHT),
                            velX: 0,
                            velY: 0,
                            gravity: 0.35,
                            isJumping: false,
                            isGrounded: false,
                            isMovingLeft: false,
                            isMovingRight: false,
                            tileMap: this.TILE_MAP,
                            tileWidth: this.TILE_WIDTH,
                            tileHeight: this.TILE_HEIGHT,
                            input: this.inputHelper,
                            worldWidth: worldWidth,
                            lastDirection: "right",
                            isInitialized: false,
                            health: {
                                health: 100, // Default health value
                                damage: 0 // Default damage value
                            }
                        }
                    };
                }
                if (tileType === 4) {
                    collectibles.push(collectibleBlock({ x: col, y: row }, this.TILE_WIDTH, this.TILE_HEIGHT));
                }
            }
        }

        // Create the tile entity instance, passing the tile map to its props.
        const tiles: ICompositeEntity<ITileProps> = {
            ...tileBlock,
            props: {
                tileMap: this.TILE_MAP,
                tileWidth: this.TILE_WIDTH,
                tileHeight: this.TILE_HEIGHT,
                platforms: [],
                collectibles: collectibles // Pass the collectibles array to the tile block
            }
        };

        const world = new WorldEntity("our-world", {
            worldHeight: worldHeight,
            worldWidth: worldWidth,
            viewportWidth: this.screenCanvas.width,
            viewportHeight: this.screenCanvas.height,
            viewportX: 0, // Initial viewport X
            viewportY: 0, // Initial viewport Y
            blocks: [],
            
        },this.screenCanvas.width,this.screenCanvas.height);

        // Add the tile, player, and enemy entities to the world.
        world.addBlock(tiles as IGameEntity<any>);
        if (player) {
            world.addBlock(player as IGameEntity<any>);
            world.follow(player as IGameEntity<any>);
        } else {
            console.error("Player start position not found!");
        }
        enemies.forEach(enemy => {
            gameState.dynamicEntities.push(enemy as IDynamicEntity<any>);
        });

        // The sequence.onFrame logic is handled by the GameEngine's update loop now
        // This makes the game loop more centralized and efficient.
        // The WorldEntity's updateBlocks method will be called automatically by the GameEngine.

        // Add only the single WorldEntity to the global game state.
        // It's responsible for managing all its child entities.
        gameState.entities.push(world);

        sequence.onFrame((ts) => {
            world.updateBlocks(ts);
        });

        return [world];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
    const runner = new RunWorld(canvas, 110);
    const sequence = await runner.initializeGame();
    sequence.onLowFrameRate((fps) => {
        console.warn(`Low frame rate detected: ${fps.toFixed(2)} FPS`);
    });

    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        sequence.play();
    });
});
