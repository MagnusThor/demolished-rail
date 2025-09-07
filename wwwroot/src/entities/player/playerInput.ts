import { KeyCode } from "../../enums/KeyCode";
import { gameState } from "../../state/gameState";
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
    const input = gameState.input!;
    const MOVE_SPEED = 4;
    const JUMP_SPEED = 8;
    
    // We'll publish events instead of directly manipulating state.
    // This decouples input from game logic.
    const entityEvents = player.entityEvents!;

    // Set up listeners for horizontal movement
    input.on('down', KeyCode.ArrowLeft, () => {
        entityEvents.publish('playerMove',player, { velX: -MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "left");
    });
    input.on('down', KeyCode.KeyA, () => {
        entityEvents.publish('playerMove',player, { velX: -MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "left");
    });

    input.on('up', KeyCode.ArrowLeft, () => {
        entityEvents.publish('playerMove',player, { velX: 0 });
    });
    input.on('up', KeyCode.KeyA, () => {
        entityEvents.publish('playerMove',player, { velX: 0 });
    });

    input.on('down', KeyCode.ArrowRight, () => {
        entityEvents.publish('playerMove',player, { velX: MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "right");
    });
    
    input.on('down', KeyCode.KeyD, () => {
        entityEvents.publish('playerMove', player,{ velX: MOVE_SPEED });
        stateHelper.set<string>("lastDirection", "right");
    });
    
    input.on('up', KeyCode.ArrowRight, () => {
        entityEvents.publish('playerMove',player, { velX: 0 });
    });
    input.on('up', KeyCode.KeyD, () => {
        entityEvents.publish('playerMove',player, { velX: 0 });
    });

    // Set up listeners for jumping and climbing
    input.on('down', KeyCode.ArrowUp, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: -MOVE_SPEED });
        } else { // if (stateHelper.get<boolean>("isGrounded")) 
            entityEvents.publish('playerJump', player, { velY: -JUMP_SPEED });
        }
    });
    
    input.on('down', KeyCode.KeyW, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: -MOVE_SPEED });
        } else if (stateHelper.get<boolean>("isGrounded")) {
            entityEvents.publish('playerJump', player, { velY: -JUMP_SPEED });
        }
    });

    // Handle keyup for "up" arrow to stop climbing
    input.on('up', KeyCode.ArrowUp, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: 0 });
        }
    });

    // Handle keyup for "W" key to stop climbing
    input.on('up', KeyCode.KeyW, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: 0 });
        }
    });
    
    // Add new listeners for climbing down
    input.on('down', KeyCode.ArrowDown, () => {
        if (stateHelper.get<boolean>("onLadder")) {
            entityEvents.publish('playerClimb', player, { velY: MOVE_SPEED });
        }
    });

    input.on('down', KeyCode.KeyS, () => {
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

    // Handle keyup for "S" key to stop climbing
    input.on('up', KeyCode.KeyS, () => {
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
