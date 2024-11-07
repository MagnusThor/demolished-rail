import {
  Entity,
  IEntity,
} from './Entity';
import { GLSLShaderEntity } from './GLSLShaderEntity';
import { Sequence } from './Sequence';
import { WGSLShaderEntity } from './WGSLShaderEntity';

export class Scene {
  public entities: IEntity[] = [];

  private transitionOutListeners: ((ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void)[] = [];
  private transitionInListeners: ((ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void)[] = [];


  public sequence: Sequence | undefined;

  /**
   * Creates a new Scene.
   * @param name - The name or identifier for the scene.
   * @param startTimeinMs - The start time of the scene in milliseconds.
   * @param durationInMs - The duration of the scene in milliseconds.
   */
  constructor(public name: string, public startTimeinMs: number, public durationInMs: number,
    public width?: number,
    public height?: number
  ) { }

  /**
   * Adds an entity to the scene.
   * @param entity - The entity to add.
   */
  addEntity(entity: IEntity | GLSLShaderEntity | WGSLShaderEntity): void {
    // If the entity's canvas dimensions are not set, use the scene's dimensions
    if (!entity.w && !entity.h) {
      entity.canvas.width = this.width || 800;
      entity.canvas.height = this.height || 450;
    }
    entity.bindToScene(this)
    this.entities.push(entity);
  }

  /**
   * Adds multiple entities to the scene.
   * @param entities - An array of entities to add.
   * @returns The Scene instance for chaining.
   */
  addEntities(...entities: Array<IEntity>): Scene {
    entities.forEach(entity => this.addEntity(entity));
    return this;
  }

  /**
   * Gets an entity from the scene by its key.
   * @param key - The key of the entity to retrieve.
   * @returns The entity if found, otherwise undefined.
   */
  getEntity<T>(key: string): IEntity | undefined {
    return this.entities.find(entity => entity.name === key);
  }

  public addPostProcessorToEntities(processor: (ctx: CanvasRenderingContext2D) => void): void {
    this.entities.forEach(entity => {
      if (entity instanceof Entity) { // Check if the entity is an instance of the Entity class
        entity.addPostProcessor(processor);
      }
    });
  }


  /**
    * Adds a transition-in effect to the scene.
    * @param sequence - The Sequence instance associated with the scene.
    * @param startTime - The time (in milliseconds) within the scene when the transition should start.
    * @param duration - The duration of the transition in milliseconds.
    * @param listener - The transition function to apply.
    */
  transitionIn(sequence: Sequence, startTime: number, duration: number, listener: (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void) {
    this.transitionInListeners.push(listener);

    sequence.addSceneTransitionIn(this, startTime, duration, (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
      this.transitionInListeners.forEach(listener => listener(ctx, scene, progress));
    });
  }

   /**
   * Adds a transition-out effect to the scene.
   * @param sequence - The Sequence instance associated with the scene.
   * @param startTime - The time (in milliseconds) within the scene when the transition should start.
   * @param duration - The duration of the transition in milliseconds.
   * @param listener - The transition function to apply.
   */
   transitionOut(sequence: Sequence, startTime: number, duration: number, listener: (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => void) {
    this.transitionOutListeners.push(listener);

    sequence.addSceneTransitionOut(this, startTime, duration, (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
      this.transitionOutListeners.forEach(listener => listener(ctx, scene, progress));
    });
  }

  
}