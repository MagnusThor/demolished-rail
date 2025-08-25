import { ISpriteAnimation } from "../../../wwwroot/src/interface/IGameSprite";
import { ISpriteSheetAsset } from "../../../wwwroot/src/utils/GameAssets";

export class CanvasHelper {
    constructor(public ctx: CanvasRenderingContext2D) {
    }

    setFillColor(color: string) {
        this.ctx.fillStyle = color;
    }

    drawRect(x: number, y: number, width: number, height: number) {
        this.ctx.fillRect(x, y, width, height);
    }

    drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number) {
        this.ctx.drawImage(image, x, y, width, height);
    }

    drawCircle(x: number, y: number, radius: number) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSprite(sprite: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
        this.ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    animateSprite(
        sprite: HTMLImageElement,
        frameWidth: number,
        frameHeight: number,
        frameIndex: number,
        x: number,
        y: number
    ) {
        const sx = (frameIndex % (sprite.width / frameWidth)) * frameWidth;
        const sy = Math.floor(frameIndex / (sprite.width / frameWidth)) * frameHeight;
        this.ctx.drawImage(sprite, sx, sy, frameWidth, frameHeight, x, y, frameWidth, frameHeight);
    }

    /**
     * Draws a frame from an animated sprite sheet and handles frame progression.
     * @param animation The animation object to draw.
     * @param spriteSheetData The full sprite sheet data.
     * @param x The destination x-coordinate.
     * @param y The destination y-coordinate.
     * @param timeStamp The current timestamp from the game loop.
     */
    drawAnimatedSprite(
        animation: ISpriteAnimation,       
        x: number,
        y: number,
        timeStamp: number
    ): void {
        // Handle frame advancement
        const now = timeStamp;
        const elapsed = now - animation.lastFrameChangeTime;
        const frameDuration = 1000 / animation.frameRate;

        if (elapsed > frameDuration) {
            animation.currentFrameIndex = (animation.currentFrameIndex + 1) % animation.frames.length;
            animation.lastFrameChangeTime = now;
        }

        // Get the current frame number from the animation sequence
        const frameNumber = animation.frames[animation.currentFrameIndex];

        // Calculate source coordinates based on the frame number
        const sx = (frameNumber %  animation.spriteSheet.columns) *  animation.spriteSheet.frameWidth;
        const sy = Math.floor(frameNumber /  animation.spriteSheet.columns) *  animation.spriteSheet.frameHeight;

        // Draw the frame
        this.ctx.drawImage(
            animation.spriteSheet.src,
            sx,
            sy,
             animation.spriteSheet.frameWidth,
             animation.spriteSheet.frameHeight,
            x,
            y,
             animation.spriteSheet.frameWidth,
             animation.spriteSheet.frameHeight
        );
    }
}