"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    /**
     * Creates a new Entity.
     * @param key - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity.
     * @param action - The action function that defines the entity's behavior.
     */
    constructor(key, w, h, props, action) {
        this.key = key;
        this.props = props;
        this.action = action;
        this.postProcessors = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext("2d");
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
            targetCtx.drawImage(this.canvas, 0, 0);
            this.postProcessors.forEach(processor => processor(targetCtx, sequence));
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
            this.action(timeStamp, this.ctx, this.props);
        }
    }
}
exports.Entity = Entity;
