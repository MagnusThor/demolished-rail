/**
 * @fileoverview Defines a post-processor that creates a realistic flashlight effect.
 * It draws a semi-transparent dark overlay onto an offscreen canvas,
 * then cuts out a feathered transparent "light" area around the player,
 * and finally composites that overlay onto the main canvas.
 */

import { IPostProcessor, Sequence } from "../../../src/Engine/Sequence";
import { GameState } from "../global/GameState";

export const createFlashlightPostProcessor = (): IPostProcessor => {
    // Reuse a single offscreen overlay canvas instead of reallocating every frame
    const overlayCanvas = document.createElement("canvas");
    const overlayCtx = overlayCanvas.getContext("2d", { alpha: true })!;

    return {
        name: "flashlight",
        isActive: false,
        update: (ctx: CanvasRenderingContext2D, sequence: Sequence, delta: number) => {
            if (!GameState.getInstance().player) return;

            const canvas = ctx.canvas;
            const player = GameState.getInstance().player!.props.position;
            const lightRadius = 150;

            // Ensure overlay canvas matches target size
            if (overlayCanvas.width !== canvas.width || overlayCanvas.height !== canvas.height) {
                overlayCanvas.width = canvas.width;
                overlayCanvas.height = canvas.height;
            }

            // Player center in screen space (World Position - Viewport Offset + Half Width/Height)
            const playerCenterX = player.x + (player.width || 32) / 2;
            const playerCenterY = player.y + (player.height || 32) / 2;
            const playerScreenX = playerCenterX - GameState.getInstance().viewport.x;
            const playerScreenY = playerCenterY - GameState.getInstance().viewport.y;

            // Step 1: fill overlay with semi-transparent black
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            overlayCtx.globalCompositeOperation = "source-over";
            overlayCtx.fillStyle = "rgba(0,0,0,0.9)";
            overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

            // Step 2: punch out flashlight hole
            overlayCtx.globalCompositeOperation = "destination-out";
            const gradient = overlayCtx.createRadialGradient(
                playerScreenX, playerScreenY, 0,
                playerScreenX, playerScreenY, lightRadius
            );
            // This is the "eraser" shape, which must be opaque to fully clear
            gradient.addColorStop(0, "rgba(0,0,0,1)"); 
            // Fades to transparent at the edge to create the feathering effect
            gradient.addColorStop(1, "rgba(0,0,0,0)"); 
            
            overlayCtx.fillStyle = gradient;
            overlayCtx.beginPath();
            overlayCtx.arc(playerScreenX, playerScreenY, lightRadius, 0, Math.PI * 2);
            overlayCtx.fill();

            // Step 3: draw the finished overlay onto the main canvas
            ctx.drawImage(overlayCanvas, 0, 0);
        }
    };
};
