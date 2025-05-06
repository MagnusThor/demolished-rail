import {
  Canvas2DEntity,
  IEntity,
  SequenceHelper,
} from '../../../src';
import {
  fadeElementEffect,
  IFadeElementEffectProps,
} from '../example/canvas2d/fadeElementEffect';
import { TextAlignment } from '../example/canvas2d/fadeInOutTextEffect';
import { AssetsManager } from './helpers/AssetsManager';
import { GLOBALS } from './runner';
import {
  IShowImageEffectProps,
  showImageEffect,
} from './showImageEffect';

export const IntroScene = (): IEntity[] => {
  const entities: IEntity[] = [];


  const folLogo = new Canvas2DEntity<IShowImageEffectProps>("logoFading", {
    x: (GLOBALS.width / 2) - 160,
    y: (GLOBALS.height  /2) - 160,
    image: AssetsManager.instance.images[0],
    scaleFactor: 1.0
  },showImageEffect,0,SequenceHelper.getDurationForBeats(122,2),800,450);
 
  
  folLogo.onBar<IShowImageEffectProps>((ts: number, count: number, propertybag?: IShowImageEffectProps) => {
    console.log("IntroScene (LogoFading)- Timestamp: ", ts,propertybag?.scaleFactor);
    // multiplay the scale factor by 0.5 on each bar
   // propertybag!.scaleFactor = 1.5 * (count % 2);
  
  });

  const fadinInOutTexts = new Canvas2DEntity<IFadeElementEffectProps>(
    "textEntity",
    {
      x: GLOBALS.width / 2,
      y: GLOBALS.height / 2,
      elements: [
        {
          "type": "text",
          "id": 0,
          "data": "WE ARE A COSMIC ACCIDENT, BUT A FORTUNATE ONE.",
          "font": "Arial",
          "size": 20
        },
        {
          "type": "text",
          "id": 1,
          "data": "SWALLOWED BY DARKNESS, CRUSHED BY GRAVITY.",
          "font": "Arial",
          "size": 20
        },
        {
          "type": "text",
          "id": 2,
          "data": "A RIP IN THE FABRIC OF SPACETIME.",
          "font": "Arial",
          "size": 20
        },
        {
          "type": "text",
          "id": 3,
          "data": "BEYOND THE EVENT HORIZON, THE UNKNOWN AWAITS",
          "font": "Arial",
          "size": 20
        },
        {
          "type": "text",
          "id": 4,
          "data": "THE SHADOW OF THE UNIVERSE, HOLDING IT ALL IN PLACE",
          "font": "Arial",
          "size": 20
        }
      ],
      element: 0,
      fadeInDuration: 1,
      fadeOutDuration: 1,
      duration: 3,
      alignment: TextAlignment.CENTER
    },
    (ts: number, ctx: CanvasRenderingContext2D, props: IFadeElementEffectProps,
      sequence: any, entity: any): void => fadeElementEffect(ts, ctx, props, sequence!, entity!),
      SequenceHelper.getDurationForBeats(122,20),undefined,800,450

  );


  fadinInOutTexts.onBar<IFadeElementEffectProps>((ts: number, count: number, propertybag?: IFadeElementEffectProps) => {
    
    if (propertybag && propertybag.elements) {
      propertybag.element = (count) % propertybag.elements.length;
      const scene = fadinInOutTexts.getScene()!;
      fadinInOutTexts.startTimeinMs = ts - scene.startTimeinMs;
    }
    console.log("IntroScene - Timestamp: ", ts);
  });

  entities.push(folLogo);
  entities.push(fadinInOutTexts);

  return entities;
};
