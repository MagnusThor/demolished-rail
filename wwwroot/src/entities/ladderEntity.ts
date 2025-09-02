
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../interface/IBoundingBox";
import { ICollisionDetector } from "../interface/ICollisionDetector";
import { IGameEntity, IGameEntityBase } from "../interface/IGameEntity";
import { IPositioned } from "../interface/IPositioned";
import { IGameTexture } from "../interface/ITexture";
import { GameEntity } from "./GameEntity";
import { StateHelper } from "./StateHelper";


export interface ILadderProps extends IGameEntityBase{
    width:number,
    height:number
    positioned: IPositioned
    texture?: IGameTexture
    
}


export class LadderEntity extends GameEntity<ILadderProps> implements IGameEntity<ILadderProps> 
{
    collisionDetectors?: ICollisionDetector[] | undefined;
    stateHelper: StateHelper<ILadderProps>;

    constructor(props:ILadderProps){
        super("ladder",props);
        this.stateHelper = new StateHelper(props);

    }
   
    
   onInit?: (self: IGameEntity<ILadderProps>) => void = (self) => {
        // Initialization logic for the ladder, if needed.
        this.collisionDetectors  = [
                {
                    targetName:"player",
                    detectorFn: (a,b) =>  {
                        return false;
                    },
                    onCollision(a, collisionData, targetEntity) {
                        
                    },
                    
                }
        ]
    };

    onUpdate?: (self: IGameEntity<ILadderProps>, timeStamp: number) => void = (self, timeStamp) => {
        
    };

    onDraw?: (self: IGameEntity<ILadderProps>, helper: CanvasHelper) => void = (self, helper) => {
        const props = self.props;
        const ctx = helper.ctx;
        
        // Assume a texture for the ladder exists, loaded into `self.props.textures`.
        const ladderTexture = this.props.texture;
        
        if (ladderTexture) {
            ctx.drawImage(
                ladderTexture.texture.src,
                ladderTexture.x,
                ladderTexture.y,
                ladderTexture.width,
                ladderTexture.height,
                props.positioned.x,
                props.positioned.y-16,
                props.width,
                props.height
            );
        } else {
            // Fallback: draw a simple rectangle if no texture is found.
            ctx.fillStyle = '#2e6612ff'; // Sienna color for a wooden ladder
            ctx.fillRect(props.positioned.x, props.positioned.y, props.width, props.height);
        }
    };

    /**
     * Defines the ladder's collision box.
     */
    getBoundingBox = (self: IGameEntity<ILadderProps>): IBoundingBox => {
        return {
            x: self.props.positioned.x,
            y: self.props.positioned.y,
            width: self.props.width,
            height: self.props.height,
        };
    };

    
}
