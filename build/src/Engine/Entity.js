"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const sequence_1 = require("./sequence");
class Entity {
    /**
     * Creates a new Entity.
     * @param name - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity.
     * @param action - The action function that defines the entity's behavior.
     */
    constructor(name, props, action, startTimeinMs, durationInMs, w, h) {
        this.name = name;
        this.props = props;
        this.action = action;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.w = w;
        this.h = h;
        this.postProcessors = [];
        this.beatListeners = [];
        this.tickListeners = [];
        this.barListeners = [];
        this.canvas = document.createElement("canvas");
        if (w !== undefined && h !== undefined) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        ;
        this.ctx = this.canvas.getContext("2d");
    }
    /**
    * Adds an event listener for when a beat occurs.
    * @param listener - The function to call when a beat occurs.
    * @returns The Entity instance for chaining.
    */
    onBeat(listener) {
        this.beatListeners.push(listener);
        return this;
    }
    /**
     * Adds an event listener for when a tick occurs.
     * @param listener - The function to call when a tick occurs.
     * @returns The Entity instance for chaining.
     */
    onTick(listener) {
        this.tickListeners.push(listener);
        return this;
    }
    /**
     * Adds an event listener for when a bar is complete.
     * @param listener - The function to call when a bar is complete.
     * @returns The Entity instance for chaining.
     */
    onBar(listener) {
        this.barListeners.push(listener);
        return this;
    }
    /**
     * Adds a post-processing function to the entity.
     * @param processor - The post-processing function to add.
     */
    addPostProcessor(processor) {
        this.postProcessors.push(processor);
    }
    /**
     * Copies the entity's canvas to the target canvas and applies post-processors.
     * @param targetCanvas - The target canvas to copy to.
     * @param sequence - The Sequence instance.
     */
    copyToCanvas(targetCanvas, sequence) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            // Calculate the elapsed time for the entity
            const elapsed = sequence.currentTime - (this.startTimeinMs || 0);
            // Check if the entity should be rendered based on its lifetime
            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
                targetCtx.drawImage(this.canvas, 0, 0);
                this.postProcessors.forEach(processor => processor(targetCtx, sequence));
            }
        }
    }
    /**
    * Updates the entity's state, clears the canvas, and calls the action function.
    * @param timeStamp - The current timestamp in the animation.
    */
    update(timeStamp) {
        var _a;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.action && this.ctx && this.props) {
            // Calculate the elapsed time for the entity
            const elapsed = timeStamp - (this.startTimeinMs || 0);
            // Check if the entity should be rendered based on its lifetime
            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
                this.action(timeStamp, this.ctx, this.props);
            }
            // const sequence = this.getSequence();
            // if (sequence) {
            //   this.triggerEntityListeners(sequence, timeStamp);
            // }
        }
    }
    /**
   * Retrieves the Sequence instance associated with the entity.
   * @returns The Sequence instance if available, otherwise null.
   */
    getSequence() {
        if (this.action && this.action.length >= 4) { // Check if the action function accepts the sequence parameter
            const sequence = this.action.arguments[3]; // Access the fourth argument (sequence)
            if (sequence instanceof sequence_1.Sequence) {
                return sequence;
            }
        }
        return null;
    }
}
exports.Entity = Entity;
