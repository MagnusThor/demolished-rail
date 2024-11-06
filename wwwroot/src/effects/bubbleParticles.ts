import { Sequence } from "../../../src/Engine/Sequence";


export interface IBallProps {
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number; // Horizontal velocity
    vy: number; // Vertical velocity
}

export interface IBallEntityProps {
    numBalls: number;
    balls: IBallProps[];
}

export const ballEffect = (ts: number, ctx: CanvasRenderingContext2D, propertybag: IBallEntityProps, sequence: Sequence) => {
    const { numBalls, balls } = propertybag;

    /**
   * Creates a new ball with random properties.
   * @param ctx - The 2D rendering context of the canvas.
   * @param balls - The array to add the new ball to.
   */
    function createBall(ctx: CanvasRenderingContext2D, balls: IBallProps[]) {
        const colors = [
            "85, 221, 224",
            "51, 101, 138",
            "47, 72, 88",
            "246, 174, 45",
            "242, 100, 25"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const ballProps: IBallProps = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2,
            radius: Math.floor(Math.random() * 12) + 4,
            color: `rgba(${randomColor}, ${Math.random()})`,
            vx: Math.random() * 8 - 4,
            vy: Math.random() * 8 - 4,
        };

        balls.push(ballProps);
    }



    // Create balls if there are not enough
    while (balls.length < numBalls) {
        createBall(ctx, balls);
    }

    // Update and draw each ball
    balls.forEach(ball => {
        ctx.fillStyle = ball.color;

        // Update position based on velocity
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Reset position if ball goes off-screen
        if (ball.x + ball.radius > ctx.canvas.width || ball.x - ball.radius < 0) {
            ball.x = Math.max(ball.radius, Math.min(ball.x, ctx.canvas.width - ball.radius));
            ball.vx = -ball.vx;
        }
        if (ball.y + ball.radius > ctx.canvas.height || ball.y - ball.radius < 0) {
            ball.y = Math.max(ball.radius, Math.min(ball.y, ctx.canvas.height - ball.radius));
            ball.vy = -ball.vy;
        }

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();
    });
};

