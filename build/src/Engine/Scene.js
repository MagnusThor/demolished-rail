"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
class Scene {
    constructor(name, startTimeinMs, durationInMs) {
        this.name = name;
        this.startTimeinMs = startTimeinMs;
        this.durationInMs = durationInMs;
        this.entities = [];
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    getEntity(key) {
        return this.entities.find(pre => pre.key === key);
    }
    play(elapsedTime) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const animate = () => {
                const currentTime = performance.now();
                const sceneElapsedTime = currentTime - startTime + elapsedTime;
                const adjustedSceneElapsedTime = sceneElapsedTime - this.startTimeinMs;
                if (adjustedSceneElapsedTime >= 0) {
                    this.entities.forEach((entity) => {
                        const remainingTime = this.durationInMs - adjustedSceneElapsedTime; // Calculate remaining time
                        entity.update(adjustedSceneElapsedTime);
                    });
                }
                if (sceneElapsedTime < this.durationInMs + this.startTimeinMs) {
                    //  requestAnimationFrame(animate); // Keep this animation loop
                }
                else {
                    resolve(true);
                }
            };
            animate();
            // requestAnimationFrame(animate);
        });
    }
}
exports.Scene = Scene;
