


export interface IMaterialShader {
  vertex: string;
  vertexEntryPoint?: string;
  fragment: string;
  fragmentEntryPoint?: string;
}


/**
 * Default vertex shader code for rendering a rectangle.
 */
export const defaultWglslVertex = /* glsl */ ` 
  struct VertexInput {
    @location(0) pos: vec2<f32>,
    @builtin(vertex_index) index : u32
  };

  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) fragCoord: vec2<f32>
  };

  @vertex
  fn main_vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var pos: vec2<f32> = input.pos * 2.0 - 1.0;
    output.pos = vec4<f32>(pos, 0.0, 1.0);
    output.uv = pos;
    output.fragCoord = vec2<f32>((pos.x + 1.0) / 2.0, (1.0 - pos.y) / 2.0); 
    return output;
  }
`;

/**
 * Represents a material with vertex and fragment shaders.
 */
export class Material {
  vertexShaderModule: GPUShaderModule;
  fragmentShaderModule: GPUShaderModule;
  /**
   * Creates a new Material.
   * @param device - The GPUDevice to use for creating shader modules.
   * @param shader - The IMaterialShader object containing the shader code.
   */
  constructor(public device: GPUDevice, public shader: IMaterialShader) {
    this.vertexShaderModule = this.device.createShaderModule({
      code: shader.vertex
    });

    this.fragmentShaderModule = this.device.createShaderModule({
      code: shader.fragment
    });
  }

  
}