import { Entity, IEntity } from "./entity";
import { ShaderEntity } from "./shaderEntity";




export class Scene {
  public entities: IEntity[] = [];

  constructor(public name: string, public startTimeinMs: number, public durationInMs: number) {}

  addEntity<T>(entity: Entity<T> | ShaderEntity): void {
    this.entities.push(entity);
  }

  getEntity<T>(key: string): IEntity | undefined {
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
            const remainingTime = this.durationInMs - adjustedSceneElapsedTime; // Calculate remaining time
      
            entity.update(adjustedSceneElapsedTime);
          });
        }
  
        if (sceneElapsedTime < this.durationInMs + this.startTimeinMs) {
        //  requestAnimationFrame(animate); // Keep this animation loop
        } else {
          resolve(true);
        }
      };
  
      animate();
     // requestAnimationFrame(animate);
    });
  }

}