
import { Uniforms } from "./uniforms";
import { Material } from "./material";
import { Geometry, IGeometry, VERTEXType } from "./geometry";

import { TextureLoader } from "./textureLoader";
import { IPass, RenderPass } from "../../Interfaces/IPass";
import { ITextureData } from "../../Interfaces/ITextureData";
import { RenderPassBuilder } from "./renderPassBuilder";
import { ITexture } from "../../Interfaces/ITexture";
import { IMaterialShader } from "../../Interfaces/IMaterialShader";


export const initWebGPU = async (canvas:HTMLCanvasElement) => {
    const adapter = await navigator.gpu?.requestAdapter();      
    const hasBGRA8unormStorage = adapter!.features.has('bgra8unorm-storage');
    const device = await adapter?.requestDevice({
        requiredFeatures: hasBGRA8unormStorage
            ? ['bgra8unorm-storage']
            : [],
    });
    if (!device)
        throw "need a browser that supports WebGPU";
    const context = canvas.getContext("webgpu");
    context?.configure({
        device,
        format: hasBGRA8unormStorage
        ? navigator.gpu.getPreferredCanvasFormat()
        : 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });    
    return {device,context};
};




export const rectGeometry:IGeometry = {
    verticesType:VERTEXType.xyz,
       vertices: new Float32Array([
           -1, 1, 0, 
           -1, -1, 0,
           1, -1, 0, 
           1, 1, 0, 
           -1, 1, 0,
           1, -1, 0,
       ]),
       indicies:new Uint16Array([ 0, 1, 2,3,4,5 ]),
}


/**
 * The Renderer class is responsible for managing the WebGPU rendering context, 
 * creating and executing render passes, and handling resources like buffers and textures.
 */
export class WGLSLShaderRenderer {

   

    renderPassBacklog: Map<string, IPass>;

    renderTarget!: GPUTexture;
    renderPipleline!: GPURenderPipeline;

    renderPassBuilder!: RenderPassBuilder;

    frameCount: number = 0;
    isPaused: any;

    screen_bind_group!: GPUBindGroup;

    geometry!: Geometry;
    textures: Array<ITextureData>;

    frame: number = 0;
    uniforms!: Uniforms;
    zoomLevel: number = 1.;

    constructor(public canvas: HTMLCanvasElement,public device:GPUDevice, 
        public context:GPUCanvasContext,geometry?:IGeometry ) 
    {
        this.renderPassBacklog = new Map<string, IPass>();
        this.textures = new Array<ITextureData>();
        this.renderPassBuilder = new RenderPassBuilder(device, this.canvas);
        this.geometry = new Geometry(device, geometry || rectGeometry); 
        this.uniforms = new Uniforms(this.device, this.canvas);      

    }
     /**
   * Gets the WebGPU device.
   * @returns The GPUDevice.
   * @throws Error if the device is not initialized.
   */
    private getDevice():GPUDevice{
        if(!this.device) throw "Cannot get the GPUDevice";
        return this.device;
    }

    /**
   * Creates a render pipeline for a given material.
   * @param uniformBuffer - The uniform buffer for the pipeline.
   * @param material - The material to use for the pipeline.
   * @returns The created GPURenderPipeline.
   */
    creatRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        const sampler = this.getDevice().createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });
        bindingGroupEntrys.push({
            binding: 0,
            resource: sampler
        },
            {
                binding: 1,
                resource: {
                    buffer: uniformBuffer
                }
            }
        );
        const layout = new Array<GPUBindGroupLayoutEntry>();
        layout.push({
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform"
            }
        });
        const pipleline_group_layout = this.getDevice().createBindGroupLayout({
            entries: layout
        });


        const pipeline_layout = this.getDevice().createPipelineLayout({
            bindGroupLayouts: [pipleline_group_layout]
        });

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                    format: 'bgra8unorm'
                }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: pipeline_layout
        };
        return this.getDevice().createRenderPipeline(pipelineDescriptor);
    }

    /**
   * Creates a main render pipeline for a given material.
   * @param uniformBuffer - The uniform buffer for the pipeline.
   * @param material - The material to use for the pipeline.
   * @returns The created GPURenderPipeline.
   */
    createMainRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.getDevice().createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 0,
            resource: sampler
        }, {
            binding: 1,
            resource: {
                buffer: uniformBuffer
            }
        });

        const layout = new Array<GPUBindGroupLayoutEntry>();

        layout.push({
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform"
            }
        });

        const renderPasses = Array.from(this.renderPassBacklog.values());
        renderPasses.forEach((pass, i) => {
            bindingGroupEntrys.push({
                binding: 2 + i,
                resource: pass.bufferView
            });
            layout.push(
                {
                    binding: 2 + i,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                });
        });

        const screen_bind_group_layout = this.getDevice().createBindGroupLayout({
            entries: layout
        });

        this.screen_bind_group = this.getDevice().createBindGroup({
            layout: screen_bind_group_layout,
            entries: bindingGroupEntrys
        });

        const screen_pipeline_layout = this.getDevice().createPipelineLayout({
            bindGroupLayouts: [screen_bind_group_layout]
        });


        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                    format: 'bgra8unorm'
                }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: screen_pipeline_layout
        };

        return this.getDevice().createRenderPipeline(pipelineDescriptor);

    }

    /**
   * Creates render targets for the pipeline.
   * @returns An object containing the texture and texture view for the render target.
   */
    createAssets(): { buffer: GPUTexture; bufferView: GPUTextureView; } {
        const buffer = this.getDevice().createTexture(
            {
                size: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                },
                format: "bgra8unorm",
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
            }
        );
        return { buffer, bufferView: buffer.createView() };

    }



  /**
   * Creates a buffer on the GPU.
   * @param arr - The data to store in the buffer.
   * @param usage - The usage flags for the buffer.
   * @param vertexSize - The size of each vertex in bytes.
   * @returns The created GPUBuffer.
   */
    createBuffer(arr: Float32Array | Uint16Array, usage: number, vertexSize: number) {
        let bufferDescriptor = {
            size: (arr.byteLength + vertexSize) & ~vertexSize,
            usage,
            mappedAtCreation: true
        };
        let buffer = this.getDevice().createBuffer(bufferDescriptor);
        const writeArray = arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
        writeArray.set(arr);
        buffer.unmap();
        return buffer;
    }


    /**
   * Adds a main render pass to the backlog.
   * @param material - The material to use for the render pass.
   */
    addMainRenderPass(shader: IMaterialShader) {
        const material =  new Material(this.device,shader);

        console.log(material);

        this.renderPipleline = this.createMainRenderPipeline(this.uniforms.uniformBuffer,
           material);
    }

    /**
   * Adds a render pass to the backlog.
   * @param label - The label for the render pass.
   * @param material - The material to use for the render pass.
   * @param geometry - The geometry to use for the render pass.
   * @param textures - An optional array of textures to use in the render pass.
   */
    addRenderPass(label: string, material: Material, geometry: Geometry,textures?:ITextureData[]) {

       
        textures?.forEach( texture => {
            this.textures.push(texture);
        });

        const priorRenderPasses = Array.from(this.renderPassBacklog.values());
        const uniforms = this.uniforms;
    
        const renderPipeline = this.renderPassBuilder.createRenderPipeline(material, geometry,
        this.textures, priorRenderPasses);

        const assets = this.createAssets();
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.getDevice().createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });


        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        }, {
            binding: 1,
            resource: sampler
        }
        );

        let offset = bindingGroupEntrys.length;
        // Pass the previos renderpasses to current
        priorRenderPasses.forEach((pass, i) => {
            bindingGroupEntrys.push({
                binding: offset + i,
                resource: pass.bufferView,
            });
        });

        // Add the bindings for the textures  
        offset = bindingGroupEntrys.length;
        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + offset,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {
                entry = {
                    binding: i + 2,
                    resource: this.getDevice().importExternalTexture({ source: t.data as HTMLVideoElement }),
                };
            }
            bindingGroupEntrys.push(entry);
        });

        const bindGroup = this.getDevice().createBindGroup({
            layout: renderPipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys,
            label: `${label} renderpass`
        });

        const renderPass = new RenderPass(
            1, label, renderPipeline, uniforms, bindGroup, assets.buffer, assets.bufferView
        );

        this.renderPassBacklog.set(label, renderPass); // send it the the renderpass backlog
    }

    /**
   * Adds a compute render pass to the backlog.
   * @param label - The label for the compute pass.
   * @param computeShaderCode - The WGSL code for the compute shader.
   * @param textures - An optional array of textures to use in the compute pass.
   */
    async addComputeRenderPass(label: string, computeShaderCode: string,
        textures?: Array<ITexture>, samplers?: Array<GPUSamplerDescriptor>
    ) {

        if (samplers) throw "Samplers not yet implememted, using default binding 2"

        const shaderModule = this.getDevice().createShaderModule(
            { code: computeShaderCode });

        const uniforms = this.uniforms    //new Uniforms(this.device, this.canvas);

        if (textures) {
            for (let i = 0; i < textures!.length; i++) {
                const texture = textures[i];
                if (texture.type == 0) {
                    this.textures.push({ type: 0, data: await TextureLoader.createImageTexture(this.getDevice(), texture) });
                } else
                    this.textures.push({ type: 1, data: await TextureLoader.createVideoTexture(this.getDevice(), texture) });
            }
        }
        const computePipeline = this.renderPassBuilder.createComputePipeline(shaderModule,
            this.textures);
        const assets = this.createAssets();
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.getDevice().createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 0,
            resource: assets.bufferView
        }, {
            binding: 1,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        }

        );

        const offset = bindingGroupEntrys.length;

        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + offset,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {
                entry = {
                    binding: i + 2,
                    resource: this.getDevice().importExternalTexture({ source: t.data as HTMLVideoElement }),
                };
            }
            bindingGroupEntrys.push(entry);
        });

        const bindGroup = this.getDevice().createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys,
            label: `${label} computepass`
        });
        const renderPass = new RenderPass(
            0, label, computePipeline, uniforms, bindGroup, assets.buffer, assets.bufferView
        );
        this.renderPassBacklog.set(label, renderPass);
    }

    /**
   * Updates the renderer and executes all render passes in the backlog.
   * @param time - The current time in seconds.
   */

    update(ts: number) {
        const encoder = this.getDevice().createCommandEncoder();
        const arrRenderPasses = Array.from(this.renderPassBacklog.values());
        // get the compute shaders from the back log
        arrRenderPasses.filter((pre) => {
            return pre.type == 0
        }).forEach(pass => {
            const computePass = encoder.beginComputePass();
            computePass.setPipeline(pass.pipleline as GPUComputePipeline);
            computePass.setBindGroup(0, pass.bindGroup);
            computePass.dispatchWorkgroups(Math.floor((this.canvas.width + 7) / 8), Math.floor((this.canvas.height + 7) / 8), 1);
            computePass.end();
        });
        arrRenderPasses.filter(pre => {
            return pre.type == 1
        }).forEach(pass => {
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: pass.bufferView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                }]
            };
            const renderPass = encoder.beginRenderPass(renderPassDescriptor);
            renderPass.setPipeline(pass.pipleline as GPURenderPipeline)
            renderPass.setBindGroup(0, pass.bindGroup);
            renderPass.setVertexBuffer(0, this.geometry.vertexBuffer);
            renderPass.setIndexBuffer(this.geometry.indexBuffer, 'uint16');
            renderPass.drawIndexed(this.geometry.numOfVerticles, 1);
            renderPass.end();
        });
        const mainRenderer: GPURenderPassEncoder = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context!.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0, b: 0.0, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });
        this.uniforms.setUniforms([this.frame], 8);
        this.uniforms.setUniforms([ts], 3);
        this.uniforms.updateUniformBuffer();

        mainRenderer.setPipeline(this.renderPipleline);
        mainRenderer.setVertexBuffer(0, this.geometry.vertexBuffer);
        mainRenderer.setBindGroup(0, this.screen_bind_group);
        mainRenderer.draw(6, 1, 0, 0);
        mainRenderer.end();
        this.getDevice().queue.submit([encoder.finish()]);
    }

    /**
   * Starts the rendering loop.
   * @param t - The initial time.
   * @param maxFps - The maximum frames per second.
   * @param onFrame - An optional callback function to be called on each frame.
   */
    start(t: number, maxFps: number = 200, onFrame?: (frame: number) => void): void {
        let startTime: any = null;
        let frame = -1;
        const renderLoop = (ts: number) => {
            if (!startTime) startTime = ts;
            let segment = Math.floor((ts - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frame = segment;
                this.frameCount = frame;
                if (!this.isPaused) {
                    this.update(ts / 1000);
                    if (onFrame) onFrame(frame);
                }
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause(): void {
        this.isPaused = !this.isPaused;
    }
    clear() {
        this.renderPassBacklog.clear();
    }
           
}
