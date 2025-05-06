import {
  GLSLShaderEntity,
  IEntity,
  IGLSLShaderProperties,
} from '../../../src';
import { mainFragment } from '../../assets/shaders/mainFragment';
import { mainVertex } from '../../assets/shaders/mainVertex';

export interface INebulaShader extends IGLSLShaderProperties {


}

/*  
    Scene description:
    This is a nebula, a large cloud of gas and dust in space.
    Nebulae are often the birthplaces of stars and planets, and they can be incredibly beautiful to observe.

    This nebula then formed from the remnants of a supernova explosion, now a swirling mass of gas and dust.
    The colors and shapes of the nebula are constantly changing as new stars are born and old ones die.

*/

export const nebula = /*glsl*/ `

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

out vec4 fragColor;

#define iMouse mouse
#define iTime time
#define iResolution resolution

#define pi 3.14159265
#define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// iq's noise
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = textureLod( iChannel0, (uv+ 0.5)/256.0, 0.0 ).yx;
	return 1. - 0.82*mix( rg.x, rg.y, f.z );
}

float rand(vec2 co)
{
	return fract(sin(dot(co*0.123,vec2(12.9898,78.233))) * 43758.5453);
}

//=====================================
// otaviogood's noise from https://www.shadertoy.com/view/ld2SzK
//--------------------------------------------------------------
// This spiral noise works by successively adding and rotating sin waves while increasing frequency.
// It should work the same on all computers since it's not based on a hash function like some other noises.
// It can be much faster than other noise functions if you're ok with some repetition.
const float nudge = 0.739513;	// size of perpendicular vector
float normalizer = 1.0 / sqrt(1.0 + nudge*nudge);	// pythagorean theorem on that perpendicular to maintain scale
float SpiralNoiseC(vec3 p)
{
    float n = 0.0;	// noise amount
    float iter = 1.0;
    for (int i = 0; i < 8; i++)
    {
        // add sin and cos scaled inverse with the frequency
        n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;	// abs for a ridged look
        // rotate by adding perpendicular and scaling down
        p.xy += vec2(p.y, -p.x) * nudge;
        p.xy *= normalizer;
        // rotate on other axis
        p.xz += vec2(p.z, -p.x) * nudge;
        p.xz *= normalizer;
        // increase the frequency
        iter *= 1.733733;
    }
    return n;
}

float SpiralNoise3D(vec3 p)
{
    float n = 0.0;
    float iter = 1.0;
    for (int i = 0; i < 5; i++)
    {
        n += (sin(p.y*iter) + cos(p.x*iter)) / iter;
        p.xz += vec2(p.z, -p.x) * nudge;
        p.xz *= normalizer;
        iter *= 1.33733;
    }
    return n;
}

float NebulaNoise(vec3 p)
{
   float final = p.y + 4.5;
    final -= SpiralNoiseC(p.xyz);   // mid-range noise
    final += SpiralNoiseC(p.zxy*0.5123+100.0)*4.0;   // large scale features
    final -= SpiralNoise3D(p);   // more large scale features, but 3d

    return final;
}

float map(vec3 p) 
{

	R(p.xz, iMouse.x*0.008*pi+iTime*0.1);

    
	float NebNoise = abs(NebulaNoise(p/0.5)*0.5);
    
	return NebNoise+0.03;
}
//--------------------------------------------------------------

// assign color to the media
vec3 computeColor( float density, float radius )
{
	// color based on density alone, gives impression of occlusion within
	// the media
	vec3 result = mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density );
	
	// color added to the media
	vec3 colCenter = 7.*vec3(0.8,1.0,1.0);
	vec3 colEdge = 1.5*vec3(0.48,0.53,0.5);
	result *= mix( colCenter, colEdge, min( (radius+.05)/.9, 1.15 ) );
	
	return result;
}

bool RaySphereIntersect(vec3 org, vec3 dir, out float near, out float far)
{
	float b = dot(dir, org);
	float c = dot(org, org) - 8.;
	float delta = b*b - c;
	if( delta < 0.0) 
		return false;
	float deltasqrt = sqrt(delta);
	near = -b - deltasqrt;
	far = -b + deltasqrt;
	return far > 0.0;
}

// Applies the filmic curve from John Hable's presentation
// More details at : http://filmicgames.com/archives/75
vec3 ToneMapFilmicALU(vec3 _color)
{
	_color = max(vec3(0), _color - vec3(0.004));
	_color = (_color * (6.2*_color + vec3(0.5))) / (_color * (6.2 * _color + vec3(1.7)) + vec3(0.06));
	return _color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{  
    const float KEY_1 = 49.5/256.0;
	const float KEY_2 = 50.5/256.0;
	const float KEY_3 = 51.5/256.0;
    float key = 0.0;

    // key += 0.7*texture(iChannel1, vec2(KEY_1,0.25)).x;
    // key += 0.7*texture(iChannel1, vec2(KEY_2,0.25)).x;
    // key += 0.7*texture(iChannel1, vec2(KEY_3,0.25)).x;

	// ro: ray origin
	// rd: direction of the ray
	vec3 rd = normalize(vec3((gl_FragCoord.xy-0.5*iResolution.xy)/iResolution.y, 1.));
	vec3 ro = vec3(0., 0., -6.+key*1.6);


    R(rd.yz, -pi*3.93);
    R(rd.xz, pi*3.2);
    R(ro.yz, -pi*3.93);
   	R(ro.xz, pi*3.2);    

	vec2 dpos = ( fragCoord.xy / iResolution.xy );
	vec2 seed = dpos + fract(iTime);

    
	// ld, td: local, total density 
	// w: weighting factor
	float ld=0., td=0., w=0.;

	// t: length of the ray
	// d: distance function
	float d=1., t=0.;
    
    const float h = 0.1;
   
	vec4 sum = vec4(0.0);
   
    float min_dist=0.0, max_dist=0.0;

    if(RaySphereIntersect(ro, rd, min_dist, max_dist))
    {
       
	t = min_dist*step(t,min_dist);
   
	// raymarch loop
	for (int i=0; i<56; i++) 
	{
	 
		vec3 pos = ro + t*rd;
  
		// Loop break conditions.
        if(td>0.9 || d<0.1*t || t>10. || sum.a > 0.99 || t>max_dist) break;
	    
        // evaluate distance function
        float d = map(pos);
		       
		// change this string to control density 
		d = max(d,0.08);
        
        // point light calculations
        vec3 ldst = vec3(0.0)-pos;
        float lDist = max(length(ldst), 0.001);

        // star in center
        vec3 lightColor=vec3(1.0,0.5,0.25);
        sum.rgb+=(lightColor/(lDist*lDist)/30.); // star itself and bloom around the light
      
		if (d<h) 
		{
			// compute local density 
			ld = h - d;
            
            // compute weighting factor 
			w = (1. - td) * ld;
     
			// accumulate density
			td += w + 1./200.;
		
			vec4 col = vec4( computeColor(td,lDist), td );
		
			// uniform scale density
			col.a *= 0.185;
			// colour by alpha
			col.rgb *= col.a;
			// alpha blend in contribution
			sum = sum + col*(1.0 - sum.a);  
       
		}
      
		td += 1./70.;
       
        // enforce minimum stepsize
        d = max(d, 0.04); 

        d=abs(d)*(.8+0.2*rand(seed*vec2(i)));

		
        // trying to optimize step size near the camera and near the light source
        t += max(d * 0.1 * max(min(length(ldst),length(ro)),1.0), 0.02);
      
	}
    
    // simple scattering
	sum *= 1. / exp( ld * 0.2 ) * 0.6;
        
   	sum = clamp( sum, 0.0, 1.0 );
   
    sum.xyz = sum.xyz*sum.xyz*(3.0-2.0*sum.xyz);
    
	}

    
    fragColor = vec4(ToneMapFilmicALU(sum.xyz*2.2),1.0);
	}

    void main(){
        mainImage(fragColor,gl_FragCoord.xy);
    }    
`;




export const Scene2Shader = (startTime?: number, duration?: number): IEntity => {

    const shader: GLSLShaderEntity<INebulaShader> = new GLSLShaderEntity<INebulaShader>
        ("nebulaShader", {
            mainFragmentShader: mainFragment,
            mainVertexShader: mainVertex,
            renderBuffers: [
                {
                    name: "nebula",
                    fragment: nebula,
                    vertex: mainVertex,
                    textures: [], // todo render a Noise texture
                    customUniforms: {
                    }
                }
            ]

        }, () => { }, 840, 450);

    return shader;

};