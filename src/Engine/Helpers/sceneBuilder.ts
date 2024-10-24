import { Scene } from "../scene";

export class SceneBuilder {
    private scenes: Scene[] = [];
    private totalDuration: number;
    private currentTime: number = 0;
  
    constructor(totalDuration: number) {
      this.totalDuration = totalDuration;
    }
  
    addScene(name: string, duration: number): SceneBuilder {
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
      const scene = new Scene(name, startTime, duration);
      this.scenes.push(scene);
      return this; 
    }
    getScenes(): Scene[] {
      return this.scenes;
    }
  }