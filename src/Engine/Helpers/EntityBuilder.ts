import { IEntity } from '../Entity';
import { GLSLShaderEntity } from '../GLSLShaderEntity';
import { WGSLShaderEntity } from '../WGSLShaderEntity';

export class EntityBuilder {
  private entities: IEntity[] = [];
  private currentTime: number = 0;
  private graph?: Record<string, IEntity>; // To store entities by name

  /**
   * Adds an entity to the builder with a specified start time and duration.
   * @param entity - The entity to add.
   * @param startTime - The start time of the entity within the scene (in milliseconds).
   * @param duration - The duration of the entity within the scene (in milliseconds).
   * @returns The EntityBuilder instance for chaining.
   */
  addEntity(entity: IEntity, startTime?: number, duration?: number): EntityBuilder {
    entity.startTimeinMs = startTime !== undefined ? startTime + this.currentTime : undefined;
    entity.durationInMs = duration;
    this.currentTime += duration || 0; // Increment currentTime only if duration is provided
    this.entities.push(entity);
    return this;
  }

  /**
   * Sets the graph object to be used for adding entities by name.
   * @param graph - An object containing entities accessible by name.
   * @returns The EntityBuilder instance for chaining.
   */
  setGraph(graph: Record<string, IEntity>): EntityBuilder {
    this.graph = graph;
    return this;
  }

  /**
   * Adds an entity from the graph by its name.
   * @param entityName - The name of the entity in the graph.
   * @param startTime - The start time of the entity within the scene (in milliseconds).
   * @param duration - The duration of the entity within the scene (in milliseconds).
   * @returns The EntityBuilder instance for chaining.
   */
  addEntityByName(entityName: string, startTime?: number, duration?: number): EntityBuilder {
    if (!this.graph) {
      throw new Error("Cannot add entity by name: graph is not set.");
    }
    const entity = this.graph[entityName];
    if (!entity) {
      throw new Error(`Entity with name "${entityName}" not found in the graph.`);
    }
    return this.addEntity(entity, startTime, duration);
  }

  /**
   * Gets the array of entities with their timing configured.
   * @returns The array of IEntity objects.
   */
  getEntities(): IEntity[] {
    return this.entities;
  }
}


export class EntityRenderer {
  public entities: IEntity[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  /**
   * Creates a new EntityRenderer to render entities without a Sequence.
   * @param canvas - The canvas element to render to.
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }
  /**
   * Adds an entity to the renderer.
   * @param entity - The entity to add.
   */
  addEntity(entity: IEntity | GLSLShaderEntity | WGSLShaderEntity) {
    this.entities.push(entity);
    entity.canvas.width = this.canvas.width;
    entity.canvas.height = this.canvas.height;
  }

  /**
   * Starts the rendering loop.
   */
  start() {
    const animate = (ts: number) => {
      this.render(ts);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  /**
   * Renders the entities on the canvas.
   * @param timeStamp - The current timestamp in the animation.
   */
  private render(timeStamp: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
    this.entities.forEach(entity => {
      entity.update(timeStamp);
      this.copyToCanvas(entity.canvas);
    });
  }
  copyToCanvas(result: HTMLCanvasElement) {   
      this.ctx.drawImage(result, 0, 0);

  }

}