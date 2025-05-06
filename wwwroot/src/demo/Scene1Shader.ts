import {
  Canvas2DEntity,
  GLSLShaderEntity,
  IEntity,
  Sequence,
} from '../../../src';
import {
  earthShader,
  IEarthShader,
} from '../../assets/shaders/glsl/earthShader';
import { mainFragment } from '../../assets/shaders/mainFragment';
import { mainVertex } from '../../assets/shaders/mainVertex';
import { TextAlignment } from '../example/canvas2d/fadeInOutTextEffect';
import { IFadeInTimedElementEffectProps } from './textEff';

/*
  Scene description:

  Ths is k2-18b, a planet located in the habitable zone of its star, K2-18.
  It is a super-Earth, meaning it is larger than Earth but smaller than Neptune.
  2.5 times the size of Earth, K2-18b is a water world with a thick atmosphere.

*/


export const Scene1Shader = (startTime?: number, duration?: number): IEntity => {
  const cameraPositions = [
    [0.0, 1.2, 0.7],
    [0.5, 1.0, 0.9],
    [1.0, 0.8, 1.1],
    [0.7, 1.3, 0.6],
    [0.2, 1.1, 1.0],
    [1.2, 0.9, 0.8],
    [0.9, 1.4, 0.5],
    [0.4, 1.0, 1.2],
    [0.0, 1.2, 2.0],
    [-1.0, 0.99, 1.0],
    [1.0, 0.99, 1.0],
    [0.0, 1.2, 0.2],
    [0.0, 0.99, 1.0],
    [0.0, 1.2, 1.2],
    [0.0, 0.9, 1.0],
    [0.0, 1.5, 1.9],
    [0.0, 1.2, 1.9],
    [1.0, 1.5, 1.1],
    [1.0, 1.5, 1.9]
  ];

  const shader = new GLSLShaderEntity<IEarthShader>(
    "earthShader",
    {
      cameraPos: cameraPositions[0],
      amountOfLightning: 1.0, // Initial value
      mainFragmentShader: mainFragment,
      mainVertexShader: mainVertex,
      renderBuffers: [
        {
          name: "a_buffer",
          fragment: earthShader,
          vertex: mainVertex,
          textures: [],
          customUniforms: {
            "amountOfLightning": (uniformLocation: WebGLUniformLocation, gl: WebGLRenderingContext,
              program: WebGLProgram, time: number, entity: GLSLShaderEntity<IEarthShader>
            ) => {
              if (uniformLocation) {
                gl.uniform1f(uniformLocation, entity.props!.amountOfLightning);
              }
            },
            "cameraPos": (uniformLocation: WebGLUniformLocation, gl: WebGLRenderingContext,
              program: WebGLProgram, time: number, entity: GLSLShaderEntity<IEarthShader>
            ) => {
              if (uniformLocation) {
                gl.uniform3fv(uniformLocation!, entity.props!.cameraPos);
              }
            }
          }
        }
      ]
    },
    () => {
      // Optional logic for the shader entity
    },
    850, 450 // Width and height
  );

  // Swap camera position on each bar
  shader.onBar<IEarthShader>((ts: number, count: number, propertyBag?: IEarthShader) => {
    const positionIndex = (count) % cameraPositions.length;
    if (propertyBag) {
      propertyBag.cameraPos = cameraPositions[positionIndex];
    }
    console.log("EarthShader -§ Timestamp: ", ts, "Camera Position: ", propertyBag?.cameraPos);
  });

  // Change amountOfLightning each tick
  shader.onTick<IEarthShader>((ts: number, count: number, propertyBag?: IEarthShader) => {
    if (propertyBag) {
      propertyBag.amountOfLightning = 1.0; // You can adjust this based on your beat detection
    }
  });

  return shader;

};



const fn = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IFadeInTimedElementEffectProps,
  sequence?: Sequence,
  entity?: Canvas2DEntity<IFadeInTimedElementEffectProps>
) => {
  const { elements, alignment, margin, fadeInDuration, fadeOutDuration, defaultY } = propertybag;


  const sceneStartTime = entity!.getScene()?.startTimeinMs || 0;
  const currentTimeInSeconds = (ts - sceneStartTime - (entity!.startTimeinMs || 0)) / 1000;

  
  elements.forEach((element) => {
    const elementStartTime = element.fadeInStart;
    const elementEndTime = elementStartTime + element.duration;

    if (currentTimeInSeconds >= elementStartTime && currentTimeInSeconds <= elementEndTime) {
      let drawX: number;
      if (element.x !== undefined) {
        drawX = element.x;
        ctx.textAlign = "left"; // If x is provided, default to left alignment for that element
      } else {
        switch (alignment) {
          case TextAlignment.LEFT:
            drawX = margin || 0;
            ctx.textAlign = "left";
            break;
          case TextAlignment.RIGHT:
            drawX = ctx.canvas.width - (margin || 0);
            ctx.textAlign = "right";
            break;
          case TextAlignment.CENTER:
          default:
            drawX = ctx.canvas.width / 2;
            ctx.textAlign = "center";
            break;
        }
      }

      const drawY = element.y !== undefined ? element.y : (defaultY !== undefined ? defaultY : 0);

      let alpha = 0;
      const elapsedTimeInElement = currentTimeInSeconds - elementStartTime;

      if (elapsedTimeInElement < fadeInDuration) {
        alpha = elapsedTimeInElement / fadeInDuration; // Fade in
      } else if (elapsedTimeInElement > element.duration - fadeOutDuration) {
        alpha = (element.duration - elapsedTimeInElement) / fadeOutDuration; // Fade out
      } else {
        alpha = 1; // Fully visible
      }

      ctx.globalAlpha = alpha;


      const fontToUse = element.font || 'sans-serif';
      const sizeToUse = element.size || 16;
      ctx.font = `${sizeToUse}px ${fontToUse}`;
      ctx.fillStyle = "white";
      ctx.fillText(element.data, drawX, drawY);


      ctx.globalAlpha = 1;
    }
  });
};

// need an entiry thar draws and image on x.y with fade in and out effect







export const textEntity = new Canvas2DEntity<IFadeInTimedElementEffectProps>
  ("foo-bar", {
    elements: [
      {

        id: 1,
        data: "THE UNIVERSE IS A COSMIC DANCE",
        font: "Arial",
        size: 20,
        x:300,
        y:40,
        fadeInStart: 11, 
        duration: 4,    
      },
    ],
    fadeInDuration: 1,
    fadeOutDuration: 1,
    alignment: TextAlignment.LEFT,
    margin: 0,
  }, (ts: number, ctx: CanvasRenderingContext2D, props: IFadeInTimedElementEffectProps,
    sequence: any, entity: any): void =>
    fn(ts, ctx, props, sequence!, entity!),undefined,undefined,800,450);


