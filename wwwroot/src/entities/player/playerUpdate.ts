import { KeyCode } from "../../enums/KeyCode";
import { gameState } from "../../state/gameState";
import { IGameEntity } from "../../interface/IGameEntity";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { runCollitionDetectors } from "../../utils/collitionHelpers";
import { BulletEntity } from "../bullet/BulletEntity";




export const playerUpdate = (self: IGameEntity<IPlayerProps>, timeStamp: Number): void => {
    const props = self.props;
    const input = gameState.input!;
    const MOVE_SPEED = 4;
    const JUMP_SPEED = 8;

    const stateHelper = self.stateHelper;


    // Reset the onLadder flag each frame before collision detection
    stateHelper.set<boolean>("onLadder", false);

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
    stateHelper.set<boolean>("isMovingLeft", input.isKeyPressed(KeyCode.ArrowLeft) || input.isKeyPressed(KeyCode.KeyA));
    stateHelper.set<boolean>("isMovingRight", input.isKeyPressed(KeyCode.ArrowRight) || input.isKeyPressed(KeyCode.KeyD));
    
    props.velX = 0;

    if (stateHelper.get<boolean>("isMovingLeft")) {
        props.velX = -MOVE_SPEED;
        stateHelper.set<string>("lastDirection", "left");
    } else if (stateHelper.get<boolean>("isMovingRight")) {
        props.velX = MOVE_SPEED;
        stateHelper.set<string>("lastDirection", "right");
    }

    // Ladder climbing logic
    if (stateHelper.get<boolean>("onLadder")) {
        stateHelper.set<boolean>("isGrounded", true); // Stay "grounded" on the ladder to prevent gravity from taking over.
        props.velY = 0; // Stop vertical movement from gravity/jumping.
        // Handle up/down movement on the ladder
        if (input.isKeyPressed(KeyCode.ArrowUp) || input.isKeyPressed(KeyCode.KeyW)) {
            props.velY = -MOVE_SPEED;
        } else if (input.isKeyPressed(KeyCode.ArrowDown) || input.isKeyPressed(KeyCode.KeyS)) {
            props.velY = MOVE_SPEED;
        }
    } else {
        // Normal jumping logic if not on a ladder
        if ((input.isKeyPressed(KeyCode.ArrowUp) || input.isKeyPressed(KeyCode.KeyW)) && stateHelper.get<boolean>("isGrounded")) {
            stateHelper.set<boolean>("isJumping", true);
            stateHelper.set<boolean>("isGrounded", false);
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
            props.positioned.x + (stateHelper.get<string>("lastDirection") === "right" ? props.positioned.width : -props.positioned.width),
            props.positioned.y + props.positioned.height / 2, stateHelper.get<string>("lastDirection") as string
        );
        gameState.dynamicEntities.push(newBullet);

        input.consumeKey(KeyCode.Space);
    }
    
    // Jump animation takes priority
    if (!stateHelper.get<boolean>("isGrounded")) {
        if (props.currentAnimation!.name !== "jump") {
            props.currentAnimation = props.animations["jump"];
        }
    }
    // If not in the air, check for walk or idle
    else {
        if (stateHelper.get<boolean>("isMovingLeft") || stateHelper.get<boolean>("isMovingRight")) {
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
