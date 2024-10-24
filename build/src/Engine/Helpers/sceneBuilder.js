"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneBuilder = void 0;
const scene_1 = require("../scene");
class SceneBuilder {
    constructor(totalDuration) {
        this.scenes = [];
        this.currentTime = 0;
        this.totalDuration = totalDuration;
    }
    addScene(name, duration) {
        const startTime = this.currentTime;
        this.currentTime += duration;
        // Adjust duration of the last scene to fit totalDuration
        if (this.currentTime > this.totalDuration) {
            const lastScene = this.scenes[this.scenes.length - 1];
            if (lastScene) {
                lastScene.durationInMs = this.totalDuration - lastScene.startTimeinMs;
            }
            duration = this.totalDuration - startTime;
        }
        const scene = new scene_1.Scene(name, startTime, duration);
        this.scenes.push(scene);
        return this;
    }
    getScenes() {
        return this.scenes;
    }
}
exports.SceneBuilder = SceneBuilder;
