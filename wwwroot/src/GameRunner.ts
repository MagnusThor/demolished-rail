import { Sequence, InputHelper, DefaultAudioLoader, SceneBuilder, IEntity } from "../../src";
import { gameAssetsToPreload } from "./assets/assetsToLoad";
import { BackgroundEntity } from "./entities/BackgroundEntity";
import { CollectibleEntity } from "./entities/collectible/CollectibleEntity";
import { EnemyEntity } from "./entities/enemy/enemyEntity";
import { enemyAnimations } from "./entities/enemy/enemyAnimations";
import { PlatformEntity } from "./entities/platform/PlatformEntity";
import { playerAnimations } from "./entities/player/animations/playerAnimations";
import { PlayerEntity } from "./entities/player/playerEntity";
import { LevelEntity  } from "./entities/level/levelEntity";
import { WorldEntity } from "./entities/WorldEntity";
import { gameState, gameAssets } from "./state/gameState";

import { IGameEntity } from "./interface/IGameEntity";
import { ILevelProps } from "./interface/ILevelProps";
import { IPlayerProps } from "./interface/IPlayerProps";
import { Positioned } from "./interface/IPositioned";
import { LEVEL_SAMPLE, DEFAULT_TILE_WIDTH, DEFULT_TILE_HEIGHT } from "./level-settings/LEVEL_SAMPLE";
import { getTilesByType, getTileXY, calculateWorldDimensions, getTileProperties, calculateTileCoordinates } from "./utils/tileBlockHelpers";
import { createLevelEntities } from "./level-settings/LevelFactory";
import { IEnemyProps } from "./interface/IEnemyProps";

export class RunWorld {
    screenCanvas: HTMLCanvasElement;
    sequence!: Sequence;
    inputHelper: InputHelper;

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

        gameState.input = new InputHelper(this.screenCanvas);

    }

    async initializeGame(): Promise<Sequence> {
        const instance = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
        const sequence = await instance.initialize();

        // Set the gameState viewport to match the screen canvas size
        gameState.viewport.viewportWidth = this.screenCanvas.width;
        gameState.viewport.viewportHeight = this.screenCanvas.height;

        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);
        sb.durationUntilEndInMs("scene0");

        const gameBackground = new BackgroundEntity("background", {}, this.screenCanvas.width, this.screenCanvas.height,
            gameState
        );
        (sb.getScenes())[0]!.addEntity(gameBackground);
        (sb.getScenes())[0]!.addEntities(...await this.createLevel(sequence));

        sequence.addScenes(...sb.getScenes());

        this.sequence = sequence;
        return sequence;
    }

    async createLevel(sequence: Sequence): Promise<Array<IEntity>> {
        const { width: worldWidth, height: worldHeight } = calculateWorldDimensions(LEVEL_SAMPLE);

        // Find the player's starting grid coordinates (row and column)
        const playerStartTileFromMap = getTilesByType(LEVEL_SAMPLE, 0xFF)[0];

        // Convert the grid coordinates to a world position
        const playerStartTile = getTileXY(LEVEL_SAMPLE, playerStartTileFromMap.y, playerStartTileFromMap.x);
        const playerProps = getTileProperties(0xFF);

        // Find all enemy start positions and convert their grid coordinates to world positions
        const enemyStartTiles = getTilesByType(LEVEL_SAMPLE, 0xa0);

        if (!playerStartTile || !playerProps) {
            console.error("Player start position not found in the tile map!");
            return [];
        }
      

        const player = new PlayerEntity({
            positioned: new Positioned(playerStartTile.x, playerStartTile.y, playerProps.width, playerProps.height),
            velX: 0,
            velY: 0,          
            gravity: 0.3,
            isInitialized: false,        
            health: {
                health: 100,
                damage: 0
            },
            animations: playerAnimations(),
            zIndex:10,
            states:{
                onLadder: false,
                isJumping: false,
                onPlatform: false,
                isGrounded: false,
                isMovingLeft: false,
                isMovingRight: false,
                lastDirection: "right",
            },
            gadgets:{},
            attachedTo:undefined,
            isCollidable:true
        });
        gameState.player = player;

        gameState.entities.push(player);
    

        let indexedTiles =  calculateTileCoordinates(LEVEL_SAMPLE);

        // Map the enemy grid coordinates to enemy entities
        const enemies: IGameEntity<IEnemyProps>[] = enemyStartTiles.map(tile => {

            const { x, y } = getTileXY(LEVEL_SAMPLE, tile.y, tile.x);

            return new EnemyEntity(x, y, indexedTiles, enemyAnimations());

        });

        // Use the new LevelInitializer to create the level's static entities
        const levelProps: ILevelProps = {
            positioned: new Positioned(0,0,0,0), // not used
            tileMap: LEVEL_SAMPLE,
            tileWidth: DEFAULT_TILE_WIDTH,
            tileHeight: DEFULT_TILE_HEIGHT,
            indexedTiles: calculateTileCoordinates(LEVEL_SAMPLE),
            textures: {
                "solid-1": gameAssets.createTexture("tileset_1", 0, 0, 32, 32,false)!, 
                "solid-2": gameAssets.createTexture("tileset_1", 64, 0, 32, 32,false)!, 
                "solid-3": gameAssets.createTexture("tileset_1", 96, 0, 32, 32,false)!, 
                "solid-4": gameAssets.createTexture("tileset_1", 129, 0, 32, 32,false)!, 
                "bush-1": gameAssets.createTexture("bush-1", 0, 0, 32, 16,false)!, 
                "bush-2": gameAssets.createTexture("bush-2", 0, 0, 63, 28,false)!, 



                "platform-1": gameAssets.createTexture("tileset_1", 0, 64, 32, 16,false)!, //30
               
               
                "stone-1": gameAssets.createTexture("tileset_1",0,112,16,16,false)!,  // 60
                "stone-2": gameAssets.createTexture("tileset_1",16,112,16,16,false)!, 
                "stone-3": gameAssets.createTexture("tileset_1",32,112,16,16,false)!,
                "stone-4": gameAssets.createTexture("tileset_1",0,128,16,16,false)!,
                
                "ladder-1": gameAssets.createTexture("tileset_1",48,160,16,16,false)!,
               
                "pilar-1": gameAssets.createTexture("tileset_1", 0, 160, 16, 64,true)!,

                "bigblock-1": gameAssets.createTexture("tileset_1",160,0,64,64,true)!
            },
            isInitialized: false,
            states:{},
            zIndex:0,
            isCollidable:false
        };

        const staticLevelEntities = createLevelEntities(levelProps);

        const world = new WorldEntity("our-world", {
            worldHeight: worldHeight,
            worldWidth: worldWidth,
            viewportWidth: this.screenCanvas.width,
            viewportHeight: this.screenCanvas.height,
            viewportX: 0,
            viewportY: 0,
            isInitialized:false,
            positioned : new Positioned(0,0,0,0),
            states:{},
            zIndex:0,
            isCollidable:false
        }, this.screenCanvas.width, this.screenCanvas.height);



        // Add all entities to the world
        staticLevelEntities.forEach(entity => gameState.entities.push(entity));
        
        //world.addBlock(player as IGameEntity<IPlayerProps>);
        enemies.forEach(enemy => gameState.entities.push(enemy));

        // Follow the player with the camera
        world.follow(player as IGameEntity<IPlayerProps>);

      
        gameState.entities.push(world);

        sequence.onFrame((ts) => {
            world.updateBlocks(ts);
        });

        return [world];
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
    await gameAssets.loadImages(gameAssetsToPreload);


    const runner = new RunWorld(canvas, 110);


    const sequence = await runner.initializeGame();
        gameState.ctx= sequence.targetCtx!



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
