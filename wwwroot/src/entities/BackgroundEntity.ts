import { Canvas2DEntity, ITexture } from "../../../src";
import { IGameTexture } from "../interface/ITexture";
import { GameAssets } from "../global/GameAssets";

export class BackgroundEntity extends Canvas2DEntity<{}> {
    private layers: { texture: IGameTexture; scrollFactor: number; }[];
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

        // Define the parallax layers with the loaded textures and scroll speeds
        this.layers = [
            { texture: GameAssets.createTexture("backgroundlayer_1",0,0,576,324,false)!, scrollFactor: 0.1 },
            { texture: GameAssets.createTexture("backgroundlayer_2",0,0,576,324,false)!, scrollFactor: 0.3 },
            { texture: GameAssets.createTexture("backgroundlayer_3",0,0,576,324,false)!, scrollFactor: 0.5 },
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
            const parallaxOffset = (playerX * layer.scrollFactor) % layer.texture.width;

            // Draw the texture at its current position
            ctx.drawImage(
                layer.texture.texture.src,
                -parallaxOffset,
                0,
                this.screenWidth,
                this.screenHeight
            );

            // Draw the texture again next to the first one to create a seamless loop
            ctx.drawImage(
                layer.texture.texture.src,
                this.screenWidth - parallaxOffset,
                0,
                this.screenWidth,
                this.screenHeight
            );
        });
    };
}
