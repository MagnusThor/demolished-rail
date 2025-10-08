import { GameState } from "../global/GameState";

export interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IBoundingCircle {
  x: number;
  y: number;
  radius: number;
}


export class BoundingBox implements IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(values: { x: number, y: number, width: number, height: number }) {
    this.x = values.x;
    this.y = values.y;
    this.width = values.width;
    this.height = values.height;
  }
  worldToViewport(vp?:{x:number,y:number}) {
    

    const viewport = vp ||   GameState.getInstance().viewport
    

    return {
      x: this.x - viewport.x,
      y: this.y - viewport.y,
      width: this.width,
      height: this.height
    };
  }
}

export const worldToViewport = (bbox: IBoundingBox): IBoundingBox => {
  const viewport = GameState.getInstance().viewport;
  return {
    x: bbox.x - viewport.x,
    y: bbox.y - viewport.y,
    width: bbox.width,
    height: bbox.height
  };
}




