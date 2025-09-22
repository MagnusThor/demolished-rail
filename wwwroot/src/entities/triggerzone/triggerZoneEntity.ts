import { GameEntity } from "../GameEntity";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { gameState } from "../../state/gameState";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IOverlayTextProps, OverlayTextEntity } from "../overlaytext/OverlayTextEntity";



export interface ITextMessage {
    text: string;
    font: string;
    speed: number;
    color: string;
}



export const messageLibrary = new Map<string, ITextMessage>

messageLibrary.set("welcome_message", {
    text: "Welcome to the game! Look for the key to unlock the gate.",
    font: "24px Arial",
    speed: 10,
    color: "#FFFFFF"
});

messageLibrary.set("key_found_message", {
    text: "You found the key! Now, go back to the gate and unlock it.",
    font: "24px 'Press Start 2P'",
    speed: 8,
    color: "#FFFF00"
});
messageLibrary.set("level_complete", {
    text: "Congratulations! You have completed the level.",
    font: "32px Impact",
    speed: 5,
    color: "#00FF00"
});


/**
 * Interface for the properties of a TriggerZone.
 *
 * @prop {() => void} onTrigger - The function to call when the zone is entered.
 * @prop {boolean} isOneShot - If true, the trigger will only fire once.
 */
export interface ITriggerZoneProps extends IGameEntityBase {
    onTrigger: (self:IGameEntity<ITriggerZoneProps>) => void;
    onLeave?: (self:any) => void;

    isOneShot?: boolean;
}

export class TriggerZoneEntity extends GameEntity<ITriggerZoneProps>
    implements IGameEntity<ITriggerZoneProps> {

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
     * The main logic runs in the update loop to check for collisions.
     * If a collision occurs and a `textId` is defined, it retrieves the related
     * message from the `messageLibrary` and creates a new `OverlayTextEntity`.
     */
    onUpdate? = (self: IGameEntity<ITriggerZoneProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;

        // Don't trigger if it's a one-shot and has already been hit.
        if (self.props.isOneShot && stateHelper.get<number>("numOfHits") > 0) {
            return;
        }

        const player = gameState.player;
        if (player) {
            // Check for collision between the trigger zone and the player.
            if (ExtendedCollisionHelper.AABBColliding(
                self.props.positioned, player.props.positioned)) {

                // If a text ID is provided, retrieve the corresponding message.
                if (self.props.settings!.bag) {
                    const message = messageLibrary.get(self.props.settings!.bag["textId"]);
                    if (message) {
                        const textProps: IOverlayTextProps = {
                        
                            positioned: self.props.positioned,
                            text: message.text,
                            speed: message.speed,
                            font: message.font,
                            color: message.color,
                            isOneShot: true, // The text itself is always a one-shot
                            onComplete: (textEntity) => {
                                //textEntity.isDestroyed = true;
                            },
                            isInitialized: false,
                            zIndex: 0,
                            states: {},
                            isCollidable: false
                        };
                        const textEntity = new OverlayTextEntity(textProps);
                        //gameState.addEntity(textEntity);
                        gameState.entities.push(textEntity);

                    } else {
                        console.error(`Message with ID '${self.props.settings?.bag["textId"]}' not found in messageLibrary.`);
                    }
                }

                stateHelper.set<number>("numOfHits", (stateHelper.get<number>("numOfHits") || 0) + 1);
            }
        }
    };

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