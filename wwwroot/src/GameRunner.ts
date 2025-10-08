import { Sequence, InputHelper, DefaultAudioLoader, SceneBuilder, IEntity } from "../../src";
import { GameAssetsToPreload } from "./factory/assetsToLoad";
import { BackgroundEntity } from "./entities/BackgroundEntity";
import { EnemyEntity } from "./entities/enemy/enemyEntity";
import { enemyAnimations } from "./entities/enemy/enemyAnimations";
import { playerAnimations } from "./entities/player/animations/playerAnimations";
import { PlayerEntity } from "./entities/player/playerEntity";
import { WorldManager } from "./entities/WorldManager";
import { GameAssets } from "./global/GameAssets";
import { GameState } from "./global/GameState";

import { IGameEntity } from "./interface/IGameEntity";
import { ILevelProps } from "./interface/ILevelProps";
import { IPlayerProps } from "./interface/IPlayerProps";
import { Positioned } from "./interface/IPosition2D";

import { getTilesByType, getTileXY, calculateWorldDimensions, getTileProperties, calculateTileCoordinates } from "./utils/tileEntityHelpers";
import { createLevelEntities } from "./factory/LevelFactory";
import { IEnemyProps } from "./interface/IEnemyProps";

import { ILevelGraph } from "./interface/ILevelGraph";
import { createFlashlightPostProcessor } from "./postprocessors/createFlashlightPostProcessor";
import { LevelLoader } from "./entities/level/LevelLoader";



export class RunGame {
    screenCanvas: HTMLCanvasElement;
    sequence!: Sequence;
    inputHelper: InputHelper;
    currentLevel: ILevelGraph | undefined;

    constructor(target: HTMLCanvasElement, public bmp: number) {

        
        this.screenCanvas = target;
        this.inputHelper = new InputHelper(this.screenCanvas);

        window.addEventListener('resize', this.handleResize.bind(this));

        this.handleResize();


    

        GameState.getInstance().gameCanvas = target;
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
        GameState.getInstance().viewport.viewportWidth = actualWidth;
        GameState.getInstance().viewport.viewportHeight = actualHeight;

        GameState.getInstance().input = new InputHelper(this.screenCanvas);

    }



    async initializeGame(): Promise<Sequence> {

        const levelLoader = new LevelLoader();

        const isLevelLoaded = await levelLoader.load("assets/levels/devlevel.json");


        if(!isLevelLoaded) throw `Could not load the level`


        this.currentLevel = levelLoader.getLevelGraph();

        const instance = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
        const sequence = await instance.initialize();

        // Set the gameState viewport to match the screen canvas size
        GameState.getInstance().viewport.viewportWidth = this.screenCanvas.width;
        GameState.getInstance().viewport.viewportHeight = this.screenCanvas.height;

        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);
        sb.durationUntilEndInMs("scene0");

        const gameBackground = new BackgroundEntity("background", {}, this.screenCanvas.width, this.screenCanvas.height,
            GameState
        );
        (sb.getScenes())[0]!.addEntity(gameBackground);
        (sb.getScenes())[0]!.addEntities(...await this.createLevel(sequence));

        sequence.addScenes(...sb.getScenes());

        

        sequence.addPostProcessor(createFlashlightPostProcessor())

        this.sequence = sequence;
        return sequence;
    }

    async createLevel(sequence: Sequence): Promise<Array<IEntity>> {


        const LEVELTILES = this.currentLevel!.tiles;

        const { width: worldWidth, height: worldHeight } = calculateWorldDimensions(LEVELTILES);

        // Find the player's starting grid coordinates (row and column)
        const playerStartTileFromMap = getTilesByType(LEVELTILES, 0xFF)[0];

        // Convert the grid coordinates to a world position
        const playerStartTile = getTileXY(LEVELTILES, playerStartTileFromMap.y, playerStartTileFromMap.x);
        const playerProps = getTileProperties(0xFF);

        // Find all enemy start positions and convert their grid coordinates to world positions
        const enemyStartTiles = getTilesByType(LEVELTILES, 0xa0);

        if (!playerStartTile || !playerProps) {
            console.error("Player start position not found in the tile map!");
            return [];
        }

        const playerPos = new Positioned(playerStartTile.x, playerStartTile.y, playerProps.width, playerProps.height);

        playerPos.offset!.x =0;
        playerPos.offset!.y = -32;


        
        const player = new PlayerEntity({
            position:  playerPos,
    
            velX: 0,
            velY: 0,
            gravity: 0.3,
            isInitialized: false,
            health: {
                health: 100,
                damage: 0
            },
            animations: playerAnimations(),
            zIndex: 10,
            states: {
                onLadder: false,
                isJumping: false,
                onPlatform: false,
                isGrounded: false,
                isMovingLeft: false,
                isMovingRight: false,
                lastDirection: "right",
            },
            gadgets: {},
            attachedTo: undefined,
            isCollidable: true
        });
        GameState.getInstance().player = player;

        GameState.getInstance().entities.push(player);


        let indexedTiles = calculateTileCoordinates(LEVELTILES);

        // Map the enemy grid coordinates to enemy entities
        const enemies: IGameEntity<IEnemyProps>[] = enemyStartTiles.map(tile => {

            const { x, y } = getTileXY(LEVELTILES, tile.y, tile.x);

            return new EnemyEntity(x, y, indexedTiles, enemyAnimations());

        });

        // Use the new LevelInitializer to create the level's static entities
        const levelProps: ILevelProps = {
            level: this.currentLevel!,
            position: new Positioned(0, 0, worldWidth, worldHeight),
            tileMap: this.currentLevel!.tiles,
            tileWidth: this.currentLevel!.metadata!.tileSize,
            tileHeight: this.currentLevel!.metadata!.tileSize,
            indexedTiles: calculateTileCoordinates(LEVELTILES),
            textures: {
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
            },
            isInitialized: false,
            states: {},
            zIndex: 0,
            isCollidable: false
        };

        const staticLevelEntities = createLevelEntities(levelProps);

        const world = new WorldManager("our-world", {
            worldHeight: worldHeight,
            worldWidth: worldWidth,
            viewportWidth: this.screenCanvas.width,
            viewportHeight: this.screenCanvas.height,
            viewportX: 0,
            viewportY: 0,
            isInitialized: false,
            position: new Positioned(0, 0, 0, 0),
            states: {},
            zIndex: 0,
            isCollidable: false
        }, this.screenCanvas.width, this.screenCanvas.height);

        // Add all entities to the world
        staticLevelEntities.forEach(entity => GameState.getInstance().entities.push(entity));

        //world.addBlock(player as IGameEntity<IPlayerProps>);
        enemies.forEach(enemy => GameState.getInstance().entities.push(enemy));

        // Follow the player with the camera

        world.camera.follow(player as IGameEntity<IPlayerProps>)

      //  world.follow(player as IGameEntity<IPlayerProps>);


        GameState.getInstance().entities.push(world);

        sequence.onFrame((sceneNumber,time,deltaTime) => {
         
            world.updateEntities(time,deltaTime);
        });

        return [world];
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;

    await GameAssets.loadImages(GameAssetsToPreload);

    const runner = new RunGame(canvas, 110);


    const sequence = await runner.initializeGame();
    GameState.getInstance().ctx = sequence.targetCtx!
    GameState.getInstance().sequence = sequence;



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


