import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { ITileSettings } from "../../interface/ILevelProps";
import { gameState } from "../../state/gameState";
import { GameEntity } from "../GameEntity";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { ITriggerZoneProps } from "./ITriggerZoneProps";


export class TriggerZoneEntity extends GameEntity<ITriggerZoneProps> implements IGameEntity<ITriggerZoneProps> {

    constructor(props: ITriggerZoneProps) {
        super("triggerZone", props);
    }

    getBoundingBox? = (self: IGameEntity<ITriggerZoneProps>) => {
        return self.props.positioned.getBoundingBox!();
    };

    onInit? = (self: IGameEntity<ITriggerZoneProps>) => {
        const stateHelper = self.stateHelper;
        // Initialize the hit counter for this specific trigger zone.
        stateHelper.set<number>("numOfHits", 0);
        stateHelper.set<boolean>("isTriggered", false);
    };

    /**
     * The main logic now checks for a collision and executes the `activate` function
     * defined in the tile settings, if one exists and the max number of hits has not been reached.
     */
    onUpdate? = (self: IGameEntity<ITriggerZoneProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;
        const player = gameState.player;
        if (!player) return;

        // Check if a collision is currently happening with the player.
        const isCurrentlyColliding = ExtendedCollisionHelper.AABBColliding(
            self.props.positioned, player.props.positioned
        );

        // Get the maximum number of hits from the tile settings. If not specified, default to -1 (infinite hits).
        const tileSettings = self.props.settings as ITileSettings;
        const maxNumberOfHits = tileSettings?.maxNumberOfHits ?? -1;
        const currentHits = stateHelper.get<number>("numOfHits") || 0;

        // Check if the trigger has exceeded its maximum number of hits.
        const hasExceededMaxHits = maxNumberOfHits !== -1 && currentHits >= maxNumberOfHits;
        
        // If we are currently colliding and have not triggered yet, AND have not exceeded max hits, fire the trigger.
        if (isCurrentlyColliding && !stateHelper.get<boolean>("isTriggered") && !hasExceededMaxHits) {
            // Player has entered the zone, trigger the onTrigger logic
            self.props.onTrigger?.(self as TriggerZoneEntity);
            stateHelper.set<boolean>("isTriggered", true);
            stateHelper.set<number>("numOfHits", currentHits + 1);

            // Execute the generic action from the tile settings.
            const action = tileSettings.activate;
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
