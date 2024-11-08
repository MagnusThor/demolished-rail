"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const Entity_1 = require("./Entity");
class Scene {
    /**
     * Creates a new Scene.
     * @param name - The name or identifier for the scene.
     * @param startTimeinMs - The start time of the scene in milliseconds.
     * @param durationInMs - The duration of the scene in milliseconds.
     */
    constructor(name, startTimeinMs, durationInMs, width, height) {
        this.name = name;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.width = width;
        this.height = height;
        this.entities = [];
        this.transitionOutListeners = [];
        this.transitionInListeners = [];
    }
    /**
     * Adds an entity to the scene.
     * @param entity - The entity to add.
     */
    addEntity(entity) {
        // If the entity's canvas dimensions are not set, use the scene's dimensions
        if (!entity.w && !entity.h) {
            entity.canvas.width = this.width || 800;
            entity.canvas.height = this.height || 450;
        }
        entity.bindToScene(this);
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
        return this.entities.find(entity => entity.name === key);
    }
    addPostProcessorToEntities(processor) {
        this.entities.forEach(entity => {
            if (entity instanceof Entity_1.Entity) { // Check if the entity is an instance of the Entity class
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
    transitionIn(sequence, startTime, duration, listener) {
        this.transitionInListeners.push(listener);
        sequence.addSceneTransitionIn(this, startTime, duration, (ctx, scene, progress) => {
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
    transitionOut(sequence, startTime, duration, listener) {
        this.transitionOutListeners.push(listener);
        sequence.addSceneTransitionOut(this, startTime, duration, (ctx, scene, progress) => {
            this.transitionOutListeners.forEach(listener => listener(ctx, scene, progress));
        });
    }
}
exports.Scene = Scene;
