import { IEntity } from "./entity";
import { Sequence } from "./sequence";
import { ShaderRenderer } from "./ShaderRenderer/shaderRenderer";

export interface IShaderRenderBuffer {
    name: string;
    vertex: string;
    fragment: string;
    customUniforms?: {};
    textures: string[];
}

export interface IShaderProperties {
    mainVertexShader: string;
    mainFragmentShader: string;
    renderBuffers: IShaderRenderBuffer[];
}

export class ShaderEntity implements IEntity {
    canvas: HTMLCanvasElement;
    shaderRenderer: ShaderRenderer;
    transitionIn?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;
    transitionOut?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;

    beatListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    tickListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
    barListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];

    private postProcessors: ((ctx: CanvasRenderingContext2D, sequence: Sequence) => void)[] = [];
    /**
     * Creates a new ShaderEntity.
     * @param name - The key or identifier for the entity.
     * @param w - The width of the entity's canvas.
     * @param h - The height of the entity's canvas.
     * @param props - The properties for the entity, including shader code and render buffers.
     * @param action - An optional action function to be called before rendering the shaders.
     */
    constructor(
        public name: string,
        public props?: IShaderProperties,
        public action?: (time: number, shaderRender: ShaderRenderer, properties: IShaderProperties, sequence?: Sequence) => void,
        public w?: number,
        public h?: number,
        public startTimeinMs?: number,
        public durationInMs?: number

    ) {
        this.canvas = document.createElement("canvas");
        if (w && h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        if (props?.mainFragmentShader && props.mainVertexShader) {
            this.shaderRenderer = new ShaderRenderer(this.canvas, props?.mainVertexShader, props?.mainFragmentShader);
            props.renderBuffers.forEach(buffer => {
                this.shaderRenderer.addBuffer(buffer.name, buffer.vertex, buffer.fragment, buffer.textures, buffer.customUniforms);
            });
        } else {
            throw new Error("Cannot create ShaderEntity: Missing main shader code.");
        }
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
 * Adds a post-processing function to the entity.
 * @param processor - The post-processing function to add.
 */
    addPostProcessor(processor: (ctx: CanvasRenderingContext2D, sequence: Sequence) => void) {
        this.postProcessors.push(processor);
    }


    /**
     * Updates the ShaderEntity by calling the action function (if provided)
     * and then updating the ShaderRenderer.
     * @param timeStamp - The current timestamp in the animation.
     */
    update(timeStamp: number): void {
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