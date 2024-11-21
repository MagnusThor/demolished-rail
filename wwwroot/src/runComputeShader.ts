import {
  defaultMainShader,
  initWebGPU,
  WGSLShaderRenderer,
} from '../../src';
import { computeShader } from '../assets/shaders/wgsl-compute/computeShader';

/**
   * A class to demonstrate the usage of WGSL (Compute) shaders in the demolished-rail framework.
   */
export class RunComputeShader {
  screenCanvas: HTMLCanvasElement;

  /**
   * Creates a new RunShader instance.
   * @param target - The canvas element to render to.
   */
  constructor(target: HTMLCanvasElement) {
    this.screenCanvas = target;
  }


  /**
   * Runs the WGSL Compute shader demo.
   * @return {*}  {Promise<void>}
   */
  async run(): Promise<void> {
    const wsglShaderCanvas = document.querySelector("canvas") as HTMLCanvasElement;
    wsglShaderCanvas.width = this.screenCanvas.width;
    wsglShaderCanvas.height = this.screenCanvas.height;
    const { device, context, adapter, workgroupsize } = await initWebGPU(wsglShaderCanvas, { powerPreference: 'high-performance' });

    const renderer = new WGSLShaderRenderer(wsglShaderCanvas, device, context!);


    renderer.addComputeRenderPass("mandelbrot-compute-shader",
      computeShader, []);

    renderer.addMainRenderPass(defaultMainShader);

    renderer.start(0, 200, (frame) => {
    });

  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunComputeShader(canvas);
  const running = await runner.run();
  console.log(`Running`);
});