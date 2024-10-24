import { IEntity } from "../entity";

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