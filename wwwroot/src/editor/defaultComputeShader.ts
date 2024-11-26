export const defaultComputeShader = /*glsl*/ `
 

struct Uniforms {
  resolution: vec3<f32>,
  time: f32
};

const AA:i32 = 3;

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var outputTexture: texture_storage_2d<bgra8unorm, write>;


@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) invocation_id: vec3u) {

   let col:vec3<f32> = vec3<f32>(1.0,1.0,0.0) ; 
    
  
    textureStore(outputTexture, invocation_id.xy, vec4<f32>(col, 1.0));
}

`