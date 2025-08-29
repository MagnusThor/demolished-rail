// RunWorld.ts
import { Sequence, InputHelper, DefaultAudioLoader, SceneBuilder, IEntity, ICompositeEntity } from "../../src";

import { WorldEntity } from "./entities/WorldEntity";
import { BackgroundEntity } from './entities/BackgroundEntity';
import { gameAssets, gameState } from "./gameState";
import { IGameEntity } from "./interface/IGameEntity";
import { ILevelProps } from "./interface/ILevelProps";



import { calculateTileCoordinates, calculateWorldDimensions, getTileProperties, getTileXy } from "./utils/tileBlockHelpers";
import { IDynamicEntity } from "./interface/IDynamicEntity";
import { IPlayerProps } from "./interface/IPlayerProps";
import { Positioned } from "./interface/IPositioned";
import { GameAssetsManager } from "./utils/GameAssets";
import { PlayerEntity } from "./entities/player/playerEntity";
import { playerAnimations } from "./entities/player/animations/playerAnimations";
import { LEVEL_SAMPLE, TILE_HEIGHT, TILE_WIDTH } from "./LEVEL_SAMPLE";
import { TileEntity } from "./entities/tiles/tileEntity";
import { CollectibleEntity } from "./entities/collectible/CollectibleEntity";
import { EnemyEntity } from "./entities/enemy/enemyEntity";






export class RunWorld {
    screenCanvas: HTMLCanvasElement;
    sequence!: Sequence;
    inputHelper: InputHelper;

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

        gameState.gameCanvas = target;

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

        // Set the gameState viewport to match the screen canvas size
        gameState.viewport.viewportWidth = this.screenCanvas.width;
        gameState.viewport.viewportHeight = this.screenCanvas.height;

        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);
        sb.durationUntilEndInMs("scene0");

        const gameBackground = new BackgroundEntity("background", {}, this.screenCanvas.width, this.screenCanvas.height);
        (sb.getScenes())[0]!.addEntity(gameBackground);
        (sb.getScenes())[0]!.addEntities(...await this.createLevel(sequence));

        sequence.addScenes(...sb.getScenes());

        this.sequence = sequence;
        return sequence;
    }

    async createLevel(sequence: Sequence): Promise<Array<IEntity>> {
      
        const { width: worldWidth, height: worldHeight } = calculateWorldDimensions(LEVEL_SAMPLE);
        const indexedTiles = calculateTileCoordinates(LEVEL_SAMPLE);

        let player = new PlayerEntity({
            position: new Positioned(32, 32, 32, 32),
            velX: 0,
            velY: 0,
            gravity: 0.25,
            isJumping: false,
            isGrounded: false,
            isMovingLeft: false,
            isMovingRight: false,
            lastDirection: "right",
            tileMap: LEVEL_SAMPLE,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,


            isInitialized: false,

            health: {
                health: 100,
                damage: 0
            },
            animations: playerAnimations(),
        })

        gameState.player = player;
        gameState.input = new InputHelper(this.screenCanvas);

        const enemies: IDynamicEntity<any>[] = [];
        const collectibles: IGameEntity<any>[] = [];

       
         // Loop through the tile map to create entities
    let currentY = 0;
    for (let row = 0; row < LEVEL_SAMPLE.length; row++) {
        let currentX = 0;
        let maxRowHeight = 0;
        for (let col = 0; col < LEVEL_SAMPLE[row].length; col++) {
            const tileType = LEVEL_SAMPLE[row][col];
            const tileProps = getTileProperties(tileType);
            
            if (tileProps) {
                // Determine the maximum height of the current row for the next row's starting Y.
                if (tileProps.height > maxRowHeight) {
                    maxRowHeight = tileProps.height;
                }

                // Correctly place entities based on the current tile's absolute position.
                if (tileType === 50) { // Enemy
                    const enemy =  new EnemyEntity(currentX, currentY,indexedTiles);
                 
                    enemies.push(enemy);
                } else if (tileType === 99) { // Player
                    player.props.position = new Positioned(currentX, currentY, tileProps.width, tileProps.height);
                } else if (tileType === 4) { // Collectible
                    collectibles.push(new CollectibleEntity(col,row));
                }

                // Increment the X position for the next tile in the row.
                currentX += tileProps.width;
            }
        }
        // Increment the Y position for the next row based on the tallest tile in the current row.
        currentY += maxRowHeight;
    }


     

        const level = new TileEntity({
                tileMap: LEVEL_SAMPLE,
                tileWidth: TILE_WIDTH,
                tileHeight: TILE_HEIGHT,
                platforms: [],
                collectibles: collectibles, // Pass the collectibles array to the tile block
                textures: [],
                indexedTiles:indexedTiles,
                isInitialized:false
            })

        const world = new WorldEntity("our-world", {
            worldHeight: worldHeight,
            worldWidth: worldWidth,
            viewportWidth: this.screenCanvas.width,
            viewportHeight: this.screenCanvas.height,
            viewportX: 0, // Initial viewport X
            viewportY: 0, // Initial viewport Y
            blocks: [],

        }, this.screenCanvas.width, this.screenCanvas.height);

        // Add the tile, player, and enemy entities to the world.

        world.addBlock(level as IGameEntity<any>);
        if (player) {
            await world.addBlock(player as IGameEntity<IPlayerProps>);
            world.follow(player as IGameEntity<IPlayerProps>);
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


    const assetsToLoad = [
        { key: "player_walk", url: "/wwwroot/assets/images/sprites/spritesheet_player_walk.png" },
        { key: "player_jump", url: "/wwwroot/assets/images/sprites/spritesheet_player_jump.png" },
        { key: "tileset_1", url: "/wwwroot/assets/images/tilesets/1_Industrial_Tileset_1.png" }
    ];

    await gameAssets.loadImages(assetsToLoad);

    // try get a sprite from the gameAssets



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
