"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const Entity_1 = require("./Entity");
class Scene {
    /**
    * Adds a WGSL post-processing effect to the scene.
    * @param sequence - The Sequence instance.
    * @param device - GPUDevice
    * @param wgslEntity - The WGSLShaderEntity to use for post-processing.
    */
    addWgslPostProcessor(sequence, device, wgslEntity) {
        wgslEntity.bindToScene(this);
        sequence.addWgslPostProcessor(this, device, (ctx, scene, device) => {
            const targetTexture = device.createTexture({
                size: { width: ctx.canvas.width, height: ctx.canvas.height },
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
                    | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
            });
            // Copy the canvas contents to the texture
            device.queue.copyExternalImageToTexture(// Access device and queue from sequence
            { source: ctx.canvas }, { texture: targetTexture }, { width: ctx.canvas.width, height: ctx.canvas.height });
            // Find the texture in the shader renderer and update its data
            const textureData = wgslEntity.shaderRenderer.textures.find(texture => texture.key === wgslEntity.props.textureKey);
            if (textureData) {
                textureData.data = targetTexture;
            }
            else {
                console.warn(`Texture with key "${wgslEntity.props.textureKey}" not found in the shader renderer.`);
            }
            wgslEntity.shaderRenderer.update(sequence.currentTime / 1000);
            wgslEntity.copyToCanvas(ctx.canvas, this.sequence);
            return;
        });
    }
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
     * @returns The Scene instance for chaining.
     */
    addEntity(entity) {
        // If the entity's canvas dimensions are not set, use the scene's dimensions
        if (!entity.w && !entity.h) {
            entity.canvas.width = this.width || 800;
            entity.canvas.height = this.height || 450;
        }
        entity.bindToScene(this);
        this.entities.push(entity);
        return this;
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
