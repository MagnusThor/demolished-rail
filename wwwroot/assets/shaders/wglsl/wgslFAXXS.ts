import {
  defaultWglslVertex,
  IMaterialShader,
} from '../../../../src/Engine/ShaderRenderers/WebGPU/Material';

export const wgslFAXXS:IMaterialShader = {
    vertex: defaultWglslVertex,
    fragment: /* wgsl */ `
    
    struct VertexOutput {
      @builtin(position) pos: vec4<f32>,
      @location(0) uv: vec2<f32>
      };    
     
    struct Uniforms {
      resolution: vec3<f32>,
      time: f32,
      mouse: vec4<f32>,
      frame: f32
      };
    
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @group(0) @binding(1) var screen_sampler: sampler;
      @group(0) @binding(2) var outputTexture: texture_2d<f32>;  
    
     
      fn sample_texture(tex: texture_2d<f32>, coord: vec2<f32>) -> vec4<f32> {
        return textureSample(tex, screen_sampler, coord);
      }
   

      fn mainImage(fragCoord: vec2<f32>) -> vec4<f32> {

        // Calculate the reciprocal of resolution to normalize coordinates
        let pp: vec2<f32> = vec2<f32>(1.0) / vec2<f32>(uniforms.resolution.x, uniforms.resolution.y);
        
        // Sample color from texture using normalized coordinates
        let color: vec4<f32> = sample_texture(outputTexture, fragCoord * pp);
        
        // Luma coefficients for luminance calculation
        let luma: vec3<f32> = vec3<f32>(0.299, 0.587, 0.114);
        
        // Calculate luminance for neighboring pixels
        let lumaNW: f32 = dot(sample_texture(outputTexture, (fragCoord + vec2<f32>(-1.0, -1.0)) * pp).xyz, luma);
        let lumaNE: f32 = dot(sample_texture(outputTexture, (fragCoord + vec2<f32>(1.0, -1.0)) * pp).xyz, luma);
        let lumaSW: f32 = dot(sample_texture(outputTexture, (fragCoord + vec2<f32>(-1.0, 1.0)) * pp).xyz, luma);
        let lumaSE: f32 = dot(sample_texture(outputTexture, (fragCoord + vec2<f32>(1.0, 1.0)) * pp).xyz, luma);
        let lumaM: f32 = dot(color.xyz, luma);
        
        // Determine minimum and maximum luminance values
        let lumaMin: f32 = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
        let lumaMax: f32 = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
        
        // Calculate direction vectors for FXAA
        var dir: vec2<f32> = vec2<f32>(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));
        let dirReduce: f32 = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * (1.0 / 8.0)), (1.0 / 128.0));
        let rcpDirMin: f32 = 2.5 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
        dir = min(vec2<f32>(8.0, 8.0), max(vec2<f32>(-8.0, -8.0), dir * rcpDirMin)) * pp;
        
        // Calculate RGB values for FXAA
        let rgbA: vec3<f32> = 0.5 * (sample_texture(outputTexture, fragCoord * pp + dir * (1.0 / 3.0 - 0.5)).xyz +
                                     sample_texture(outputTexture, fragCoord * pp + dir * (2.0 / 3.0 - 0.5)).xyz);
        let rgbB: vec3<f32> = rgbA * 0.5 + 0.25 * (sample_texture(outputTexture, fragCoord * pp + dir * -0.5).xyz +
                                                   sample_texture(outputTexture, fragCoord * pp + dir * 0.5).xyz);
        
        // Calculate final luminance and choose between RGBA or RGBB
        let lumaB: f32 = dot(rgbB, luma);
        var fragColor: vec4<f32>;
        if (lumaB < lumaMin || lumaB > lumaMax) {
            fragColor = vec4<f32>(rgbA, color.w);
        } else {
            fragColor = vec4<f32>(rgbB, color.w);
        }
        
        return fragColor;
       
    
      }
      @fragment
      fn main_fragment(vert: VertexOutput) -> @location(0) vec4<f32> {   
        
        return mainImage(vert.uv);
      }
  `
  };
  
  