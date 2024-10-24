import { Sequence } from "./sequence";

export interface IEntity {
  key: string;
  update(timeStamp: number): void;
  copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence): void;
  transitionIn?: (ctx: CanvasRenderingContext2D, progress: number) => void;
  transitionOut?: (ctx: CanvasRenderingContext2D, progress: number) => void;
}

export class Entity<T> implements IEntity {
  canvas: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  private postProcessors: ((ctx: CanvasRenderingContext2D, sequence: Sequence) => void)[] = [];

  /**
   * Creates a new Entity.
   * @param key - The key or identifier for the entity.
   * @param w - The width of the entity's canvas.
   * @param h - The height of the entity's canvas.
   * @param props - The properties for the entity.
   * @param action - The action function that defines the entity's behavior.
   */
  constructor(
    public key: string,
    w: number,
    h: number,
    public props?: T,
    public action?: (time: number, ctx: CanvasRenderingContext2D, properties: T, sequence?: Sequence) => void
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Adds a post-processing function to the entity.
   * @param processor - The post-processing function to add.
   */
  addPostProcessor(processor: (ctx: CanvasRenderingContext2D, sequence: Sequence) => void) {
    this.postProcessors.push(processor);
  }

  /**
   * Copies the entity's canvas to the target canvas and applies post-processors.
   * @param targetCanvas - The target canvas to copy to.
   * @param sequence - The Sequence instance.
   */
  copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence) {
    const targetCtx = targetCanvas.getContext("2d");
    if (targetCtx) {
      targetCtx.drawImage(this.canvas, 0, 0);
      this.postProcessors.forEach(processor => processor(targetCtx, sequence));
    }
  }

  /**
   * Updates the entity's state, clears the canvas, and calls the action function.
   * @param timeStamp - The current timestamp in the animation.
   */
  update(timeStamp: number): void {
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.action && this.ctx && this.props) {
      this.action(timeStamp, this.ctx, this.props);
    }
  }
}