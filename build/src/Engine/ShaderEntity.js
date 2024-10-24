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
    constructor(key, w, h, props, action) {
        this.key = key;
        this.props = props;
        this.action = action;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
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
     * Updates the ShaderEntity by calling the action function (if provided)
     * and then updating the ShaderRenderer.
     * @param timeStamp - The current timestamp in the animation.
     */
    update(timeStamp) {
        if (this.action && this.shaderRenderer && this.props) {
            this.action(timeStamp, this.shaderRenderer, this.props);
        }
        this.shaderRenderer.update(timeStamp / 1000);
    }
    /**
     * Copies the entity's canvas to the target canvas.
     * @param targetCanvas - The target canvas to copy to.
     */
    copyToCanvas(targetCanvas) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
        }
    }
}
exports.ShaderEntity = ShaderEntity;
