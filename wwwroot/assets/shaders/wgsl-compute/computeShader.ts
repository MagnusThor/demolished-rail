export const computeShader = /* glsl */ ` 

struct Uniforms {
  resolution: vec3<f32>,
  time: f32
};

const AA:i32 = 3;

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var outputTexture: texture_storage_2d<bgra8unorm, write>;

//@compute ##workgroup_size ( for auto detect , but seems a bit tricky/fuzzy still in WebGPU)
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) invocation_id: vec3u) {


    
    let R: vec2<f32> = uniforms.resolution.xy;
    
    let fragCoord = vec2<f32>(f32(invocation_id.x), f32(invocation_id.y));
    var col: vec3<f32> = vec3<f32>(0.0);

    let zoo = 1.0 / (350.0 - 250.0 * sin(fma(0.25, uniforms.time, -0.3)));
    let t2c_base = vec2<f32>(-0.5, 2.0) +
                   0.5 * vec2<f32>(cos(fma(0.13, uniforms.time, -1.3)), 
                                   sin(fma(0.13, uniforms.time, -1.3)));

    for (var m: i32 = 0; m < AA; m = m + 1) {
        for (var n: i32 = 0; n < AA; n = n + 1) {
            let p = (2.0 * (fragCoord + vec2<f32>(f32(m), f32(n)) / f32(AA)) - R) / R.y;
            let cc = vec2<f32>(-0.533516, 0.526141) + p * zoo;
            var z = vec2<f32>(0.0);
            var dz = vec2<f32>(0.0);
            var trap1: f32 = 0.0;
            var trap2: f32 = 1e20;
            var co2: f32 = 0.0;

            for (var i: i32 = 0; i < 150; i = i + 1) {
                dz = vec2<f32>(fma(2.0 * z.x, dz.x, -2.0 * z.y * dz.y), 
                               fma(2.0 * z.x, dz.y, 2.0 * z.y * dz.x)) + vec2<f32>(1.0, 0.0);
                z = cc + vec2<f32>(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);

                let z_offset = z - vec2<f32>(0.0, 1.0);
                let d1 = abs(dot(z_offset, vec2<f32>(0.707)));
                let ff = 1.0 - smoothstep(0.6, 1.4, d1);
                co2 += ff;
                trap1 += ff * d1;
                trap2 = min(trap2, dot(z - t2c_base, z - t2c_base));

                if (dot(z, z) > 1024.0) { break; }
            }

            let d = sqrt(dot(z, z) / dot(dz, dz)) * log(dot(z, z));
            let c1 = pow(clamp(2.0 * d / zoo, 0.0, 1.0), 0.5);
            let c2 = pow(clamp(1.5 * trap1 / co2, 0.0, 1.0), 2.0);
            let c3 = pow(clamp(0.4 * trap2, 0.0, 1.0), 0.25);
            col += 2.0 * sqrt(c1 * (0.5 + 0.5 * sin(3.0 + 4.0 * c2 + vec3<f32>(0.0, 0.5, 1.0))) *
                               (0.5 + 0.5 * sin(4.1 + 2.0 * c3 + vec3<f32>(1.0, 0.5, 0.0))));
        }
    }

    col /= f32(AA * AA);
    textureStore(outputTexture, invocation_id.xy, vec4<f32>(col, 1.0));
}

    `;
