"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderEntity = void 0;
const shaderRenderer_1 = require("./ShaderRenderer/shaderRenderer");
class ShaderEntity {
    /**
     * Creates a new ShaderEntity.
     * @param name - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity, including shader code and render buffers.
     * @param action - An optional action function to be called before rendering the shaders.
     */
    constructor(name, props, action, w, h, startTimeinMs, durationInMs) {
        this.name = name;
        this.props = props;
        this.action = action;
        this.w = w;
        this.h = h;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.beatListeners = [];
        this.tickListeners = [];
        this.barListeners = [];
        this.postProcessors = [];
        this.canvas = document.createElement("canvas");
        if (w && h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        if ((props === null || props === void 0 ? void 0 : props.mainFragmentShader) && props.mainVertexShader) {
            this.shaderRenderer = new shaderRenderer_1.ShaderRenderer(this.canvas, props === null || props === void 0 ? void 0 : props.mainVertexShader, props === null || props === void 0 ? void 0 : props.mainFragmentShader);
            props.renderBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });
        }
        else {
            throw new Error("Cannot create ShaderEntity: Missing main shader code.");
        }
    }
    bindToScene(scene) {
        this.scene = scene;
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
     * Updates the ShaderEntity by calling the action function (if provided)
     * and then updating the ShaderRenderer.
     * @param timeStamp - The current timestamp in the animation.
     */
    update(timeStamp) {
        if (this.action && this.shaderRenderer && this.props) {
            // Calculate elapsed time relative to the scene's start time
            const sceneStartTime = this.scene ? this.scene.startTimeinMs : 0;
            const elapsed = timeStamp - sceneStartTime - (this.startTimeinMs || 0);
            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
                this.action(timeStamp, this.shaderRenderer, this.props);
                // Calculate shader time relative to the entity's start time (within the scene)
                const shaderTime = Math.max(0, elapsed);
                this.shaderRenderer.update(shaderTime / 1000);
            }
        }
    }
    /**
     * Copies the entity's canvas to the target canvas.
     * @param targetCanvas - The target canvas to copy to.
     */
    copyToCanvas(targetCanvas, sequence) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            // Calculate the elapsed time for the entity
            const elapsed = sequence.currentTime - (this.startTimeinMs || 0);
            // Check if the entity should be rendered based on its lifetime
            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
                targetCtx.drawImage(this.canvas, 0, 0);
            }
        }
    }
}
exports.ShaderEntity = ShaderEntity;
