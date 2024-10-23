import { Sequence } from "./sequence";



export interface IEntity {
  update(timeStamp: number): void
  key: string
  copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence): void
  transitionIn?: (ctx: CanvasRenderingContext2D, progress: number) => void;
  transitionOut?: (ctx: CanvasRenderingContext2D, progress: number) => void;

}

export class Entity<T> implements IEntity {
  canvas: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;

  private postProcessors: ((ctx: CanvasRenderingContext2D, sequence: Sequence) => void)[] = [];


  constructor(public key: string, w: number, h: number, public props?: T,
    public action?: (time: number, ctx: CanvasRenderingContext2D, properties: T, sequence?: Sequence) => void) {

    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext("2d");
  }


  addPostProcessor(processor: (ctx: CanvasRenderingContext2D, sequence: Sequence) => void) {
    this.postProcessors.push(processor);
  }

  copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence) {
    const targetCtx = targetCanvas.getContext("2d");
    if (targetCtx) {
      targetCtx.drawImage(this.canvas, 0, 0);
      this.postProcessors.forEach(processor => processor(targetCtx, sequence)); 
    }
  }


  update(timeStamp: number): void {
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.action && this.ctx && this.props)
      this.action(timeStamp, this.ctx, this.props);
  }
}


