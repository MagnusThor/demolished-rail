import { Positioned } from "../../interface/IPosition2D";
import { GameState } from "../../global/GameState";
import { messageLibrary } from "./messageLibrary";
import { OverlayTextEntity } from "./OverlayTextEntity";
import { ITileSettings, ITileSettingsBag } from "../../interface/ITileSettings";

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
    public showText(tileSettings: ITileSettingsBag) {
        if (this._isShowing) {
            // If already showing, update the text instead of creating a new entity
            this._overlayTextEntity?.resetText(messageLibrary.get(tileSettings.bag.textId)?.text || "Text not found.");
            return;
        }

        // Create or get the single entity instance
        if (!this._overlayTextEntity) {

            const props =messageLibrary.get(tileSettings.textId)!;

          
            this._overlayTextEntity = new OverlayTextEntity({
                text: props.text,
                speed: props.speed,
                color: props.color,
                font: props.font
            });

            console.log("Text is not showing, lets se what the bag is",props);
         
       
            // Add the entity to the game state to be updated and drawn
            GameState.getInstance().entities.push(this._overlayTextEntity);
        } else {
            // Update the existing entity's text
            this._overlayTextEntity.resetText(messageLibrary.get(tileSettings.textId)?.text || "Text not found.");
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
