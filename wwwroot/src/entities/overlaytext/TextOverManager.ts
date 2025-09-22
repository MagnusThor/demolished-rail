import { Positioned } from "../../interface/IPositioned";
import { gameState } from "../../state/gameState";
import { OverlayTextEntity, TEXT_MAP } from "./OverlayTextEntity";

export class TextOverlayManager {
    private static instance: TextOverlayManager;
    private _overlayTextEntity: OverlayTextEntity | null = null;
    private _isShowing: boolean = false;

    private constructor() {}

    public static getInstance(): TextOverlayManager {
        if (!TextOverlayManager.instance) {
            TextOverlayManager.instance = new TextOverlayManager();
        }
        return TextOverlayManager.instance;
    }

    /**
     * Shows a text overlay by ID.
     * @param textId The key from TEXT_MAP.
     */
    public showText(textId: string) {
        if (this._isShowing) {
            // If already showing, update the text instead of creating a new entity
            this._overlayTextEntity?.resetText(TEXT_MAP[textId] || "Text not found.");
            return;
        }

        // Create or get the single entity instance
        if (!this._overlayTextEntity) {
            this._overlayTextEntity = new OverlayTextEntity({
        
                text: TEXT_MAP[textId] || "Text not found.",
                speed: 10, // words per second
                font: "Arial",
                color: "255, 255, 255", // RGB values
                onComplete: undefined,
                isOneShot: false,
                isInitialized: true,
                states: {},
                positioned: new Positioned(0,0,0,0),
                zIndex:1,
                isCollidable: false
            });
            // Add the entity to the game state to be updated and drawn
            gameState.entities.push(this._overlayTextEntity);
        } else {
            // Update the existing entity's text
            this._overlayTextEntity.resetText(TEXT_MAP[textId] || "Text not found.");
        }
        this._isShowing = true;
    }

    /**
     * Hides the current text overlay.
     */
    public hideText() {
        if (this._isShowing) {
            this._overlayTextEntity?.hide();
            this._isShowing = false;
        }
    }
}
