import { Scene } from './Scene';
import { Sequence } from './Sequence';

export interface IEntity {
  name: string;
  canvas: HTMLCanvasElement;
  scene?: Scene
  bindToScene(scene: Scene): void;
  update(timeStamp: number): void;
  copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence): void;
  transitionIn?: (ctx: CanvasRenderingContext2D, progress: number) => void;
  transitionOut?: (ctx: CanvasRenderingContext2D, progress: number) => void;
  startTimeinMs?: number; // Optional start time for the entity within the scene
  durationInMs?: number;  // Optional duration for the entity within the scene
  w?: number;
  h?: number;
  props?: any
  beatListeners?: ((time: number, count: number, propertyBag: any) => void)[];
  tickListeners?: ((time: number, count: number, propertyBag: any) => void)[];
  barListeners?: ((time: number, count: number, propertyBag: any) => void)[];

  onBeat(listener?: (time: number, count: number, propertyBag: any) => void): void;
  onTick(listener?: (time: number, count: number, propertyBag: any) => void): void;
  onBar(listener?: (time: number, count: number, propertyBag: any) => void): void;
}

export class Entity<T> implements IEntity {
  canvas: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  private postProcessors: ((ctx: CanvasRenderingContext2D, sequence: Sequence) => void)[] = [];

  scene?: Scene | undefined;

  beatListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
  tickListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];
  barListeners?: ((time: number, count: number, propertyBag: any) => void)[] = [];

  /**
   * Creates a new Entity.
   * @param name - The key or identifier for the entity.
   * @param w - The width of the entity's canvas.
   * @param h - The height of the entity's canvas.
   * @param props - The properties for the entity.
   * @param action - The action function that defines the entity's behavior.
   */
  constructor(
    public name: string,
    public props?: T,
    public action?: (time: number, ctx: CanvasRenderingContext2D, properties: T, sequence?: Sequence, entity?: IEntity) => void,
    public startTimeinMs?: number,
    public durationInMs?: number,
    public w?: number,
    public h?: number
  ) {

    this.canvas = document.createElement("canvas");
    if (w !== undefined && h !== undefined) {
      this.canvas.width = w;
      this.canvas.height = h;

    };
    this.ctx = this.canvas.getContext("2d")!;
  }
  bindToScene(scene: Scene): void {
    this.scene = scene;
  }
  transitionIn?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;
  transitionOut?: ((ctx: CanvasRenderingContext2D, progress: number) => void) | undefined;

  /**
  * Adds an event listener for when a beat occurs.
  * @param listener - The function to call when a beat occurs.
  * @returns The Entity instance for chaining.
  */
  onBeat<T>(listener: (time: number, count: number, propeetyBag: T) => void): this {
    this.beatListeners!.push(listener as any);
    return this;
  }

  /**
   * Adds an event listener for when a tick occurs.
   * @param listener - The function to call when a tick occurs.
   * @returns The Entity instance for chaining.
   */
  onTick<T>(listener: (time: number, count: number) => void): this {
    this.tickListeners!.push(listener as any);
    return this;
  }

  /**
   * Adds an event listener for when a bar is complete.
   * @param listener - The function to call when a bar is complete.
   * @returns The Entity instance for chaining.
   */
  onBar<T>(listener: (ts: number, count: number, props: T) => void): this {
    this.barListeners!.push(listener as any);
    return this;
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
      // Calculate the elapsed time for the entity
      const elapsed = sequence.currentTime - (this.startTimeinMs || 0);
      // Check if the entity should be rendered based on its lifetime
      if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
        targetCtx.drawImage(this.canvas, 0, 0);
        this.postProcessors.forEach(processor => processor(targetCtx, sequence));
      }
    }
  }

  /**
  * Updates the entity's state, clears the canvas, and calls the action function.
  * @param timeStamp - The current timestamp in the animation.
  */
  update(timeStamp: number): void {
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.action && this.ctx && this.props) {
      // Calculate elapsed time relative to the scene's start time    
      const sceneStartTime = this.getScene()!.startTimeinMs || 0;
      const elapsed = timeStamp - sceneStartTime - (this.startTimeinMs || 0);



      if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {
        this.action(timeStamp, this.ctx, this.props, this.getScene()?.sequence, this
        );
      }
    }
  }

  /**
 * Retrieves the Scene instance associated with the entity.
 * @returns The Sequence instance if available, otherwise null.
 */
  public getScene(): Scene | undefined {
    return this.scene;
  }
  /**
* Retrieves the Sequence instance associated with the entity.
* @returns The Sequence instance if available, otherwise null.
*/
  private getSequence(): Sequence | undefined {
    return this.scene?.sequence;
  }
}