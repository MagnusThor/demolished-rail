export interface IStarburstProps {
    x: number;
    y: number;
    numPoints: number;
    outerRadius: number;
    innerRadius: number;
    rotation: number;
    rotationSpeed: number;
    hue: number;
    saturation: number;
    lightness: number;
}

export const starburstEffect = (ts: number, ctx: CanvasRenderingContext2D, propertybag: IStarburstProps) => {
    const { x, y, numPoints, outerRadius, innerRadius, rotation, rotationSpeed, hue, saturation, lightness } = propertybag;

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / numPoints + rotation;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();

    propertybag.rotation += rotationSpeed * (Math.PI / 180); // Update rotation
};