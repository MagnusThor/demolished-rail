// entities/playerBlock.ts
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { playerCollisionDetectors } from "./collisiondetectors/playerCollitionDetectors";
import { playerUpdate } from "./playerUpdate";
import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { GameEntity } from "../GameEntity";


export class PlayerEntity extends GameEntity<IPlayerProps> implements IGameEntity<IPlayerProps> {   
        constructor(props:IPlayerProps)     {   
            super("playerBlock", props);
            this.collisionDetectors =playerCollisionDetectors;
            this.props.currentAnimation = this.props.animations["idle"];     
         }
        getBoundingBox = (self:IGameEntity<IPlayerProps>): IBoundingBox => {  
            return self.props.positioned.getBoundingBox!();
        }
        onInit = (self: IGameEntity<IPlayerProps>) => {
                self.props.isInitialized = true;
        }
        onUpdate? = (self: IGameEntity<IPlayerProps>, timeStamp: number) => {
                 playerUpdate(self, timeStamp)
        }
        onDraw = (self: IGameEntity<IPlayerProps>, helper: CanvasHelper) => {            
             const props = self.props              
             helper.drawAnimatedSprite(
                    props.currentAnimation!,
                    props.positioned.x,
                    props.positioned.y,
                    performance.now()
            );
        }
} 

