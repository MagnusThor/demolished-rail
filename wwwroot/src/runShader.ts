import {
  defaultMainShader,
  EntityRenderer,
  Geometry,
  IWGSLShaderProperties,
  Material,
  WGSLShaderEntity,
  WGSLShaderRenderer,
  WGSLTextureLoader,
  WGSLTextureType,
} from '../../src';
import { rectGeometry } from '../../src/Engine/ShaderRenderers/WebGPU/Geometry';
import {
  initWebGPU,
} from '../../src/Engine/ShaderRenderers/WebGPU/WGSLShaderRenderer';
import { wgslFlamesShader } from '../assets/shaders/wglsl/wgslFlamesShader';

export class RunShader {
    screenCanvas:HTMLCanvasElement
    constructor(target: HTMLCanvasElement) {
        this.screenCanvas = target; // render entities to this canvas
    }
    async run() {

        
        const wsglShaderCanvas = document.createElement("canvas"); // create a render target for this "shader"
        wsglShaderCanvas.width = this.screenCanvas.width; wsglShaderCanvas.height = this.screenCanvas.height;      
        const webgpu = await initWebGPU(wsglShaderCanvas, { powerPreference: 'high-performance' });   
        
        // load 1-n textures
        const wsglTextures = await WGSLTextureLoader.loadAll(webgpu.device, {
            key: "NOISE-TEXTURE",
            source: "assets/images/noise.png",
            type: WGSLTextureType.IMAGE,
        });
 
        // Set up the WGSL Shader entity to render
        const wgslShaderProps: IWGSLShaderProperties = {
            canvas:wsglShaderCanvas ,
            device: webgpu.device,
            context: webgpu.context!,
            shader: defaultMainShader,
            renderBuffers: [
                {
                    name: "buffer-01",
                    shader: new Material(webgpu.device,
                        wgslFlamesShader
                    ),
                    geometry: new Geometry(webgpu.device, rectGeometry),
                    textures: wsglTextures
                }
            ]
        };
        const wgslShaderEntity = new WGSLShaderEntity("wgsl-shader",
            wgslShaderProps, (ts: number, wgslRenderer: WGSLShaderRenderer,props:IWGSLShaderProperties) => {
                // do op's , like modify uniforms etc, per frame..
            });    
        const entityRenderer = new EntityRenderer(this.screenCanvas);
        entityRenderer.addEntity(wgslShaderEntity);
        entityRenderer.start();
        return wgslShaderEntity;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let runShader = new RunShader(document.querySelector("canvas#main-canvas")!);
    const running = await runShader.run();
    console.log(`Running ${running.name}`)
})