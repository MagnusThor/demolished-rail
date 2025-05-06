import { MathHelper } from './Math/MathHelper';
import { Point3D } from './Math/Point3D';

export class InputHelper {
    private keys: Set<string> = new Set();
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseButtons: Set<number> = new Set();
    private keyListeners: { [key: string]: (() => void)[] } = {};


    private mouseListeners: ((x: number, y: number, z: number, a: number[]) => void)[] = [];
    private zoom: number = 0;


    private keyDownTimes: { [key: string]: number } = {}; // Store key down times
    private mouseButtonDownTimes: { [button: number]: number } = {}; // Store mouse button down times


    /**
     * Initializes the Input class by attaching event listeners for keyboard and mouse events.
     */
    constructor(private parent: HTMLElement) {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        parent.addEventListener('mousemove', (e) => this.onMouseMove(e));
        parent.addEventListener('mousedown', (e) => this.onMouseDown(e));
        parent.addEventListener('mouseup', (e) => this.onMouseUp(e));
        parent.addEventListener('wheel', (e) => this.onWheel(e));
    }

    /**
     * Registers a listener function to handle mouse events.
     *
     * @param listener - A callback function that is invoked when a mouse event occurs.
     * The function receives the following parameters:
     * - `x`: The x-coordinate of the mouse event.
     * - `y`: The y-coordinate of the mouse event.
     * - `z`: A number representing additional mouse-related data (e.g., scroll or depth).
     * - `a`: An array of numbers providing extra contextual information about the event.
     * 
     * @returns The current instance to allow method chaining.
     */
    onMouse(listener: (x: number, y: number, z: number, a: number[]) => void): this {
        this.mouseListeners.push(listener);
        return this;
    }
    /**
     * Gets the time (in milliseconds) since a specific key was pressed.
     * @param key - The key to check.
     * @returns The time since the key was pressed, or 0 if the key is not currently pressed.
     */
    getKeyDownTime(key: string): number {
        if (this.keys.has(key)) {
            if (!this.keyDownTimes[key]) { // Check if keyDownTime is not set
                this.keyDownTimes[key] = performance.now(); // If not set, capture the current time
            }
            return performance.now() - this.keyDownTimes[key]; // Calculate the difference
        } else {
            return 0; // Return 0 if the key is not pressed
        }
    }
    /**
     * Gets the time (in milliseconds) since a specific mouse button was pressed.
     * @param button - The mouse button to check (0 for left, 1 for middle, 2 for right).
     * @returns The time since the mouse button was pressed, or 0 if the button is not currently pressed.
     */
    getMouseButtonDownTime(button: number): number {
        return this.mouseButtons.has(button) ? performance.now() - this.mouseButtonDownTimes[button] : 0;
    }

    /**
     * Checks if a specific key is currently pressed.
     * @param key - The key to check (e.g., "a", "ArrowUp", " ").
     * @returns True if the key is pressed, false otherwise.
     */
    isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }

    /**
     * Gets the current mouse X coordinate.
     * @returns The mouse X coordinate.
     */
    getMouseX(): number {
        return this.mouseX;
    }

    /**
     * Gets the current mouse Y coordinate.
     * @returns The mouse Y coordinate.
     */
    getMouseY(): number {
        return this.mouseY;
    }

    /**
     * Retrieves the current zoom level based on mouse input.
     *
     * @returns {number} The current zoom level.
     */
    getMouseZoom(): number {
        return this.zoom;
    }

    /**
 * Returns the current mouse position & scroll as normalized coords.
 *  x: -1 (left) → +1 (right)
 *  y: +1 (top)  → -1 (bottom)
 *  z: normalized scroll (clamped to [-1,1] by default)
 */
    getMouseNormalizedPosition(): Point3D {
        // avoid divide by zero
        const w = this.parent.clientWidth || 1;
        const h = this.parent.clientHeight || 1;

        // normalized [0,1]
        const nx = this.mouseX / w;
        const ny = this.mouseY / h;

        // remap: x: [0,1]→[-1,1], y: [0,1]→[+1,-1]
        const x = nx * 2 - 1;
        const y = 1 - ny * 2;

        // optionally clamp or scale zoom
        // here we map event.deltaY accumulation into [-1,1]
        const z = MathHelper.clamp(this.zoom / 500, -1, 1);

        return new Point3D(x, y, z, 0, 0);
    }


    /**
     * Retrieves the current state of mouse buttons that are being tracked.
     * 
     * @returns {number[]} An array containing the mouse button codes currently stored in the internal set.
     *                     Each number represents a specific mouse button.
     */
    getmouseButtons(): number[] {
        return [...this.mouseButtons]; // Convert Set to Array
    }

    /**
     * Checks if a specific mouse button is currently pressed.
     * @param button - The mouse button to check (0 for left, 1 for middle, 2 for right).
     * @returns True if the button is pressed, false otherwise.
     */
    isMouseButtonPressed(button: number): boolean {
        return this.mouseButtons.has(button);
    }

    /**
     * Adds an event listener for a specific key.
     * @param key - The key to listen for (e.g., "a", "ArrowUp", " ").
     * @param listener - The function to call when the key is pressed.
     * @returns The Input instance for chaining.
     */
    on(key: string, listener: () => void): this {
        if (!this.keyListeners[key]) {
            this.keyListeners[key] = [];
        }
        this.keyListeners[key].push(listener);
        return this;
    }

    // --- Event Handlers ---

    private onKeyDown(event: KeyboardEvent) {
        this.keys.add(event.key);
        // Do not capture key down time here
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys.delete(event.key);
        this.keyDownTimes[event.key] = 0; // Reset key down time on key up
    }

    private onWheel(event: WheelEvent) {
        // accumulate (or use event.deltaY directly if you don't want to accumulate)
        this.zoom += event.deltaY;
        // notify mouse listeners
        this.emitMouseEvent();
    }

    private onMouseMove(event: MouseEvent) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.emitMouseEvent();
    }

    private onMouseDown(event: MouseEvent) {
        this.mouseButtons.add(event.button);
        this.mouseButtonDownTimes[event.button] = performance.now();
        this.emitMouseEvent();
    }

    private onMouseUp(event: MouseEvent) {
        this.mouseButtons.delete(event.button);
        this.mouseButtonDownTimes[event.button] = 0;
        this.emitMouseEvent();
    }

    private emitMouseEvent() {
        const pressedButtons = [...this.mouseButtons]; // as array
        for (const listener of this.mouseListeners) {
            listener(this.mouseX, this.mouseY, this.zoom, pressedButtons);
        }
    }

}