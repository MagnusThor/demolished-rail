import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { gameState } from "../../state/gameState";
import { GameEntity } from "../GameEntity";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";


/**
 * Interface for the properties of an InteractableEntity.
 *
 * @prop {() => void} onInteract - The function to call when the player interacts.
 * @prop {number} proximityRadius - The distance a player must be to interact.
 * @prop {boolean} canInteract - If true, the interaction can happen. Set to false after use.
 */
export interface IInteractableProps extends IGameEntityBase {
    onInteract: () => void;
    proximityRadius: number;
    canInteract: boolean;
}

/**
 * A visible entity that the player can interact with when in close proximity.
 * This class handles the logic for detecting the player and listening for an interaction event.
 */
export class InteractableEntity extends GameEntity<IInteractableProps> {

    private hasBeenInteractedWith: boolean = false;

    constructor(props: IInteractableProps) {
        super("interactable", props);
    }
    
    onUpdate? = (self: IGameEntity<IInteractableProps>, timeStamp: number) => {
        const player = gameState.player;

        if (player) {
            // Check if the player is within the proximity radius.
            const isNear = 
            ExtendedCollisionHelper.
            checkProximity(self.props.positioned, player.props.positioned, self.props.proximityRadius);
            
            if (isNear && !this.hasBeenInteractedWith) {
                // Here, you would listen for an "interact" key press (e.g., 'E' or 'Enter').
                // This is a placeholder for your input system.
                // For now, we'll assume a player action triggers this logic.
                // In a real game, you might check if (inputManager.isKeyPressed("E")) { ... }
                
                // For demonstration, let's just trigger it on proximity.
                // In your game, you would add a user interface prompt.
                
                // Let's add a debug log and assume a key press would call the interaction.
                console.log("Player is near an interactable item. Press 'E' to interact!");
            }
        }
    };

    // This method would be called by your input system when the 'interact' key is pressed.
    public performInteraction() {
        if (!this.hasBeenInteractedWith) {
             this.props.onInteract();
             this.hasBeenInteractedWith = true; // Prevents repeated interaction
        }
    }

    onDraw? = (self: IGameEntity<IInteractableProps>, helper: CanvasHelper) => {
        const props = self.props;
        const ctx = helper.ctx;
    };
}
