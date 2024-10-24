export const mainFragment = /*glsl*/ `
uniform vec2 resolution;
uniform float time;

uniform float sI;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;

out vec4 fragColor;

#define iTime time
#define res resolution 


//-------------------------------------------------------------------------------------------
void mainImage(out vec4 fragColor,in vec2 fragCoord)
{

	vec4 color = vec4(vec3(0.),1.);
	vec2 uv = gl_FragCoord.xy / res.xy;

	color = texture(iChannel0,uv);
	
	fragColor = color; //multi1*multi2*blend2;
	
}

void main(){

    mainImage(fragColor,gl_FragCoord.xy);

}`