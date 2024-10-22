
export interface IMovingCircleProps {
    x: number
    y: number
    xSpeed: number
    ySpeed: number
}


export const movingCircleEffet = (ts:number, ctx:CanvasRenderingContext2D, 
    propertybag:IMovingCircleProps) => {

    propertybag.x += propertybag.xSpeed;
    propertybag.y += propertybag.ySpeed;

    ctx.strokeStyle = "red";

    // Bounce off the edges of the canvas
    if (propertybag.x + 40 > ctx.canvas.width || propertybag.x - 40 < 0) {
        propertybag.xSpeed = -propertybag.xSpeed;
    }
    if (propertybag.y + 40 > ctx.canvas.height || propertybag.y - 40 < 0) {
        propertybag.ySpeed = -propertybag.ySpeed;
    }

    ctx.beginPath();
    ctx.arc(propertybag.x, propertybag.y, 40, 0, 2 * Math.PI);
    ctx.stroke();


}
