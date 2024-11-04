export const singularityShader = /*glsl*/ `uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
out vec4 fragColor;

vec2 hash(vec2 x)
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
	uv.y = -uv.y;
    uv.y /= aspect;
    
    //vec2 sing = iMouse.xy / resolution.xy;
    vec2 sing = vec2(0.5, 0.5 / aspect);
    sing.y = -sing.y;
    
    uv -= sing;
    uv *= pow(0.1, (time - 10.0) * 0.05);
    uv += sing;
    
	vec2 warp = 1. * normalize(sing - uv) * pow(distance(sing, uv) * 1000.0, -1.0);
	uv = uv + warp;
    
    uv = fract(uv - time / 8.0);
    
    float n = smoothstep(0.4, 0.5, noise(uv * 100.) + noise(uv * 25.) / 2.0);
	
	float light = clamp(distance(sing, uv), 0.0, 1.0);
	
	//vec4 color = texture(iChannel1, fract(uv - time / 8.0));
    vec4 color = vec4(n);
	fragColor = color;// * light;
}



void main(){
    mainImage(fragColor,gl_FragCoord.xy);
}

`;