import { ISpriteAnimation } from "../../../wwwroot/src/interface/ISpriteAnimation";

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

    drawAnimatedSprite(
        animation: ISpriteAnimation,
        x: number,
        y: number,
        timeStamp: number,
        flippedX: boolean = false
    ): void {
        const now = timeStamp;
        const elapsed = now - animation.lastFrameChangeTime;
        const frameDuration = 1000 / animation.frameRate;

        if (elapsed > frameDuration) {
            animation.currentFrameIndex = (animation.currentFrameIndex + 1) % animation.frames.length;
            animation.lastFrameChangeTime = now;
        }

        const frameNumber = animation.frames[animation.currentFrameIndex];
        const spriteSheet = animation.spriteSheet;
        const sx = (frameNumber % spriteSheet.columns) * spriteSheet.frameWidth;
        const sy = Math.floor(frameNumber / spriteSheet.columns) * spriteSheet.frameHeight;

        this.ctx.save();

        // Translate to the center of the sprite and scale to flip
        if (flippedX) {
            this.ctx.translate(x + spriteSheet.frameWidth / 2, y + spriteSheet.frameHeight / 2);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-(x + spriteSheet.frameWidth / 2), -(y + spriteSheet.frameHeight / 2));
        }

        this.ctx.drawImage(
            spriteSheet.src,
            sx,
            sy,
            spriteSheet.frameWidth,
            spriteSheet.frameHeight,
            x,
            y,
            spriteSheet.frameWidth,
            spriteSheet.frameHeight
        );

        this.ctx.restore();
    }

    public drawText(text: string, x: number, y: number, style: any): void {
        // Save the current canvas state before applying new styles.
        this.ctx.save();

        // Apply default styles or override with provided styles.
        this.ctx.font = style.font || "16px Arial";
        this.ctx.fillStyle = style.color || "#FFFFFF";
        this.ctx.textAlign = style.textAlign || "left";
        this.ctx.textBaseline = style.textBaseline || "top";

        // Draw the text at the specified coordinates.
        this.ctx.fillText(text, x, y);

        // Restore the previous canvas state. This is crucial to prevent styles from "leaking"
        // and affecting other drawing operations.
        this.ctx.restore();
    }

    /**
     * Draws a rectangle with rotation around its center point.
     * @param x The x-coordinate of the rectangle's top-left corner.
     * @param y The y-coordinate of the rectangle's top-left corner.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @param rotation The rotation in radians.
     * @param style An object containing fillStyle and strokeStyle for the rectangle.
     */
    public drawRotatedRect(x: number, y: number, width: number, height: number, rotation: number, style: any): void {
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        this.ctx.save();
        // Translate to the center of the rectangle
        this.ctx.translate(centerX, centerY);
        // Apply the rotation
        this.ctx.rotate(rotation);
        // Translate back and draw the rectangle from its top-left corner
        this.ctx.translate(-centerX, -centerY);

        if (style.fillStyle) {
            this.ctx.fillStyle = style.fillStyle;
            this.ctx.fillRect(x, y, width, height);
        }

        if (style.strokeStyle) {
            this.ctx.strokeStyle = style.strokeStyle;
            this.ctx.lineWidth = style.lineWidth || 1;
            this.ctx.strokeRect(x, y, width, height);
        }

        this.ctx.restore();
    }
}
