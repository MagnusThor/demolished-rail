import { Sequence, InputHelper, DefaultAudioLoader, SceneBuilder, IEntity, ICompositeEntity } from "../../src";
import { playerEntity } from "./entities/playerBlock";

import { tileBlock } from "./entities/tileBlock";
import { WorldEntity } from "./entities/WorldEntity";
import { gameState } from "./gameState";

import { IGameEntity } from "./interface/IGameEntity";
import { ITileProps } from "./interface/ITileProps";

export class RunWorld {
    screenCanvas: HTMLCanvasElement;
    sequence!: Sequence;
    inputHelper: InputHelper;
    private TILE_WIDTH = 50;
    private TILE_HEIGHT = 50;
    private TILE_MAP = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 1, 1, 1, 0, 0, 1, 3, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 4, 4, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    constructor(target: HTMLCanvasElement, public bmp: number) {
        this.screenCanvas = target;
        this.inputHelper = new InputHelper(this.screenCanvas);
    }

    async initializeGame(): Promise<Sequence> {
        const instance = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
        const sequence = await instance.initialize();

        // set the gameState viewport to match the screen canvas size
        gameState.viewport.viewportWidth = this.screenCanvas.width;
        gameState.viewport.viewportHeight = this.screenCanvas.height;

        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);
        sb.durationUntilEndInMs("scene0");
        (sb.getScenes())[0]!.addEntities(...this.createWorld(sequence));
        sequence.addScenes(...sb.getScenes());
        this.sequence = sequence;
        return sequence;
    }

    createWorld(sequence: Sequence): Array<IEntity> {
        // Create the tile entity instance, passing the tile map to its props.
        const tiles: ICompositeEntity<ITileProps> = {
            ...tileBlock,
            props: {
                tileMap: this.TILE_MAP,
                tileWidth: this.TILE_WIDTH,
                tileHeight: this.TILE_HEIGHT,
                platforms: [],
                collectibles: []
            }
        };

        const worldWidth = this.TILE_MAP[0].length * this.TILE_WIDTH;
        const worldHeight = this.TILE_MAP.length * this.TILE_HEIGHT;

        const playerInitialX = 100;
        const playerInitialY = (this.TILE_MAP.length - 2) * this.TILE_HEIGHT - 20;

        const viewportInitialX = playerInitialX - this.screenCanvas.width / 2;
        const viewportInitialY = playerInitialY - this.screenCanvas.height / 2;
        
        // Create the WorldEntity to act as a container for all game objects.
        const world = new WorldEntity("our-world", {
            worldHeight: worldHeight,
            worldWidth: worldWidth,
            viewportWidth: this.screenCanvas.width,
            viewportHeight: this.screenCanvas.height,
            viewportX: viewportInitialX,
            viewportY: viewportInitialY,
            blocks: [],
        });

        // Create the player entity instance, configuring its props.
        const player = {
            ...playerEntity,
            props: {
                x: playerInitialX,
                y: playerInitialY,
                width: 32,
                height: 32,
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
             
            }
        };

        // Add the tile and player entities to the world, not the global gameState.
        world.addBlock(tiles as IGameEntity<any>);
        world.addBlocks(player as IGameEntity<any>);

        // Tell the world to follow the player
        world.follow(player as IGameEntity<any>);

        sequence.onFrame((scene, time) => {
            world.updateBlocks(time);
        });

        // Add only the single WorldEntity to the global game state.
        // It's responsible for managing all its child entities.
        gameState.entities.push(world);
    
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
