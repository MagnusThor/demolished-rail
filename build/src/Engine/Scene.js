"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const entity_1 = require("./entity");
class Scene {
    /**
     * Creates a new Scene.
     * @param name - The name or identifier for the scene.
     * @param startTimeinMs - The start time of the scene in milliseconds.
     * @param durationInMs - The duration of the scene in milliseconds.
     */
    constructor(name, startTimeinMs, durationInMs) {
        this.name = name;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.entities = [];
    }
    /**
     * Adds an entity to the scene.
     * @param entity - The entity to add.
     */
    addEntity(entity) {
        this.entities.push(entity);
    }
    /**
     * Adds multiple entities to the scene.
     * @param entities - An array of entities to add.
     * @returns The Scene instance for chaining.
     */
    addEntities(...entities) {
        entities.forEach(entity => this.addEntity(entity));
        return this;
    }
    /**
     * Gets an entity from the scene by its key.
     * @param key - The key of the entity to retrieve.
     * @returns The entity if found, otherwise undefined.
     */
    getEntity(key) {
        return this.entities.find(entity => entity.key === key);
    }
    /**
     * Plays the scene by animating its entities.
     * @param elapsedTime - The elapsed time in the animation sequence.
     * @returns A promise that resolves when the scene has finished playing.
     */
    play(elapsedTime) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const animate = () => {
                const currentTime = performance.now();
                const sceneElapsedTime = currentTime - startTime + elapsedTime;
                const adjustedSceneElapsedTime = sceneElapsedTime - this.startTimeinMs;
                if (adjustedSceneElapsedTime >= 0) {
                    this.entities.forEach((entity) => {
                        entity.update(adjustedSceneElapsedTime);
                    });
                }
                if (sceneElapsedTime < this.durationInMs + this.startTimeinMs) {
                    // The requestAnimationFrame call was removed here. 
                    // The animation loop is now handled in the Sequence class.
                }
                else {
                    resolve(true);
                }
            };
            animate(); // Call animate once to start the initial rendering
        });
    }
    addPostProcessorToEntities(processor) {
        this.entities.forEach(entity => {
            if (entity instanceof entity_1.Entity) { // Check if the entity is an instance of the Entity class
                entity.addPostProcessor(processor);
            }
        });
    }
}
exports.Scene = Scene;
