import { Scene } from "../scene";

export class SceneBuilder {
  private scenes: Scene[] = [];
  private totalDuration: number;
  private currentTime: number = 0;

  /**
   * Creates a new SceneBuilder to help construct scenes with automatic timing.
   * @param totalDuration - The total duration of the animation sequence in milliseconds.
   */
  constructor(totalDuration: number) {
    this.totalDuration = totalDuration;
  }

  /**
   * Adds a scene to the builder with a specified name and duration.
   * @param name - The name of the scene.
   * @param duration - The duration of the scene in milliseconds.
   * @returns The SceneBuilder instance for chaining.
   */
  addScene(name: string, duration: number): SceneBuilder {
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

    const scene = new Scene(name, startTime, duration);
    this.scenes.push(scene);
    return this; // For chaining
  }

  /**
   * Gets the array of scenes with their timing configured.
   * @returns The array of Scene objects.
   */
  getScenes(): Scene[] {
    return this.scenes;
  }

  /**
   * Gets the total duration of all scenes added to the builder.
   * @returns The total duration in milliseconds.
   */
  get totalScenesDuration(): number {
    return this.scenes.reduce((total, scene) => total + scene.durationInMs, 0);
  }


  /**
   * Adds a scene to the builder with a specified name and a duration that extends to the end of the total duration.
   * @param name - The name of the scene.
   * @returns The SceneBuilder instance for chaining.
   */
  durationUntilEndInMs(name: string): SceneBuilder {
    const startTime = this.currentTime;
    const duration = this.totalDuration - startTime;
    const scene = new Scene(name, startTime, duration);
    this.scenes.push(scene);
    return this;
  }
}