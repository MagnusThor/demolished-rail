import { GameAssets } from "../../../global/GameAssets";
import { ISpriteAnimation } from "../../../interface/ISpriteAnimation";

export const playerAnimations = (): { [key: string]: ISpriteAnimation; } => {
    const animations: { [key: string]: ISpriteAnimation; } = {
        walk: {
            name: 'walk',
            frames: [0, 1, 2, 3, 4, 5,6,7,8,9],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_walk", 363, 458, 4, 3, { maxRenderHeight: 64 })!
        },
        idle: {
            name: 'idle',
            frames: [0,1,2,3,4,5,6,7,8,9], // You might have a specific idle frame
            frameRate: 1, // Can be a slow rate or 0
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_idle", 232, 439, 4, 3, { maxRenderHeight: 64 })!
        },
        jump: {
            name: 'jump',
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8,9],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_jump", 362, 483, 3, 3, { maxRenderHeight: 64 })!
        },
    };

    return animations;
};
