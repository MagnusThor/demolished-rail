import { IEntity } from "./entity";
import { ShaderEntity } from "./shaderEntity";

export class Scene {
  public entities: IEntity[] = [];

  /**
   * Creates a new Scene.
   * @param name - The name or identifier for the scene.
   * @param startTimeinMs - The start time of the scene in milliseconds.
   * @param durationInMs - The duration of the scene in milliseconds.
   */
  constructor(public name: string, public startTimeinMs: number, public durationInMs: number) { }

  /**
   * Adds an entity to the scene.
   * @param entity - The entity to add.
   */
  addEntity(entity: IEntity | ShaderEntity): void {
    this.entities.push(entity);
  }

  /**
   * Adds multiple entities to the scene.
   * @param entities - An array of entities to add.
   * @returns The Scene instance for chaining.
   */
  addEntities(...entities: Array<IEntity>): Scene {
    entities.forEach(entity => this.addEntity(entity));
    return this;
  }

  /**
   * Gets an entity from the scene by its key.
   * @param key - The key of the entity to retrieve.
   * @returns The entity if found, otherwise undefined.
   */
  getEntity<T>(key: string): IEntity | undefined {
    return this.entities.find(entity => entity.key === key);
  }

  /**
   * Plays the scene by animating its entities.
   * @param elapsedTime - The elapsed time in the animation sequence.
   * @returns A promise that resolves when the scene has finished playing.
   */
  play(elapsedTime: number): Promise<boolean> {
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
        } else {
          resolve(true);
        }
      };

      animate(); // Call animate once to start the initial rendering
    });
  }
}