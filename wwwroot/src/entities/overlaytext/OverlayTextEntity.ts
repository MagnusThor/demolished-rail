import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { IPositioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";

/**
 * Interface for the properties of an OverlayTextEntity.
 *
 * @prop {string} text - The text to display. Sentences should be separated by a period, exclamation mark, or question mark.
 * @prop {number} speed - The speed at which words are revealed, in words per second.
 * @prop {string} font - The font to use for the text.
 * @prop {string} color - The color of the text.
 * @prop {() => void} onComplete - A callback to execute when the full text has been revealed.
 * @prop {number} [isOneShot=true] - If true, the text will only reveal once and then be destroyed.
 */
export interface IOverlayTextProps extends IGameEntityBase {
    text: string;
    speed: number;
    font: string;
    color: string;
    onComplete?: (self: IGameEntity<IOverlayTextProps>) => void;
    isOneShot?: boolean;
    uuid: string;
}

/**
 * An entity that displays text, revealing it word by word or sentence by sentence.
 */
export class OverlayTextEntity extends GameEntity<IOverlayTextProps>
    implements IGameEntity<IOverlayTextProps> {

    constructor(props: IOverlayTextProps) {
        super("overlayText", props);
    }

    getBoundingBox? = (self: IGameEntity<IOverlayTextProps>) => {
        
        return self.props.positioned.getBoundingBox();

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
                    //self.isDestroyed = true;
                }
            }
        }
    };

    onDraw? = (self: IGameEntity<IOverlayTextProps>, helper: any) => {
        const ctx = helper.ctx;
        const props = self.props;
        const stateHelper = self.stateHelper;

        const positioned = props.positioned as IPositioned;
        const wordsToReveal = stateHelper.get<number>("wordsToReveal")!;
        const currentWords = stateHelper.get<string[]>("currentWords")!;
        const currentText = currentWords.slice(0, wordsToReveal).join(' ');

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
        ctx.fillText(currentText, positioned.x + padding, positioned.y + padding);
        ctx.restore();
    };
}
