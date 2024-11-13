export class InputHelper {
    private keys: Set<string> = new Set();
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseButtons: Set<number> = new Set();
    private keyListeners: { [key: string]: (() => void)[] } = {};

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

        // Trigger key listeners
        if (this.keyListeners[event.key]) {
            this.keyListeners[event.key].forEach(listener => listener());
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys.delete(event.key);
    }

    private onMouseMove(event: MouseEvent) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    private onMouseDown(event: MouseEvent) {
        this.mouseButtons.add(event.button);
    }

    private onMouseUp(event: MouseEvent) {
        this.mouseButtons.delete(event.button);
    }
}