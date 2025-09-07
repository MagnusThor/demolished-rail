/**
 * A helper class to manage keyboard and mouse input.
 * It provides methods to check the state of keys and mouse buttons.
 */
export class InputHelper {
    private keys: Set<string> = new Set();
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseButtons: Set<number> = new Set();
    private keyListeners: { [key: string]: { down: (() => void)[], up: (() => void)[] } } = {};

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
     * Registers an event listener for a specific key and event type.
     * @param type - The event type to listen for: 'down' or 'up'.
     * @param key - The key to listen for (e.g., "a", "ArrowUp", " ").
     * @param listener - The function to call when the key event occurs.
     * @returns The Input instance for chaining.
     */
    on(type: 'down' | 'up', key: string, listener: () => void): this {
        if (!this.keyListeners[key]) {
            this.keyListeners[key] = { down: [], up: [] };
        }
        this.keyListeners[key][type].push(listener);
        return this;
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

    // --- Event Handlers ---

    private onKeyDown(event: KeyboardEvent) {
        this.keys.add(event.key);
        // Trigger key listeners
        if (this.keyListeners[event.key]) {
            this.keyListeners[event.key].down.forEach(listener => listener());
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys.delete(event.key);
        if (this.keyListeners[event.key]) {
            this.keyListeners[event.key].up.forEach(listener => listener());
        }
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
