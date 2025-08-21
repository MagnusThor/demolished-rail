import { IDynamicProps, IGameEntityProp } from "../interface/IGameEntity";



export interface IBulletProps extends IDynamicProps {
    x: number;
    y: number;
    width: number;
    height: number;
    velX: number;
    velY: number;
    isAlive: boolean;
    lifeTime: number; // Time in frames before the bullet disappears
    startPoint: { x: number; y: number }; // The point where the bullet was created

}
