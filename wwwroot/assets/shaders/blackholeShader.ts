export const blackholeShader = /*glsl*/ `uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float zoom;
out vec4 fragColor;

#define f(a) exp( -10.* pow( length( U -.52*cos(a+vec2(0,33)) ) , 2. ) )

void mainImage( out vec4 O, vec2 u )
{
    float zoomFactor = zoom;

    vec2  R = resolution.xy,
          U = ( u+u - R ) / R.y ;
    
    O =   ( .5-.5*cos(min(6.*length(U),6.3)) ) 
        * (    .7* vec4(1,.25,0,0)
            + ( f(.65)+f(1.6)+f(2.8) ) * vec4(.8,.8,.5,0) );
}
void main(){
    mainImage(fragColor,gl_FragCoord.xy);
}

`