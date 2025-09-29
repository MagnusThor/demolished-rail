import { GameAssets } from "../../../global/GameAssets";
import { ISpriteAnimation } from "../../../interface/ISpriteAnimation";

export const playerAnimations = (): { [key: string]: ISpriteAnimation; } => {
    const animations: { [key: string]: ISpriteAnimation; } = {
        walk: {
            name: 'walk',
            frames: [0, 1, 2, 3, 4, 5],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_walk", 32, 32, 3, 2)!
        },
        idle: {
            name: 'idle',
            frames: [0], // You might have a specific idle frame
            frameRate: 1, // Can be a slow rate or 0
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_idle", 32, 32, 3, 2)!
        },
        jump: {
            name: 'jump',
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: GameAssets.getSpriteSheet("player_jump", 32, 32, 3, 3)!
        },
    };

    return animations;
};
