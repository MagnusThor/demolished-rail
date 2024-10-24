import { IEntity } from "./entity";
import { ShaderRenderer } from "./ShaderRenderer/shaderRenderer";

export interface IShaderRenderBuffer {
    name: string;
    vertex: string;
    fragment: string;
    customUniforms?: {};
    textures: string[];
}

export interface IShaderProperties {
    mainShaderVertex: string;
    mainFragmentShader: string;
    rendeBuffers: IShaderRenderBuffer[];
}

export class ShaderEntity implements IEntity {
    canvas: HTMLCanvasElement;
    shaderRenderer: ShaderRenderer;

    /**
     * Creates a new ShaderEntity.
     * @param key - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity, including shader code and render buffers.
     * @param action - An optional action function to be called before rendering the shaders.
     */
    constructor(
        public key: string,
        w: number,
        h: number,
        public props?: IShaderProperties,
        public action?: (time: number, shaderRender: ShaderRenderer, properties: IShaderProperties) => void
    ) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        if (props?.mainFragmentShader && props.mainShaderVertex) {
            this.shaderRenderer = new ShaderRenderer(this.canvas, props?.mainShaderVertex, props?.mainFragmentShader);
            props.rendeBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });
        } else {
            throw new Error("Cannot create ShaderEntity: Missing main shader code.");
        }
    }

    /**
     * Updates the ShaderEntity by calling the action function (if provided)
     * and then updating the ShaderRenderer.
     * @param timeStamp - The current timestamp in the animation.
     */
    update(timeStamp: number): void {
        if (this.action && this.shaderRenderer && this.props) {
            this.action(timeStamp, this.shaderRenderer, this.props);
        }
        this.shaderRenderer.update(timeStamp / 1000);
    }

    /**
     * Copies the entity's canvas to the target canvas.
     * @param targetCanvas - The target canvas to copy to.
     */
    copyToCanvas(targetCanvas: HTMLCanvasElement) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
        }
    }
}