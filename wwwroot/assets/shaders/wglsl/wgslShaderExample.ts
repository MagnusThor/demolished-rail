import {
  defaultWglslVertex,
  IMaterialShader,
} from '../../../../src/Engine/ShaderRenderers/WebGPU/Material';

export const blueColorShader:IMaterialShader = {
  vertex: defaultWglslVertex,
  fragment: /* wgsl */ `
  
  struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
  @group(0) @binding(1) var linearSampler: sampler;
  @group(0) @binding(2) var iChannel0: texture_2d<f32>; 
  
  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
  };  

  fn main(fragCoord: vec2<f32>) -> vec4<f32> {
    var col: vec3<f32> = vec3<f32>(0.0,0.0,1.0); 
    var result:vec4<f32> = vec4<f32>(col,1.0);
   return result; 
  
  }
  @fragment
  fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
    return main(in.uv);
}`
};

