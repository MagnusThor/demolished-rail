import { KeyCode } from "../../enums/KeyCode";
import { GameState } from "../../global/GameState";
import { IGameEntity } from "../../interface/IGameEntity";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { BulletEntity } from "../bullet/BulletEntity";
import { PlayerEntity } from "./playerEntity";

/**
 * Sets up all the event listeners for player input.
 * This function publishes events for other systems to consume.
 * @param player The player game entity.
 */
export const setupPlayerInput = (player: PlayerEntity) => {
    const props = player.props;
    const stateHelper = player.stateHelper;
    const input = GameState.getInstance().input!;
    const MOVE_SPEED = 4;
    const JUMP_SPEED = 8;

    // We'll publish events instead of directly manipulating state.
    // This decouples input from game logic.
    const entityEvents = player.entityEvents!;

    // Set up listeners for horizontal movement
    input.on('down', KeyCode.ArrowLeft, () => {
    
        if (stateHelper.get<boolean>("isSwinging")) {
            stateHelper.set<boolean>("isSwinging", false);
        return;
        };
        entityEvents.publish('playerMove', player, { velX: -MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "left");

    });


    input.on('up', KeyCode.ArrowLeft, () => {
        if (stateHelper.get<boolean>("isSwinging")) {
            stateHelper.set<boolean>("isSwinging", false);
            return;
        };

        entityEvents.publish('playerMove', player, { velX: 0 });
    });



    input.on('down', KeyCode.ArrowRight, () => {
        if (stateHelper.get<boolean>("isSwinging")) {
            stateHelper.set<boolean>("isSwinging", false);
            return;
        };
        entityEvents.publish('playerMove', player, { velX: MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "right");
    });

    input.on('up', KeyCode.ArrowRight, () => {
        if (stateHelper.get<boolean>("isSwinging")) {
            stateHelper.set<boolean>("isSwinging", false);
            return;
        };
        entityEvents.publish('playerMove', player, { velX: 0 });
    });


    // Set up listeners for jumping and climbing
    input.on('down', KeyCode.ArrowUp, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: -MOVE_SPEED });
        } else if (stateHelper.get<boolean>("isGrounded") || stateHelper.get<boolean>("isSwinging")) {
            // Player can jump if on the ground or swinging
            entityEvents.publish('playerJump', player, { velY: -JUMP_SPEED });
        } else if (props.gadgets.jetpack && !stateHelper.get<boolean>("isGrounded")) {
            // Start the jetpack if in the air and player has it
            entityEvents.publish('playerStartJetpack', player, {});
        }
    });

    input.on('up', KeyCode.ArrowUp, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: 0 });
        } else if (props.gadgets.jetpack) {
            // Stop the jetpack when the key is released
            entityEvents.publish('playerStopJetpack', player, {});
        }
    });


    // Add new listeners for climbing down
    input.on('down', KeyCode.ArrowDown, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: MOVE_SPEED });
        }
    });


    // Handle keyup for "down" arrow to stop climbing
    input.on('up', KeyCode.ArrowDown, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: 0 });
        }
    });


    // Set up listeners for shooting
    input.on('down', KeyCode.Space, () => {
        const lastDirection = stateHelper.get<string>("lastDirection") || "right";
        entityEvents.publish('playerShoot', player, { direction: lastDirection });
    });
}
