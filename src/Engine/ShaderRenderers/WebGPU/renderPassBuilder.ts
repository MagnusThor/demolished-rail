import { IPass } from "../../Interfaces/IPass";
import { IPassBuilder } from "../../Interfaces/IPassBuilder";
import { IWgslTextureData } from "../../Interfaces/IWgslTextureData";
import { Geometry } from "./geometry";

import { Material } from "./material";

/**
 * A builder class for creating render passes in WebGPU.
 */
export class RenderPassBuilder implements IPassBuilder {

    pipelineLayout!: GPUPipelineLayout;
    bindGroup!: GPUBindGroup;
    device: GPUDevice;
    /**
  * Creates a new RenderPassBuilder.
  * @param device - The GPUDevice to use for creating resources.
  * @param canvas - The HTMLCanvasElement to render to.
  */

    constructor(device: GPUDevice, public canvas: HTMLCanvasElement) {
        this.device = device;
    }

    /**
   * Creates a bind group layout and entries for a render pipeline.
   * @param uniformBuffer - The uniform buffer for the pipeline.
   * @param sampler - An optional GPUSampler to use. If not provided, a default sampler is created.
   * @returns An array of GPUBindGroupEntry objects.
   */
    getRenderPiplelineBindingGroupLayout(
        uniformBuffer: GPUBuffer, sampler?: GPUSampler
    ): Array<GPUBindGroupEntry> {

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        });

        const defaultSampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 1,
            resource: sampler || defaultSampler
        });
        return bindingGroupEntrys;
    }

    /**
  * Creates a render pipeline.
  * @param material - The material to use for the pipeline.
  * @param geometry - The geometry to use for the pipeline.
  * @param textures - An array of textures to use in the pipeline.
  * @param priorRenderPasses - An array of prior render passes to include as textures.
  * @returns The created GPURenderPipeline.
  */
    createRenderPipeline(material: Material, geometry: Geometry, textures: Array<IWgslTextureData>,
        priorRenderPasses: IPass[]

    ): GPURenderPipeline {

        const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();

        // add uniforms
        bindGroupLayoutEntries.push(
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            });


        // add sampler
        bindGroupLayoutEntries.push({ // sampler
            binding: 1,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            sampler: {
                type: "filtering"
            }
        });

        let offset = bindGroupLayoutEntries.length;

        // add prior render passes

        priorRenderPasses.forEach((p, index) => {
            bindGroupLayoutEntries.push({
                binding: offset + index,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            });

        })

        offset = bindGroupLayoutEntries.length;


        if (textures.length > 0) {

            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if (textures[i].type === 0) {
                    bindGroupLayoutEntries.push({
                        binding: 2 + i,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {
                            sampleType: "float"
                        }
                    })
                } else {
                    bindGroupLayoutEntries.push({
                        binding: 2 + i,
                        visibility: GPUShaderStage.FRAGMENT,
                        externalTexture: {}
                    })
                }

            }
        }

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: bindGroupLayoutEntries
        });



        const pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),

            vertex: {
                module: material.vertexShaderModule,
                entryPoint: "main_vertex",
                buffers: [geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: "main_fragment",
                targets: [
                    {
                        format: 'bgra8unorm'
                    }
                ]
            }

        });

        return pipeline;


    }
    /**
     * Creates a compute pipeline.
     * @param computeShader - The compute shader module.
     * @param textures - An array of textures to use in the pipeline.
     * @returns The created GPUComputePipeline.
     */
    createComputePipeline(computeShader: GPUShaderModule, textures: Array<IWgslTextureData>): GPUComputePipeline {
        const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();
        bindGroupLayoutEntries.push({
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
                access: "write-only",
                format: "bgra8unorm",
                viewDimension: "2d"
            },
        },
            {
                binding: 1, visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform"
                }
            });
        if (textures.length > 0) {
            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if (textures[i].type === 0) {
                    bindGroupLayoutEntries.push({
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        texture: {
                            sampleType: "float"
                        }
                    })
                } else {
                    bindGroupLayoutEntries.push({
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        externalTexture: {}
                    })
                }

            }
        }
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: bindGroupLayoutEntries
        });
        const pipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),
            compute: {
                module: computeShader,
                entryPoint: 'main',
            },
        });
        return pipeline;
    }
}
