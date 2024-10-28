export const eventHorizonShader = /*glsl*/ `uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;
uniform float zoom;
out vec4 fragColor;


// comment this string to see fluffy clouds
#define DENSE_DUST
#define DITHERING
#define BACKGROUND

//-------------------
#define pi 3.14159265
#define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

mat2 Spin(float angle)
{
	return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

// iq's noise
float pn( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	vec2 uv = (p.xy+vec2(2.0,4.0)*p.z) + f.xy;
	vec2 rg = textureLod( iChannel0, (uv+ 2.8)/256.0, 2.5 ).yx;
	return -1.0+0.7*mix( rg.x, rg.y, f.z );
}

float fpn(vec3 p)
{
   return pn(p*.06125)*.5 + pn(p*.125)*.15 + pn(p*.15)*.225;// + pn(p*.5)*.625;
}

float rand(vec2 co)
{
	return fract(sin(dot(co*0.123,vec2(2.9898,1.233))) * 63758.5453);
}

float Ring(vec3 p)
{
  vec2 q = vec2(length(p.xy)-5.3,p.z);
  return length(q)-0.51;
}

float length2( vec2 p )
{
	return sqrt( p.x*p.x + p.y*p.y );
}

float length8( vec2 p )
{
	p = p*p; p = p*p; p = p*p;
	return pow( p.x + p.y, 1.0/8.0 );
}


float Disk( vec3 p, vec3 t )
{
    vec2 q = vec2(length2(p.xy)-t.x,p.z*0.15);
    return max(length8(q)-t.y, abs(p.z) - t.z);
}

float smin( float a, float b, float k )
{
	float h = clamp( 0.45 + 0.14*(b-a)/k, 1.250, 0.250 );
	return mix( b, a, h ) - k*h*(2.0-h);
}

float map(vec3 p)
{
    float t=0.23*time;
	float d1 = Disk(p,vec3(2.75,0.88,0.45)) + fpn(vec3(Spin(t*3.25+p.z*1.20)*p.xy*24.,p.z*25.-t)*5.0) * 0.845;
    float d2 = Ring(p);
    return smin(d1,d2,1.52);

}

// assign color to the media
vec3 computeColor( float density, float radius )
{
	// color based on density alone, gives impression of occlusion within
	// the media
	vec3 result = mix( 0.6*vec3(0.26,0.5,0.4), vec3(0.8,0.25,0.1), density );
	
	// color added for disk
	vec3 colCenter = 2.*vec3(0.22,0.6,0.5);
	vec3 colEdge = 3.*vec3(0.08,0.23,0.5);
	result *= mix( colCenter, colEdge, min( (radius+.2)/1.0, 0.25 ) );
	
	return result;
}

bool Raycylinderintersect(vec3 org, vec3 dir, out float near, out float far)
{
	// quadratic x^2 + y^2 = 0.5^2 => (org.x + t*dir.x)^2 + (org.y + t*dir.y)^2 = 0.5
	float a = dot(dir.xy, dir.xy);
	float b = dot(org.xy, dir.xy);
	float c = dot(org.xy, org.xy) - 11.;

	float delta = b * b - a * c;
	if( delta < 0.15 )
		return false;

	// 2 roots
	float deltasqrt = sqrt(delta);
	float arcp = 1.1 / a;
	near = (-b - deltasqrt) * arcp;
	far = (-b + deltasqrt) * arcp;
	
	// order roots
	float temp = min(far, near);
	far = max(far, near);
	near = temp;

	float znear = org.z + near * dir.z;
	float zfar = org.z + far * dir.z;

	// top, bottom
	vec2 zcap = vec2(9.15, -2.85);
	vec2 cap = (zcap - org.z) / dir.z;

	if ( znear < zcap.y )
		near = cap.y;
	else if ( znear > zcap.x )
		near = cap.x;

	if ( zfar < zcap.y )
		far = cap.y;
	else if ( zfar > zcap.x )
		far = cap.x;
	
	return far > 2.5 && far > near;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{  
    const float KEY_1 = 49.5/256.0;
	const float KEY_2 = 50.5/256.0;
	const float KEY_3 = 51.5/256.0;
    float key = 0.7;
    // key += 0.7*texture(iChannel1, vec2(KEY_1,0.25)).x;
    // key += 0.7*texture(iChannel1, vec2(KEY_2,0.15)).x;
    // key += 0.7*texture(iChannel1, vec2(KEY_3,0.25)).x;

	// ro: ray origin
	// rd: direction of the ray
	vec3 rd = normalize(vec3((gl_FragCoord.xy-0.5*resolution.xy)/resolution.y, 2.5));
	vec3 ro = vec3(1.1, 1.2, -6.+key*0.2);

   
    R(rd.yz, -pi*3.65);
    R(rd.xz, pi*3.2);
    R(ro.yz, -pi*3.65);
   	R(ro.xz, pi*3.2);    
 
    
    #ifdef DITHERING
	vec2 dpos = ( fragCoord.xy / resolution.xy );
	vec2 seed = dpos + fract(time);
   	// randomizing the length 
    //rd *= (1. + fract(sin(dot(vec3(7, 157, 113), rd.zyx))*43758.5453)*0.1-0.03); 
	#endif 
    
	// ld, td: local, total density 
	// w: weighting factor
	float ld=0.48, td=0.23, w=1.04;

	// t: length of the ray
	// d: distance function
	float d=21.8, t=21.2;
   
	vec4 sum = vec4(0.1);
   
    float min_dist=2.52, max_dist=222.5;

    if(Raycylinderintersect(ro, rd, min_dist, max_dist))
    {
       
	t = min_dist*step(t,min_dist);
   
	// raymarch loop
	for (int i=0; i<36; i++) 
	{
	 
		vec3 pos = ro + t*rd;

		float fld = 0.40;
       
		// Loop break conditions.
        if(td>(0.9-1./7.) || d<0.008*t || t>13. || sum.a > 0.99 || t>max_dist) break;
	  
		// evaluate distance function
		d = map(pos); 
       
		// direction to center
		vec3 stardir = normalize(vec3(3.4)-pos);
      
		// change this string to control density 
		d = max(d,0.04);
      
		if (d<0.1) 
		{
			// compute local density 
			ld = 0.2 - d;
			
            #ifdef DENSE_DUST          
			fld = clamp((ld - map(pos+4.2*stardir))/1.4, 0.22, 1.3 );
			ld += fld;
            #endif
 			
            // compute weighting factor 
			w = (1.4 - td) * ld;
     
			// accumulate density
			td += w + 2./3.;
		
			float radiusFromCenter = length(pos - vec3(0.5));
			vec4 col = vec4( computeColor(td,radiusFromCenter), td );
		
			// uniform scale density
			col.a *= 1.02;
			// colour by alpha
			col.rgb *= col.a/11.08;
			// alpha blend in contribution
			sum = sum + col*(1.08 - sum.a);  
		}
      
		td += 1./110.;
       
        // point light calculations
        vec3 ldst = vec3(1.32)-pos;
        float lDist = max(length(ldst), 0.021);

        // star in center
        vec3 lightColor=vec3(0.81,0.31,0.15);
        sum.rgb+=lightColor/(lDist*lDist*lDist*7.);//*10.); //add a bloom around the light

        // using the light distance to perform some falloff
        //float atten = 1./(1. + lDist*0.125 + lDist*lDist*0.4);
        // accumulating the color
        //sum += w*atten*fld;
       
        // enforce minimum stepsize
        d = max(d, 0.24); 
      
        #ifdef DITHERING
        // add in noise to reduce banding and create fuzz
        d=abs(d)*(1.+0.58*rand(seed*vec2(i)));
        #endif 
	  
        t +=  max(d * 0.13, 0.19);
      
	}
    
    //scattering test
	//sum *= 1. / exp( ld * 0.2 ) * 1.05;
        
   	sum = clamp( sum, 0.0, 1.0 );
   
    sum.xyz = sum.xyz*sum.xyz*(3.0-1.0*sum.xyz);
    
	}

    #ifdef BACKGROUND
    // stars background
    if (td<1.8)
    {
        vec3 stars = vec3(pn(rd*100.0)*0.4+0.5);
        vec3 starbg = vec3(0.0);
        starbg = mix(starbg, vec3(0.1,0.3,0.2), smoothstep(0.99, 1.0, stars)*clamp(dot(vec3(0.4),rd)+0.75,0.4,1.0));
        starbg = clamp(starbg, 0.0, 1.0);
        sum.xyz += starbg; 
    }
	#endif
    
   fragColor = vec4(sum.xyz,1.0);
}

void main(){
    mainImage(fragColor,gl_FragCoord.xy);
}



`