import { GameEntity } from "../GameEntity";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { gameState } from "../../state/gameState";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IPositioned } from "../../interface/IPositioned";
import { IOverlayTextProps } from "../overlaytext/OverlayTextEntity";


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
     textId?: string;
    isOneShot?: boolean;
}

/**
 * An invisible, non-solid entity that detects when another entity (e.g., the player)
 * enters its bounds and executes a callback function.
 */
export class OverlayTextEntity extends GameEntity<IOverlayTextProps>
    implements IGameEntity<IOverlayTextProps> {

    constructor(props: IOverlayTextProps) {
        super("overlayText", props);
    }

    onInit? = (self: IGameEntity<IOverlayTextProps>) => {
        const stateHelper = self.stateHelper;
        const sentences = self.props.text.match(/[^.!?]+[.!?]+/g) || [self.props.text];
        const words = sentences[0].split(' ');

        stateHelper.set<string[]>("sentences", sentences);
        stateHelper.set<number>("currentSentenceIndex", 0);
        stateHelper.set<string[]>("currentWords", words);
        stateHelper.set<number>("wordsToReveal", 0);
        stateHelper.set<number>("lastRevealTimestamp", 0);
    };

    onUpdate? = (self: IGameEntity<IOverlayTextProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;
        const wordsPerSecond = self.props.speed;
        const revealInterval = 1000 / wordsPerSecond;
        const lastRevealTimestamp = stateHelper.get<number>("lastRevealTimestamp")!;
        const wordsToReveal = stateHelper.get<number>("wordsToReveal")!;
        const currentWords = stateHelper.get<string[]>("currentWords")!;
        const sentences = stateHelper.get<string[]>("sentences")!;
        const currentSentenceIndex = stateHelper.get<number>("currentSentenceIndex")!;

        // Check if all words in the current sentence have been revealed.
        if (wordsToReveal < currentWords.length) {
            if (timeStamp - lastRevealTimestamp > revealInterval) {
                stateHelper.set("wordsToReveal", wordsToReveal + 1);
                stateHelper.set("lastRevealTimestamp", timeStamp);
            }
        } else {
            // All words in the current sentence are revealed. Check for next sentence.
            if (currentSentenceIndex < sentences.length - 1) {
                stateHelper.set("currentSentenceIndex", currentSentenceIndex + 1);
                const nextWords = sentences[currentSentenceIndex + 1].split(' ');
                stateHelper.set("currentWords", nextWords);
                stateHelper.set("wordsToReveal", 0);
            } else {
                // All sentences are revealed.
                if (self.props.onComplete) {
                    self.props.onComplete(self);
                }
                if (self.props.isOneShot !== false) {
                   // self.isDestroyed = true;
                   console.log("destroy me");
                }
            }
        }
    };

    onDraw? = (self: IGameEntity<IOverlayTextProps>, helper: any) => {
        const ctx = helper.ctx;
        const props = self.props;
      
        const positioned = props.positioned as IPositioned;
  

        // Draw a semi-transparent background for the text box.
        const padding = 15;
        const backgroundWidth = positioned.width;
        const backgroundHeight = positioned.height;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(positioned.x - backgroundWidth / 2, positioned.y - backgroundHeight / 2, backgroundWidth + padding * 2, backgroundHeight + padding * 2);

        // Set text properties
        ctx.fillStyle = props.color;
        ctx.font = `${props.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw the revealed text
        ctx.fillText(this.props.text, positioned.x + padding, positioned.y + padding);
        ctx.restore();
    };

    getBoundingBox = (self: IGameEntity<IOverlayTextProps>) =>  {
          return self.props.positioned.getBoundingBox!();
    }
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
                if (self.props.textId) {
                    const message = messageLibrary.get(self.props.textId);

                    if (message) {
                        const textProps: IOverlayTextProps = {
                            uuid: crypto.randomUUID(),
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
                        console.error(`Message with ID '${self.props.textId}' not found in messageLibrary.`);
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