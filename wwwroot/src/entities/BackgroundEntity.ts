import { Canvas2DEntity } from "../../../src";

export class BackgroundEntity extends Canvas2DEntity<{}> {
    private layers: { color: string; scrollFactor: number; }[];
    private gameState: any;

    constructor(
        public name: string,
        public props: {},
        public screenWidth: number,
        public screenHeight: number,
        gameState: any
    ) {
        super(
            name,
            props,
            (ts, ctx) => this.backgroundEntityRenderer(ts, ctx),
            undefined,
            undefined,
            screenWidth,
            screenHeight
        );
        this.gameState = gameState;

        // Define the parallax layers with colors and scroll speeds
        this.layers = [
            { color: '#1B2C4F', scrollFactor: 0.1 }, // Furthest away, darkest mountains
            { color: '#2C4066', scrollFactor: 0.2 },
            { color: '#3B5784', scrollFactor: 0.3 }, // Closest mountains
        ];
    }

    private backgroundEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        // Draw the static sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
        skyGradient.addColorStop(0.0, '#87CEEB'); // Sky Blue
        skyGradient.addColorStop(1.0, '#00008B'); // Dark Blue
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // Get the player's current x position for the parallax effect
        const playerX = this.gameState.player.props.positioned.x;

        // Loop through each layer and draw the parallax effect
        this.layers.forEach(layer => {
            const parallaxOffset = (playerX * layer.scrollFactor) % this.screenWidth;

            ctx.fillStyle = layer.color;
            ctx.beginPath();
            
            // Draw a basic mountain range using a series of lines
            const mountainHeight = this.screenHeight * 0.4;
            const mountainBase = this.screenHeight - mountainHeight;
            const segmentWidth = this.screenWidth / 30;
            
            // Draw the first mountain range at the current offset
            ctx.moveTo(-parallaxOffset, mountainBase);

            for (let i = 0; i <= 10; i++) {
                const x = (i * segmentWidth) - parallaxOffset;
                const y = mountainBase - Math.sin((i * Math.PI) / 10) * mountainHeight * layer.scrollFactor * 2;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(this.screenWidth - parallaxOffset, this.screenHeight);
            ctx.lineTo(-parallaxOffset, this.screenHeight);
            ctx.closePath();
            ctx.fill();

            // Draw the second mountain range to create a seamless loop
            ctx.beginPath();
            ctx.moveTo(this.screenWidth - parallaxOffset, mountainBase);

            for (let i = 0; i <= 10; i++) {
                const x = (i * segmentWidth) + this.screenWidth - parallaxOffset;
                const y = mountainBase - Math.sin((i * Math.PI) / 10) * mountainHeight * layer.scrollFactor * 2;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo((this.screenWidth * 2) - parallaxOffset, this.screenHeight);
            ctx.lineTo(this.screenWidth - parallaxOffset, this.screenHeight);
            ctx.closePath();
            ctx.fill();
        });
    };

}
