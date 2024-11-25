import {
  defaultWglslVertex,
  IMaterialShader,
} from '../../../../src';

export const alienWaterWorld: IMaterialShader = {
	vertex: defaultWglslVertex,
	fragment: /* glsl */ `


	struct VertexOutput {
		@builtin(position) pos: vec4<f32>,
		@location(0) uv: vec2<f32>
	  };    
   
	struct Uniforms {
		resolution: vec3<f32>,
		time: f32,
	  };
	
	@group(0) @binding(0) var<uniform> uniforms: Uniforms;	
	@group(0) @binding(1) var linearSampler: sampler;


	
	const skyCol1: vec3<f32> = vec3<f32>(0.35, 0.45, 0.6);
	const skyCol2: vec3<f32> = skyCol1 * skyCol1 * skyCol1 * 3.0;
	const sunCol1: vec3<f32> = vec3<f32>(1.0, 0.9, 0.8);
	const sunCol2: vec3<f32> = vec3<f32>(1.0, 0.9, 0.8);
	const smallSunCol1: vec3<f32> = vec3<f32>(1.0, 0.5, 0.25) * 0.5;
	const smallSunCol2: vec3<f32> = vec3<f32>(1.0, 0.5, 0.25) * 0.5;
	const ringColor: vec3<f32> = sqrt(vec3<f32>(0.95, 0.65, 0.45));
	const planet: vec4<f32> = vec4<f32>(80.0, -20.0, 100.0, 50.0) * 1000.0;
	const planetCol: vec3<f32> = sqrt(vec3<f32>(0.9, 0.8, 0.7));
	const ringsNormal: vec3<f32> = normalize(vec3<f32>(1.0, 1.25, 0.0));

	const PI: f32 = 3.1415927;
	const TAU: f32 = 2.0 * PI;
	const MAX_ITER:i32 = 55;
	const TOLERANCE: f32 = 0.00001;
	const MAX_DISTANCE: f32 = 31.0;
	const PERIOD: f32 = 45.0;
	

	//  #define TIMEmod(time, PERIOD) 	
	fn TIME() -> f32 {
		return uniforms.time % PERIOD;
	}

	const rings: vec4<f32> = vec4<f32>(ringsNormal, -dot(ringsNormal, planet.xyz));

	fn rot(p: ptr<function, vec2<f32>>, a: f32) {
		let c: f32 = cos(a);
		let s: f32 = sin(a);
		(*p) = vec2<f32>((*p).x * c + (*p).y * s, -(*p).x * s + (*p).y * c);
	}
	
	fn psin(f: f32) -> f32 {
		return 0.5 + 0.5 * sin(f);
	}
	
	fn toRect(p: vec2<f32>) -> vec2<f32> {
		return p.x * vec2<f32>(cos(p.y), sin(p.y));
	}
	
	fn toPolar(p: vec2<f32>) -> vec2<f32> {
		return vec2<f32>(length(p), atan2(p.y, p.x));
	}
	
	fn mod1(p: ptr<function, f32>, size: f32) -> f32 {
		let halfsize: f32 = size * 0.5;
		// Read the value from the pointer
		var value: f32 = *p;
		// Perform the calculations
		let c: f32 = floor((value + halfsize) / size);
		value = ((value + halfsize) % size) - halfsize;
		// Write the modified value back to the pointer
		*p = value;
		return c;
	}
	
	fn circle(p: vec2<f32>, r: f32) -> f32 {
		return length(p) - r;
	}
	
	fn rayPlane(ro: vec3<f32>, rd: vec3<f32>, p: vec4<f32>) -> f32 {
		return -(dot(ro, p.xyz) + p.w) / dot(rd, p.xyz);
	}
	
	fn raySphere(ro: vec3<f32>, rd: vec3<f32>, sphere: vec4<f32>) -> vec2<f32> {
		let center: vec3<f32> = sphere.xyz;
		let radius: f32 = sphere.w;
		let originToCenter: vec3<f32> = ro - center;
		let b: f32 = dot(originToCenter, rd);
		let c: f32 = dot(originToCenter, originToCenter) - radius * radius;
	
		if (c < 0.0) { 
			return vec2<f32>(0.0, -2.0 * b); 
			// Ray origin inside sphere, directly return the two intersection distances as (0.0, -2.0 * b) 
		}
	
		var h: f32 = b * b - c;
		h = select(sqrt(h), -1.0, h < 0.0); 
		return select(vec2<f32>(-b - h, -b + h), vec2<f32>(-1.0), h < 0.0);
	}
	
	fn hash(co: vec2<f32>) -> f32 {
		return fract(sin(dot(co.xy, vec2<f32>(12.9898, 58.233))) * 13758.545);
	}
	
	fn noise2(x: vec2<f32>) -> f32 {
		var i: vec2<f32> = floor(x);
		let w: vec2<f32> = fract(x);
		let u: vec2<f32> = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
		var a: f32 = hash(i + vec2<f32>(0.0, 0.0));
		let b: f32 = hash(i + vec2<f32>(1.0, 0.0));
		let c: f32 = hash(i + vec2<f32>(0.0, 1.0));
		let d: f32 = hash(i + vec2<f32>(1.0, 1.0));
		let k0: f32 = a;
		let k1: f32 = b - a;
		let k2: f32 = c - a;
		let k3: f32 = d - c + a - b;
		return k0 + k1 * u.x + k2 * u.y + k3 * u.x * u.y;
	}
	
	fn smoother(d: f32, s: f32) -> f32 {
		return s * tanh(d / s);
	}
	
	fn heightMod(p: vec2<f32>) -> f32 {
		var p_var = p;
		var pp: vec2<f32> = toPolar(p_var);
		pp.y = pp.y + (-pp.x * 0.2);
		p_var = toRect(pp);
		return pow(psin(1.0 * p_var.x) * psin(1.0 * p_var.y), max(0.25, pp.x * 0.2)) * 0.8;
	}
	
	fn loheight(p: vec2<f32>, d: f32) -> f32 {
		var p_var = p;
		var aa: f32 = 0.5;
		var ff: f32 = 2.03;
		var tt: f32 = 1.3;
		var oo: f32 = 0.93;
		var hm: f32 = heightMod(p_var);
		var s: vec2<f32> = vec2<f32>(0.0);
		var a: f32 = 1.0;
		var o: f32 = 0.2;
	
		for (var i: i32 = 0; i < 3; i = i + 1) {
			var nn: f32 = a * noise2(2.0 * p_var);
			s.x = s.x + nn;
			s.y = s.y + abs(a);
			p_var = p_var + o;
			a = a * aa;
			p_var = p_var * ff;
			o = o * oo;
			rot(&p_var, tt);
		}
	
		s.x = s.x / s.y;
		s.x = s.x - 1.0;
		s.x = s.x + (0.7 * hm);
		s.x = smoother(s.x, 0.125);
		return max(s.x + 0.125, 0.0) * 0.5;
	}
	
	fn height(p: vec2<f32>, d: f32) -> f32 {
		
		var p_var = p;
		var aa: f32 = 0.5;
		var ff: f32 = 2.03;
		var tt: f32 = 1.3;
		var oo: f32 = 0.93;
		var hm: f32 = heightMod(p_var);
		var s: vec2<f32> = vec2<f32>(0.0);
		var a: f32 = 1.0;
		var o: f32 = 0.2;
	
		for (var i: i32 = 0; i < 5; i = i + 1) {
			var nn: f32 = a * noise2(2.0 * p_var);
			s.x = s.x + nn;
			s.y = s.y + abs(a);
			p_var = p_var + o;
			a = a * aa;
			p_var = p_var * ff;
			o = o * oo;
			rot(&p_var, tt);
		}
	
		s.x = s.x / s.y;
		s.x = s.x - 1.0;
		s.x = s.x + (0.7 * hm);
		s.x = smoother(s.x, 0.125);
		return max(s.x + 0.125, 0.0) * 0.5;
	}
	

	fn hiheight(p: vec2<f32>, d: f32) -> f32 {
		var p_var = p;
		let aa: f32 = 0.5;
		let ff: f32 = 2.03;
		let tt: f32 = 1.3;
		let oo: f32 = 0.93;
		let hm: f32 = heightMod(p_var);
		var s: vec2<f32> = vec2<f32>(0.);
		var a: f32 = 1.;
		var o: f32 = 0.2;
	
		for (var i: i32 = 0; i < 6; i = i + 1) {
			let nn: f32 = a * noise2(2. * p_var);
			s.x = s.x + (nn);
			s.y = s.y + (abs(a));
			p_var = p_var + (o);
			a = a * (aa);
			p_var = p_var * (ff);
			o = o * (oo);
			rot(&p_var, tt);
		}
	
		s.x = s.x / (s.y);
		s.x = s.x - (1.);
		s.x = s.x + (0.7 * hm);
		s.x = smoother(s.x, 0.125);
		return max(s.x + 0.125, 0.) * 0.5;
	} 

	fn normal(p: vec2<f32>, d: f32) -> vec3<f32> {
		let eps: vec2<f32> = vec2<f32>(0.000125, 0.);
		var n: vec3<f32>;
		n.x = hiheight(p - eps.xy, d) - hiheight(p + eps.xy, d);
		n.y = 2. * eps.x;
		n.z = hiheight(p - eps.yx, d) - hiheight(p + eps.yx, d);
		return normalize(n);
	} 



	fn march(ro: vec3<f32>, rd: vec3<f32>, id: f32, max_iter: ptr<function, i32>) -> f32 {
		var dt: f32 = 0.1;
		var d: f32 = id;
		let currentStep: i32 = 0;
		var lastd: f32 = d;
	
		for (var i: i32 = 0; i < MAX_ITER; i = i + 1) {
			var p: vec3<f32> = ro + d * rd;
			let h: f32 = height(p.xz, d);
	
			// Use any() to combine conditions
			if (any(vec2<bool>(d > MAX_DISTANCE, p.y - h < TOLERANCE))) { 
				(*max_iter) = i;
	
				// Select return value based on which condition was met
				return select(MAX_DISTANCE, d, p.y - h < TOLERANCE); 
			}
	
			let sl: f32 = 0.9;
			dt = max(p.y - h * sl, TOLERANCE + 0.0005 * d);
			lastd = d;
			
			//d = d + (dt);
			d = fma(1.0, dt, d);  
		}
	
		(*max_iter) = MAX_ITER;
		return MAX_DISTANCE;
	}

	fn sunDirection() -> vec3<f32> {
		return normalize(vec3<f32>(-0.5, 0.2, 1.));
	} 
	
	fn smallSunDirection() -> vec3<f32> {
		return normalize(vec3<f32>(-0.2, -0.05, 1.));
	} 
	
	fn skyColor(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
		let sunDir: vec3<f32> = sunDirection();
		let smallSunDir: vec3<f32> = smallSunDirection();
		let sunDot: f32 = max(dot(rd, sunDir), 0.0);
		let smallSunDot: f32 = max(dot(rd, smallSunDir), 0.0);
	
		// Avoid recomputing length(rd.xz)
		let rdXZLength: f32 = length(rd.xz);
		let angle: f32 = atan(rd.y / rdXZLength) * (2.0 / PI);
	
		let sunCol: vec3<f32> =
			0.5 * sunCol1 * pow(sunDot, 20.0) +
			8.0 * sunCol2 * pow(sunDot, 2000.0);
		let smallSunCol: vec3<f32> =
			0.5 * smallSunCol1 * pow(smallSunDot, 200.0) +
			8.0 * smallSunCol2 * pow(smallSunDot, 20000.0);
	
		// Ray-sphere and ray-plane intersections
		let si: vec2<f32> = raySphere(ro, rd, planet);
		let pi: f32 = rayPlane(ro, rd, rings);
	
		// Dust transparency and sky color blending
		let dustTransparency: f32 = smoothstep(-0.15, 0.075, rd.y);
		let skyCol: vec3<f32> = mix(
			skyCol1 * (1.0 - dustTransparency),
			skyCol2 * sqrt(dustTransparency),
			sqrt(dustTransparency)
		);
	
		// Planet-related calculations
		let planetSurface: vec3<f32> = ro + si.x * rd;
		let planetNormal: vec3<f32> = normalize(planetSurface - planet.xyz);
		let planetDiff: f32 = max(dot(planetNormal, sunDir), 0.0);
		let planetBorder: f32 = max(dot(planetNormal, -rd), 0.0);
		let planetLat: f32 = (planetSurface.x + planetSurface.y) * 0.0005;
	
		let planetCol: vec3<f32> = mix(
			1.3 * planetCol,
			0.3 * planetCol,
			pow(
				psin(planetLat + 1.0) *
				psin(sqrt(2.0) * planetLat + 2.0) *
				psin(sqrt(3.5) * planetLat + 3.0),
				0.5
			)
		);
	
		// Rings calculations
		let ringsSurface: vec3<f32> = ro + pi * rd;
		let ringsDist: f32 = length(ringsSurface - planet.xyz);
		let ringsPeriod: f32 = ringsDist * 0.001;
	
		let ringsMul: f32 = pow(
			psin(ringsPeriod + 1.0) *
			psin(sqrt(0.5) * ringsPeriod + 2.0) *
			psin(sqrt(0.45) * ringsPeriod + 4.0) *
			psin(sqrt(0.35) * ringsPeriod + 5.0),
			0.25
		);
	
		let ringsMix: f32 = psin(ringsPeriod * 10.0) *
			psin(ringsPeriod * 10.0 * sqrt(2.0)) *
			(1.0 - smoothstep(50000.0, 200000.0, pi));
	
		let ringsCol: vec3<f32> = mix(
			vec3<f32>(0.125),
			0.75 * ringColor,
			ringsMix
		) * step(-pi, 0.0) *
			step(ringsDist, 150000.0 * 0.655) *
			step(-ringsDist, -100000.0 * 0.666) *
			ringsMul;
	
		// Combine results
		let borderTransparency: f32 = smoothstep(0.0, 0.1, planetBorder);
	
		var result: vec3<f32> = vec3<f32>(0.0);
		result = result + ringsCol * (step(pi, si.x) + step(si.x, 0.0));
		result = result + step(0.0, si.x) *
			pow(planetDiff, 0.75) *
			mix(planetCol, ringsCol, 0.0) *
			dustTransparency *
			borderTransparency +
			ringsCol * (1.0 - borderTransparency);
		result = result + (skyCol + sunCol + smallSunCol);
	
		return result;
	}
	

	fn shipColor(p: vec2<f32>) -> vec3<f32> {

		let timeMod:f32 = uniforms.time % PERIOD; 
		var p_var = p;

		var pp: vec2<f32> = toPolar(p_var);
		pp.y = pp.y + (pp.x * 0.05);
		p_var = toRect(pp);

		var x_temp: f32 = p_var.x; // Create a mutable copy
		let n: f32 = mod1(&x_temp, 0.15); // Pass pointer to mod1
		p_var.x = x_temp; // Update the original field

		p_var.y = p_var.y + (3. - timeMod * 0.5 + 0.05 * abs(n * n));
		var td: f32 = abs(p_var.x) - (0.005 - p_var.y * 0.002);
		td = abs(td) - 0.02 * pow(-p_var.y, 0.25);
		var sd: f32 = circle(p_var, 0.05);
		let trailCol: vec3<f32> = vec3<f32>(0.5) * smoothstep(-5., 0., p_var.y) * step(p_var.y, 0.) * smoothstep(0., 0.025, -td);
		let shipCol: vec3<f32> = vec3<f32>(0.5 + smoothstep(-1., 1., sin(timeMod * 15. * TAU + n))) * smoothstep(0., 0.075, -sd);
		var col: vec3<f32> = trailCol;
		col = col + (shipCol);
		let sm: f32 = step(abs(n), 2.);
		return col * sm;
	} 

	fn getColor(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
		var max_iter: i32 = 0;
		let skyCol: vec3<f32> = skyColor(ro, rd);
		var col: vec3<f32> = vec3<f32>(0.);
		let shipHeight: f32 = 1.;
		let seaHeight: f32 = 0.;
		let cloudHeight: f32 = 0.2;
		let upperCloudHeight: f32 = 0.5;
		let id: f32 = (cloudHeight - ro.y) / rd.y;
	
		// Replace if-else with select
		let d: f32 = select(MAX_DISTANCE, march(ro, rd, id, &max_iter), id > 0.);
	
		let sunDir: vec3<f32> = sunDirection();
		let osunDir: vec3<f32> = sunDir * vec3<f32>(-1., 1., -1.);
		let p: vec3<f32> = ro + d * rd;
		
		// Pre-calculate loh, loh2, and hih using select to avoid repeated calculation
		let loh: f32 = loheight(p.xz, d);
		let loh2: f32 = loheight(p.xz + sunDir.xz * 0.05, d);
		let hih: f32 = hiheight(p.xz, d);
		let normal: vec3<f32> = normal(p.xz, d);
		
		let ud: f32 = (upperCloudHeight - 4. * loh - ro.y) / rd.y;
		let sd: f32 = (seaHeight - ro.y) / rd.y;
		let sp: vec3<f32> = ro + sd * rd;
		let scd: f32 = (cloudHeight - sp.y) / sunDir.y;
		let scp: vec3<f32> = sp + sunDir * scd;
		let sloh: f32 = loheight(scp.xz, d);
	
		let cshd: f32 = exp(-15. * sloh);
		let amb: f32 = 0.3;
		let seaNormal: vec3<f32> = normalize(vec3<f32>(0., 1., 0.));
		let seaRef: vec3<f32> = reflect(rd, seaNormal);
	
		var seaCol: vec3<f32> = 0.25 * skyColor(p, seaRef);
		seaCol = seaCol + pow(max(dot(seaNormal, sunDir), 0.), 2.);
		seaCol = seaCol * cshd;
		seaCol = seaCol + 0.075 * pow(vec3<f32>(0.1, 1.3, 4.), vec3<f32>(max(dot(seaNormal, seaRef), 0.)));
		
		// Simplify specular reflection and fresnel
		let spe: f32 = pow(max(dot(sunDir, reflect(rd, normal)), 0.), 3.);
		let fre: f32 = pow(1. - dot(normal, -rd), 2.);
		
		col = seaCol;
	
		// Using select instead of smoothstep and if-else
		let level: f32 = 0.;
		let level2: f32 = 0.3;
		let scol: vec3<f32> = sunCol1 * (smoothstep(level, level2, hih) - smoothstep(level, level2, loh2));
		
		col = mix(vec3<f32>(1.), col, exp(-17. * (hih - 0.25 * loh)));
		col = mix(vec3<f32>(0.75), col, exp(-10. * loh * max(d - ud, 0.)));
		col = col + scol;
		col = col + vec3<f32>(0.5) * spe * fre;
	
		let ssd: f32 = (shipHeight - ro.y) / rd.y;
		col = col + shipColor((ro + rd * ssd).xz);
	
		// Apply mix using select to replace if-else logic
		col = mix(col, skyCol, smoothstep(0.5 * MAX_DISTANCE, 1. * MAX_DISTANCE, d));
	
		return col;
	}
	 

	fn postProcess(col: vec3<f32>, q: vec2<f32>) -> vec3<f32> {
		var col_var = col;
		col_var = pow(clamp(col_var, vec3<f32>(0.),vec3<f32>(1.)), vec3<f32>(0.75));
		col_var = col_var * 0.6 + 0.4 * col_var * col_var * (3. - 2. * col_var);
		col_var = mix(col_var, vec3<f32>(dot(col_var, vec3<f32>(0.33))), -0.4);
		col_var = col_var * (0.5 + 0.5 * pow(19. * q.x * q.y * (1. - q.x) * (1. - q.y), 0.7));
		return col_var;
	} 
	

	// Optimized getSample1 with fma
	fn getSample1(p: vec2<f32>, time: f32) -> vec3<f32> {
   

		let ro: vec3<f32> = vec3<f32>(0.5, 5.5, -2.0);
		
		// Use fma for offsetting la.y based on time
		let la: vec3<f32> = ro + vec3<f32>(0.0, fma(0.9, time / PERIOD, -1.0), 1.0);
		
		let ww: vec3<f32> = normalize(la - ro);
		let uu: vec3<f32> = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), ww));
		let vv: vec3<f32> = normalize(cross(ww, uu));
	
		// Use fma for rd calculation: p.x * uu + p.y * vv + 2.0 * ww
		let rd: vec3<f32> = normalize(fma(vec3<f32>(p.x), uu, fma(vec3<f32>(p.y), vv, 2.0 * ww)));
	
		var col: vec3<f32> = getColor(ro, rd);
		return col;
	}
	
	
	// Optimized getSample1 with fma
	fn getSample2(p: vec2<f32>, time: f32) -> vec3<f32> {
		var p_var = p; // Create a mutable copy of the parameter
		p_var.y = p_var.y - (time * 0.25);
		
		let h: f32 = height(p_var, 0.0);
		let n: vec3<f32> = normal(p_var, 0.0);
		let lp: vec3<f32> = vec3<f32>(10.0, -1.2, 0.0);
		let ld: vec3<f32> = normalize(vec3<f32>(p_var.x, h, p_var.y) - lp);
		let d: f32 = max(dot(ld, n), 0.0);
		
		var col: vec3<f32> = vec3<f32>(0.0);

		//col = vec3<f32>(1.0) * (h + 0.1);
		//col = col + (vec3<f32>(1.5) * pow(d, 0.75));

		// Use fma for more efficient arithmetic
	
		col = vec3<f32>(fma(h, 1.0, 0.1)); 
		col = col + (vec3<f32>(1.5) * pow(d, 0.75));
		
		return col;
	}

	
	fn mainImage(invocation_id: vec2<f32>) -> vec4<f32> {

		 // Inline TIME calculation
		let timeMod: f32 = uniforms.time % PERIOD;  // Direct calculation, removing external function call
   

		// Screen resolution from uniforms
		let R: vec2<f32> = uniforms.resolution.xy;
	
		// Compute the y-inverted location and original location in pixel space
		let y_inverted_location: vec2<i32> = vec2<i32>(
			i32(invocation_id.x), 
			i32(R.y) - i32(invocation_id.y)
		);
		let location: vec2<i32> = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
		
		// Initialize fragment coordinates
		let fragCoord = vec2<f32>(
			invocation_id.x, 
			uniforms.resolution.y - invocation_id.y
		);
	
		// Compute normalized device coordinates
		let q: vec2<f32> = fragCoord.xy / uniforms.resolution.xy;
		var p: vec2<f32> = -1.0 + 2.0 * q;
		p.x = p.x * (uniforms.resolution.x / uniforms.resolution.y);
	
		
		var col: vec3<f32> = getSample1(p, timeMod);
	
		// Post-processing effects
		col = postProcess(col, q);
		col = col * smoothstep(0.0, 2.0, timeMod);
		col = col * (1.0 - smoothstep(PERIOD - 2.0, PERIOD, timeMod));
	
		// Return the final color as a vec4
		return vec4<f32>(col, 1.0);
	}
	

	

	fn debug_mainImage(fragCoord: vec2<f32>) -> vec4<f32> {		
		return vec4<f32>(vec3<f32>(1.0), 1.);
	} 
		


	@fragment
	fn main_fragment(vert: VertexOutput) -> @location(0) vec4<f32> {    
		
		return mainImage(vert.pos.xy);
	}

`};