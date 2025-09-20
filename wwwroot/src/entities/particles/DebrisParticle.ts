import { IParticle } from "../../interface/IParticle";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { gameState } from "../../state/gameState";

export class DebrisParticle implements IParticle {
    uuid: string;
    Positioned: IPositioned;
    data: HTMLCanvasElement | HTMLImageElement;
    width: number;
    height: number;
    isAlive: boolean;
    scale: number;

    // IPhysicsProps properties
    posX: number;
    posY: number;
    velX: number;
    velY: number;
    bounciness: number;
    gravity: number;
    friction: number;
    drag: number;
    mass: number;
    terminalVelocityY: number;

    constructor(
        data: HTMLCanvasElement | HTMLImageElement ,
        x: number, y: number,
        initialVelX: number, initialVelY: number,
        scale: number
    ) {
        this.uuid = crypto.randomUUID();
        this.data = data;
        this.Positioned = new Positioned(x, y, data.width , data.height);
        this.width = data.width ;
        this.height = data.height;
        this.isAlive = true;
        this.scale = scale;

        // Initialize physics properties
        this.posX = x;
        this.posY = y;
        this.velX = initialVelX;
        this.velY = initialVelY;
        this.bounciness = 0.5;
        this.gravity = 0.5;
        this.friction = 0.05;
        this.drag = 0.005;
        this.mass = 1;
        this.terminalVelocityY = 10;
    }

    /**
     * Updates the particle's position and checks if it is still within the canvas bounds.
     * @param canvasHeight The height of the canvas to check against.
     * @returns boolean - True if the particle is still alive, false otherwise.
     */
    update(canvasHeight: number): boolean {
        // Apply physics effects
        this.velY += this.gravity;
        this.velX *= (1 - this.drag);
        this.velY *= (1 - this.drag);

        // Apply velocities to the Positioned object's coordinates
        this.posX += this.velX;
        this.posY += this.velY;
        this.Positioned.x = this.posX;
        this.Positioned.y = this.posY;

        // Handle collision with the bottom of the canvas
        if (this.Positioned.y + this.height > canvasHeight) {
            this.Positioned.y = canvasHeight - this.height;
            this.velY *= -this.bounciness;
            this.velX *= (1 - this.friction);
            
            // Randomize horizontal bounce a bit
            if (Math.abs(this.velX) < 0.1) this.velX = 0;
            if (Math.abs(this.velY) < 0.1) this.velY = 0;
        }

        const { width, height } = gameState.gameCanvas!;

        // Check if the particle is outside the canvas and mark as not alive.
        if (
            this.Positioned.x > width ||
            this.Positioned.x + this.width < 0 ||
            this.Positioned.y > height ||
            (this.Positioned.y >= height - this.height - 1 && Math.abs(this.velY) < 1 && Math.abs(this.velX) < 1)
        ) {
            this.isAlive = false;
        }

        return this.isAlive;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { x, y } = this.Positioned;
        if (this.isAlive) {
            ctx.drawImage(this.data as HTMLCanvasElement, x, y, this.width * this.scale, this.height * this.scale);
        }
    }
}
