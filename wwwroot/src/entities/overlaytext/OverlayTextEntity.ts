import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";


/**
 * Interface for the properties of an OverlayTextEntity.
 *
 * @prop {string} text - The text to display. Sentences should be separated by a period, exclamation mark, or question mark.
 * @prop {number} speed - The speed at which words are revealed, in words per second.
 * @prop {string} color - The color of the text.
 * @prop {() => void} onComplete - A callback to execute when the full text has been revealed.
 * @prop {number} [isOneShot=true] - If true, the text will only reveal once and then be destroyed.
 * @prop {number} [isFadingIn=false] - A state flag for the fade-in animation.
 * @prop {number} [isFadingOut=false] - A state flag for the fade-out animation.
 * @prop {number} [alpha=0] - The current opacity of the text, from 0 to 1.
 */
export interface IOverlayTextProps extends IGameEntityBase {
    text: string;
    speed: number;
    font: string;
    color: string;
    onComplete?: (self: IGameEntity<IOverlayTextProps>) => void;
    isOneShot?: boolean;
    isFadingIn?: boolean;
    isFadingOut?: boolean;
    alpha?: number;
}

export enum TextOverlayState {
    Idle,
    FadingIn,
    Showing,
    FadingOut
}

/**
 * An entity that displays text, revealing it word by word and fading in/out.
 */
export class OverlayTextEntity extends GameEntity<IOverlayTextProps>
    implements IGameEntity<IOverlayTextProps> {

    public _currentState: TextOverlayState = TextOverlayState.FadingIn;
    private _wordsToReveal: number = 0;
    private _words: string[] = [];

    private _revealTimer: any;
    isDestroyed: boolean = false;

    constructor(props: IOverlayTextProps) {
        super("overlayText", {
            ...props,
            isCollidable: false,
            positioned: new Positioned(0, 0, 0, 0), // Positioned dynamically
            zIndex: 1000,
            alpha: 0
        });

        this._words = this.props.text.split(' ');
    }

    onUpdate? = (self: IGameEntity<IOverlayTextProps>, timeStamp: number) => {
        
        const props = self.props;
        const fadeSpeed = 0.05; // Alpha change per frame

        switch (this._currentState) {
            case TextOverlayState.FadingIn:
                props.alpha = Math.min(1, props.alpha! + fadeSpeed);
                if (props.alpha! >= 1) {
                    this._currentState = TextOverlayState.Showing;
                    this._startReveal();
                }
                break;
            case TextOverlayState.Showing:
                // Word reveal handled by setTimeout
                break;
            case TextOverlayState.FadingOut:
                props.alpha = Math.max(0, props.alpha! - fadeSpeed);
                if (props.alpha! <= 0) {
                    this._currentState = TextOverlayState.Idle;
                    this.isDestroyed = true; // Mark for removal
                }
                break;
            case TextOverlayState.Idle:
            default:
                break;
        }
    };

    private _startReveal() {
        this._wordsToReveal = 0;
        this._revealWord();
    }

    private _revealWord() {
        if (this._wordsToReveal < this._words.length) {
            this._wordsToReveal++;
            const revealInterval = 1000 / this.props.speed;
            this._revealTimer = setTimeout(() => this._revealWord(), revealInterval);
        } else {
            if (this.props.onComplete) {
                this.props.onComplete(this);
            }
        }
    }

    onDraw? = (self: IGameEntity<IOverlayTextProps>, helper: CanvasHelper) => {
        if (this._currentState === TextOverlayState.Idle) {
            return;
        }

        const ctx = helper.ctx;
        const props = self.props;
        const canvas = helper.ctx.canvas;

        const revealedText = this._words.slice(0, this._wordsToReveal).join(' ');

        // Dynamic text wrapping logic
        const maxWidth = canvas.width * 0.8; // 80% of canvas width
        const lines: string[] = [];
        let currentLine = '';
        const words = revealedText.split(' ');
        const fontSize = 16;
        const fontName = props.font;
        const lineHeight = fontSize * 1.5;

        ctx.font = `${fontSize}px ${fontName}`;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = i > 0 ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
       
        // Draw a semi-transparent background for the text box.
        const padding = 20;
        const backgroundHeight = (lines.length * lineHeight) + (padding * 2);
        const backgroundWidth = maxWidth + (padding * 2);
        const backgroundX = (canvas.width / 2) - (backgroundWidth / 2);
        const backgroundY = canvas.height - backgroundHeight - padding;

        ctx.save();

        // Background
        ctx.fillStyle = `rgba(0, 0, 0, ${props.alpha! * 0.75})`;
        ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);

        // Text
        ctx.fillStyle = `rgba(${props.color}, ${props.alpha!})`;
        ctx.font = `${fontSize}px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const textY = backgroundY + padding + (i * lineHeight);
            ctx.fillText(line, backgroundX + backgroundWidth / 2, textY);
        }

        ctx.restore();
    };

    /**
     * Resets the text and starts the reveal process again.
     * @param newText The new text string to display.
     */
    public resetText(newText: string) {
        if (this._revealTimer !== null) {
            clearTimeout(this._revealTimer);
        }
        this.props.text = newText;
        this._words = newText.split(' ');
        this._wordsToReveal = 0;
        this._currentState = TextOverlayState.FadingIn;
    }

    /**
     * Hides the text overlay immediately by triggering the fade-out.
     */
    public hide() {
        this._currentState = TextOverlayState.FadingOut;
        if (this._revealTimer !== null) {
            clearTimeout(this._revealTimer);
        }
 
    }

    getBoundingBox? = (self: IGameEntity<IOverlayTextProps>) => {
        return self.props.positioned.getBoundingBox!();
    };
}
