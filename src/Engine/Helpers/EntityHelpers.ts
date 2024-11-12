import { Scene } from '../Scene';

/**
 * Applies an easing function to a value.
 * @param t - The current time or progress (between 0 and 1).
 * @param easingFunction - The easing function to apply.
 * @returns The eased value.
 */
export const ease = (t: number, easingFunction: (t: number) => number): number => {
    return easingFunction(t);
  };
  
  /**
   * Creates an ease-in transition function.
   * @param easingFunction - The easing function to use for the ease-in effect.
   * @returns A transition function that can be used with Entity.transitionIn().
   */
  export const createEaseInTransition = (easingFunction: (t: number) => number): (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void => {
    return (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
      ctx.globalAlpha = ease(progress, easingFunction);
    };
  };
  
  /**
   * Creates an ease-out transition function.
   * @param easingFunction - The easing function to use for the ease-out effect.
   * @returns A transition function that can be used with Entity.transitionOut().
   */
  export const createEaseOutTransition = (easingFunction: (t: number) => number): (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void => {
    return (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
      ctx.globalAlpha = 1 - ease(progress, easingFunction);
    };
  };
  
  // --- Easing Functions ---  
  export const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };
  
  export const easeOutBounce = (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
  
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };