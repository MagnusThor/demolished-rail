import { Entity, IEntity } from "../../../src/Engine/entity";
import { Sequence } from "../../../src/Engine/sequence";
import { ITextFadeInOut, textFadeInOut } from "../effects/FoL/fadeInOutTextEffect";

/**
 * Creates a new text fade-in/out entity.
 * @param key - The key of the entity.
 * @param width - The width of the canvas.
 * @param height - The height of the canvas.
 * @param props - The properties for the text effect.
 * @returns A new Entity with the text fade-in/out effect.
 */
export const createTextFadeInOutEntity= (key: string, width: number, height: number, props: ITextFadeInOut): IEntity => {
    return new Entity<ITextFadeInOut>(
      key,
      props,
      (ts:number, ctx:CanvasRenderingContext2D, props:ITextFadeInOut, sequence:Sequence | undefined) => textFadeInOut(ts, ctx, props, sequence!),
      undefined, // startTimeinMs (optional)
      undefined, // durationInMs (optional)
      width,
      height
    );
  };