// import { ICollisionResult } from "../../interface/ICollisionResult";
// import { gameState } from "../../state/gameState";
// import { playerCollisionDetectors } from "./collisiondetectors/playerCollitionDetectors";
// import { PlayerEntity } from "./playerEntity";

// /**
//  * The main update loop for the player entity.
//  * This function handles physics, position updates, and collision detection.
//  * @param player The player game entity.
//  */
// export const playerUpdate = (player: PlayerEntity) => {
//     const props = player.props;
//     const stateHelper = player.stateHelper;

//     // --- Critical Fix ---
//     // At the beginning of every frame, we assume the player is not grounded.
//     // The collision detection system will then set it to true if a collision with a platform occurs.
//     stateHelper.set<boolean>("isGrounded", false);

//     // Apply gravity
//     const GRAVITY = 0.5;
//     props.velY += GRAVITY;

//     // Apply horizontal friction to stop the player when not moving
//     const FRICTION = 0.8;
//     props.velX *= FRICTION;
    
//     // Clamp velocities to prevent them from getting out of control
//     props.velX = Math.min(Math.max(props.velX, -10), 10);
//     props.velY = Math.min(Math.max(props.velY, -20), 20);

//     // Update player's position based on their velocity
//     props.positioned.x += props.velX;
//     props.positioned.y += props.velY;

//     // --- Collision Detection and Resolution ---
//     // This section loops through all entities and applies the collision detection logic you provided.
//     // It's a standard physics loop that you'll need to integrate.
//     for (const entity of gameState.entities) {
//         if (entity === player) continue;

//         const detector = playerCollisionDetectors.find(d => d.targetName === entity.props.type);

//         if (detector) {
//             const collisionResults = detector.detectorFn(player, entity as any);
//             for (const result of collisionResults) {
//                 // Here we call the onCollision logic from your file
//                 detector.onCollision(player, result as ICollisionResult, entity as any);
//             }
//         }
//     }
// }
