"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityBuilder = void 0;
class EntityBuilder {
    constructor() {
        this.entities = [];
        this.currentTime = 0;
    }
    /**
     * Adds an entity to the builder with a specified start time and duration.
     * @param entity - The entity to add.
     * @param startTime - The start time of the entity within the scene (in milliseconds).
     * @param duration - The duration of the entity within the scene (in milliseconds).
     * @returns The EntityBuilder instance for chaining.
     */
    addEntity(entity, startTime, duration) {
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
    setGraph(graph) {
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
    addEntityByName(entityName, startTime, duration) {
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
    getEntities() {
        return this.entities;
    }
}
exports.EntityBuilder = EntityBuilder;
