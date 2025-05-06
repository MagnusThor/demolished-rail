import {
  Canvas2DEntity,
  IEntity,
} from '../../../src';
import { GLOBALS } from './runner';

export const EndScene = ():IEntity[] => {
   
      const entities: IEntity[] = [];

      const whitebackground = new Canvas2DEntity<any>(
         "whitebackground",
         {},
         // Update function to draw a white background
         (ts:number, ctx:CanvasRenderingContext2D): void => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, GLOBALS.width, GLOBALS.height);
         }
      );
   
      entities.push(whitebackground);
      return entities;
   }  