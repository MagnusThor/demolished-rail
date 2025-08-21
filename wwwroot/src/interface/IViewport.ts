/**
 * Defines the shape of the viewport object.
 * This determines which part of the game world is currently visible on the screen.
 */
export interface IViewport {
    // The top-left x-coordinate of the viewport in the game world.
    x: number;

    // The top-left y-coordinate of the viewport in the game world.
    y: number;

    // The width of the viewport (usually the screen width).
    viewportWidth: number;

    // The height of the viewport (usually the screen height).
    viewportHeight: number;
}
