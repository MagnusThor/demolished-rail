import { Canvas2DEntity } from '../../../src';



export class BackgroundEntity extends Canvas2DEntity<{}> {

    constructor(
        public name: string,
        public props: {},
        public screenWidth: number,
        public screenHeight: number
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
    }

    private backgroundEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
        skyGradient.addColorStop(0.0, '#87CEEB'); // Sky Blue
        skyGradient.addColorStop(1.0, '#00008B'); // Dark Blue
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    };

}
