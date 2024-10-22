"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainFragment = void 0;
exports.mainFragment = `
uniform vec2 resolution;
uniform float time;

uniform float sI;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;


uniform sampler2D[5] channels;


out vec4 fragColor;

#define iTime time
#define res resolution 

const float GA =2.399; 
const mat2 rot = mat2(cos(GA),sin(GA),-sin(GA),cos(GA));


vec3 dof(sampler2D tex,vec2 uv,float rad)
{
	
	vec3 acc=vec3(0);
    vec2 pixel=vec2(.002*res.y/res.x,.002),angle=vec2(0,rad);;
    rad=1.;
	for (int j=0;j<80;j++){  
        rad += 1./rad;
	    angle*=rot;
        vec4 col=texture(tex,uv+pixel*(rad-1.)*angle);
		acc+=col.xyz;
	}
	return acc/80.;
}

//-------------------------------------------------------------------------------------------
void mainImage(out vec4 fragColor,in vec2 fragCoord)
{

	vec4 color = vec4(vec3(0.),1.);

	vec2 uv = gl_FragCoord.xy / res.xy;

	float blend,blend2,multi1,multi2;
	
    blend=min (3. *abs(sin((.1*iTime)*3.1415/3.0)),1.); 

    blend2=min(2.5*abs(sin((.1*iTime)*3.1415/3.0)),1.); 
    
    multi1=((fract(uv.x*6.-4.*uv.y*(1.-blend2))< 0.5 || uv.y<blend) 
    &&(fract(uv.x*6.-4.*uv.y*(1.-blend2))>=0.5 || uv.y>1.-blend))?1.:0.;

 	multi2=(fract(uv.x*12.-0.05-8.*uv.y*(1.-blend2))>0.9)?blend2:1.;
   
    uv.y=(fract(uv.x*6.-4.*uv.y*(1.-blend2))<0.5)?uv.y-(1.-blend):uv.y+=(1.-blend);
	
	if(sI ==0.0){
		//color = texture(iChannel0,uv);
		color=vec4(dof(iChannel0,uv,texture(iChannel0,uv).w),1.);
	}else if(sI == 1.0){
		color = texture(iChannel1,uv);
	}else if(sI == 2.0){
			color=vec4(dof(iChannel2,uv,texture(iChannel2,uv).w),1.);
	}	
	else{
		color = texture(iChannel3,uv);
		//color=vec4(dof(iChannel1,uv,texture(iChannel1,uv).w),1.);
	}
	
	fragColor = color; //multi1*multi2*blend2;
	
}

void main(){

    mainImage(fragColor,gl_FragCoord.xy);

}`;
