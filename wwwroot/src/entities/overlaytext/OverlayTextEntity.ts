import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { gameState } from "../../state/gameState";
import { GameEntity } from "../GameEntity";


export const TEXT_MAP: { [key: string]: string } = {
    "welcome_message": "Welcome to the game! Use the arrow keys to move and the spacebar to jump. Explore the world and find the hidden secrets.",
    "level_1_intro": "You have entered the Whispering Woods. Be cautious of the shadows.",
    "power_up_found": "A new power has awakened within you. Use it wisely."
};

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

export class OverlayTextEntity extends GameEntity<IOverlayTextProps>
    implements IGameEntity<IOverlayTextProps> {

    private _currentState: TextOverlayState = TextOverlayState.Idle;
    private _lastRevealTimestamp: number = 0;
    private _wordsToReveal: number = 0;
    private _currentWords: string[] = [];
    private _currentSentences: string[] = [];
    private _currentSentenceIndex: number = 0;
    private _lines: string[] = [];
    private _isDestroyed: boolean = false;

    constructor(props: IOverlayTextProps) {
        super("overlayText", {
            ...props,
            isCollidable: false,
            positioned: new Positioned(0, 0, 0, 0), // Positioned dynamically
            zIndex: 1000,
            alpha: 0
        });

        // Set up the internal state
        this.resetText(props.text);
    }

    resetText(newText: string) {
        this.props.text = newText;
        this.props.alpha = 0;
        this._currentState = TextOverlayState.FadingIn;
        this._isDestroyed = false;

        this._currentSentences = this.props.text.match(/[^.!?]+[.!?]+/g) || [this.props.text];
        this._currentSentenceIndex = 0;
        this._currentWords = this._currentSentences[0].split(' ');
        this._wordsToReveal = 0;
        this._lastRevealTimestamp = performance.now();
        this._lines = [];
    }

    onUpdate? = (self: IGameEntity<IOverlayTextProps>, timeStamp: number) => {
        const props = self.props;
        const fadeSpeed = 0.05; // Alpha change per frame

        switch (this._currentState) {
            case TextOverlayState.FadingIn:
                props.alpha = Math.min(1, props.alpha! + fadeSpeed);
                if (props.alpha! >= 1) {
                    this._currentState = TextOverlayState.Showing;
                    this._lastRevealTimestamp = timeStamp;
                }
                break;

            case TextOverlayState.Showing:
                const wordsPerSecond = props.speed;
                const revealInterval = 1000 / wordsPerSecond;

                if (this._wordsToReveal < this._currentWords.length) {
                    if (timeStamp - this._lastRevealTimestamp > revealInterval) {
                        this._wordsToReveal++;
                        this._lastRevealTimestamp = timeStamp;
                    }
                } else {
                    // All words in the current sentence are revealed.
                    if (this._currentSentenceIndex < this._currentSentences.length - 1) {
                        // Move to next sentence
                        this._currentSentenceIndex++;
                        this._currentWords = this._currentSentences[this._currentSentenceIndex].split(' ');
                        this._wordsToReveal = 0;
                        this._lastRevealTimestamp = timeStamp;
                    } else if (props.onComplete) {
                        // All sentences revealed, trigger complete
                        props.onComplete(self);
                    }
                }
                break;

            case TextOverlayState.FadingOut:
                props.alpha = Math.max(0, props.alpha! - fadeSpeed);
                if (props.alpha! <= 0) {
                    this._currentState = TextOverlayState.Idle;
                    this._isDestroyed = true; // Mark for removal
                }
                break;

            case TextOverlayState.Idle:
            default:
                break;
        }
    };

    getBoundingBox? = (self: IGameEntity<IOverlayTextProps>) => {
            return self.props.positioned.getBoundingBox!();
    };

    onDraw? = (self: IGameEntity<IOverlayTextProps>, helper: CanvasHelper) => {
        if (this._currentState === TextOverlayState.Idle) {
            return;
        }

        const ctx = helper.ctx;
        const props = self.props;
        const canvas = helper.ctx.canvas;

        const revealedText = this._currentWords.slice(0, this._wordsToReveal).join(' ');

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
        this._lines = lines; // Store for drawing

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
        ctx.fillStyle = `rgba(255,255,255, ${props.alpha!})`;
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
    
    // Public methods for the manager to control
    public hide() {
        if (this._currentState === TextOverlayState.Showing) {
            this._currentState = TextOverlayState.FadingOut;
        }
    }
}