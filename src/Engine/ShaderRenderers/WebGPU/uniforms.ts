/**
 * Manages uniform data for shaders in WebGPU.
 */
export class Uniforms {
  uniformBufferArray: Float32Array;
  uniformBuffer: GPUBuffer;

  /**
   * Initializes a Float32Array with default values for uniforms.
   * @param w - The width of the canvas.
   * @param h - The height of the canvas.
   * @returns A new Float32Array with initialized values.
   */
  static initialize(w: number, h: number): Float32Array {
    return new Float32Array([w, h, 0, 1, 0, 0, 0, 0, 0, 0]);
  }

  /**
   * Creates a new Uniforms instance.
   * @param device - The GPUDevice to use for creating the uniform buffer.
   * @param canvas - The HTMLCanvasElement to get dimensions from.
   */
  constructor(public device: GPUDevice, canvas: HTMLCanvasElement) {
    this.uniformBuffer = this.device.createBuffer({
      size: 60,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.uniformBufferArray = Uniforms.initialize(canvas.width, canvas.height); // Use the initialize method
  }

  /**
   * Sets uniform values in the uniform buffer array.
   * @param values - An array of values to set.
   * @param offset - The offset in the array where the values should be written.
   */
  setUniforms(values: ArrayLike<number>, offset: number) {
    this.uniformBufferArray.set(values, offset);
  }

  /**
   * Updates the uniform buffer on the GPU with the data from the uniform buffer array.
   */
  updateUniformBuffer() {
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      this.uniformBufferArray.buffer,
      this.uniformBufferArray.byteOffset,
      this.uniformBufferArray.byteLength
    );
  }
}