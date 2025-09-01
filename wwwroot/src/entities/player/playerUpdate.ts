import { CollisionAxis } from "../../enums/CollisionAxis";
import { KeyCode } from "../../enums/KeyCode";
import { gameState } from "../../state/gameState";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { IGameEntity } from "../../interface/IGameEntity";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { isEntityInView, runCollitionDetectors } from "../../utils/collitionHelpers";
import { BulletEntity } from "../bullet/BulletEntity";
import { CollectibleEntity } from "../collectible/CollectibleEntity";



export const playerUpdate = (self: IGameEntity<IPlayerProps>, timeStamp: Number): void => {
    const props = self.props;
    const input = gameState.input!;
    const MOVE_SPEED = 5;
    const JUMP_SPEED = 10;
    
    // Reset the onLadder flag each frame before collision detection
    props.onLadder = false;

    // Check for collisions after updating the x position
    const detectors = gameState.player!.collisionDetectors;
    if (detectors) {
        detectors.forEach(detector => {
            const targetEntities = gameState.findEntities(detector.targetName);


            if (targetEntities && targetEntities.length > 0) {
                targetEntities.forEach(targetEntity => {
                    const collisionResults = detector.detectorFn(props, targetEntity);
                    if (Array.isArray(collisionResults)) {
                        collisionResults.forEach(collisionData => {
                            // This single line replaces the old conditional logic, making the code more robust.
                            detector.onCollision(props, collisionData, targetEntity);
                        });
                    }
                });
            }
        });
    }

    // Horizontal movement
    props.isMovingLeft = input.isKeyPressed(KeyCode.ArrowLeft) || input.isKeyPressed(KeyCode.KeyA);
    props.isMovingRight = input.isKeyPressed(KeyCode.ArrowRight) || input.isKeyPressed(KeyCode.KeyD);
    props.velX = 0;

    if (props.isMovingLeft) {
        props.velX = -MOVE_SPEED;
        props.lastDirection = "left";
    } else if (props.isMovingRight) {
        props.velX = MOVE_SPEED;
        props.lastDirection = "right";
    }

    // Ladder climbing logic
    if (props.onLadder) {
        props.isGrounded = true; // Stay "grounded" on the ladder to prevent gravity from taking over.
        props.velY = 0; // Stop vertical movement from gravity/jumping.

        // Handle up/down movement on the ladder
        if (input.isKeyPressed(KeyCode.ArrowUp) || input.isKeyPressed(KeyCode.KeyW)) {
            props.velY = -MOVE_SPEED;
        } else if (input.isKeyPressed(KeyCode.ArrowDown) || input.isKeyPressed(KeyCode.KeyS)) {
            props.velY = MOVE_SPEED;
        }
    } else {
        // Normal jumping logic if not on a ladder
        if ((input.isKeyPressed(KeyCode.ArrowUp) || input.isKeyPressed(KeyCode.KeyW)) && props.isGrounded) {
            props.isJumping = true;
            props.isGrounded = false;
            props.velY = -JUMP_SPEED;
            props.currentAnimation = props.animations["jump"];
        }
        // Apply gravity if not on a ladder
        if (props.velY < 10) {
            props.velY += props.gravity;
        }
    }

    // Apply movement
    props.positioned.x += props.velX;
    props.positioned.y += props.velY;
    
    // Check for collisions after updating the y position
    if (detectors) {
        detectors.forEach(detector => {
            const targetEntities = gameState.findEntities(detector.targetName);
            if (targetEntities && targetEntities.length > 0) {
                targetEntities.forEach(targetEntity => {
                    const collisionResults = detector.detectorFn(props, targetEntity);
                    if (Array.isArray(collisionResults)) {
                        collisionResults.forEach(collisionData => {
                            // This single line replaces the old conditional logic, making the code more robust.
                            detector.onCollision(props, collisionData, targetEntity);
                        });
                    }
                });
            }
        });
    }

    if (input.isKeyPressed(KeyCode.Space)) {
        const newBullet = new BulletEntity(
            props.positioned.x + (props.lastDirection === "right" ? props.positioned.width : -props.positioned.width),
            props.positioned.y + props.positioned.height / 2,
            props.lastDirection
        );
        gameState.dynamicEntities.push(newBullet);

        input.consumeKey(KeyCode.Space);
    }
    
    // Jump animation takes priority
    if (!props.isGrounded) {
        if (props.currentAnimation!.name !== "jump") {
            props.currentAnimation = props.animations["jump"];
        }
    }
    // If not in the air, check for walk or idle
    else {
        if (props.isMovingLeft || props.isMovingRight) {
            // If the player is moving, switch to the walk animation
            if (props.currentAnimation!.name !== 'walk') {
                props.currentAnimation = props.animations.walk;
                props.currentAnimation.currentFrameIndex = 0; // Reset animation
            }
        } else {
            // If the player is not moving, switch to the idle animation
            if (props.currentAnimation!.name !== 'idle') {
                props.currentAnimation = props.animations.idle;
                props.currentAnimation.currentFrameIndex = 0; // Reset animation
            }
        }
    }

    runCollitionDetectors<IPlayerProps>(gameState, self.props, self.collisionDetectors!);
}
