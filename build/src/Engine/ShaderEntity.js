"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderEntity = void 0;
const shaderRenderer_1 = require("./ShaderRenderer/shaderRenderer");
class ShaderEntity {
    /**
     * Creates a new ShaderEntity.
     * @param key - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity, including shader code and render buffers.
     * @param action - An optional action function to be called before rendering the shaders.
     */
    constructor(key, props, action, startTimeinMs, durationInMs, w, h) {
        this.key = key;
        this.props = props;
        this.action = action;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.w = w;
        this.h = h;
        this.postProcessors = [];
        this.canvas = document.createElement("canvas");
        if (w && h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        if ((props === null || props === void 0 ? void 0 : props.mainFragmentShader) && props.mainShaderVertex) {
            this.shaderRenderer = new shaderRenderer_1.ShaderRenderer(this.canvas, props === null || props === void 0 ? void 0 : props.mainShaderVertex, props === null || props === void 0 ? void 0 : props.mainFragmentShader);
            props.rendeBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });
        }
        else {
            throw new Error("Cannot create ShaderEntity: Missing main shader code.");
        }
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
            // Calculate the elapsed time for the entity
            const elapsed = timeStamp - (this.startTimeinMs || 0);
            this.action(timeStamp, this.shaderRenderer, this.props);
            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
                this.action(timeStamp, this.shaderRenderer, this.props);
                this.shaderRenderer.update(timeStamp / 1000);
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
