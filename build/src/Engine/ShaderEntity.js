"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderEntity = void 0;
const ShaderRenderer_1 = require("./ShaderRenderer/ShaderRenderer");
class ShaderEntity {
    update(timeStamp) {
        this.shaderRenderer.update(timeStamp / 1000);
    }
    copyToCanvas(targetCanvas) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
        }
    }
    constructor(key, w, h, props, action) {
        this.key = key;
        this.props = props;
        this.action = action;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        if ((props === null || props === void 0 ? void 0 : props.mainFragmentShader) && props.mainShaderVertex) {
            this.shaderRenderer = new ShaderRenderer_1.ShaderRenderer(this.canvas, props === null || props === void 0 ? void 0 : props.mainShaderVertex, props === null || props === void 0 ? void 0 : props.mainFragmentShader);
            props.rendeBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });
        }
        else
            throw "Cannot create shaderRender";
    }
}
exports.ShaderEntity = ShaderEntity;
