import { ISpriteAnimation } from "../../interface/ISpriteAnimation";
import { gameAssets } from "../../state/gameState";



export const enemyAnimations = (): { [key: string]: ISpriteAnimation; } => {

    const spriteSheetIdle = gameAssets.getSpriteSheet("enemy-1-idle", 128, 128, 10, 1)!;
    const spriteSheetAttack = gameAssets.getSpriteSheet("enemy-1-attack", 128, 128, 4, 1)!;
     const spriteSheetWalk = gameAssets.getSpriteSheet("enemy-1-walk", 128, 128, 10, 1)!;

    const animations: { [key: string]: ISpriteAnimation; } = {
         "idle": {
            name: 'idle',
            frames: [0, 1, 2, 3, 4, 5, 6, 7,8,9],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: spriteSheetIdle,
            flippedX: false,
            flippedY:false
        },
        "walk": {
            name: 'walk',
            frames: [0, 1, 2, 3, 4, 5, 6, 7,8,9],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: spriteSheetWalk,
            flippedX: false,
            flippedY:false
        },
        "attack": {
            name: 'attack',
            frames: [0, 1, 2, 3, 4],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: spriteSheetAttack
            ,flippedX: false,
            flippedY:false
        }
    };
    return animations;
};
