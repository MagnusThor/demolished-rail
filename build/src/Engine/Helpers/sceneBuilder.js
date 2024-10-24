"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneBuilder = void 0;
const scene_1 = require("../scene");
class SceneBuilder {
    /**
     * Creates a new SceneBuilder to help construct scenes with automatic timing.
     * @param totalDuration - The total duration of the animation sequence in milliseconds.
     */
    constructor(totalDuration) {
        this.scenes = [];
        this.currentTime = 0;
        this.totalDuration = totalDuration;
    }
    /**
     * Adds a scene to the builder with a specified name and duration.
     * @param name - The name of the scene.
     * @param duration - The duration of the scene in milliseconds.
     * @returns The SceneBuilder instance for chaining.
     */
    addScene(name, duration) {
        const startTime = this.currentTime;
        this.currentTime += duration;
        // If the current time exceeds the total duration, adjust the last scene's duration
        if (this.currentTime > this.totalDuration) {
            const lastScene = this.scenes[this.scenes.length - 1];
            if (lastScene) {
                lastScene.durationInMs = this.totalDuration - lastScene.startTimeinMs;
            }
            duration = this.totalDuration - startTime; // Adjust the current scene's duration as well
        }
        const scene = new scene_1.Scene(name, startTime, duration);
        this.scenes.push(scene);
        return this; // For chaining
    }
    /**
     * Gets the array of scenes with their timing configured.
     * @returns The array of Scene objects.
     */
    getScenes() {
        return this.scenes;
    }
    /**
     * Adds a scene to the builder with a specified name and a duration that extends to the end of the total duration.
     * @param name - The name of the scene.
     * @returns The SceneBuilder instance for chaining.
     */
    durationUntilEndInMs(name) {
        const startTime = this.currentTime;
        const duration = this.totalDuration - startTime;
        const scene = new scene_1.Scene(name, startTime, duration);
        this.scenes.push(scene);
        return this;
    }
}
exports.SceneBuilder = SceneBuilder;
