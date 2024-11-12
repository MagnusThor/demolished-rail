import {
  defaultWglslVertex,
  IMaterialShader,
} from '../../../../src/Engine/ShaderRenderers/WebGPU/Material';

export const rayMarchWGSLShader: IMaterialShader = {
	vertex: defaultWglslVertex,
	fragment: /* glsl */ `struct Uniforms {
		resolution: vec3 < f32 > ,
		time: f32
	};
	
	@group(0) @binding(0) var < uniform > uniforms: Uniforms;
	@group(0) @binding(1) var linearSampler: sampler;
	struct VertexOutput {
		@builtin(position) pos: vec4 < f32 > ,
			@location(0) uv: vec2 < f32 >
	};
	const MAX_STEPS: i32 = 100;
	const MAX_DIST: f32 = 100.0;
	const SURFACE_DIST: f32 = 0.001;
	const LIGHT_POS: vec3 < f32 > = vec3 < f32 > (-2.0, 5.0, 3.0);
	
	fn estimateNormal(pos: vec3 < f32 > ) -> vec3 < f32 > {
		let e: vec2 < f32 > = vec2 < f32 > (1.0, -1.0) * 0.5773 * 0.0005;
		return normalize(
			e.xyy * map(pos + e.xyy) +
			e.yyx * map(pos + e.yyx) +
			e.yxy * map(pos + e.yxy) +
			e.xxx * map(pos + e.xxx)
		);
	}
	
	fn calculateLight(p: vec3 < f32 > , viewDir: vec3 < f32 > , normal: vec3 < f32 > ) -> vec3 < f32 > {
		let ambientStrength: f32 = 0.1;
		let ambient: vec3 < f32 > = vec3 < f32 > (0.1, 0.1, 0.1) * ambientStrength;
		let lightDir: vec3 < f32 > = normalize(LIGHT_POS - p);
		let diffuseStrength: f32 = 1.7;
		let diffuse: vec3 < f32 > = vec3 < f32 > (1.0, 1.0, 1.0) * diffuseStrength * max(dot(normal, lightDir), 0.0);
	
		let viewDirNorm: vec3 < f32 > = normalize(viewDir);
		let reflectDir: vec3 < f32 > = reflect(-lightDir, normal);
		let specularStrength: f32 = 0.8;
		let shininess: f32 = 32.0;
		let specular: vec3 < f32 > = vec3 < f32 > (1.0, 1.0, 1.0) * specularStrength * pow(max(dot(viewDirNorm, reflectDir), 0.0), shininess);
	
		return ambient + diffuse + specular;
	}
	
	fn calculateAO(p: vec3 < f32 > , normal: vec3 < f32 > ) -> f32 {
		let aoRadius: f32 = 0.1;
		let aoSamples: i32 = 5;
		var occlusion: f32 = 0.0;
		for (var i: i32 = 1; i <= aoSamples; i = i + 1) {
			let stepSize: f32 = aoRadius / f32(i);
			let samplePoint: vec3 < f32 > = p + normal * stepSize;
			let sampleDist: f32 = map(samplePoint);
			occlusion += stepSize - sampleDist;
		}
		occlusion = 1.0 - (occlusion / f32(aoSamples));
		return occlusion;
	}
	
	fn rotationMatrixY(angle: f32) -> mat3x3 < f32 > {
		let c: f32 = cos(angle);
		let s: f32 = sin(angle);
		return mat3x3 < f32 > (
			vec3 < f32 > (c, 0.0, s),
			vec3 < f32 > (0.0, 1.0, 0.0),
			vec3 < f32 > (-s, 0.0, c)
		);
	}
	
	fn map(point: vec3 < f32 > ) -> f32 {
		return length(point) - 1.5;  
	}
	
	fn main(fragCoord: vec2 < f32 > ) -> vec4 < f32 > {
	
		let uv: vec2 < f32 > = (2.*fragCoord.xy-uniforms.resolution.xy) / uniforms.resolution.y;
	  
		var color: vec3 < f32 > = vec3 < f32 > (0.0, 0.0, 0.0);
	
		let cameraPos: vec3 < f32 > = vec3 < f32 > (0.0, 0.0, 2.0);
		let rayDir: vec3 < f32 > = normalize(vec3 < f32 > (uv, -1.0));
	
	
	
	
	
		var t: f32 = 0.0;
	
		for (var i: i32 = 0; i < MAX_STEPS; i = i + 1) {
			let currentPos: vec3 < f32 > = cameraPos + t * rayDir;
			let dist: f32 = map(currentPos);
			if (dist < SURFACE_DIST) {
				let normal: vec3 < f32 > = estimateNormal(currentPos);
				let lightColor: vec3 < f32 > = calculateLight(currentPos, rayDir, normal);
				let ao: f32 = calculateAO(currentPos, normal);
				color = lightColor * ao; // Apply lighting and AO
				break;
			}
			if (t > MAX_DIST) {
				break;
			}
			t = t + dist;
		}
	
		return vec4 < f32 > (color, 1.0);
	}
	
	@fragment
	fn main_fragment(in: VertexOutput) -> @location(0) vec4 < f32 > {
		return main(in.pos.xy);
	}


`};