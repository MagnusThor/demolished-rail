import { Entity } from "./Entity";

export class Scene {
  private entities: Entity[] = [];

  constructor(public name: string, public startTimeinMs: number, public durationInMs: number) {}

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  getEntity(key: string): Entity | undefined {
    return this.entities.find ( pre => pre.key === key);
  }

  play(elapsedTime: number): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = performance.now();
  
      const animate = () => {
        const currentTime = performance.now();
        const sceneElapsedTime = currentTime - startTime + elapsedTime;
        const adjustedSceneElapsedTime = sceneElapsedTime - this.startTimeinMs;
  
        if (adjustedSceneElapsedTime >= 0) {
          this.entities.forEach((entity) => {
            entity.draw(adjustedSceneElapsedTime);
          });
        }
  
        if (sceneElapsedTime < this.durationInMs + this.startTimeinMs) {
          requestAnimationFrame(animate); // Keep this animation loop
        } else {
          resolve(true);
        }
      };
  
      requestAnimationFrame(animate);
    });
  }

}