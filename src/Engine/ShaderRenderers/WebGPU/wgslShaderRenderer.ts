import {
  Geometry,
  IGeometry,
  rectGeometry,
} from './Geometry';
import {
  IMaterialShader,
  Material,
} from './Material';
import {
  IRenderPass,
  RenderPass,
  RENDERPASS,
  RenderPassBuilder,
  WebGPUTiming,
} from './RenderPassBuilder';
import { IWGSLTextureData } from './TextureLoader';
import { Uniforms } from './Uniforms';

export const getWorkgroupSizeString = (limits: any): {
    x: number, y: number, z: number,
    workgroup_size: string

} => {
    const x = Math.min(16, largestPowerOf2LessThan(limits.maxComputeWorkgroupSizeX));
    const y = Math.min(16, largestPowerOf2LessThan(limits.maxComputeWorkgroupSizeY));
    return {
        x: x, y, z: 1, workgroup_size: `@workgroup_size(${x}, ${y}, 1)`
    };
}

export const largestPowerOf2LessThan = (n: number): number => {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}



export class RollingAverage {
    total: number = 0;
    samples: number[] = [];
    cursor: number = 0;

    constructor(public numSamples: number = 30) {
    }
    addSample(v: number) {
        this.total += v - (this.samples[this.cursor] || 0);
        this.samples[this.cursor] = v;
        this.cursor = (this.cursor + 1) % this.numSamples;
    }
    get() {
        return this.total / this.samples.length;
    }
}


export const initWebGPU = async (canvas: HTMLCanvasElement, options?: GPURequestAdapterOptions) => {
    const adapter = await navigator.gpu?.requestAdapter(options);
    const hasBGRA8unormStorage = adapter!.features.has('bgra8unorm-storage');
    const canTimestamp = adapter!.features.has('timestamp-query');

    const features: GPUFeatureName[] = [];
    if (hasBGRA8unormStorage) {
        features.push('bgra8unorm-storage');
    }
    if (canTimestamp) {
        features.push('timestamp-query');
    }
    const device = await adapter?.requestDevice({
        requiredFeatures: features
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

    const workgroupsize = getWorkgroupSizeString(adapter!.limits);

    return { device, context, adapter, workgroupsize };
};

/**
 * The Renderer class is responsible for managing the WebGPU rendering context, 
 * creating and executing render passes, and handling resources like buffers and textures.
 */
export class WGSLShaderRenderer {

    gpuAverage: RollingAverage | undefined
    renderPassBacklog: Map<string, IRenderPass>;
    renderPipleline!: GPURenderPipeline;
    renderPassBuilder!: RenderPassBuilder;
    frameCount: number = 0;
    frame: number = 0;
    isPaused: any;
    screenBindGroup!: GPUBindGroup;
    geometry!: Geometry;
    textures: Array<IWGSLTextureData>;
    uniforms!: Uniforms;
    gpuTimer: WebGPUTiming;

    constructor(public canvas: HTMLCanvasElement, public device: GPUDevice,
        public context: GPUCanvasContext, geometry?: IGeometry) {
        this.renderPassBacklog = new Map<string, IRenderPass>();
        this.textures = new Array<IWGSLTextureData>();
        this.renderPassBuilder = new RenderPassBuilder(device);
        this.geometry = new Geometry(device, geometry || rectGeometry);
        this.uniforms = new Uniforms(this.device, this.canvas);
        this.gpuAverage = new RollingAverage(30);
        this.gpuTimer = new WebGPUTiming(this.device);

    }
    /**
  * Gets the WebGPU device.
  * @returns The GPUDevice.
  * @throws Error if the device is not initialized.
  */
    private getDevice(): GPUDevice {
        if (!this.device) throw "Cannot get the GPUDevice";
        return this.device;
    }

    /**
   * Creates a render pipeline for a given material.
   * @param uniformBuffer - The uniform buffer for the pipeline.
   * @param material - The material to use for the pipeline.
   * @returns The created GPURenderPipeline.
   */
    createRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {
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
   * This pipeline combines the output of other render passes.
   * @param uniformBuffer - The uniform buffer for the pipeline.
   * @param material - The material to use for the pipeline.
   * @returns The created GPURenderPipeline.
   */
    createMainRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {
        const bindingGroupEntries: Array<GPUBindGroupEntry> = [];

        // Create a default sampler
        const sampler = this.getDevice().createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        // Bind the sampler and uniform buffer
        bindingGroupEntries.push(
            { binding: 0, resource: sampler },
            { binding: 1, resource: { buffer: uniformBuffer } }
        );

        const layout = new Array<GPUBindGroupLayoutEntry>();

        // Define the layout entries for the sampler and uniform buffer
        layout.push(
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: { type: "uniform" }
        }
        );

        // Include the output textures from other render passes in the bind group
        const renderPasses = Array.from(this.renderPassBacklog.values());
        renderPasses.forEach((pass, index) => {
            bindingGroupEntries.push({
                binding: 2 + index,
                resource: pass.bufferView
            });
            layout.push({
                binding: 2 + index,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            });
        });

        // Create the bind group layout and pipeline layout
        const screenBindGroupLayout = this.getDevice().createBindGroupLayout({ entries: layout });
        this.screenBindGroup = this.getDevice().createBindGroup({
            layout: screenBindGroupLayout,
            entries: bindingGroupEntries
        });
        const screenPipelineLayout = this.device.createPipelineLayout({ bindGroupLayouts: [screenBindGroupLayout] });

        // Create the render pipeline
        return this.device.createRenderPipeline({
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{ format: 'bgra8unorm' }]
            },
            primitive: { topology: 'triangle-list' },
            layout: screenPipelineLayout
        });
    }
    /**
     * Creates a render target texture.
     * @param width - The width of the render target.
     * @param height - The height of the render target.
     * @returns An object containing the texture and texture view for the render target.
     */
    createRenderTarget(width: number, height: number): { buffer: GPUTexture; bufferView: GPUTextureView } {
        const buffer = this.getDevice().createTexture(
            {
                size: {
                    width: width,
                    height: height,
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
   * @param shader - The material to use for the render pass.
   */
    addMainRenderPass(shader: IMaterialShader) {
        const material = new Material(this.device, shader);
        this.renderPipleline = this.createMainRenderPipeline(this.uniforms.uniformBuffer,
            material);
    }

    /**
     * Adds a render pass to the backlog.
     * @param label - The label for the render pass.
     * @param material - The material to use for the render pass.
     * @param geometry - The geometry to use for the render pass.
     * @param textures - An optional array of textures to use in the render pass.
     * @returns The created RenderPass object.
     */
    addRenderPass(label: string, material: Material, geometry: Geometry, textures: IWGSLTextureData[] = []): RenderPass {
        this.textures.push(...textures); // Add textures to the renderer's textures array

        const priorRenderPasses = Array.from(this.renderPassBacklog.values());
        const renderPipeline = this.renderPassBuilder.createRenderPipeline(material, geometry, this.textures, priorRenderPasses);
        const renderTarget = this.createRenderTarget(this.canvas.width, this.canvas.height);

        // Create bind group entries for the uniform buffer, sampler, and textures
        const bindingGroupEntries: Array<GPUBindGroupEntry> = [
            { binding: 0, resource: { buffer: this.uniforms.uniformBuffer } },
            { binding: 1, resource: this.getDevice().createSampler() }
        ];

        let bindingIndex = bindingGroupEntries.length;

        // Add textures from previous render passes to the bind group
        priorRenderPasses.forEach((pass, i) => {
            bindingGroupEntries.push({
                binding: bindingIndex++,
                resource: pass.bufferView
            });
        });

        // Add textures to the bind group
        this.textures.forEach((texture, i) => {
            const entry = texture.type === 0
                ? { binding: bindingIndex++, resource: (texture.data as GPUTexture).createView() }
                : { binding: bindingIndex++, resource: this.getDevice().importExternalTexture({ source: texture.data as HTMLVideoElement }) };

            bindingGroupEntries.push(entry);
        });

        // Create the bind group
        const bindGroup = this.getDevice().createBindGroup({
            layout: renderPipeline.getBindGroupLayout(0),
            entries: bindingGroupEntries,
            label: `${label} renderpass`
        });

        // Create and return the render pass
        const renderPass = new RenderPass(RENDERPASS.FRAGMENTSHADER, label, renderPipeline, this.uniforms, bindGroup, renderTarget.buffer, renderTarget.bufferView);

        this.renderPassBacklog.set(label, renderPass);
        return renderPass;
    }
    /**
     * Adds a compute pass to the backlog.
     * @param label - The label for the compute pass.
     * @param computeShaderCode - The WGSL code for the compute shader.
     * @param textures - An optional array of textures to use in the compute pass.
     * @returns The created RenderPass object.
     */
    addComputeRenderPass(label: string, computeShaderCode: string, textures: IWGSLTextureData[] = [],
        workgroupsize?: {
            x: number, y: number, z: number,
            workgroup_size: string
        }

    ): RenderPass {

        this.textures.push(...textures); // Add textures to the renderer's textures array

        if (workgroupsize?.workgroup_size) {
            computeShaderCode = computeShaderCode.replace("##workgroup_size", workgroupsize.workgroup_size);
        }

        const computeShaderModule = this.getDevice().createShaderModule({ code: computeShaderCode });
        const computePipeline = this.renderPassBuilder.createComputePipeline(computeShaderModule, this.textures);
        const renderTarget = this.createRenderTarget(this.canvas.width, this.canvas.height);

        // Create bind group entries for the render target, uniform buffer, sampler, and textures
        const bindingGroupEntries: Array<GPUBindGroupEntry> = [
            { binding: 0, resource: { buffer: this.uniforms.uniformBuffer } },
            { binding: 1, resource: this.getDevice().createSampler() },
            { binding: 2, resource: renderTarget.bufferView }
        ];

        let bindingIndex = bindingGroupEntries.length;

        // Add textures to the bind group
        this.textures.forEach((texture, i) => {
            const entry = texture.type === 0
                ? { binding: bindingIndex++, resource: (texture.data as GPUTexture).createView() }
                : { binding: bindingIndex++, resource: this.getDevice().importExternalTexture({ source: texture.data as HTMLVideoElement }) };

            bindingGroupEntries.push(entry);
        });

        // Create the bind group
        const bindGroup = this.getDevice().createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: bindingGroupEntries,
            label: `${label} computepass`
        });



        // Create and return the render pass
        const renderPass = new RenderPass(RENDERPASS.COMPUTESHADER,
            label, computePipeline, this.uniforms, bindGroup, renderTarget.buffer, renderTarget.bufferView);


        this.renderPassBacklog.set(label, renderPass);
        return renderPass;
    }


    /**
      * Updates the renderer and executes all render passes in the backlog.
      * @param time - The current time in seconds.
      */
    update(time: number) {
        const device = this.getDevice();
        const commandEncoder = this.getDevice().createCommandEncoder();
        const arrRenderPasses = Array.from(this.renderPassBacklog.values());
        // get the compute shaders from the back log
        arrRenderPasses.filter((pre) => {
            return pre.type == RENDERPASS.COMPUTESHADER
        }).forEach(computeRenderPass => {
            const computePassEncoder = commandEncoder.beginComputePass();
            computePassEncoder.setPipeline(computeRenderPass.pipleline as GPUComputePipeline);
            computePassEncoder.setBindGroup(0, computeRenderPass.bindGroup);
            //computePass.dispatchWorkgroups(Math.floor((this.canvas.width + 7) / 8), Math.floor((this.canvas.height + 7) / 8), 1);
            computePassEncoder.dispatchWorkgroups(
                Math.ceil(this.canvas.width / computeRenderPass.workgroupSize!.x),
                Math.ceil(this.canvas.height / computeRenderPass.workgroupSize!.y),
                computeRenderPass.workgroupSize!.z
            );

            computePassEncoder.end();


        });
        arrRenderPasses.filter(pre => {
            return pre.type == RENDERPASS.FRAGMENTSHADER
        }).forEach(pass => {

            const renderPassDescriptor: GPURenderPassDescriptor = {
                label: `${pass.label} GPURenderPassDescriptor`,
                colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: pass.bufferView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                }],

            };

            const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            renderPassEncoder.setPipeline(pass.pipleline as GPURenderPipeline)
            renderPassEncoder.setBindGroup(0, pass.bindGroup);
            renderPassEncoder.setVertexBuffer(0, this.geometry.vertexBuffer);
            renderPassEncoder.setIndexBuffer(this.geometry.indexBuffer, 'uint16');
            renderPassEncoder.drawIndexed(this.geometry.numOfVerticles, 1);
            renderPassEncoder.end();
        });

        const supportsTimeStampQuery =  this.gpuTimer.supportsTimeStampQuery;
        const mainRendererPassEncoder: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.context!.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0, b: 0.0, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            },
            ],
            ...(supportsTimeStampQuery &&  {
                timestampWrites:{
                querySet: this.gpuTimer!.querySet!,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1,
            }
            })
        });

        this.uniforms.setUniforms([this.frame], 8);
        this.uniforms.setUniforms([time], 3);
        this.uniforms.updateUniformBuffer();

        mainRendererPassEncoder.setPipeline(this.renderPipleline);
        mainRendererPassEncoder.setVertexBuffer(0, this.geometry.vertexBuffer);
        mainRendererPassEncoder.setBindGroup(0, this.screenBindGroup);
        mainRendererPassEncoder.draw(6, 1, 0, 0);
        mainRendererPassEncoder.end();

        if (supportsTimeStampQuery) {
            const timer = this.gpuTimer!;

            commandEncoder.resolveQuerySet( // Use commandEncoder here
                timer!.querySet!,
                0,
                2,
                timer!.resolveBuffer!,
                0
            );

            if (timer!.readBuffer!.mapState === 'unmapped') {
            commandEncoder.copyBufferToBuffer(
                timer!.resolveBuffer!,
                0,
                timer!.readBuffer!,
                0,
                timer!.resolveBuffer!.size
            );    
        }
        }


      

        this.device.queue.submit([commandEncoder.finish()]);


        this.device.queue.onSubmittedWorkDone().then ( () => {

            if (supportsTimeStampQuery) {
                const timer = this.gpuTimer!;
                if(timer!.readBuffer!.mapState === 'unmapped')
                   timer!.readBuffer!.mapAsync(GPUMapMode.READ).then(() => {
                  const times = new BigInt64Array(timer!.readBuffer!.getMappedRange());
                 const  gpuTime = Number(times[1] - times[0]);
                 this.gpuAverage?.addSample(gpuTime / 1000);
                 timer!.readBuffer!.unmap();
                });
              }
        });

        


    }

   
    /**
 * Starts the rendering loop with an FPS counter.
 * @param t - The initial time.
 * @param maxFps - The maximum frames per second.
 * @param onFrame - An optional callback function to be called on each frame.
 */
start(t: number, maxFps: number = 200, onFrame?: (frame: number, fps: number) => void): void {
    let startTime: number | null = null;
    let frame = -1;
    let fps = 0; // Current FPS
    let lastFpsUpdate = 0; // Last time FPS was updated
    let frameCounter = 0; // Frame count since last FPS update

    const renderLoop = (ts: number) => {
        if (!startTime) startTime = ts;

        let segment = Math.floor((ts - startTime) / (1000 / maxFps));
        if (segment > frame) {
            frame = segment;
            this.frame = segment;
            this.frameCount = frame;

            if (!this.isPaused) {
                this.update(ts / 1000);
                frameCounter++; // Count this frame
                const elapsed = ts - lastFpsUpdate;

                // Update FPS every second (or any desired interval)
                if (elapsed >= 1000) {
                    fps = Math.round((frameCounter / elapsed) * 1000);
                    frameCounter = 0; // Reset the counter
                    lastFpsUpdate = ts;
                }

                if (onFrame) onFrame(frame, fps);
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
