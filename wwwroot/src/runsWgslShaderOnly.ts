import {
  defaultMainShader,
  EntityRenderer,
  Geometry,
  initWebGPU,
  IWGSLShaderProperties,
  Material,
  rectGeometry,
  WGSLShaderEntity,
  WGSLShaderRenderer,
  WGSLTextureLoader,
  WGSLTextureType,
} from '../../src';
import {
  alienWaterWorld,
} from '../assets/shaders/wglsl-frag/alien-waterworldShader';

/**
   * A class to demonstrate the usage of WGSL shaders in the demolished-rail framework.
   */
  export class RunWGSLShader {
    screenCanvas: HTMLCanvasElement;
  
    /**
     * Creates a new RunShader instance.
     * @param target - The canvas element to render to.
     */
    constructor(target: HTMLCanvasElement) {
      this.screenCanvas = target;
    }
  
    /**
     * Runs the WGSL shader demo.
     * @returns A Promise that resolves to the created WGSLShaderEntity.
     */
    async run(): Promise<WGSLShaderEntity<IWGSLShaderProperties>> {
      const wsglShaderCanvas = document.createElement("canvas");
      wsglShaderCanvas.width = this.screenCanvas.width;
      wsglShaderCanvas.height = this.screenCanvas.height;
      const webgpu = await initWebGPU(wsglShaderCanvas,){};
  
      const wsglTextures = await WGSLTextureLoader.loadAll(webgpu.device, {
        key: "NOISE-TEXTURE",
        source: "assets/images/noise2.png",
        type: WGSLTextureType.IMAGE,
      });
      
  
      const wgslMainShader = defaultMainShader;
  
      const wgslShaderProps: IWGSLShaderProperties = {
        canvas: wsglShaderCanvas,
        device: webgpu.device,
        context: webgpu.context!,
        shader: wgslMainShader,
        renderBuffers: [
          {
            name: "buffer1",
            shader: new Material(webgpu.device, alienWaterWorld),
            geometry: new Geometry(webgpu.device, rectGeometry),
          //  textures: wsglTextures
          }
        ]
      };
  
      const wgslShaderEntity = new WGSLShaderEntity(
        "wgsl-shader",
        wgslShaderProps,
        (ts: number, wgslRenderer: WGSLShaderRenderer, props: IWGSLShaderProperties) => {
          // Perform operations, like modifying uniforms, per frame
        }
      );
  
      const entityRenderer = new EntityRenderer(this.screenCanvas);
      entityRenderer.addEntity(wgslShaderEntity);
      entityRenderer.start();
  
      return wgslShaderEntity;
    }
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
    const runner = new RunWGSLShader(canvas);
    const running = await runner.run();
    console.log(`Running ${running.name}`);
  });