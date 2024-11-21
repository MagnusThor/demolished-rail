export class InputHelper {
    private keys: Set<string> = new Set();
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseButtons: Set<number> = new Set();
    private keyListeners: { [key: string]: (() => void)[] } = {};


    private keyDownTimes: { [key: string]: number } = {}; // Store key down times
    private mouseButtonDownTimes: { [button: number]: number } = {}; // Store mouse button down times


    /**
     * Initializes the Input class by attaching event listeners for keyboard and mouse events.
     */
    constructor(parent: HTMLElement) {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        parent.addEventListener('mousemove', (e) => this.onMouseMove(e));
        parent.addEventListener('mousedown', (e) => this.onMouseDown(e));
        parent.addEventListener('mouseup', (e) => this.onMouseUp(e));
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
    private onMouseMove(event: MouseEvent) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    private onMouseDown(event: MouseEvent) {
        this.mouseButtons.add(event.button);
        this.mouseButtonDownTimes[event.button] = performance.now(); // Capture mouse button down time

    }

    private onMouseUp(event: MouseEvent) {
        this.mouseButtons.delete(event.button);
        this.mouseButtonDownTimes[event.button] = 0;
    }
}