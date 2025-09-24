import { GameEntity } from "../GameEntity";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { gameState } from "../../state/gameState";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { OverlayTextEntity, IOverlayTextProps, TextOverlayState } from "../overlaytext/OverlayTextEntity";
import { messageLibrary } from "../overlaytext/messageLibrary";
import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";



/**
 * Interface for the properties of a TriggerZone.
 *
 * @prop {() => void} onTrigger - The function to call when the zone is entered.
 * @prop {boolean} isOneShot - If true, the trigger will only fire once.
 */
export interface ITriggerZoneProps extends IGameEntityBase {
    onTrigger: (self:TriggerZoneEntity) => void;
    onLeave?: (self:any) => void;
    isOneShot?: boolean;
}
export class TriggerZoneEntity extends GameEntity<ITriggerZoneProps> implements IGameEntity<ITriggerZoneProps> {

    constructor(props: ITriggerZoneProps) {
        super("triggerZone", props);
    }

    getBoundingBox? = (self: IGameEntity<ITriggerZoneProps>) => {
        return self.props.positioned.getBoundingBox!();
    };

    onInit? = (self: IGameEntity<ITriggerZoneProps>) => {
        const stateHelper = self.stateHelper;
        stateHelper.set<number>("numOfHits", 0);
    };

    /**
     * The main logic now checks for a collision and executes the `action` function
     * defined in the tile settings, if one exists.
     */
    onUpdate? = (self: IGameEntity<ITriggerZoneProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;
        const player = gameState.player;
        if (!player) return;

        const isCurrentlyColliding = ExtendedCollisionHelper.AABBColliding(
            self.props.positioned, player.props.positioned
        );

        // Don't trigger if it's a one-shot and has already been hit.
        if (self.props.isOneShot && stateHelper.get<number>("numOfHits") > 0) {
            return;
        }

        if (isCurrentlyColliding && !stateHelper.get<boolean>("isTriggered")) {
            // Player has entered the zone, trigger the onTrigger logic
            self.props.onTrigger?.(self as TriggerZoneEntity);
            stateHelper.set<boolean>("isTriggered", true);
            stateHelper.set<number>("numOfHits", (stateHelper.get<number>("numOfHits") || 0) + 1);

            // Here is where we execute the generic action from the tile settings.
            const action = self.props.settings!.activate;
            if (action) {
                action(self as TriggerZoneEntity, player);
            }
        } else if (!isCurrentlyColliding && stateHelper.get<boolean>("isTriggered")) {
            // Player has left the zone, trigger onLeave logic
            if (self.props.onLeave) {
                self.props.onLeave(self);
            }
            stateHelper.set<boolean>("isTriggered", false);
        }
    };

    onDraw? = (self: IGameEntity<ITriggerZoneProps>, helper: CanvasHelper) => {
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