import { IEntity } from './Entity';
import { Scene } from './Scene';
import { Sequence } from './Sequence';
import { Geometry } from './ShaderRenderers/WebGPU/Geometry';
import {
  IMaterialShader,
  Material,
} from './ShaderRenderers/WebGPU/Material';
import { IWGSLTextureData } from './ShaderRenderers/WebGPU/TextureLoader';
import {
  WGSLShaderRenderer,
} from './ShaderRenderers/WebGPU/WGSLShaderRenderer';

export interface IWGSLShaderRenderBuffer {
    name: string;
    shader: Material;
    geometry: Geometry;
    textures?: Array<IWGSLTextureData>
}

export interface IWGSLShaderProperties {
    shader: IMaterialShader
    canvas: HTMLCanvasElement;
    device: GPUDevice;
    context: GPUCanvasContext;
    renderBuffers?: IWGSLShaderRenderBuffer[];
}
export class WGSLShaderEntity
 implements IEntity {

    canvas: HTMLCanvasElement;
    scene?: Scene | undefined;

    transitionIn?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;
    transitionOut?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;

    beatListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    tickListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    barListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    shaderRenderer: WGSLShaderRenderer;

    constructor(
        public name: string,
        public props?: IWGSLShaderProperties,
        public action?: (time: number, shaderRender: WGSLShaderRenderer,
            properties: IWGSLShaderProperties, sequence?: Sequence) => void,
        public w?: number,
        public h?: number,
        public startTimeinMs?: number,
        public durationInMs?: number
    ) {

       
        this.canvas = props?.canvas!;

        if (props?.shader) {
            this.shaderRenderer = new WGSLShaderRenderer(this.canvas, this.props?.device!, this.props?.context!);
            props.renderBuffers!.forEach((buffer, index) => {
                this.shaderRenderer.addRenderPass(buffer.name,
                    buffer.shader, buffer.geometry,buffer.textures)
            });
            this.shaderRenderer.addMainRenderPass(props.shader);
        } else {
            throw new Error("Cannot create WGSLShaderEntity: Missing main shader code.");
        }


    }

    bindToScene(scene: Scene): void {
        this.scene = scene;
    }


    /**
 * Adds an event listener for when a beat occurs.
 * @param listener - The function to call when a beat occurs.
 * @returns The Entity instance for chaining.
 */
    onBeat<T>(listener: (time: number, count: number, propeetyBag: T) => void): this {
        this.beatListeners!.push(listener as any);
        return this;
    }

    /**
     * Adds an event listener for when a tick occurs.
     * @param listener - The function to call when a tick occurs.
     * @returns The Entity instance for chaining.
     */
    onTick<T>(listener: (time: number, count: number) => void): this {
        this.tickListeners!.push(listener as any);
        return this;
    }

    /**
     * Adds an event listener for when a bar is complete.
     * @param listener - The function to call when a bar is complete.
     * @returns The Entity instance for chaining.
     */
    onBar<T>(listener: (ts: number, count: number, props: T) => void): this {
        this.barListeners!.push(listener as any);
        return this;
    }






    /**
     * Updates the ShaderEntity by calling the action function (if provided)
     * and then updating the ShaderRenderer.
     * @param timeStamp - The current timestamp in the animation.
     */
    update(timeStamp: number): void {
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
    copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence) {
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
