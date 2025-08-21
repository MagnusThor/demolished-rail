




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

    animateSprite(sprite: HTMLImageElement, frameWidth: number, frameHeight: number, frameIndex: number, x: number, y: number) {    
        const sx = (frameIndex % (sprite.width / frameWidth)) * frameWidth;
        const sy = Math.floor(frameIndex / (sprite.width / frameWidth)) * frameHeight;
        this.ctx.drawImage(sprite, sx, sy, frameWidth, frameHeight, x, y, frameWidth, frameHeight);
    }


}
