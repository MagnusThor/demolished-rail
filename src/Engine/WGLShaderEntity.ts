import { IEntity } from "./Entity";
import { IGLSLShaderProperties } from "./GLSLShaderEntity";
import { Scene } from "./scene";
import { Sequence } from "./sequence";
import { WGLSLShaderRenderer } from "./ShaderRenderers/WebGPU/wgslShaderRenderar";



export interface IWGLSLShaderRenderBuffer {
    name: string;
    vertex: string;
    fragment: string;
}

export interface IWGLSLShaderProperties {
    mainVertexShader: string;
    mainFragmentShader: string;
    canvas: HTMLCanvasElement;
    device: GPUDevice;
    context: GPUCanvasContext;
    renderBuffers?: IWGLSLShaderRenderBuffer[];
}

export class WGLSLShaderEntity implements IEntity {

    canvas: HTMLCanvasElement;
    scene?: Scene | undefined;

    transitionIn?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;
    transitionOut?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;

    beatListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    tickListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    barListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    shaderRenderer: WGLSLShaderRenderer;

    constructor(
        public name: string,
        public props?: IWGLSLShaderProperties,
        public action?: (time: number, shaderRender: WGLSLShaderRenderer,
            properties: IWGLSLShaderProperties, sequence?: Sequence) => void,
        public w?: number,
        public h?: number,
        public startTimeinMs?: number,
        public durationInMs?: number

    ) {

        this.canvas = props?.canvas!;

        if (props?.mainFragmentShader && props.mainVertexShader) {
            this.shaderRenderer = new WGLSLShaderRenderer(this.canvas, this.props?.device!, this.props?.context!);



            props.renderBuffers!.forEach(buffer => {

                //    this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);

            });
        } else {
            throw new Error("Cannot create WGSLShaderEntity: Missing main shader code.");
        }

    }

    bindToScene(scene: Scene): void {
        throw new Error("Method not implemented.");
    }
    update(timeStamp: number): void {
        throw new Error("Method not implemented.");
    }

    copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence): void {
        throw new Error("Method not implemented.");
    }


    onBeat(listener?: (time: number, count: number, propertyBag: any) => void): void {
        throw new Error("Method not implemented.");
    }
    onTick(listener?: (time: number, count: number, propertyBag: any) => void): void {
        throw new Error("Method not implemented.");
    }
    onBar(listener?: (time: number, count: number, propertyBag: any) => void): void {
        throw new Error("Method not implemented.");
    }

}
