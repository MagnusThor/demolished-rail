
import { IEntity } from "./Entity";
import { ShaderRenderer } from "./ShaderRenderer/ShaderRenderer";


export interface IShaderRenderBuffer {
    name: string
    vertex: string
    fragment: string
    customUniforms?: {}
    textures: string[]
}


export interface IShaderProperties {
    mainShaderVertex: string
    mainFragmentShader: string
    rendeBuffers: IShaderRenderBuffer[]
}


export class ShaderEntity implements IEntity {
    canvas: HTMLCanvasElement;
    shaderRenderer: ShaderRenderer;
    update(timeStamp: number): void {
        this.shaderRenderer.update(timeStamp / 1000);
    }

    copyToCanvas(targetCanvas: HTMLCanvasElement): void {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
        }
    }

    constructor(public key: string, w: number, h: number, public props?: IShaderProperties,
        public action?: (time: number, ctx: CanvasRenderingContext2D, properties: IShaderProperties) => void) {


        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        if (props?.mainFragmentShader && props.mainShaderVertex) {
            this.shaderRenderer = new ShaderRenderer(this.canvas, props?.mainShaderVertex, props?.mainFragmentShader);
            props.rendeBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });


        } else throw "Cannot create shaderRender"


    }

}