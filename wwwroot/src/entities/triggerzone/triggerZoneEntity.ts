import { GameEntity } from "../GameEntity";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { gameState } from "../../state/gameState";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";


/**
 * Interface for the properties of a TriggerZone.
 *
 * @prop {() => void} onTrigger - The function to call when the zone is entered.
 * @prop {boolean} isOneShot - If true, the trigger will only fire once.
 */
export interface ITriggerZoneProps extends IGameEntityBase {
    onTrigger: (self:IGameEntity<ITriggerZoneProps>) => void;
}

/**
 * An invisible, non-solid entity that detects when another entity (e.g., the player)
 * enters its bounds and executes a callback function.
 */
export class TriggerZoneEntity extends GameEntity<ITriggerZoneProps> 
    implements IGameEntity<ITriggerZoneProps> {

    constructor(props: ITriggerZoneProps) {
        super("triggerZone", props);
    }

    getBoundingBox? = (self: IGameEntity<ITriggerZoneProps>) =>  {
        return self.props.positioned.getBoundingBox!();
    };
    

    onInit? = (self: IGameEntity<ITriggerZoneProps>) => {
        const stateHelper = self.stateHelper;
        stateHelper.set<number>("numOfHits",0)
    }
    
    // The main logic runs in the update loop to check for collisions.
    onUpdate? = (self: IGameEntity<ITriggerZoneProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;
        // Check if the trigger is a one-shot and has already been triggered.
        if (stateHelper.get<number>("numOfHits") && self.props.isInitialized) {
            return;
        }

        const player = gameState.player;
        if (player) {
            // Check for collision between the trigger zone and the player.
            if (
            ExtendedCollisionHelper.AABBColliding(
                self.props.positioned, player.props.positioned)) 
                
                // If the player is colliding, call the onTrigger function.
                self.props.onTrigger(self);
                stateHelper.set<number>("numOfHits", (stateHelper.get<number>("numOfHits") || 0) + 1);
                // If it's a one-shot trigger, set isInitialized to true so it doesn't fire again.
               
            }
        }
    

    // Trigger zones are invisible, so they have no draw method.
    onDraw? = (self: IGameEntity<ITriggerZoneProps>, helper: any) => {
      
        
        const ctx = helper.ctx;
        const props = self.props;
        const bbox: IBoundingBox = props.positioned.getBoundingBox!();
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        ctx.restore();
        
    };

}
