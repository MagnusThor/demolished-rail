export const exoplanetShader = /*glsl*/ `uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

out vec4 fragColor;



const float tau = 6.283185;

float hash1(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash1(float p, float q) {
    vec3 p3  = fract(vec3(p, q, p) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash2(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 hash2(float p, float q) {
    vec3 p3 = fract(vec3(p, q, p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec3 hash3(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx); 
}

vec3 hash3(vec3 p3) {
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec4 hash4(float p) {
    vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);    
}

float noise1(float p) {
    float i = floor(p);
    float f = fract(p);
    float u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(hash1(i), hash1(i + 1.0), u);
}

vec3 noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return 1.0 - 2.0 * mix(mix(mix(hash3(i + vec3(0.0, 0.0, 0.0)), 
                                   hash3(i + vec3(1.0, 0.0, 0.0)), u.x),
                               mix(hash3(i + vec3(0.0, 1.0, 0.0)), 
                                   hash3(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
                           mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), 
                                   hash3(i + vec3(1.0, 0.0, 1.0)), u.x),
                               mix(hash3(i + vec3(0.0, 1.0, 1.0)), 
                                   hash3(i + vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float fbm1(float p) {
    float f = noise1(p); p = 2.0 * p;
    f += 0.5 * noise1(p); p = 2.0 * p;
    f += 0.25 * noise1(p); p = 2.0 * p;
    f += 0.125 * noise1(p); p = 2.0 * p;
    f += 0.0625 * noise1(p);
    return f / 1.9375;
}

const mat3 m = mat3( 0.51162, -1.54702,  1.15972,
                    -1.70666, -0.92510, -0.48114,
                     0.90858, -0.86654, -1.55678);

vec3 fbm3(vec3 p) {
    vec3 f = noise3(p); p = m * p;
    f += 0.5 * noise3(p); p = m * p;
    f += 0.25 * noise3(p); p = m * p;
    f += 0.125 * noise3(p); p = m * p;
    f += 0.0625 * noise3(p);
    return f / 1.9375;
}

vec3 uniform3(float seed) {
    vec2 hash = hash2(seed);
    float x = 2.0 * hash.x - 1.0;
    float r = sqrt(1.0 - x * x);
    float t = tau * hash.y;
    return vec3(x, r * sin(t), r * cos(t));
}

vec3 hsv(float hue, float sat, float val) {
    return (val) * (vec3(1.0 - (sat)) + (sat) * (0.5 + 0.5 * cos(6.2831853 * (vec3(hue) + vec3(0.0, 0.33, 0.67)))));
}

vec4 newMoon(float moonCount, vec3 pole, float seed, float moon) {
    vec3 pos = uniform3(seed);
    pos -= 0.75 * pole * dot(pole, pos);
    pos = normalize(pos);
    pos *= 1.5 + 2.0 * hash1(seed + 0.001);
    pos *= step(moon, moonCount);
    float r = 0.02 + 0.1 * pow(hash1(seed + 0.002), 6.0);
    return vec4(pos, r);
}

#define hitMoon(moon, seed) { \
    vec3 v = eye - moon.xyz; \
    float b = dot(v, ray); \
    float c = dot(v, v) - moon.w * moon.w; \
    float h = b * b - c; \
    float mHit = step(0.0, h); \
    h = max(h, 0.0); \
    float mDepth = -b - sqrt(h); \
    vec3 p = eye + mDepth * ray; \
    vec3 mNorm = normalize(p - moon.xyz); \
    mHit *= step(mDepth, moonDepth); \
    moonDepth = mix(moonDepth, mDepth, mHit); \
    moonNorm = mix(moonNorm, mNorm, mHit); \
    moonSeed = mix(moonSeed, seed, mHit); \
}

float moonShadow(vec3 pos, vec4 moon, vec3 dir) {
    vec3 p = pos - moon.xyz;
	float m = dot(p, dir);
    float n = dot(p, p);
    return step(step(m, 0.0) * moon.w * moon.w, n - m * m);
}

float ring(vec3 pos, vec3 dir, vec3 pole, float seed, out float d, out float r, out vec3 q) {
    vec2 bounds = 1.4 * hash2(seed + 0.9) + vec2(1.1, 1.6);
    
    d = dot(-pos, pole) / dot(dir, pole);
    q = pos + d * dir;
    r = length(q);
    
    float a = smoothstep(bounds.x, bounds.x + 0.1, r) * smoothstep(bounds.y, bounds.y - 0.1, r);
    a *= smoothstep(-0.5, 1.0, fbm1(6.0 * (r + 3.0 * seed)));
    return clamp(a, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float t = 0.25 * time;
    float seed = floor(t) + 1.0;
    
    vec3 center = vec3(0.0);
    float s = 2.0 * fract(t) - 1.0;
    float powS = s * s;
    powS = powS * powS;
    powS = powS * powS;
    powS = powS * powS;    
    center += s * powS * vec3(1.0, 3.0, 0.0);
    vec3 eye = center + vec3(0.0, -5.0, 0.0) + fract(t) * vec3(1.0, 1.0, 0.0);
    float zoom = 3.0;
    
    vec3 forward = normalize(center - eye);
    vec3 right = normalize(cross(forward, vec3(0.0, 0.0, 1.0)));
    vec3 up = cross(right, forward);
    vec2 xy = 2.0 * fragCoord - resolution.xy;
    vec3 ray = normalize(xy.x * right + xy.y * up + zoom * forward * resolution.y);
    
    vec3 light = uniform3(seed);
    vec3 pole = uniform3(seed + 0.1);
        
    float dist = 1.0 + 1.2 * hash1(seed);
    eye *= dist;

    vec2 bandHash = hash2(seed + 0.2);
    float bandScale = 1.0 + 6.0 * bandHash.x;
    float bandTurbulence = 0.1 * pow(bandHash.y, 2.0);
    
    vec4 planetHash = hash4(seed + 0.3);
    vec3 planetColor = hsv(planetHash.x, 0.5, 0.5 + 0.2 * planetHash.y);
    vec3 planetMinorX = hsv(planetHash.x, 0.3, 0.5 + 0.2 * planetHash.y + 0.3 * planetHash.w) - planetColor;
    vec3 planetMinorY = hsv(planetHash.x + 0.4 * planetHash.z, 0.5, 0.5 + 0.2 * planetHash.y) - planetColor;
    vec3 planetMinorZ = hsv(planetHash.x + 0.4 * planetHash.z, 0.3, 0.5 + 0.2 * planetHash.y - 0.4 * planetHash.w) - planetColor;
    
    vec3 ringHash = hash3(seed + 0.4);
    vec3 ringColor = hsv(ringHash.x, 0.2, 0.5 + 0.2 * ringHash.y);
    vec3 ringMinor = hsv(ringHash.x + 0.3 * ringHash.z, 0.2, 0.7 + 0.2 * ringHash.y) - ringColor;
    
    float moonCount = hash1(seed + 0.5) * 8.0 - 2.0;    
    
    vec4 moon1 = newMoon(moonCount, pole, seed + 0.01, 0.0);
    vec4 moon2 = newMoon(moonCount, pole, seed + 0.02, 1.0);
    vec4 moon3 = newMoon(moonCount, pole, seed + 0.03, 2.0);
    vec4 moon4 = newMoon(moonCount, pole, seed + 0.04, 3.0);
    vec4 moon5 = newMoon(moonCount, pole, seed + 0.05, 4.0);
    vec4 moon6 = newMoon(moonCount, pole, seed + 0.06, 5.0);
    
    float b = dot(eye, ray);
    float c = dot(eye, eye) - 1.0;
    float h = b * b - c;
    float hit = step(0.0, h);
    h = max(h, 0.0);
    float depth = -b - sqrt(h);
    vec3 pos = eye + depth * ray;
    
    vec3 poleX = normalize(cross(pole, vec3(0.0, 0.0, 1.0)));
    vec3 poleY = cross(pole, poleX);
    mat3 rot = inverse(mat3(pole, poleX, poleY));
    
    vec3 p = rot * pos;
    //p.x = asin(p.x); // Latitude bands
    p += bandTurbulence * fbm3(10.0 * p);
    
    vec3 bands = fbm3(bandScale * vec3(1.0, 0.05, 0.05) * p + seed);
    vec3 color = planetColor;
    color += planetMinorX * bands.x;
    color += planetMinorY * bands.y;
    color += planetMinorZ * bands.z;
    
    float moonDepth = 2.0 * depth;
    vec3 moonNorm = vec3(0.0);
    float moonSeed = 0.0;
    hitMoon(moon1, 1.0);
    hitMoon(moon2, 2.0);
    hitMoon(moon3, 3.0);
    hitMoon(moon4, 4.0);
    hitMoon(moon5, 5.0);
    hitMoon(moon6, 6.0);
    float moonHit = 1.0 - step(depth, moonDepth) * hit;

    vec3 moonPos = eye + moonDepth * ray;
    
    vec3 moonColor = fbm3(10.0 * moonPos);
    float moonSat = 0.4 * hash1(seed + 0.123 * moonSeed) + 0.2 * moonColor.x;
    moonColor = hsv(hash1(seed + 0.321 * moonSeed) + 0.2 * moonColor.y, moonSat, 0.4 + 0.7 * moonColor.z);
    
    pos = mix(pos, moonPos, moonHit);
    color = mix(color, moonColor, moonHit);
    depth = mix(depth, moonDepth, moonHit);
    vec3 norm = mix(pos, moonNorm, moonHit);
    hit = 1.0 - (1.0 - hit) * (1.0 - moonHit);
    
    float illumination = max(dot(norm, light), 0.0);

    float m = dot(pos, light);
    float n = dot(pos, pos);
    illumination *= step(step(m, 0.0), n - m * m);
    
    illumination *= moonShadow(pos, moon1, light);
    illumination *= moonShadow(pos, moon2, light);
    illumination *= moonShadow(pos, moon3, light);
    illumination *= moonShadow(pos, moon4, light);
    illumination *= moonShadow(pos, moon5, light);
    illumination *= moonShadow(pos, moon6, light);

    float d, r;
    vec3 q;
    float ringShadow = ring(pos, light, pole, seed, d, r, q);
    illumination *= 1.0 - ringShadow * step(0.0, d);

    color *= hit * illumination;
    
    float ringAlpha = ring(eye, ray, pole, seed, d, r, q);
    float ringLight = 0.5 + 0.5 * abs(dot(pole, light));
    
    m = dot(q, light);
    n = dot(q, q);
    ringLight *= step(step(m, 0.0), n - m * m);
    
    ringLight *= moonShadow(q, moon1, light);
    ringLight *= moonShadow(q, moon2, light);
    ringLight *= moonShadow(q, moon3, light);
    ringLight *= moonShadow(q, moon4, light);
    ringLight *= moonShadow(q, moon5, light);
    ringLight *= moonShadow(q, moon6, light);
    
    ringColor += ringMinor * fbm1(15.0 * (r + 3.0 * seed));
    ringColor *= ringLight;
    
    color = mix(color, ringColor, step(hit * d, depth) * ringAlpha);
    
    color *= 2.0;
    float flare = max(0.0, dot(ray, light));
    color += pow(flare, 10.0);
    
    fragColor = vec4(color, 1.0);
}




void main(){
    mainImage(fragColor,gl_FragCoord.xy);
}

`; 